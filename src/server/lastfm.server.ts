import { Cache, Context, Duration, Effect, Exit, HashMap, Layer, Option, Redacted, Ref, Schema } from "effect";
import { HttpClient, HttpClientResponse } from "effect/http";
import { AppConfig } from "./config.server";

const API_ROOT = "https://ws.audioscrobbler.com/2.0/";
const CACHE_CAPACITY = 16;
const CACHE_TTL = "5 minutes";
const REQUEST_TIMEOUT = "5 seconds";

const ArtistSchema = Schema.Struct({
  name: Schema.String,
  playcount: Schema.String,
  url: Schema.String,
});

const TrackSchema = Schema.Struct({
  name: Schema.String,
  artist: Schema.Struct({ "#text": Schema.String }),
  album: Schema.optionalKey(Schema.Struct({ "#text": Schema.String })),
  url: Schema.String,
  date: Schema.optionalKey(Schema.Struct({ uts: Schema.String, "#text": Schema.String })),
  "@attr": Schema.optionalKey(Schema.Struct({ nowplaying: Schema.optionalKey(Schema.String) })),
});

const TopArtistsResponse = Schema.Struct({
  topartists: Schema.optionalKey(
    Schema.Struct({
      artist: Schema.optionalKey(Schema.Union([ArtistSchema, Schema.Array(ArtistSchema)])),
    }),
  ),
});

const RecentTracksResponse = Schema.Struct({
  recenttracks: Schema.optionalKey(
    Schema.Struct({
      track: Schema.optionalKey(Schema.Union([TrackSchema, Schema.Array(TrackSchema)])),
    }),
  ),
});

const ErrorResponse = Schema.Struct({
  error: Schema.optionalKey(Schema.Number),
  message: Schema.optionalKey(Schema.String),
});

export type LastfmArtist = Schema.Schema.Type<typeof ArtistSchema>;
export type LastfmTrack = Schema.Schema.Type<typeof TrackSchema>;

export type Cached<T> = {
  readonly data: ReadonlyArray<T>;
  readonly stale: boolean;
};

export class LastfmError extends Schema.TaggedError<LastfmError>()("LastfmError", {
  operation: Schema.String,
  cause: Schema.optionalKey(Schema.Defect()),
}) {}

export interface LastfmShape {
  readonly topArtists: (period: string, limit: number) => Effect.Effect<Cached<LastfmArtist>, LastfmError>;
  readonly recentTracks: (limit: number) => Effect.Effect<Cached<LastfmTrack>, LastfmError>;
}

export class Lastfm extends Context.Service<Lastfm, LastfmShape>()("Lastfm") {}

