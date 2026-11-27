import { expect, it } from "@effect/vitest";
import { Effect } from "effect";
import { Content, layer as ContentLayer } from "./content.server";

it.effect("sorts projects newest first", () =>
  Effect.gen(function* () {
    const content = yield* Content;
    const projects = yield* content.projects;

    expect(projects).toHaveLength(4);
    expect(projects[0].pubDate.valueOf()).toBeGreaterThanOrEqual(projects[1].pubDate.valueOf());
  }).pipe(Effect.provide(ContentLayer)),
);

it.effect("finds a project by its path", () =>
  Effect.gen(function* () {
    const content = yield* Content;
    const project = yield* content.project("spotui");

    expect(project?.title).toBe("(WIP) Spotui");
  }).pipe(Effect.provide(ContentLayer)),
);

it.effect("finds the Japan album by its fixed slug", () =>
  Effect.gen(function* () {
    const content = yield* Content;
    const album = yield* content.gallery("japan-2026");

    expect(album?.title).toBe("Japan 2026");
    expect(album?.photos[0].image.key).toContain("/src/assets/japan-2026/");
  }).pipe(Effect.provide(ContentLayer)),
);

it.effect("returns null for the old gallery slug", () =>
  Effect.gen(function* () {
    const content = yield* Content;
    const album = yield* content.gallery("fall-2026");

    expect(album).toBeNull();
  }).pipe(Effect.provide(ContentLayer)),
);

it.effect("returns an empty blog list", () =>
  Effect.gen(function* () {
    const content = yield* Content;
    const posts = yield* content.posts;

    expect(posts).toHaveLength(0);
  }).pipe(Effect.provide(ContentLayer)),
);
