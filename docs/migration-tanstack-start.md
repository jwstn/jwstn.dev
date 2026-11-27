# Migration spec: Astro 7 to TanStack Start with Effect

Status: decision-complete, ready for implementation
Date: 2026-11-27
Map: [#56](https://github.com/jwstn/jwstn.dev/issues/56)
Decisions: [#57](https://github.com/jwstn/jwstn.dev/issues/57) through [#68](https://github.com/jwstn/jwstn.dev/issues/68)

This is the destination artifact of the migration map. It records the target architecture and the
order to build it. It does not contain application code.

## 1. Destination and scope

Rebuild `jwstn.dev` on TanStack Start (React), keeping:

- Markdown and JSON authored as files in `src/content`, with images committed under `src/assets`.
- Build-time content and image processing; no CMS, upload UI or object storage.
- Pixel-identical visuals and the same routes, URLs, feeds and sitemap.
- Every piece of server-side execution implemented in Effect TS: content access, Last.fm, config,
  cache, errors and logging.

Non-goals: redesign, new features or content, AVIF, OG image generation, drafts, CMS, auth,
database, prerender optimization, or running Astro and TanStack Start together permanently.

## 2. Version matrix

| Package | Version | Notes |
| --- | --- | --- |
| Node | `>=22.19.0`, pin `24.x` | Effect 4 floor is higher than TanStack Start's `>=22.12` |
| pnpm | 11 | matches the current repo and CI |
| TypeScript | 6.0.3 | Effect requires `>=5.9`; keep `strict` |
| `@tanstack/react-start` | 1.169.7 | React 19, Vite 8 |
| `@tanstack/react-router` | matching 1.169 line | file routing, `viewTransition`, scroll restoration |
| `react` / `react-dom` | 19 | |
| `vite` | 8.x | TanStack Start peer |
| `nitro` | current, Vercel preset | produces the Vercel Build Output |
| `effect` | 4.1.7 | do not add `@effect/platform` (v3 package) |
| `@effect/vitest` | 4.1.7 | tests only |
| `@effect/platform-node` | 4.1.7 | only if a build script needs Node services |
| `@content-collections/core` | 0.15.3 | pin the 0.x line |
| `@content-collections/vite` | 0.3.1 | pin |
| `vite-imagetools` | 12.0.2 | Vite 8, Node 22+ |
| `sharp` | 0.34.3 | content-transform metadata |
| `tailwindcss` / `@tailwindcss/vite` | 4.3.1 | unchanged |
| `@shikijs/rehype` | current | build-time highlighting |
| `lucide-react` | current | replaces `@lucide/astro` |
| `clsx` | current | replaces `class:list` |
| `three` | 0.187.0 | unchanged |
| `vitest` | 5.1.2 | `@effect/vitest` peer |
| `@biomejs/biome` | 2.4.5 | unchanged |
| Playwright + `pixelmatch` + `pngjs` | current | visual parity gate |

Remove `astro`, `@astrojs/*`, `@lucide/astro`, `@astrojs/check` and the Astro-specific packages.

## 3. Target architecture

```text
Browser
  TanStack Router (React, SSR + hydration)
    route loader -> createServerFn (same-origin RPC)
      Effect ManagedRuntime (one per process)
        AppConfig  (LASTFM_API_KEY optional, LASTFM_USERNAME)
        Content    (build-time collections, server-only)
        Lastfm     (Cache + stale Ref -> FetchHttpClient -> Last.fm)
        Logger     (consoleJson)

Build
  content-collections -> typed collections + Markdown HTML (remark/rehype + Shiki)
  vite-imagetools     -> hashed WebP derivatives
  feeds/sitemap plugin -> rss.xml, blog.xml, projects.xml, gallery.xml, sitemap-index.xml, sitemap-0.xml
  Content transform   -> canonical image keys + intrinsic width/height

Client
  ResponsiveImage -> src/lib/images.ts manifest -> hashed WebP assets
```

## 4. Repository layout

```text
content-collections.ts          # collections, Effect Schema, transforms
vite.config.ts                  # tanstackStart, viteReact, tailwind, imagetools, nitro
src/
  router.tsx                    # createRouter, trailingSlash, viewTransition, scrollRestoration
  routes/
    __root.tsx                  # document shell, header/nav, footer, theme script
    index.tsx
    blog/index.tsx
    blog/$slug.tsx
    projects/index.tsx
    projects/$slug.tsx
    gallery/index.tsx
    gallery/$slug.tsx
    music.tsx
  components/
    FormattedDate.tsx
    IsoButton.tsx
    ResponsiveImage.tsx
    Prose.tsx
    isometric/CassetteScene.tsx
    isometric/three/mount.js
    isometric/three/cassette.js
    isometric/three/player.js
    isometric/three/shelf.js
    isometric/three/textures.js
  server/
    runtime.server.ts
    config.server.ts
    content.server.ts
    lastfm.server.ts
    functions.ts
  lib/
    site.ts                     # SITE_URL, consts, nav items, buildHead
    images.ts                   # client-safe import.meta.glob manifest
    music.ts                    # client-safe Last.fm and MusicResult types
  styles/
    base.css                    # unchanged
    theme.css                   # unchanged
  content/
    blog/                       # scaffolded
    projects/                   # unchanged except dates
    gallery/                    # unchanged except japan-2026 slug
  assets/                       # unchanged
build/
  feeds-plugin.ts               # build-time XML assets
scripts/
  visual-diff.mjs               # pixelmatch gate
docs/
  screenshots/                  # Astro baselines
  screenshots-tanstack/         # new captures
```

Header and footer markup stay in `__root.tsx`: they are used once, and the repo's rule is not to
extract single-use code. `CassetteScene` stays separate because it is the existing self-contained
Three.js module, not a premature abstraction.

## 5. Content layer

Use `@content-collections/vite` plus `@content-collections/core`, with Effect Schema through
`Schema.toStandardSchemaV1`. The config is Node-only; Effect never enters the client bundle.

| Collection | Source | Schema |
| --- | --- | --- |
| `blog` | `src/content/blog/**/*.md` | `title`, `description`, `pubDate`, `updatedDate?`, `heroImage?` |
| `projects` | `src/content/projects/**/*.md` | `title`, `description`, `pubDate`, `href`, `tags: string[]` |
| `gallery` | `src/content/gallery/**/*.json` | `title`, `pubDate`, `slug`, `photos[] { image, title, caption? }` |

Rules:

- `pubDate` and `updatedDate` are ISO `YYYY-MM-DD`; decode with `Schema.DateFromString` (UTC
  midnight) and format in UTC. Change the four project dates; gallery dates are already ISO.
- IDs: `_meta.path` for blog and projects; gallery keeps its explicit `slug` as the public URL.
- Index pages sort by `pubDate` descending in the `Content` service.
- `caption: ""` stays falsy; no draft field. Content Collections `skip()` remains available later.
- The `blog` directory is scaffolded; an empty collection is valid and the index keeps its empty
  state.
- `japan-2026.json` changes `slug` from `fall-2026` to `japan-2026`; `/gallery/fall-2026/` gets a
  301. Remove the empty `src/assets/fall-2026/`.
- Image paths stay relative. The transform resolves them against `_meta.filePath`, checks them with
  `sharp().metadata()`, and stores `{ key, width, height }` where `key` is
  `/src/assets/<album>/<file>`.
- Body HTML is compiled in the transform with `@content-collections/markdown` (it accepts
  `remarkPlugins`/`rehypePlugins`) using `@shikijs/rehype` and the `tokyo-night` theme.
- The Vite plugin runs with `environment: "ssr"`; a writer hook adds
  `@tanstack/react-start/server-only` to the generated data. Collections are read only inside
  server functions.

```ts
// content-collections.ts (sketch)
const Blog = defineCollection({
  name: "blog",
  directory: "src/content/blog",
  include: "**/*.md",
  parser: "frontmatter",
  schema: Schema.toStandardSchemaV1(
    Schema.Struct({
      title: Schema.String,
      description: Schema.String,
      pubDate: Schema.DateFromString,
      updatedDate: Schema.optionalKey(Schema.DateFromString),
      heroImage: Schema.optionalKey(Schema.String),
    }),
  ),
  transform: async (doc) => ({
    ...doc,
    heroImage: await resolveImage(doc.heroImage, doc._meta.filePath),
    html: await markdownToHtml(doc.content),
  }),
})
```

## 6. Image pipeline

Build-time `vite-imagetools` (Sharp), WebP only, hashed Vite assets. No runtime `/_image`, no
Vercel Image Optimization, no committed derivatives.

| Preset | Query | Used by |
| --- | --- | --- |
| gallery | `?w=96;128;160;640;960;1280;1600;1920&format=webp&quality=80&as=img` | gallery strips and wall |
| hero | `?w=800;1024;1280&format=webp&quality=80&as=img` | blog hero |

- `as=img` returns `{ src, w, h, srcset }`. `sizes` stays manual and reuses the current strings.
- `src/lib/images.ts` is the client-safe manifest:

```ts
export const galleryImages = import.meta.glob(
  "/src/assets/**/*.{JPG,jpg,jpeg,png,PNG}",
  {
    eager: true,
    query: "?w=96;128;160;640;960;1280;1600;1920&format=webp&quality=80&as=img",
    import: "default",
  },
) as Record<string, Img>
```

- `ResponsiveImage` is the only image renderer. It renders `img` with `src`, `srcSet`, `width`,
  `height`, `sizes`, `loading="lazy"`, `decoding="async"`, `alt` and the caller's class.
- Configure a case-insensitive `include` in `vite-imagetools`; do not rename the `.JPG` files.
- No upscaling (imagetools does not enlarge by default; do not pass `allowUpscale`).
- Missing source fails the content transform's build with the file and path. EXIF/GPS is stripped.
- Cache `node_modules/.cache/imagetools` in CI. Derivatives are hashed Vercel assets.
- The gallery manifest is used by the index strip and the detail wall; the hero manifest by blog
  posts. No OG image.

## 7. Routing, rendering and response contracts

| URL | File | Data |
| --- | --- | --- |
| `/` | `index.tsx` | static |
| `/blog/` | `blog/index.tsx` | `getPosts` |
| `/blog/:slug` | `blog/$slug.tsx` | `getPost` |
| `/projects/` | `projects/index.tsx` | `getProjects` |
| `/projects/:slug` | `projects/$slug.tsx` | `getProject` |
| `/gallery/` | `gallery/index.tsx` | `getGalleries` |
| `/gallery/:slug` | `gallery/$slug.tsx` | `getGallery` |
| `/music/` | `music.tsx` | `getMusic` |

- `trailingSlash: "preserve"` matches Astro's `"ignore"`: `/music` and `/music/` both resolve and
  the canonical keeps the requested form. Internal links keep their current forms.
- Every page is SSR (`ssr: true`, the default). No prerender in this migration.
- Unknown slugs throw `notFound()`; a minimal `notFoundComponent` returns status 404 with a plain
  "Not found" message. Unmatched routes use the same component.
- `/gallery/fall-2026` and `/gallery/fall-2026/` throw
  `redirect({ to: "/gallery/japan-2026/", statusCode: 301 })`.
- `/music` has `headers: () => ({ "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" })`.
- `SITE_URL = "https://www.jwstn.dev"`; canonical is `SITE_URL` plus the request pathname. Absolute
  OG/Twitter URLs use `SITE_URL` (production-parity; local dev differs from the old request origin).
  Drop the Astro generator meta. Use route `head` functions.
- Enable `viewTransition` and scroll restoration. Focus `<main tabIndex={-1}>` after a forward
  navigation; do not steal focus on back/forward.
- Avoid a custom `src/start.ts` unless global middleware is needed; if added, include
  `createCsrfMiddleware()`.

## 8. Feeds and sitemap

A build-time Vite plugin emits these into the client output:

- `/rss.xml` and `/blog.xml` — blog posts; channel title/description from `src/consts.ts`, site
  `SITE_URL`, items `title`, `description`, `pubDate`, absolute `/blog/:id/` links. `/blog.xml`
  remains an intentional duplicate for existing subscribers.
- `/projects.xml` — absolute `/projects/:id/` links.
- `/gallery.xml` — absolute `/gallery/:slug/` links.
- `/sitemap-index.xml` — points at `https://www.jwstn.dev/sitemap-0.xml`.
- `/sitemap-0.xml` — every page and detail route with trailing slashes, no `<lastmod>`.

This is build tooling, not server-side execution, so the Effect-only boundary does not apply. Keep
the exact URLs; the sitemap gains the previously omitted detail pages. Validate the XML and links
in CI.

## 9. Effect services and server functions

All services live in `.server.ts` modules and are imported only inside server-function handlers.

| Module | Service | Responsibility |
| --- | --- | --- |
| `config.server.ts` | `AppConfig` | `lastfmApiKey: Option<Redacted<string>>`, `lastfmUsername` |
| `content.server.ts` | `Content` | `posts`, `post`, `projects`, `project`, `galleries`, `gallery`; sorting and lookup |
| `lastfm.server.ts` | `Lastfm` | `topArtists`, `recentTracks`; HTTP, decode, cache, stale snapshot |
| `runtime.server.ts` | — | one `ManagedRuntime` |
| `functions.ts` | — | thin `createServerFn` handlers |

- One module-level runtime, pinned on `globalThis` to survive module duplication, with a dev-only
  HMR dispose. Never build a runtime per request.
- `AppConfig` reads `Config.option(Config.Redacted("LASTFM_API_KEY"))` and
  `Config.string("LASTFM_USERNAME")` with default `jwstn`; a missing key is `None`, never a layer
  failure.
- `AppLayer` merges config, content and logger, and provides config plus `FetchHttpClient` to
  `Lastfm`. Keep the graph flat and topologically sorted.
- Server functions: `getPosts`, `getPost(slug)`, `getProjects`, `getProject(slug)`, `getGalleries`,
  `getGallery(slug)`, `getMusic`. Each runs `runtime.runPromise` inside `.handler()`.
- Expected Last.fm failures are results, not throws:
  `{ status: "live" | "stale" | "unavailable", artists, tracks }`. Content misses return `null` and
  routes throw `notFound()`. Defects escape and become 500s after logging.
- Logging uses `Logger.consoleJson`; log the Last.fm operation and cause, never the API key.
- Tests use `@effect/vitest`, `TestClock` and `HttpClient.make`, with a `ConfigProvider` for the
  no-key branch.

## 10. Last.fm cache

Two layers inside the `Lastfm` service:

1. `Cache.makeWith(lookup, { capacity: 16, timeToLive: (exit) => Exit.isSuccess(exit) ? "5 minutes" : Duration.zero })`.
2. A per-key `Ref<HashMap<string, CachedValue>>` holding the last successful value.

- Fresh value: `{ data, stale: false }`. Miss or failure with a snapshot: `{ data, stale: true }`.
  No snapshot: the `LastfmError` propagates.
- Keys are structured strings including method, username, period and limit; the API key is never a
  key.
- Concurrent `Cache.get`s for a missing key share one lookup; `getMusic` fetches both methods with
  `Effect.all(..., { concurrency: 2 })`.
- Both succeed: `live`, or `stale` if either is stale. Either fails without a snapshot:
  `unavailable` with empty arrays, matching today's all-or-nothing behavior.
- 5-second timeout, no retries. HTTP status checked; JSON decoded with `Schema`; Last.fm error
  payloads and decode failures become typed errors.
- The `/music` header stays `public, s-maxage=300, stale-while-revalidate=600`. The Effect cache is
  per Vercel instance; the CDN is the only layer shared by all visitors.
- Do not pass the request `AbortSignal` into the shared cache lookup.
- Log failures at warn and stale fallback at info. No API key in logs.

## 11. UI port

- `__root.tsx` renders the document shell: `<html lang="en" className="theme-isometric">`, head
  content, the blocking theme script, body classes, skip link, header/nav, `<main id="iso-main">`,
  footer and `<Scripts />`. Header state is React state; the burger, Escape handling, media query
  and close-on-pathname-change live in effects.
- `FormattedDate` formats in UTC with `Intl.DateTimeFormat("en-US", { ... })` and sets
  `dateTime={date.toISOString()}`.
- `IsoButton` is a React anchor with `clsx`, `variant`, `external` and the same depth/face spans.
- `ResponsiveImage` is the only image renderer.
- `Prose` renders trusted build-time HTML in `div.iso-prose` with `dangerouslySetInnerHTML`.
- `buildHead` in `src/lib/site.ts` builds canonical/OG/Twitter tags for every route.
- Keep all `iso-*` class names, `base.css`, `theme.css`, Tailwind v4, fontsource imports and the
  pseudo-element isometric depth. Replace `class:list` with `clsx` and `@lucide/astro` with
  `lucide-react`. No text arrows, no `box-shadow` depth.

## 12. Three.js scene

- `CassetteScene.tsx` renders the figure, stage and fallback on the server.
- Lazy-load the scene with `await import("./three/mount")` inside one `useEffect`, guarded by a
  `cancelled` flag; `three` stays out of the SSR graph and every non-home route.
- Enable `StrictMode`. The effect must dispose: stop the loop, disconnect observers and listeners,
  `OrbitControls.dispose()`, dispose the PMREM target and environment scene, traverse geometries,
  materials and textures, `renderer.dispose()`, `forceContextLoss()`, remove the canvas, clear
  effect-added classes/styles and delete the DEV hook.
- Preserve the coarse-pointer static scene, `touchAction: pan-y`, `role="img"` and the current
  aria-label.
- `prefers-reduced-motion: reduce` renders a static first frame, skips the idle loop, and repaints
  on interaction.
- Rebuild the scene on every arrival at `/` (no camera restore). DPR is sampled once.
- `window.__isoCassette` is DEV-only and deleted on cleanup.
- Verify WebGL contexts and document listeners stay flat across repeated navigation.

## 13. Styling, fonts and icons

- Global CSS only: import `base.css` then `theme.css` once in the root. Tailwind v4 stays on
  `@tailwindcss/vite`.
- Fonts stay `@fontsource-variable/space-grotesk` and `@fontsource-variable/geist-mono`, imported
  from `theme.css`.
- Icons become named `lucide-react` imports with the same sizes. Update the `AGENTS.md` rule
  accordingly.
- Keep the `theme-isometric` class on `<html>` at SSR and the `"theme"` localStorage key.

## 14. Accessibility and motion

- Keep the skip link, `sr-only` h1s, `aria-current`, `aria-expanded`/`aria-controls`,
  external-link rels, gallery hover/focus-within captions, focus-visible styles and reduced-motion
  CSS.
- Add main-region focus after forward navigation.
- Keep the scene's current accessible name; touch-specific copy, context-loss recovery, DPR changes
  and structured data are out of scope.
- Verify keyboard order, focus visibility and contrast on every route.

## 15. Performance

- Budget: LCP and CLS within 10% of the Astro baseline. Measure both stacks with the same
  Playwright/Lighthouse setup on the same routes and viewports.
- Keep the Three.js scene home-only and lazy.
- WebP-only build-time images; cold build is a few seconds for the current 22 photos, warm builds
  hit the imagetools cache.
- Pages remain SSR function invocations, as today; the CDN absorbs `/music` and static assets.
- Do not prerender in this migration; revisit after parity is measured.

## 16. Security and privacy

- The Last.fm key is server-only; it never enters a client bundle or a log.
- Effect and all `.server.ts` modules are import-protected; verify the client bundle has no `effect`
  or content-collection code.
- `vite-imagetools` strips EXIF/GPS by default.
- If `src/start.ts` is added, include `createCsrfMiddleware()`.
- Vercel preview URLs are noindexed; do not expose secrets in preview env names.
- HTML bodies are trusted local Markdown; do not introduce user-authored HTML without a sanitizer.

## 17. Testing and CI

- Unit tests with `@effect/vitest`: content ordering and misses, no-key branch, Last.fm 5xx/decode/
  timeout, cache TTL/stale/dedupe, layer composition.
- Feed/sitemap tests: valid XML, correct links, all detail routes, both sitemap URLs.
- Route smoke tests: 200/301/404, trailing-slash forms, cache header on `/music`.
- Visual diff: capture both stacks at 1440x900 and 375x812, full-page, 2500 ms wait, plus dark home;
  compare with `pixelmatch` at a 0.1% threshold and review every diff. `/music` uses a fixed Last.fm
  fixture; exclude live data from the diff.
- CWV check against the Astro baseline.
- Content authoring smoke: add a Markdown post and image, build, verify, remove.
- CI workflow on PRs: non-mutating Biome check, `tsc --noEmit`, `vitest run`, `pnpm build`. Do not
  use the repo's `--write` scripts in CI.

## 18. Deployment, cutover and rollback

- Code lives on a long-lived `tanstack-start` branch in this repo; `main` stays Astro until cutover.
  Tag `astro-final` at the last Astro commit.
- Create a separate Vercel project for the TanStack app so its Nitro framework preset never touches
  the Astro project. Use Node 24 and pnpm 11; set `LASTFM_API_KEY` and `LASTFM_USERNAME` in Preview
  and Production.
- Preview deployments run the visual diff and route/feed/sitemap smoke checks.
- Cutover: freeze content edits, merge `main` into the branch, run the full gate, tag `astro-final`,
  disable the Astro project's `main` workflow, merge to `main`, deploy the new project, smoke test
  the `*.vercel.app` URL, then move `www`/apex to the new project.
- Rollback: move `www`/apex back to the Astro project and promote its last production deployment; no
  code revert needed. Keep the old project for 7 days and rehearse the domain move.
- Data that must survive: content files, image paths, all URLs except the `fall-2026` 301, RSS
  subscribers, sitemap URLs and the canonical domain.

## 19. Implementation phases

| Phase | Work | Exit criteria |
| --- | --- | --- |
| 0 | Branch, second Vercel project, dependency/version floor, CI skeleton | hello-world SSR preview deploys |
| 1 | Content Collections, Effect Schema, dates, blog scaffold, slug fix, Markdown + Shiki, image pipeline, `ResponsiveImage` | content pages render with images; build and typecheck pass |
| 2 | Routes, head, 404, redirect, `/music` header, feeds/sitemap plugin | route/feed/sitemap smoke passes |
| 3 | Effect runtime, services, server functions, Last.fm cache | live/stale/unavailable and cache tests pass |
| 4 | Root shell, header/nav, footer, static pages | pixel diff on static routes within threshold |
| 5 | Music page and Three.js scene | three music states and scene teardown pass |
| 6 | Parity, accessibility, performance, CI | full gate green |
| 7 | Cutover, domain move, rollback rehearsal | definition of done |

## 20. File-by-file checklist

Delete/replace:

- `astro.config.mjs`, `src/content.config.ts`, `src/pages/*`, `src/layouts/Layout.astro`,
  `src/components/MetaTags.astro`, `FormattedDate.astro`, `IsoButton.astro`,
  `src/components/isometric/CassetteScene.astro`, `src/lib/lastfm.ts`, `src/pages/*.xml.js`.
- `@astrojs/*`, `astro`, `@lucide/astro`, `@astrojs/check` dependencies and scripts.

Keep:

- `src/styles/base.css`, `src/styles/theme.css`, `src/assets/**`, `src/content/**`,
  `public/favicon.*`, `docs/screenshots/**`, `biome.json`, the lockfile.

Add:

- `content-collections.ts`, `vite.config.ts`, `src/router.tsx`, `src/routes/**`, the React
  components, `src/server/**`, `src/lib/site.ts`, `src/lib/images.ts`, `src/lib/music.ts`,
  `build/feeds-plugin.ts`, tests, `scripts/visual-diff.mjs`, the CI workflow, this spec.

Update:

- `package.json` scripts and dependencies, `tsconfig.json` (`#/*`, `resolve.tsconfigPaths`, JSX),
  `.nvmrc`, `.env.example` only if names change, `README.md`, `AGENTS.md` (`ResponsiveImage`,
  `lucide-react`), `docs/STYLES.md`, `docs/SCREENSHOTS.md`.

Content edits:

- Normalize the four project dates to ISO.
- Change `japan-2026.json` slug to `japan-2026`.
- Remove `src/assets/fall-2026/`.
- Scaffold `src/content/blog/`.

## 21. Parity acceptance

| Check | Pass condition |
| --- | --- |
| Routes | expected 200/301/404, trailing-slash forms preserved |
| Feeds | valid XML, correct absolute links, `/blog.xml` alias works |
| Sitemap | `sitemap-index.xml` points at a complete `sitemap-0.xml` |
| Visual | pixel diff within 0.1% on static routes; `/music` three states verified |
| Performance | LCP/CLS within 10% of the Astro baseline |
| Music | exact cache header; live/stale/unavailable verified |
| Content | add a post and image, build, verify, remove |
| Build | Biome check, `tsc --noEmit`, `vitest run`, `pnpm build` pass |
| Rollback | domain moves to the old project and back |

## 22. Risks

- Content Collections is 0.x; pin core 0.15.3 and vite 0.3.1.
- Effect `HttpClient`/`FetchHttpClient` are marked unstable in 4.1.7; pin and read release notes.
- Vite's `emitAssets` default can hide SSR-only image derivatives; keep the image manifest
  client-reachable and test the build.
- Duplicate runtime modules across SSR/server-function chunks; pin on `globalThis` and verify one
  cache per process.
- The Last.fm cache is per instance; the CDN is the shared layer.
- Full React hydration replaces Astro islands; measure client JS against the baseline.
- The Three.js teardown is the main porting risk; StrictMode double-mount must not leak contexts.
- Hashed image URLs change on re-encode; do not hardcode them.
- Date/timezone drift is avoided by ISO/UTC, but keep it enforced in tests.
- The Vercel framework preset and domain move are the main cutover risks; use a separate project.
- Server-function payloads grow with long HTML bodies; RSC/streaming is the escape hatch.
- Trailing-slash preservation can produce two canonical URLs; this matches current behavior and is
  accepted.
- Shiki `tokyo-night` is dark in both modes; add a light theme only if the design needs it.
- The build-time feed/sitemap plugin is new code; validate its output in CI.

## 23. Out of scope

Visual redesign; CMS, admin upload or object storage; new features or content; AVIF/next-gen
formats; social/OG images; drafts/preview workflow; WebGL context-loss recovery; DPR-change
handling; touch-specific scene copy; structured data; prerender optimization; search; analytics;
auth; database; native/mobile apps; running Astro and TanStack Start in parallel permanently.

## 24. References

- Map: [#56](https://github.com/jwstn/jwstn.dev/issues/56)
- Resolved decisions: [#62](https://github.com/jwstn/jwstn.dev/issues/62),
  [#63](https://github.com/jwstn/jwstn.dev/issues/63),
  [#64](https://github.com/jwstn/jwstn.dev/issues/64),
  [#65](https://github.com/jwstn/jwstn.dev/issues/65),
  [#66](https://github.com/jwstn/jwstn.dev/issues/66),
  [#67](https://github.com/jwstn/jwstn.dev/issues/67),
  [#68](https://github.com/jwstn/jwstn.dev/issues/68)
- Research tickets: [#57](https://github.com/jwstn/jwstn.dev/issues/57),
  [#58](https://github.com/jwstn/jwstn.dev/issues/58),
  [#59](https://github.com/jwstn/jwstn.dev/issues/59),
  [#60](https://github.com/jwstn/jwstn.dev/issues/60),
  [#61](https://github.com/jwstn/jwstn.dev/issues/61)
- Research files live on the `research/*` branches and are linked from each ticket.
