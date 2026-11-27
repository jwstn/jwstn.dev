import { expect, it } from "@effect/vitest";
import { ConfigProvider, Effect, Exit, Layer, Ref } from "effect";
import { HttpClient, HttpClientResponse } from "effect/http";
import { TestClock } from "effect/testing";
import { layer as AppConfigLayer } from "./config.server";
import { Lastfm, layer as LastfmLayer } from "./lastfm.server";

const topArtists = {
  topartists: {
    artist: [{ name: "Artist One", playcount: "12", url: "https://www.last.fm/music/Artist+One" }],
  },
};

const recentTracks = {
  recenttracks: {
    track: [
      {
        name: "Track One",
        artist: { "#text": "Artist One" },
        album: { "#text": "Album One" },
        url: "https://www.last.fm/music/Artist+One/_/Track+One",
        "@attr": { nowplaying: "true" },
      },
    ],
  },
};

const config = (env: Record<string, string>) => ConfigProvider.layer(ConfigProvider.fromUnknown(env));

const body = (value: unknown, status = 200) =>
  new Response(JSON.stringify(value), {
    status,
    headers: { "content-type": "application/json" },
  });

const testLayer = (respond: (url: URL) => Response, calls: Ref.Ref<number>, env: Record<string, string>) =>
  LastfmLayer.pipe(
    Layer.provide(AppConfigLayer),
    Layer.provide(
      Layer.succeed(
        HttpClient.HttpClient,
        HttpClient.make((request, url) =>
          Effect.gen(function* () {
            yield* Ref.update(calls, (count) => count + 1);
            return HttpClientResponse.fromWeb(request, respond(url));
          }),
        ),
      ),
    ),
    Layer.provide(config(env)),
  );

it.effect("caches a successful response for five minutes", () => {
  return Effect.gen(function* () {
    const calls = yield* Ref.make(0);
    const layer = testLayer(
      (url) => body(url.searchParams.get("method") === "user.getTopArtists" ? topArtists : recentTracks),
      calls,
      { LASTFM_API_KEY: "test" },
    );

    yield* Effect.gen(function* () {
      const lastfm = yield* Lastfm;
      const first = yield* lastfm.topArtists("1month", 3);
      const second = yield* lastfm.topArtists("1month", 3);

      expect(first.stale).toBe(false);
      expect(second.data).toEqual(first.data);
      expect(yield* Ref.get(calls)).toBe(1);

      yield* TestClock.adjust("5 minutes");
      yield* lastfm.topArtists("1month", 3);
      expect(yield* Ref.get(calls)).toBe(2);
    }).pipe(Effect.provide(layer));
  });
});

it.effect("serves the stale snapshot after the fresh window expires", () => {
  return Effect.gen(function* () {
    const calls = yield* Ref.make(0);
    let fail = false;
    const layer = testLayer(() => (fail ? body({}, 503) : body(topArtists)), calls, { LASTFM_API_KEY: "test" });

    yield* Effect.gen(function* () {
      const lastfm = yield* Lastfm;
      const first = yield* lastfm.topArtists("1month", 3);

      fail = true;
      yield* TestClock.adjust("5 minutes");
      const stale = yield* lastfm.topArtists("1month", 3);

      expect(stale.stale).toBe(true);
      expect(stale.data).toEqual(first.data);
    }).pipe(Effect.provide(layer));
  });
});

it.effect("does not call Last.fm without an API key", () => {
  return Effect.gen(function* () {
    const calls = yield* Ref.make(0);
    const layer = testLayer(() => body(topArtists), calls, {});

    yield* Effect.gen(function* () {
      const lastfm = yield* Lastfm;
      const result = yield* Effect.exit(lastfm.topArtists("1month", 3));

      expect(Exit.isFailure(result)).toBe(true);
      expect(yield* Ref.get(calls)).toBe(0);
    }).pipe(Effect.provide(layer));
  });
});

it.effect("deduplicates concurrent lookups for the same key", () => {
  return Effect.gen(function* () {
    const calls = yield* Ref.make(0);
    const layer = testLayer(() => body(topArtists), calls, { LASTFM_API_KEY: "test" });

    yield* Effect.gen(function* () {
      const lastfm = yield* Lastfm;
      yield* Effect.all([lastfm.topArtists("1month", 3), lastfm.topArtists("1month", 3)], {
        concurrency: 2,
      });

      expect(yield* Ref.get(calls)).toBe(1);
    }).pipe(Effect.provide(layer));
  });
});

it.effect("falls back to stale data when decoding fails", () => {
  return Effect.gen(function* () {
    const calls = yield* Ref.make(0);
    let malformed = false;
    const layer = testLayer(
      () =>
        malformed
          ? new Response("{", { status: 200, headers: { "content-type": "application/json" } })
          : body(topArtists),
      calls,
      { LASTFM_API_KEY: "test" },
    );

    yield* Effect.gen(function* () {
      const lastfm = yield* Lastfm;
      const first = yield* lastfm.topArtists("1month", 3);

      malformed = true;
      yield* TestClock.adjust("5 minutes");
      const stale = yield* lastfm.topArtists("1month", 3);

      expect(stale.stale).toBe(true);
      expect(stale.data).toEqual(first.data);
    }).pipe(Effect.provide(layer));
  });
});
