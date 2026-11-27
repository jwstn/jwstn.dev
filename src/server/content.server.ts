import { allBlogs, allGalleries, allProjects } from "content-collections";
import { Context, Effect, Layer } from "effect";

type BlogPost = (typeof allBlogs)[number];
type Project = (typeof allProjects)[number];
type Gallery = (typeof allGalleries)[number];

export interface ContentShape {
  readonly posts: Effect.Effect<ReadonlyArray<BlogPost>>;
  readonly post: (slug: string) => Effect.Effect<BlogPost | null>;
  readonly projects: Effect.Effect<ReadonlyArray<Project>>;
  readonly project: (slug: string) => Effect.Effect<Project | null>;
  readonly galleries: Effect.Effect<ReadonlyArray<Gallery>>;
  readonly gallery: (slug: string) => Effect.Effect<Gallery | null>;
}

export class Content extends Context.Service<Content, ContentShape>()("Content") {}

function byNewest<T extends { pubDate: Date }>(items: ReadonlyArray<T>) {
  return [...items].sort((a, b) => b.pubDate.valueOf() - a.pubDate.valueOf());
}

export const layer = Layer.succeed(
  Content,
  Content.of({
    posts: Effect.succeed(byNewest(allBlogs)),
    post: (slug) => Effect.succeed(allBlogs.find((post) => post._meta.path === slug) ?? null),
    projects: Effect.succeed(byNewest(allProjects)),
    project: (slug) => Effect.succeed(allProjects.find((project) => project._meta.path === slug) ?? null),
    galleries: Effect.succeed(byNewest(allGalleries)),
    gallery: (slug) => Effect.succeed(allGalleries.find((album) => album.slug === slug) ?? null),
  }),
);