const program: Effect.Effect<LastfmShape, never, AppConfig | HttpClient.HttpClient> = Effect.gen(function* () {
  const config = yield* AppConfig;
  const staleTop = yield* Ref.make(HashMap.empty<string, ReadonlyArray<LastfmArtist>>());
  const staleRecent = yield* Ref.make(HashMap.empty<string, ReadonlyArray<LastfmTrack>>());

  const fetchJson = Effect.fn("LastFM.fetchJson")(function* <S extends Schema.ConstraintDecoder<unknown>>(
    operation: string,
    url: URL,
    schema: S,
  ) {
    const response = yield* HttpClient.get(url, {
      headers: { "User-Agent": "jwstn.dev music page (https://jwstn.dev)" },
    }).pipe(
      Effect.flatMap(HttpClientResponse.filterStatusOk),
      Effect.timeout(REQUEST_TIMEOUT),
      Effect.mapError((cause) => new LastfmError({ operation, cause })),
    );

    const web = HttpClientResponse.toWeb(response);
    if (Option.isNone(web)) {
      return yield* Effect.fail(new LastfmError({ operation }));
    }

    const body = yield* Effect.tryPromise({
      try: () => web.value.json() as Promise<unknown>,
      catch: (cause) => new LastfmError({ operation, cause }),
    });

    const error = yield* Effect.try({
      try: () => Schema.decodeUnknownSync(ErrorResponse)(body),
      catch: (cause) => new LastfmError({ operation, cause }),
    });

    // Last.fm reports some failures with HTTP 200 and an error body. Treat
    // those as failures so the cache keeps its last good value.
    if (error.error) {
      return yield* Effect.fail(
        new LastfmError({
          operation,
          cause: new Error(`Last.fm API error ${error.error}: ${error.message ?? "unknown"}`),
        }),
      );
    }

    return yield* Effect.try({
      try: () => Schema.decodeUnknownSync(schema)(body),
      catch: (cause) => new LastfmError({ operation, cause }),
    });
  });

  const request = <S extends Schema.ConstraintDecoder<unknown>>(
    operation: string,
    params: Record<string, string>,
    schema: S,
  ): Effect.Effect<S["Type"], LastfmError, HttpClient.HttpClient> =>
    Effect.gen(function* () {
      const apiKey = config.lastfmApiKey;

      if (Option.isNone(apiKey)) {
        return yield* Effect.fail(new LastfmError({ operation }));
      }

      const url = new URL(API_ROOT);
      url.searchParams.set("method", operation);
      url.searchParams.set("api_key", Redacted.value(apiKey.value));
      url.searchParams.set("format", "json");
      url.searchParams.set("user", config.lastfmUsername);
      for (const [key, value] of Object.entries(params)) {
        url.searchParams.set(key, value);
      }

      return yield* fetchJson(operation, url, schema);
    });

  const fetchTop = Effect.fn("LastFM.fetchTopArtists")(function* (key: string) {
    const [period, limit] = key.split("|");
    const response = yield* request("user.getTopArtists", { period, limit }, TopArtistsResponse);
    const artist = response.topartists?.artist;
    const data = !artist ? [] : Array.isArray(artist) ? artist : [artist];

    yield* Ref.update(staleTop, (stale) => HashMap.set(stale, key, data));
    return data;
  });

  const fetchRecent = Effect.fn("LastFM.fetchRecentTracks")(function* (key: string) {
    const response = yield* request("user.getRecentTracks", { limit: key }, RecentTracksResponse);
    const track = response.recenttracks?.track;
    const data = !track ? [] : Array.isArray(track) ? track : [track];

    yield* Ref.update(staleRecent, (stale) => HashMap.set(stale, key, data));
    return data;
  });

  const topCache = yield* Cache.makeWith(fetchTop, {
    capacity: CACHE_CAPACITY,
    timeToLive: (exit) => (Exit.isSuccess(exit) ? CACHE_TTL : Duration.zero),
  });

  const recentCache = yield* Cache.makeWith(fetchRecent, {
    capacity: CACHE_CAPACITY,
    timeToLive: (exit) => (Exit.isSuccess(exit) ? CACHE_TTL : Duration.zero),
  });

  const topArtists = Effect.fn("LastFM.topArtists")(function* (period: string, limit: number) {
    const key = `${period}|${limit}`;

    return yield* Cache.get(topCache, key).pipe(
      Effect.map((data) => ({ data, stale: false })),
      Effect.catchEager((error) =>
        Ref.get(staleTop).pipe(
          Effect.flatMap((stale) =>
            Option.match(HashMap.get(stale, key), {
              onNone: () => Effect.fail(error),
              onSome: (data) => Effect.succeed({ data, stale: true }),
            }),
          ),
        ),
      ),
    );
  });

  const recentTracks = Effect.fn("LastFM.recentTracks")(function* (limit: number) {
    const key = String(limit);

    return yield* Cache.get(recentCache, key).pipe(
      Effect.map((data) => ({ data, stale: false })),
      Effect.catchEager((error) =>
        Ref.get(staleRecent).pipe(
          Effect.flatMap((stale) =>
            Option.match(HashMap.get(stale, key), {
              onNone: () => Effect.fail(error),
              onSome: (data) => Effect.succeed({ data, stale: true }),
            }),
          ),
        ),
      ),
    );
  });

  return Lastfm.of({ topArtists, recentTracks });
});

export const layer = Layer.effect(Lastfm, program);
