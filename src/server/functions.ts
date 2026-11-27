import { createServerFn } from "@tanstack/react-start";
import { Effect } from "effect";
import { Content, type ContentShape } from "./content.server";
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
