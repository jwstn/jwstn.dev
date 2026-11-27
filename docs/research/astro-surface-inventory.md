# Astro-only surface inventory

**Ticket:** [jwstn/jwstn.dev#60](https://github.com/jwstn/jwstn.dev/issues/60) · **Map:** [#56](https://github.com/jwstn/jwstn.dev/issues/56)
**Baseline:** Astro 7.4.12, `output: "server"`, `@astrojs/vercel` 11.0.22, commit `9c1f456`.
**Scope:** inventory only — no source or config changes, no decisions locked here.

## Headline conclusion

The repo is **small but image-heavy**: 13 `.astro` files, 8 page routes, 4 XML endpoints, 3 content
collections, 22 source photos (134 MB), and no Astro middleware, actions, sessions, i18n, server
islands, scoped styles or `set:html`. Roughly **80% of the surface has a mechanical React/TanStack
equivalent** (props/params/URL/slots/`class:list`/icons/alias/env). **Five things have no first-party
equivalent and drive the migration design**: the content layer with its `image()` helper, the
`astro:assets` `<Image>` pipeline (which here is an *on-demand* sharp endpoint at `/_image`, not
build-time output), Markdown `render()`, `@astrojs/rss`/`@astrojs/sitemap`, and Astro's view-transition
lifecycle (`astro:page-load` / `astro:before-swap`). Two verified facts sharpen the risk: the current
sitemap **already omits every detail page** (it lists only the 5 index routes), and all 13 Astro files
render **on demand** (`prerender: false`) — nothing is statically generated today.

## Method & sources

- Read the ticket and map (#60, #56) with `gh`.
- Inventoried the repository in an isolated worktree (`research/astro-surface-inventory`, from `main`
  @ `9c1f456`), using `grep` sweeps for every Astro API named in the ticket.
- Treated **Astro 7.4.12's own types/source in `node_modules`** as the primary definition of the APIs
  (`node_modules/astro/dist/assets/types.d.ts`, `components/Image.astro`,
  `node_modules/@astrojs/sitemap/dist/index.js`, `node_modules/@astrojs/vercel/dist/index.d.ts`,
  `node_modules/@astrojs/rss/dist/index.d.ts`).
- Built the site (`astro build`, Vercel adapter) in a throwaway copy and inspected
  `dist/client/sitemap-*.xml`, `.vercel/output/config.json` and the server manifest; ran `astro dev`
  and probed `/gallery/`, `/music` and an unmatched path with `curl` to capture real emitted HTML,
  headers and 404 behaviour.
- Cross-checked replacement mechanisms against official docs: Astro images/content references, Vite
  assets/env/config, TanStack Start server routes/functions/env/hosting, TanStack Router head/not-found,
  and the TanStack Router `Link` source.

Everything below marked **verified** was observed in this repository's own build or dev output, not
inferred from docs.

## 1. Surface summary

| Astro surface | Occurrences | Files | Clean React/TanStack equivalent? |
| --- | --- | --- | --- |
| `astro:content` (`defineCollection`, `glob`, `getCollection`, `render`) | 11 files | `src/content.config.ts` + 10 routes | ⚠️ No — build-time module + Markdown renderer needed |
| `image()` schema helper | 2 call sites | `content.config.ts:16,44` | ❌ No — must reproduce `{src,width,height,format}` metadata |
| `astro:assets` `<Image>` | 3 files / 4 usages | gallery index + both detail pages | ❌ No — srcset + `/_image` endpoint |
| `Astro.props` | 4 components | Layout, MetaTags, IsoButton, FormattedDate | ✅ React props |
| `Astro.params` | 3 routes | blog/projects/gallery `[...slug]` | ✅ `Route.useParams()` / loader `params` |
| `Astro.url` | 2 files / 3 uses | Layout:18, MetaTags:14,31,35 | ✅ router location / request URL |
| `Astro.site` | 1 | MetaTags:14 | ⚠️ No — becomes a `SITE_URL` constant |
| `Astro.generator` | 1 | MetaTags:23 | ✅ delete (Astro branding) |
| `Astro.response.headers` | 1 | music.astro:27 | ✅ `setResponseHeaders()` / middleware |
| `src/pages` file routing | 8 pages + 4 endpoints | see §2 | ✅ file routes / server routes |
| `@astrojs/rss` | 4 endpoints | `*.xml.js` | ⚠️ No — hand-rolled XML server route |
| `@astrojs/sitemap` | 1 integration | `astro.config.mjs:9` | ⚠️ No — build step or route |
| `@astrojs/vercel` | 1 adapter | `astro.config.mjs:16` | ✅ Nitro/Vercel deployment |
| `#/*` tsconfig alias | 27 imports | all over `src` | ✅ `resolve.tsconfigPaths` / `resolve.alias` |
| `import.meta.env` | 2 files | lastfm.ts:37, CassetteScene:462 | ✅ Vite `import.meta.env` (server env → `process.env`) |
| `astro:transitions` `ClientRouter` | 1 | MetaTags:5,39 | ⚠️ Client routing replaces it; `viewTransition` opt-in |
| `astro:page-load` / `astro:before-swap` | 4 listeners | Layout, MetaTags, CassetteScene | ⚠️ React mount/unmount effects |
| Slots | 2 | Layout:116, IsoButton:26 | ✅ `children` |
| `class:list` | 3 | music:88, gallery detail:36, IsoButton:19 | ✅ `clsx` / template string |
| `set:html`, `define:vars`, `client:*`, scoped `<style>` | 0 | — | ✅ nothing to port |
| `is:inline` script | 1 | MetaTags:41 | ✅ `ScriptOnce` / inline script |
| Bundled `<script>` | 2 | Layout:125, CassetteScene:24 | ✅ component module + `useEffect` |
| `@lucide/astro` | 8 files | see §5 | ✅ `lucide-react` |
| `astro/types` `HTMLAttributes<"a">` | 1 | IsoButton:7,9 | ✅ `AnchorHTMLAttributes<HTMLAnchorElement>` |

## 2. Routes (all server-rendered, no `getStaticPaths`)

Verified from the build manifest: every route has `"prerender": false`; the Vercel output is a single
`_render` function with a catch-all `^/.*$` route.

| URL | Source | Notes for the port |
| --- | --- | --- |
| `/` | `src/pages/index.astro` | static markup + client 3D scene |
| `/blog/` | `src/pages/blog/index.astro` | empty-state branch when `posts.length === 0` (blog dir does not exist) |
| `/blog/:slug` | `src/pages/blog/[...slug].astro` | rest param; lookup by `p.id === slug`; 404 via `return new Response("Not found", {status:404})` |
| `/gallery/` | `src/pages/gallery/index.astro` | album list, 4 thumbnails each |
| `/gallery/:slug` | `src/pages/gallery/[...slug].astro` | lookup by `album.data.slug` (not `id`) |
| `/projects/` | `src/pages/projects/index.astro` | sorted by `pubDate` |
| `/projects/:slug` | `src/pages/projects/[...slug].astro` | lookup by `p.id` |
| `/music` | `src/pages/music.astro` | SSR Last.fm fetch + response cache header |
| `/blog.xml` | `src/pages/blog.xml.js` | endpoint `GET(context)`; duplicate of `rss.xml` |
| `/gallery.xml` | `src/pages/gallery.xml.js` | endpoint; links use `image.id`, not `data.slug` |
| `/projects.xml` | `src/pages/projects.xml.js` | endpoint; links use `/project/${id}/` (wrong prefix) |
| `/rss.xml` | `src/pages/rss.xml.js` | endpoint; canonical feed |
| *(404)* | none | no `404.astro`; Astro's built-in 404 page (**verified**: HTML `404: Not Found`, status 404) |

TanStack mapping: `src/routes/index.tsx`, `blog/index.tsx`, `blog/$.tsx` (splat, `_splat` param),
`gallery/…`, `projects/…`, `music.tsx`, and server routes named `blog[.]xml.ts`, `gallery[.]xml.ts`,
`projects[.]xml.ts`, `rss[.]xml.ts` ([TanStack server routes — escaped matching](https://tanstack.com/start/latest/docs/framework/react/guide/server-routes#escaped-matching)).
404s become `throw notFound()` + `notFoundComponent` ([TanStack not-found](https://tanstack.com/router/latest/docs/framework/react/guide/not-found-errors)),
which changes the 404 body from plain text/blank Astro page to rendered HTML — a parity decision, not a
mechanical port.

## 3. Content layer

`src/content.config.ts` (52 lines) is the single Astro-specific data definition:

| Collection | Loader | Schema (lines) |
| --- | --- | --- |
| `blog` | `glob({ base: "./src/content/blog", pattern: "**/*.{md,mdx}" })` (7) | `title`, `description`, `pubDate` (`z.coerce.date()`), `updatedDate?`, `heroImage?` via `image()` (9–17) |
| `projects` | `glob({ base: "./src/content/projects", pattern: "**/*.{md,mdx}" })` (22) | `title`, `description`, `pubDate`, `href`, `tags: string[]` (24–32) |
| `gallery` | `glob({ pattern: "**/*.json", base: "./src/content/gallery" })` (36) | `title`, `pubDate`, `slug`, `photos[] { image: image(), title, caption? }` (37–49) |

Facts that matter for the replacement:

- **`image()` resolves a path relative to the content file and returns image metadata.** Gallery JSON
  uses `"../../assets/<album>/<file>.JPG"` (`src/content/gallery/*.json`), i.e. relative to
  `src/content/gallery/`. `gallery/[...slug].astro:32` then reads `photo.image.width / photo.image.height`
  to classify plates as wide/tall — so the replacement must expose real intrinsic dimensions, not just a
  URL.
- **`glob()` ids are slugified** ([Astro `CollectionEntry.id`](https://docs.astro.build/en/reference/modules/astro-content/#collectionentryid));
  list routes build hrefs from `post.id` / `project.id` (`blog/index.astro:43`, `projects/index.astro:23,35`).
- **`src/content/blog/` does not exist** — the build logs `[glob-loader] The base directory … does not
  exist`; the blog collection is empty and the index renders its empty state. Any replacement loader
  must tolerate a missing/empty directory (map already flags “seed content” as undecided).
- **Project bodies use only paragraphs, `**bold**`, `__underline__` and inline links** (no headings,
  fences, images or raw HTML), so `render()` only needs a minimal Markdown pipeline today. There is no
  blog corpus to test richer syntax against.
- There is **no `reference()`**, no live collection, no custom loader, no `remark`/`rehype` config.

`render()` (`blog/[...slug].astro:13`, `projects/[...slug].astro:13`) returns a `<Content />`
component. TanStack has no content-collection or MDX renderer built in; the replacement is a build-time
data module (Vite `import.meta.glob` + frontmatter parser + Zod) plus a Markdown-to-HTML/component step
(`@mdx-js/mdx`, `marked`, or `remark`+`rehype`). This is the largest design gap after images.

## 4. Images (`astro:assets`)

Four `<Image>` usages, with exactly these props:

| File | Props | Emitted behaviour (verified) |
| --- | --- | --- |
| `gallery/index.astro:32-39` | `src={photo.image}`, `alt`, `widths=[96,128,160]`, `sizes`, `loading="lazy"`, `decoding="async"` | `<img>` with `srcset` of `/_image?…&w=96|128|160`, `width`/`height` = **original** dims, `data-image-component` in dev |
| `gallery/[...slug].astro:39-46` | `widths=[640,960,1280,1600,1920]`, `sizes`, lazy, async | same pattern at 5 widths |
| `blog/[...slug].astro:52-58` | `src={heroImage}`, `alt`, `widths=[800,1024,1280]`, `sizes` | lazy/async defaults applied by Astro |

Verified output shape:

```html
<img src="/_image?href=%2F%40fs%2F…%3ForigWidth%3D4000%26origHeight%3D6000…&amp;w=4000&amp;h=6000&amp;f=webp"
     srcset="/_image?…&amp;w=96&amp;h=144&amp;f=webp 96w, …"
     sizes="(min-width: 48rem) 10rem, 22vw" loading="lazy" decoding="async"
     width="4000" height="6000" alt="…">
```

Replacement facts:

- **There is no build-time image output in this repo.** Because every route is SSR, transformations run
  per request through Astro's `/_image` endpoint backed by sharp (manifest lists `/_image` → generic
  endpoint + `sharp.js`; `@astrojs/vercel` `imageService` is *not* enabled, so this is Astro's own
  endpoint, not Vercel Image Optimization).
- **The 22 originals (134 MB, up to 6000 px) are also copied into the client build as hashed
  `_astro/*.JPG` assets**, and each `<img>` points at `/_image` for the actual bytes.
- Astro components such as `<Image>` **cannot be used inside React/framework components**
  ([Astro images guide](https://docs.astro.build/en/guides/images/#images-in-ui-framework-components)),
  so the repo rule “always render images through an optimizing component” must be re-implemented as a
  React component.
- Vite asset imports return **only a URL** — no dimensions, no transforms
  ([Vite static assets](https://vite.dev/guide/assets#importing-asset-as-url)). Any React `<Image>`
  therefore needs either `vite-imagetools`/sharp output emitted at build, or a runtime transform
  endpoint; `width`/`height` must come from a generated metadata map (the gallery layout depends on it).
- `widths` + `sizes` → `srcset` is the only responsive feature used; Astro's `layout`/`densities` props
  and `image.layout` config are **not** used here. Astro's `<Image>` also auto-adds `loading="lazy"` and
  `decoding="async"` when unspecified ([Astro images guide](https://docs.astro.build/en/guides/images/#image-)).

## 5. File-keyed checklist

### Config & tooling

| File | Astro surface | Replacement |
| --- | --- | --- |
| `astro.config.mjs:1-17` | `defineConfig`, `site: "https://www.jwstn.dev"`, `output: "server"`, `integrations: [sitemap()]`, `adapter: vercel()`, `vite.plugins: [tailwindcss()]` | Vite config with `tanstackStart()` + `viteReact()` + `tailwindcss()`; `site` becomes a `SITE_URL` const; SSR is the default Start behaviour; sitemap and Vercel adapter replaced (§7) |
| `tsconfig.json:2-12` | `extends: "astro/tsconfigs/strict"`, `include: [".astro/types.d.ts", "**/*"]`, `paths: {"#/*": ["./src/*"]}`, `jsx: react-jsx` | plain `strict` TS config; keep `paths` and enable Vite `resolve.tsconfigPaths` (Vite 8, default `false`) or declare `resolve.alias` — [Vite config](https://vite.dev/config/shared-options#resolve-tsconfigpaths) |
| `package.json:9-15` | `astro dev/build/preview/astro` scripts | `vite dev` / `vite build` / server start (Nitro shape for Vercel); `check` stays Biome |
| `package.json:18,25` | `@astrojs/check` (no script uses it), `@lucide/astro` | drop `@astrojs/check`; `lucide-react` |
| `package.json:19-21,27` | `@astrojs/rss`, `@astrojs/sitemap`, `@astrojs/vercel`, `astro` | remove; add `@tanstack/react-router`, `@tanstack/react-start`, `react`, `react-dom` |
| `.github/workflows/*.yaml:8-9` | `PUBLIC_VERSION`, `PUBLIC_RELEASE_VERSION` (Astro's client prefix) — **not referenced anywhere in `src`** | rename to `VITE_*` only if used; otherwise dead config. `vercel build`/`vercel deploy` steps are framework-agnostic but rely on Vercel framework detection — verify after the port |
| `src/env.d.ts:1-6` | `/// <reference types="astro/client" />`, `ImportMetaEnv` | `/// <reference types="vite/client" />` + `ProcessEnv` augmentation for `LASTFM_*` ([TanStack env types](https://tanstack.com/start/latest/docs/framework/react/guide/environment-variables#type-safety)) |

### Routes

| File | Astro surface | Replacement |
| --- | --- | --- |
| `src/pages/index.astro` | `Layout` + `.astro` children, `@lucide/astro` (2,40,41), `CassetteScene` (45), `doors.map` JSX (51-66) | `routes/index.tsx`: JSX + `children`; icons from `lucide-react`; scene as a client-only component |
| `src/pages/blog/index.astro` | `getCollection("blog")` + sort (8), `.astro` components, empty-state ternary (18-53) | route loader (or build-time module) + normal React `posts.length === 0` branch |
| `src/pages/blog/[...slug].astro` | `Astro.params.slug` (8), 404 `Response` (10-12), `render()` (13), `<Image>` (52-58), `<Content />` (64) | `blog/$.tsx` + `Route.useParams()`; `throw notFound()`; precompiled Markdown → HTML/component |
| `src/pages/blog.xml.js` | `getCollection` (1,6), `rss()` (7), `context.site` (10), relative `../consts` import (3) | server route `blog[.]xml.ts` returning `Response` with `application/xml`; hardcode/import `SITE_URL` |
| `src/pages/gallery/index.astro` | `getCollection` (6,8), `<Image>` strip (32-39), `album.data.slug` hrefs (29) | list route + new `<Image>`; same URLs |
| `src/pages/gallery/[...slug].astro` | `Astro.params.slug` (8), 404 (10-12), `ImageMetadata.width/height` ratio (32), `class:list` (36), `<Image>` (39-46) | detail route + `notFound()`; intrinsic dimensions from image manifest; `clsx` |
| `src/pages/gallery.xml.js` | `getCollection` (1,6), `rss()` (7), `context.site` (10), links use `image.id` (13) | server route; align on `data.slug` (see §8, pre-existing bug) |
| `src/pages/projects/index.astro` | `getCollection` (6,8), icons (2,35,37), `IsoButton` (35-38) | list route; `lucide-react`; IsoButton → React |
| `src/pages/projects/[...slug].astro` | `Astro.params.slug` (8), 404 (10-12), `render()` (13), `<Content />` (51) | detail route + `notFound()` + Markdown render |
| `src/pages/projects.xml.js` | `getCollection` (1,6), `rss()` (7,10), link prefix `/project/…` (13) | server route; fix prefix to `/projects/…` (pre-existing bug) |
| `src/pages/rss.xml.js` | `getCollection` + sort (6), `rss()` (7-17), `context.site` (10), `#/consts` (3) | server route; same feed contract |
| `src/pages/music.astro` | SSR fetch in frontmatter (12-25), `Astro.response.headers.set` (27), `class:list` (88), icons none | route loader calling an Effect service; set CDN header via `setResponseHeaders`/middleware; `clsx` |

### Components & layout

| File | Astro surface | Replacement |
| --- | --- | --- |
| `src/layouts/Layout.astro` | `Astro.props` (11), `Astro.url.pathname` for active nav (18,25), `<slot />` (116), `<script>` (125-176) listening to `astro:page-load` (175), icons (2) | root layout component: props/`children`; active nav from router state or `Link activeProps` (sets `aria-current="page"` — see `Link` source below) plus `data-status="active"`; burger menu becomes a `useEffect`/component state |
| `src/components/MetaTags.astro` | `ClientRouter` (5,39), `canonicalURL = new URL(Astro.url.pathname, Astro.site)` (14), `Astro.props` (16), `Astro.generator` (23), `og:url`/`twitter:url` = `Astro.url` (31,35), `is:inline` theme script (41-58) + `astro:page-load` (56) | head via route `head`/`<HeadContent />` ([TanStack head](https://tanstack.com/router/latest/docs/framework/react/guide/document-head-management)); canonical from `SITE_URL` + pathname; drop generator; theme script via `<ScriptOnce>` (documented for exactly this pre-hydration case) |
| `src/components/FormattedDate.astro` | `Astro.props` (2-6) | plain React component; **hydration caveat**: `toLocaleDateString` must produce identical output on server and client (locale/timezone pinning) |
| `src/components/isometric/IsoButton.astro` | `HTMLAttributes<"a">` from `astro/types` (7,9), `Astro.props` (15), `class:list` (19), spread props (23), `<slot />` (26) | `AnchorHTMLAttributes<HTMLAnchorElement>`, `rest` spread, `clsx`, `children` |
| `src/components/isometric/CassetteScene.astro` | bundled `<script>` with three.js (24-482), `astro:before-swap` disposal (448-460), `import.meta.env.DEV` (462), `astro:page-load` boot (481) | client-only React component; `useEffect` init + cleanup (replaces `before-swap`), `IntersectionObserver`/`ResizeObserver` unchanged; `import.meta.env.DEV` works as-is in Vite. Note the build warns this chunk is >500 kB |
| `src/components/isometric/three/*.js` | none | copy unchanged (no Astro references) |
| `src/lib/lastfm.ts` | `import.meta.env` cast + `process.env` fallback (36-41) | server-only Effect service reading `process.env` per request; `import.meta.env` is **statically replaced at build time** and only `VITE_*` reaches the client ([Vite env](https://vite.dev/guide/env-and-mode)) |
| `src/styles/base.css`, `src/styles/theme.css` | none (plain global CSS) | keep; Tailwind v4 + `@fontsource-variable/*` imports are Vite-native. **No scoped styles anywhere** (0 `<style>` blocks), so no Astro style scoping to unwind |

### Ambient content

| File | Astro surface | Replacement |
| --- | --- | --- |
| `src/content/gallery/*.json` | `image` paths resolved by `image()` relative to the JSON file (`../../assets/…`) | loader must resolve relative to the content file and emit metadata |
| `src/content/projects/*.md` | frontmatter parsed by the collection schema; body rendered by `render()` | same frontmatter shape via Zod; minimal Markdown renderer |

## 6. Verified current behaviour worth preserving (or consciously changing)

1. **Everything is SSR.** All 12 project routes (8 pages + 4 endpoints) show `"prerender": false`; the Vercel adapter emits one
   `_render` function plus a `^/.*$` catch-all. Migration must not accidentally turn pages into client-only
   shells or SSG without a decision.
2. **Cache header contract.** `GET /music` returns
   `cache-control: public, s-maxage=300, stale-while-revalidate=600` (verified with `curl`). This is the
   only per-route response header in the repo.
3. **`/music` renders three states** — not configured, upstream error, data — decided at request time
   from env + Last.fm outcome (`music.astro:19-25,39-56`).
4. **404s.** Unmatched URLs and unknown slugs return status 404. Unknown slugs return a **plain-text**
   body (`new Response("Not found")`); unmatched URLs get Astro's built-in HTML 404. In TanStack both
   become the `notFoundComponent` HTML — a visible (if minor) parity change.
5. **Head output.** Canonical is absolute on `https://www.jwstn.dev` with the path's own trailing-slash
   form (`/gallery/` vs `/music`); `og:url`/`twitter:url` use the **request** origin (so `localhost` in
   dev); `<meta name="generator" content="Astro v7.4.12">`; view-transition meta tags
   `astro-view-transitions-enabled` / `-fallback=animate`.
6. **`<Image>` emits original intrinsic dimensions** as `width`/`height` even when displaying at 96 px,
   and `data-image-component` in dev — parity screenshots taken in dev will contain dev-only attributes.
7. **Astro 7 compresses HTML in `jsx` mode** (manifest `"compressHTML":"jsx"`; config does not override).
   Whitespace between elements/text nodes is therefore JSX-like — compare against React's whitespace
   handling when chasing pixel parity.
8. **Sitemap gap (verified).** `dist/client/sitemap-0.xml` contains exactly
   `/`, `/blog/`, `/gallery/`, `/music/`, `/projects/` — no album, project or post URLs. The integration
   only adds routes with a static `pathname` (`@astrojs/sitemap/dist/index.js:39-78`), and the dynamic
   routes are SSR-only. So the current behaviour is “incomplete sitemap”; “parity” and “fix” are both
   available.

## 7. Integration replacements in detail

- **`@astrojs/rss` (4 endpoints).** No TanStack equivalent; write a small XML serializer in a server
  route (`GET` handler returning `new Response(xml, { headers: { "content-type": "application/xml" } })`).
  Preserve URLs and the current item fields (`title`, `description`, `pubDate`, `link`); note
  `blog.xml.js` is a duplicate of `rss.xml.js`, and the gallery/projects feeds contain link bugs (§8).
  Keep the channel `site` absolute — it came from `context.site` (i.e. `astro.config.mjs` `site`).
- **`@astrojs/sitemap`.** No TanStack equivalent. Options: emit XML during the build from the route
  manifest/content index, or serve `/sitemap-index.xml` + `/sitemap-0.xml` from a server route. Current
  output is a `sitemapindex` pointing at `sitemap-0.xml`; both are static files under the adapter.
  Whatever is chosen must keep those two URL shapes if the map's “same URL shapes” constraint covers
  them.
- **`@astrojs/vercel`.** TanStack Start documents Vercel deployment through Nitro
  ([TanStack hosting — Vercel](https://tanstack.com/start/latest/docs/framework/react/guide/hosting#vercel)).
  Consequences to re-establish: single serverless function bundling, immutable `cache-control` for hashed
  assets (`^/_astro(?:/(.*))$` today), and the `/_image` transform endpoint (or its build-time
  replacement). `.vercel/` is gitignored; CI uses the Vercel CLI, not the adapter directly.
- **`@lucide/astro` → `lucide-react`.** Eight files import `ArrowRight`, `ArrowLeft`, `ExternalLink`
  (`index.astro:2`, `Layout.astro:2`, blog index/detail:2, gallery index/detail:2, projects index/detail:2).
  Icon names and `size` prop carry over unchanged; component syntax `<Icon />` already matches JSX.
- **View transitions.** `ClientRouter` (MetaTags:39) is replaced by TanStack Router's client navigation.
  Its `Link`/`navigate` options include `viewTransition` (“Use View Transitions/React transitions for
  navigation”) and apply `aria-current="page"` + `data-status="active"` automatically
  ([`Link` source](https://github.com/TanStack/router/blob/main/packages/react-router/src/link.tsx)).
  The three `astro:page-load` listeners and the one `astro:before-swap` listener become React
  effects/cleanup; the scene's disposal path gets simpler and more reliable.

## 8. Pre-existing bugs found while inventorying (fix-or-preserve decisions)

These are unrelated to Astro but will be touched by the port:

1. `src/pages/projects.xml.js:13` links to `/project/${id}/` — no such route; the pages use `/projects/…`.
2. `src/pages/gallery.xml.js:13` links with `image.id` while pages use `album.data.slug`. They coincide
   today because each JSON filename equals its `slug`, but they are different fields, and the feed
   spreads `...image.data` (including the `photos` array) into an RSS item.
3. `src/pages/blog.xml.js` duplicates `rss.xml.js`; both will be empty feeds while the blog collection is
   missing.
4. `MetaTags.astro`'s `transitions` prop is never passed by any caller (dead option).
5. `@astrojs/check` is installed but no script runs `astro check`.
6. `Transitions`-related inline script comment says view transitions re-execute inline scripts; that
   assumption disappears with client-side React routing (the theme script must not re-run on every
   navigation).

## 9. Risky items — no clean equivalent

| # | Item | Why it is risky | Intended replacement |
| --- | --- | --- | --- |
| 1 | `image()` metadata (relative path → `{src,width,height,format}`) | Gallery layout maths and `<Image>` sizing both depend on real dimensions; relative resolution is content-file-based | Build-time image manifest generated with sharp (or `vite-imagetools` metadata sidecar) consumed by the content loader |
| 2 | `astro:assets` `<Image>` responsive output | No React equivalent; must reproduce `srcset`, `sizes`, `width`/`height`, lazy/async defaults while keeping the “no raw `<img>`” repo rule | One repo `<Image>` component + either build-time variants or a runtime `/_image`-style endpoint |
| 3 | On-demand image transform endpoint | Today `/_image` sharp-transforms 134 MB of 4000–6000 px originals **per request**; Vercel’s image service is not enabled | Decide build-time generation vs runtime endpoint (cost/caching); this is the biggest performance-parity lever |
| 4 | `render()` Markdown | No TanStack/MDX equivalent wired in; `<Content />` component contract disappears | Precompile Markdown at build to HTML or MDX components (content is currently simple enough for either) |
| 5 | RSS + sitemap | No first-party TanStack equivalents; current sitemap is incomplete by construction | Small XML emitters (build step or server routes), same URLs |
| 6 | Per-route response headers in SSR | `Astro.response.headers` has no page-level analogue; needs `setResponseHeaders` in a loader/server function or request middleware | Confirm the exact hook in the Effect/HTTP ticket; keep `s-maxage=300, stale-while-revalidate=600` on `/music` |
| 7 | View-transition lifecycle (`astro:page-load`, `astro:before-swap`) | Not an API port: the navigation model changes from MPA+transitions to SPA routing | React mount/unmount effects; opt-in `viewTransition` where motion parity matters |
| 8 | 404 semantics | Slug misses are plain text today; unmatched paths use Astro’s built-in page | `notFoundComponent` + `defaultNotFoundComponent`; decide whether to keep plain text for slug misses |
| 9 | URL shape | Astro `trailingSlash: "ignore"` accepts both `/music` and `/music/`; canonical keeps whichever was requested | TanStack route matching is exact; trailing-slash strategy must be decided (same-URL constraint from the map) |
| 10 | Deploy pipeline | `astro build` output layout (`.vercel/output`, `_render`, `_astro/*`) disappears | Nitro/Vercel build; re-verify CI (`vercel build` framework detection, cache headers, function size) |

## 10. Practical implications for this project

- **The port is mostly mechanical, not conceptually hard** — props, params, URL, slots, `class:list`,
  icons, alias, env and `import.meta.env.DEV` all have direct equivalents. Budget the time on the five
  ❌ items, not on the 141 `class=` → `className` edits.
- **The image pipeline is the real migration project.** It touches the repo rule (“always `<Image>`”), the
  gallery’s aspect-ratio layout, the 134 MB asset payload, the Vercel function, and Core Web Vitals
  parity. It should be decided before any UI porting starts.
- **Content collections are a loader, not a framework feature.** A single build-time module (glob +
  frontmatter + Zod + image manifest) can serve every route and every feed, which also removes the
  `getCollection` calls from request paths.
- **Preserve SSR deliberately.** Nothing is prerendered today, and `/music` depends on request-time
  behaviour. If the new app prerenders `/`, `/blog/`, `/gallery/`, `/projects/`, that is a change in
  deployment semantics and should be an explicit decision, not a default.
- **Fix or record the feed bugs while porting.** Two malformed links and one duplicate feed are cheaper to
  fix during the rewrite than to preserve byte-for-byte.
- **Keep the global CSS model.** All styling is already framework-neutral (Tailwind v4 + 1,613 lines of
  `theme.css`), so pixel parity depends on markup structure and whitespace, not on Astro’s style system.
- **`@fontsource` and `three` need no work**; `lucide-react` is the only icon swap.

## 11. Open questions / risks for the map

1. **Image strategy:** build-time variants vs runtime endpoint; which widths/format; where metadata comes
   from. (Blocks the UI/image tickets.)
2. **Sitemap:** reproduce today’s 5-URL output, or enumerate all detail pages? (Map lists RSS/sitemap as
   unspecified.)
3. **Feeds:** are `/blog.xml`, `/gallery.xml`, `/projects.xml` still wanted, or should they collapse into
   `/rss.xml`? Fix the malformed links unconditionally?
4. **404 parity:** HTML not-found page (TanStack default) vs today’s plain-text slug misses. Which is the
   acceptance bar?
5. **Trailing slash / URL shape:** Astro currently tolerates both; TanStack matches exactly. Decide the
   canonical form before SEO parity work.
6. **Cache headers:** where in the Start/Effect stack does `Cache-Control` get set for `/music` (loader,
   server function, request middleware)?
7. **View transitions:** is the cross-page transition animation part of the parity bar, or is instant SPA
   navigation acceptable?
8. **Empty blog:** keep the collection empty (parity) or seed it? This changes whether the Markdown
   renderer is exercised at all during acceptance.
9. **Deploy check:** does `vercel build` still detect/build the app after the Astro adapter is gone, and
   does the single-function model still apply under Nitro?
