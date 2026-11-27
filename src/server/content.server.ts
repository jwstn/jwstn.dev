import type { Meta } from "@content-collections/core";
import {
  allBlogs as generatedBlogs,
  allGalleries as generatedGalleries,
  allProjects as generatedProjects,
} from "content-collections";
import { Context, Effect, Layer } from "effect";

export type ImageRef = {
  readonly key: string;
  readonly width: number;
  readonly height: number;
};

export type BlogPost = {
  readonly title: string;
  readonly description: string;
  readonly pubDate: Date;
  readonly updatedDate?: Date;
  readonly heroImage?: ImageRef;
  readonly html: string;
  readonly _meta: Meta;
};

export type Project = {
  readonly title: string;
  readonly description: string;
  readonly pubDate: Date;
  readonly href: string;
  readonly tags: ReadonlyArray<string>;
  readonly html: string;
  readonly _meta: Meta;
};

export type GalleryPhoto = {
  readonly title: string;
  readonly caption?: string;
  readonly image: ImageRef;
};

export type Gallery = {
  readonly title: string;
  readonly pubDate: Date;
  readonly slug: string;
  readonly photos: ReadonlyArray<GalleryPhoto>;
  readonly _meta: Meta;
};

const allBlogs: ReadonlyArray<BlogPost> = generatedBlogs;
const allProjects: ReadonlyArray<Project> = generatedProjects;
const allGalleries: ReadonlyArray<Gallery> = generatedGalleries;

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
