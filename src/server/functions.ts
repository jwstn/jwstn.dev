import { createServerFn } from "@tanstack/react-start";
import { Effect, Option } from "effect";
import type { MusicResult } from "#/lib/music";
import { AppConfig } from "./config.server";
import { Content, type ContentShape } from "./content.server";
import { Lastfm } from "./lastfm.server";
import { runtime } from "./runtime.server";

const withContent = <A, E>(use: (content: ContentShape) => Effect.Effect<A, E>) =>
  Effect.gen(function* () {
    const content = yield* Content;
    return yield* use(content);
  });

export const getPosts = createServerFn({ method: "GET" }).handler(() =>
  runtime.runPromise(withContent((content) => content.posts)),
);

export const getPost = createServerFn({ method: "GET" })
  .validator((slug: string) => slug)
  .handler(({ data: slug }) => runtime.runPromise(withContent((content) => content.post(slug))));

export const getProjects = createServerFn({ method: "GET" }).handler(() =>
  runtime.runPromise(withContent((content) => content.projects)),
);

export const getProject = createServerFn({ method: "GET" })
  .validator((slug: string) => slug)
  .handler(({ data: slug }) => runtime.runPromise(withContent((content) => content.project(slug))));

export const getGalleries = createServerFn({ method: "GET" }).handler(() =>
  runtime.runPromise(withContent((content) => content.galleries)),
);

export const getGallery = createServerFn({ method: "GET" })
  .validator((slug: string) => slug)
  .handler(({ data: slug }) => runtime.runPromise(withContent((content) => content.gallery(slug))));

export const getMusic = createServerFn({ method: "GET" }).handler(() =>
  runtime.runPromise(
    Effect.gen(function* () {
      const config = yield* AppConfig;
      const username = config.lastfmUsername;

      if (Option.isNone(config.lastfmApiKey)) {
        return {
          status: "unavailable",
          configured: false,
          username,
          artists: [],
          tracks: [],
        } satisfies MusicResult;
      }

      return yield* Effect.gen(function* () {
        const [top, recent] = yield* Effect.all(
          [
            Effect.flatMap(Lastfm, (lastfm) => lastfm.topArtists("1month", 3)),
            Effect.flatMap(Lastfm, (lastfm) => lastfm.recentTracks(12)),
          ],
          { concurrency: 2 },
        );

        return {
          status: top.stale || recent.stale ? "stale" : "live",
          configured: true,
          username,
          artists: top.data.map((artist) => ({
            name: artist.name,
            playcount: artist.playcount,
            url: artist.url,
          })),
          tracks: recent.data.map((track) => ({
            name: track.name,
            artist: track.artist["#text"],
            album: track.album?.["#text"],
            url: track.url,
            nowPlaying: track["@attr"]?.nowplaying === "true",
            playedAt: track.date?.uts,
          })),
        } satisfies MusicResult;
      }).pipe(
        Effect.catchEager(() =>
          Effect.succeed({
            status: "unavailable",
            configured: true,
            username,
            artists: [],
            tracks: [],
          } satisfies MusicResult),
        ),
      );
    }),
  ),
);
