# TanStack Start architecture and Vercel deployment

Research for [jwstn.dev#57](https://github.com/jwstn/jwstn.dev/issues/57), 2026-11-27.
Scope: routing, rendering, server APIs, response control, environment variables, Vercel
deployment and caching, as they constrain the Astro 7 (`output: "server"`) migration.

## Answer / recommendation

TanStack Start is stable and is a React full-document SSR framework built on TanStack Router
and Vite. The current npm `latest` is **1.169.7**, requiring **Node >= 22.12.0**, **Vite >= 8**
and React 18 or 19 ([npm registry](https://registry.npmjs.org/@tanstack/react-start/latest),
[Start overview](https://tanstack.com/start/latest/docs/framework/react/overview)). It is a
file-based router; **SSR is the default for every route**, while static prerendering is opt-in
([Selective SSR](https://tanstack.com/start/latest/docs/framework/react/guide/selective-ssr),
[Static Prerendering](https://tanstack.com/start/latest/docs/framework/react/guide/static-prerendering)).
On Vercel the documented path is **Nitro plus Vercel Functions on the Node.js runtime**, not a
native Start adapter ([Vercel: TanStack Start](https://vercel.com/docs/frameworks/full-stack/tanstack-start),
[Start: Hosting](https://tanstack.com/start/latest/docs/framework/react/guide/hosting#vercel)).

For this migration the shape is therefore: explicit per-route prerendering for the build-time
markdown and image pages, SSR for everything that needs a request, `createServerFn` for
app-internal Effect RPCs, server routes for public HTTP endpoints (RSS, sitemap, webhooks),
route-level `headers` for `/music`'s `Cache-Control`, and `throw redirect` for URL parity. The
main deltas from Astro are that SSR is the default rather than the exception, that there is no
built-in content-collection or image-optimisation layer, and that the whole React tree hydrates
rather than isolated islands.

## Method & sources

Primary sources only:

- TanStack Start and TanStack Router official documentation (the `latest` docs).
- npm registry metadata for `@tanstack/react-start` (version, `engines`, peer dependencies).
- The TanStack Router repository's official `start-basic` example `package.json`.
- Vercel official docs for framework support, functions, runtimes, environments, limits and CDN
  caching.
- Nitro's official Vercel provider docs.
- Astro official docs, used only for the comparison with `output: "server"`, content and images.

No secondary blog posts or community threads were used. Where a statement is my judgement it is
labelled **Judgement** or **Recommendation**.

## Findings

### 1. Current stable version and requirements

- npm `latest` is **`@tanstack/react-start@1.169.7`**, published **2026-11-19**. The docs describe
  Start as stable, with a migration guide for release-candidate users
  ([npm](https://www.npmjs.com/package/@tanstack/react-start),
  [Start overview](https://tanstack.com/start/latest/docs/framework/react/overview)).
- Published runtime constraints:
  - `engines.node`: `>=22.12.0`
  - peer `vite`: `>=8.0.0`
  - peer `react` / `react-dom`: `>=18.0.0 || >=19.0.0`
  - peer `@rsbuild/core`: `^2.0.5` (only if using Rsbuild)

  ([npm registry JSON](https://registry.npmjs.org/@tanstack/react-start/latest))
- The official `start-basic` example pins `vite ^8.0.14`, `react ^19.0.0`,
  `@tanstack/react-start ^1.169.7`, and TypeScript 6/7 tooling
  ([example package.json](https://github.com/TanStack/router/blob/main/examples/react/start-basic/package.json)).
- TypeScript is strongly recommended but no minimum version is specified. The docs give the
  required `tsconfig` shape (`jsx: react-jsx`, `moduleResolution: Bundler`, `target: ES2022`,
  `strictNullChecks`) and warn against `verbatimModuleSyntax` because it can leak server bundles
  into client bundles
  ([Build from scratch](https://tanstack.com/start/latest/docs/framework/react/build-from-scratch#typescript-configuration)).

### 2. Scaffolding

- New projects are created with `npx @tanstack/cli@latest create`, the TanStack Builder flow, or
  by cloning an official example
  ([Quick start](https://tanstack.com/start/latest/docs/framework/react/quick-start)).
- A minimal manual app needs `@tanstack/react-start`, `@tanstack/react-router`, `react`,
  `react-dom`, `vite`, `@vitejs/plugin-react` and TypeScript, plus a `vite.config.ts` with
  `tanstackStart()` before `viteReact()`
  ([Build from scratch](https://tanstack.com/start/latest/docs/framework/react/build-from-scratch)).
- Required source files are `src/router.tsx` (exports `getRouter`) and `src/routes/__root.tsx`.
  The router plugin generates `src/routeTree.gen.ts`
  ([Routing](https://tanstack.com/start/latest/docs/framework/react/guide/routing)).

### 3. File-based routing model

- Routes live in `src/routes`; the root route must be `src/routes/__root.tsx`, always matches, and
  renders the document shell (`<html>`, `<head>` with `<HeadContent />`, `<body>` with
  `<Scripts />`)
  ([Routing](https://tanstack.com/start/latest/docs/framework/react/guide/routing#the-root-route)).
- Each route exports `Route = createFileRoute('/path')({...})`. The path string is written and
  maintained by the bundler plugin, so files can be moved and renamed safely
  ([Routing](https://tanstack.com/start/latest/docs/framework/react/guide/routing#defining-routes)).
- Path mapping is filesystem-driven: `index.tsx` -> `/`, `about.tsx` -> `/about`,
  `posts/$postId.tsx` -> `/posts/:postId`, `rest/$.tsx` -> `/rest/*`. Nested routes are expressed
  by dot-separated filenames or directories, and layouts come from parent route files
  ([Routing](https://tanstack.com/start/latest/docs/framework/react/guide/routing#creating-file-routes)).
- Route types include index, dynamic/splat, pathless layout, non-nested and grouped routes
  ([Routing](https://tanstack.com/start/latest/docs/framework/react/guide/routing#types-of-routes)).

### 4. Rendering: SSR by default, prerender opt-in

- Start provides full-document SSR and streaming ([Start overview](https://tanstack.com/start/latest/docs/framework/react/overview)).
- On the initial request, matching routes are rendered on the server by default: `beforeLoad`
  and `loader` run on the server, the component renders to HTML, and the client hydrates it.
  The route `ssr` option defaults to `true`
  ([Selective SSR](https://tanstack.com/start/latest/docs/framework/react/guide/selective-ssr)).
- Per route you can set `ssr: false` (no server `beforeLoad`/`loader`/render), `ssr: 'data-only'`
  (server data, client render), or a function form. `defaultSsr` can be changed in
  `src/start.ts`. Child routes can only inherit a more restrictive value
  ([Selective SSR](https://tanstack.com/start/latest/docs/framework/react/guide/selective-ssr)).
- Static prerendering is configured explicitly through `tanstackStart({ prerender: { ... } })`;
  the documented config shows `enabled: false` as the switch, plus `autoStaticPathsDiscovery`,
  `crawlLinks`, `filter`, `pages` and output paths
  ([Static Prerendering](https://tanstack.com/start/latest/docs/framework/react/guide/static-prerendering)).
- Prerender discovery excludes routes with path parameters, layout routes and routes without
  components, unless reached through `crawlLinks`
  ([Static Prerendering](https://tanstack.com/start/latest/docs/framework/react/guide/static-prerendering#automatic-static-route-discovery)).
- **Consequence for this project:** unlike Astro's `output: "server"` where pages can be
  prerendered individually and default to static, Start defaults every route to SSR. Every route
  that is not explicitly prerendered becomes a function invocation.

### 5. Data loading and the execution model

- `loader`s are **isomorphic**: they run on the server for the initial request and on the client
  for subsequent navigations
  ([Execution model](https://tanstack.com/start/latest/docs/framework/react/guide/execution-model#core-principle-isomorphic-by-default)).
- Resolved loader data is automatically dehydrated on the server and rehydrated on the client
  ([Router SSR](https://tanstack.com/router/latest/docs/framework/react/guide/ssr#automatic-loader-dehydration-hydration)).
- Because loaders are isomorphic, secrets and `process.env` reads must not live directly in a
  loader; the documented pattern is to call a server function from the loader
  ([Execution model](https://tanstack.com/start/latest/docs/framework/react/guide/execution-model#incorrect-loader-assumptions)).
- Environment-specific APIs: `createServerFn` (RPC, client-callable), `createServerOnlyFn`
  (throws on client), `createClientOnlyFn`, `createIsomorphicFn`, `<ClientOnly>`
  ([Execution model](https://tanstack.com/start/latest/docs/framework/react/guide/execution-model#execution-control-apis)).
- Import protection is on by default: `*.server.*` is denied in the client build and
  `*.client.*` is denied in the server build, with `error` behaviour at build time
  ([Import protection](https://tanstack.com/start/latest/docs/framework/react/guide/import-protection)).

### 6. `createServerFn` vs server routes

| Need | Use | Why |
| --- | --- | --- |
| Call server logic from components, loaders or hooks inside the Start app | `createServerFn()` | Type-safe same-origin RPC with serialization handled by Start ([Server functions](https://tanstack.com/start/latest/docs/framework/react/guide/server-functions)) |
| Endpoint called from outside the Start app, or a raw HTTP response | `createFileRoute` with `server.handlers` | Server route returns a standard `Response` ([Server routes](https://tanstack.com/start/latest/docs/framework/react/guide/server-routes)) |

- Server functions accept one `data` argument, use `.validator()` (Zod is supported), and check
  input/output serializability in `strict` mode by default. `method` defaults to `GET`
  ([Server functions](https://tanstack.com/start/latest/docs/framework/react/guide/server-functions#parameters--validation)).
- Server functions are same-origin RPC endpoints. If `src/start.ts` is absent, Start installs
  CSRF middleware automatically; if you add `src/start.ts`, add `createCsrfMiddleware()`
  explicitly
  ([Server functions](https://tanstack.com/start/latest/docs/framework/react/guide/server-functions#same-origin-requests)).
- Server routes are declared by adding a `server` property to a route file and can live beside a
  page component in the same file. Handlers receive `request`, `params` and `context`, and return
  a `Response`
  ([Server routes](https://tanstack.com/start/latest/docs/framework/react/guide/server-routes#defining-a-server-route)).
- There is no separate `pages/api` tree: `/routes/users.ts` is an API route at `/users`,
  `/routes/users/$id.ts` at `/users/$id`, `/routes/api/file/$.ts` at `/api/file/$`
  ([Server routes](https://tanstack.com/start/latest/docs/framework/react/guide/server-routes#file-route-conventions)).

### 7. Response headers, status codes and redirects per route

- **Headers:** every route supports a `headers` option, a function returning
  `Record<string, string>` that is applied "when this route is rendered during SSR"
  ([RouteOptions: headers](https://tanstack.com/router/latest/docs/framework/react/api/router/RouteOptionsType#headers-method)).
  This is the direct replacement for `Astro.response.headers.set(...)`.
- **Redirects:** throw `redirect({ to })` (or `href` for external) from `beforeLoad` or `loader`.
  The `Redirect` object accepts `statusCode` and `headers`
  ([redirect function](https://tanstack.com/router/latest/docs/framework/react/api/router/redirectFunction),
  [Redirect type](https://tanstack.com/router/latest/docs/framework/react/api/router/RedirectType)).
  On the server, `router.navigate()` is a no-op, so redirects must use this API
  ([Router SSR](https://tanstack.com/router/latest/docs/framework/react/guide/ssr#automatic-server-history)).
- **Not found:** throw `notFound()` from `beforeLoad` or `loader`; it renders the nearest
  `notFoundComponent`. The router's server loader resolves a not-found boundary to HTTP status
  `404` ([notFound function](https://tanstack.com/router/latest/docs/framework/react/api/router/notFoundFunction),
  [server loader source](https://github.com/TanStack/router/blob/main/packages/router-core/src/load-server.ts)).
- **Arbitrary status codes and headers:** the documented primitives are `getRequest()`,
  `getRequestHeader()`, `setResponseHeader()`, `setResponseHeaders()` and `setResponseStatus()`
  from `@tanstack/react-start/server`, used in server functions, middleware and server routes
  ([Server functions: context utilities](https://tanstack.com/start/latest/docs/framework/react/guide/server-functions#server-context--request-handling)).
- Global request middleware in `src/start.ts` runs for **every** request, including SSR, server
  routes and server functions, and shares the same response-modification context
  ([Middleware: global request middleware](https://tanstack.com/start/latest/docs/framework/react/guide/middleware#global-request-middleware)).
  For an arbitrary status (for example 410) on an HTML page route, use that middleware or a custom
  server entry; there is no per-route `status` option in `RouteOptions`
  ([Server entry point](https://tanstack.com/start/latest/docs/framework/react/guide/server-entry-point)).
- **Judgement:** route `headers` is the right tool for `/music`'s `Cache-Control`. Use
  `setResponseStatus` only if a page needs a non-404, non-redirect status; otherwise express
  intent with `notFound()` or `redirect()`. If a route is prerendered, its `headers` function is
  not part of the SSR request path, so those headers need a static rule in `vercel.json` or a
  Nitro `routeRules.headers` entry (see section 11).

### 8. Environment variables and secrets

- Server code reads unprefixed variables from `process.env`; client code only sees Vite's
  `VITE_`-prefixed variables through `import.meta.env`
  ([Environment variables](https://tanstack.com/start/latest/docs/framework/react/guide/environment-variables#quick-start)).
- Load order is `.env.local`, `.env.production`, `.env.development`, `.env`
  ([Environment variables: file hierarchy](https://tanstack.com/start/latest/docs/framework/react/guide/environment-variables#file-hierarchy-loaded-in-order)).
- Read env **per request**, not at module scope: module-level reads can be inlined into the
  client bundle and evaluate to `undefined` on runtimes that inject env per request
  ([Environment variables: read env per-request](https://tanstack.com/start/latest/docs/framework/react/guide/environment-variables),
  [Execution model: module-level process.env](https://tanstack.com/start/latest/docs/framework/react/guide/execution-model#module-level-processenv-reads)).
- Server-only files can be enforced by the `*.server.*` filename suffix or the
  `@tanstack/react-start/server-only` side-effect import; both are checked by import protection
  ([Import protection](https://tanstack.com/start/latest/docs/framework/react/guide/import-protection#file-markers)).
- **Implication for Effect:** the Effect config layer must be built inside the request handler or
  server function, not as a module-level singleton that reads `process.env` at import time.

### 9. Vercel deployment path

- Vercel's TanStack Start page says Start "works great on Vercel when paired with Nitro", and the
  only setup it documents is installing `nitro` and adding `nitro()` to the Vite plugin array
  ([Vercel: TanStack Start](https://vercel.com/docs/frameworks/full-stack/tanstack-start#nitro-configuration)).
- TanStack's own hosting guide has a Vercel section that says only "Follow the Nitro deployment
  instructions"
  ([Start: Hosting, Vercel](https://tanstack.com/start/latest/docs/framework/react/guide/hosting#vercel)).
- Nitro has a first-class `vercel` preset with zero-configuration deployment, preview deployments,
  Fluid Compute, observability and the Vercel Firewall
  ([Nitro: Vercel](https://v3.nitro.build/deploy/providers/vercel)).
- Vercel's framework matrix lists **TanStack** as supported for SSR, streaming SSR, Routing
  Middleware, Output File Tracing and Framework Routing Middleware, but marks **Incremental Static
  Regeneration**, **Image Optimization**, **Runtime Cache**, **OG Image Generation**,
  **Multi-runtime support** and **Skew Protection** as `N/A` for TanStack
  ([Vercel: framework support matrix](https://vercel.com/docs/frameworks#frameworks-infrastructure-support-matrix)).
- **Answer:** no native TanStack Start adapter for Vercel is documented. Nitro is the supported
  build and deployment layer; it produces the Vercel Build Output and routes requests into a
  Vercel Function. Treat "TanStack Start is supported on Vercel" as "Nitro's Vercel preset is
  supported", not as a separate adapter.
- TanStack Start apps on Vercel use **Vercel Functions with Fluid Compute by default**
  ([Vercel: TanStack Start](https://vercel.com/docs/frameworks/full-stack/tanstack-start#vercel-functions)).

### 10. Runtime, build output, previews and limits

- **Runtime:** Node.js. Nitro selects the function runtime from `vercel.functions.runtime`, then
  `engines.node` / `engines.bun` in `package.json`, then `vercel.json` `bunVersion`, then the
  build runtime. Vercel currently supports Node.js **22, 24 and 26**, with 26 as the default
  ([Nitro: Vercel, Runtime](https://v3.nitro.build/deploy/providers/vercel#runtime),
  [Vercel: Node.js versions](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions)).
- Because Start requires Node >= 22.12.0, pin `engines.node` to `22.x` or `24.x` (or `26.x`) and
  let Nitro/Vercel resolve it. Do not rely on the build machine's version.
- **Edge runtime:** not a documented TanStack Start-on-Vercel target. Vercel's matrix marks
  multi-runtime support as `N/A` for TanStack, and the Vercel page only describes Vercel
  Functions/Fluid Compute
  ([Vercel: framework support matrix](https://vercel.com/docs/frameworks#frameworks-infrastructure-support-matrix)).
  Nitro does technically run on other presets, but on Vercel the supported path is Node.js.
- **Build output:** the Vite build emits client assets and a server bundle; with Nitro the server
  starts from `.output/server/index.mjs`
  ([Start: Hosting, Node.js](https://tanstack.com/start/latest/docs/framework/react/guide/hosting#nodejs--docker)).
  Netlify's documented publish directory is `dist/client`, confirming the client/server split
  ([Start: Hosting, Netlify](https://tanstack.com/start/latest/docs/framework/react/guide/hosting#netlify--official-partner)).
- **Preview deployments:** any push to a non-production branch, any pull request, or `vercel`
  without `--prod` creates a Preview deployment; branch-specific and commit-specific URLs are
  generated. Preview deployments use Preview-scoped environment variables, not Production ones
  ([Vercel: Environments](https://vercel.com/docs/deployments/environments#preview-environment-pre-production)).
  Vercel adds `X-Robots-Tag: noindex` to preview and deployment URLs, and new projects start with
  Deployment Protection
  ([Vercel: Environments FAQ](https://vercel.com/docs/deployments/environments#frequently-asked-questions)).
- **Limits that matter here:**

  | Constraint | Limit |
  | --- | --- |
  | Function bundle, uncompressed | 250 MB standard; 5 GB with Large Functions beta |
  | Request body | 4.5 MB default; 20 MiB opt-in beta on Node.js with 4 GB memory |
  | Response body | 4.5 MB, except streamed responses |
  | Duration | 300 s default; Hobby max 300 s; Pro/Enterprise max 800 s (1800 s beta) |
  | Memory | Hobby 2 GB / 1 vCPU; Pro/Enterprise up to 4 GB / 2 vCPU |
  | Region | Single region by default (`iad1`) |
  | Filesystem | Read-only, `/tmp` up to 500 MB |
  | File descriptors | 1,024 shared across concurrent executions |

  ([Vercel: Functions limits](https://vercel.com/docs/functions/limitations),
  [Vercel: Runtimes](https://vercel.com/docs/functions/runtimes))
- **Judgement:** for this site the limits are not a concern. The 250 MB bundle and 4.5 MB response
  limits are worth watching only if image processing or large generated files move into a
  request path.

### 11. Caching implications for `/music`

- Vercel's CDN caches function responses only when the response includes `Cache-Control` with
  `s-maxage`, or `s-maxage` plus `stale-while-revalidate` / `stale-if-error`. A plain
  `Cache-Control: public, max-age=...` is not sufficient for Vercel's CDN
  ([Vercel: CDN cache, how to cache responses](https://vercel.com/docs/caching/cdn-cache#how-to-cache-responses)).
- `Cache-Control` returned by the function overrides headers configured for the same route in
  `vercel.json` (or `next.config.js`)
  ([Vercel: CDN cache](https://vercel.com/docs/caching/cdn-cache#using-verceljson-and-nextconfigjs)).
- Vercel supports `CDN-Cache-Control` and `Vercel-CDN-Cache-Control` to separate browser, other
  CDN and Vercel cache TTLs
  ([Vercel: CDN cache, CDN-Cache-Control](https://vercel.com/docs/caching/cdn-cache#cdn-cache-control)).
- Cacheable response criteria include `GET`/`HEAD`, no `Authorization`, status 200/404/410/301/
  302/307/308, no `Set-Cookie`, no `private`/`no-cache`/`no-store`, and no `Vary: *` or
  `Vary: Cookie`
  ([Vercel: cacheable response criteria](https://vercel.com/docs/caching/cdn-cache#cacheable-response-criteria)).
- Maximum cacheable response is 10 MB and maximum cache time is 1 year
  ([Vercel: CDN cache limits](https://vercel.com/docs/caching/cdn-cache#limits)).
- **Recommendation:** for an SSR `/music` route, set both a browser and CDN policy in the route
  `headers` function, for example
  `Cache-Control: public, max-age=0, s-maxage=3600, stale-while-revalidate=86400`. If the route
  is prerendered instead, set the same header through Nitro `routeRules`/`vercel.json`, because a
  static file is served from the CDN before any route `headers` function runs.

### 12. Caveats versus Astro's `output: "server"` model

| Area | Astro 7, `output: "server"` | TanStack Start | Consequence |
| --- | --- | --- | --- |
| Default rendering | Static by default; `output: "server"` flips the default to on-demand, and `export const prerender = true` opts individual routes back to static ([Astro on-demand rendering](https://docs.astro.build/en/guides/on-demand-rendering/#server-mode)) | SSR is the default per route; prerendering is opt-in through `prerender` config ([Selective SSR](https://tanstack.com/start/latest/docs/framework/react/guide/selective-ssr), [Static Prerendering](https://tanstack.com/start/latest/docs/framework/react/guide/static-prerendering)) | Start needs an explicit prerender list to keep build-time pages out of the function |
| Response headers | `Astro.response.headers.set(...)` or a returned `Response`, at page level only ([Astro on-demand rendering](https://docs.astro.build/en/guides/on-demand-rendering/#astroresponseheaders)) | Route `headers` option returns a header map ([RouteOptions](https://tanstack.com/router/latest/docs/framework/react/api/router/RouteOptionsType#headers-method)) | Direct mapping for `/music`; status codes are less direct |
| Status code | `Astro.response.status = 404` or return `new Response(null, { status })` ([Astro on-demand rendering](https://docs.astro.build/en/guides/on-demand-rendering/#response)) | No per-route `status` option; use `notFound()`, `redirect({ statusCode })`, or `setResponseStatus` in global middleware ([notFound](https://tanstack.com/router/latest/docs/framework/react/api/router/notFoundFunction), [Redirect type](https://tanstack.com/router/latest/docs/framework/react/api/router/RedirectType), [Middleware](https://tanstack.com/start/latest/docs/framework/react/guide/middleware)) | 301/302/404 are clean; arbitrary statuses need middleware |
| Redirects | `Astro.redirect('/path', 301)` or return a `Response` ([Astro on-demand rendering](https://docs.astro.build/en/guides/on-demand-rendering/#return-a-response-object)) | `throw redirect({ to, statusCode })` in `beforeLoad`/`loader` ([redirect](https://tanstack.com/router/latest/docs/framework/react/api/router/redirectFunction)) | Direct mapping, but redirects are control flow, not a Response return |
| API endpoints | File exports returning `Response` in `src/pages` ([Astro endpoints](https://docs.astro.build/en/guides/endpoints/)) | `server.handlers` on a route file, or `createServerFn` for internal RPC ([Server routes](https://tanstack.com/start/latest/docs/framework/react/guide/server-routes)) | Public endpoints become server routes; internal calls become server functions |
| Middleware | `src/middleware.ts` runs per request, with `context.locals` ([Astro middleware](https://docs.astro.build/en/guides/middleware/)) | `src/start.ts` global request middleware runs before every request including SSR ([Middleware](https://tanstack.com/start/latest/docs/framework/react/guide/middleware#global-request-middleware)) | Equivalent hook, different file and API |
| Content | Content collections and Markdown pipeline are built in ([Astro content collections](https://docs.astro.build/en/guides/content-collections/)) | No content-collection or Markdown pipeline in the Start feature set ([Start overview](https://tanstack.com/start/latest/docs/framework/react/overview)) | Build-time content must be loaded with Vite glob/raw imports or a third-party content layer |
| Images | `<Image>` from `astro:assets` with optimisation, srcset and dimensions ([Astro images](https://docs.astro.build/en/guides/images/)) | No built-in image optimiser; Vercel's matrix marks Image Optimization `N/A` for TanStack ([Vercel matrix](https://vercel.com/docs/frameworks#frameworks-infrastructure-support-matrix)) | Image pipeline must be solved separately (pre-built assets or a service) |
| Client JS | Islands hydrate individually ([Astro islands](https://docs.astro.build/en/concepts/islands/)) | The React tree hydrates as a full app ([Start overview](https://tanstack.com/start/latest/docs/framework/react/overview)) | Expect more client JS; measure against current Astro output |
| Deployment | `@astrojs/vercel` adapter emits Vercel Build Output ([Astro Vercel adapter](https://docs.astro.build/en/guides/integrations-guide/vercel/)) | Nitro `vercel` preset emits Vercel Build Output ([Nitro: Vercel](https://v3.nitro.build/deploy/providers/vercel)) | Different build tooling, same platform concepts |

- **Additional caveat:** Astro's `output: "server"` does not change route semantics or add runtime
  features; it only changes the default rendering mode
  ([Astro on-demand rendering](https://docs.astro.build/en/guides/on-demand-rendering/#server-mode)).
  Start's equivalent switch is not a global output mode but per-route `ssr` plus a global
  `defaultSsr`, with separate prerender config
  ([Selective SSR](https://tanstack.com/start/latest/docs/framework/react/guide/selective-ssr)).
  This means the migration cannot be a one-line output change; each route needs a rendering
  decision.

## Practical implications for this project

### Routing and URL parity

- Mirror the current URL structure with `src/routes` files: `index.tsx`, `about.tsx`,
  `music.tsx`, `blog/index.tsx`, `blog/$slug.tsx`, and so on. Dynamic Astro `[slug]` routes become
  `$slug.tsx`
  ([Routing](https://tanstack.com/start/latest/docs/framework/react/guide/routing#creating-file-routes)).
- Use `throw redirect({ to, statusCode: 301 })` for any legacy URL that must keep its permanent
  redirect status
  ([Redirect type](https://tanstack.com/router/latest/docs/framework/react/api/router/RedirectType)).
- Use `notFound()` for missing posts/albums so the response is a real 404, not a 200 shell
  ([notFound](https://tanstack.com/router/latest/docs/framework/react/api/router/notFoundFunction),
  [server loader source](https://github.com/TanStack/router/blob/main/packages/router-core/src/load-server.ts)).
- Keep a single root route that renders the document shell; this is the replacement for the Astro
  layout and `<head>` handling
  ([Routing: root route](https://tanstack.com/start/latest/docs/framework/react/guide/routing#the-root-route)).

### `/music` caching

- For an SSR `/music`, add a `headers` function on the route and include `s-maxage` (Vercel's CDN
  requires it) plus a browser policy
  ([RouteOptions](https://tanstack.com/router/latest/docs/framework/react/api/router/RouteOptionsType#headers-method),
  [Vercel CDN cache](https://vercel.com/docs/caching/cdn-cache#how-to-cache-responses)).
- If `/music` is prerendered for build-time content, put the header in Nitro `routeRules` or
  `vercel.json`, because the static file is served before Start's route handler
  ([Nitro: public asset caching](https://v3.nitro.build/deploy/providers/vercel#public-asset-caching),
  [Vercel CDN cache](https://vercel.com/docs/caching/cdn-cache#using-verceljson-and-nextconfigjs)).
- Do not add `Vary: Cookie` to a public page; Vercel refuses to cache responses that vary on
  `Cookie` ([Vercel CDN cache](https://vercel.com/docs/caching/cdn-cache#high-cardinality-headers)).

### Server logic in Effect

- Use `createServerFn` for anything the app itself calls: data for loaders, mutations, session
  reads. Wrap the Effect runtime execution inside `.handler()`, and read `process.env` there
  ([Server functions](https://tanstack.com/start/latest/docs/framework/react/guide/server-functions),
  [Environment variables](https://tanstack.com/start/latest/docs/framework/react/guide/environment-variables)).
- Use server routes for endpoints that must be callable from outside the app or must return a
  raw `Response`: RSS, sitemap, webhooks, health checks
  ([Server routes](https://tanstack.com/start/latest/docs/framework/react/guide/server-routes)).
- If you create `src/start.ts`, re-add `createCsrfMiddleware()` for server functions, or rely on
  Start's automatic CSRF when the file is absent
  ([Server functions: same-origin requests](https://tanstack.com/start/latest/docs/framework/react/guide/server-functions#same-origin-requests)).
- Keep Effect layers per request rather than module-level singletons if they read env or hold
  request-scoped resources; module-level env reads are explicitly called out as wrong
  ([Execution model](https://tanstack.com/start/latest/docs/framework/react/guide/execution-model#module-level-processenv-reads)).

### Build-time content and images

- Markdown and image pages that should not invoke a function must be added to the prerender
  config, either through `autoStaticPathsDiscovery` plus `crawlLinks`, or explicit `pages`
  entries ([Static Prerendering](https://tanstack.com/start/latest/docs/framework/react/guide/static-prerendering)).
- Because there is no content-collection API, the build-time loader will need a Vite-side import
  strategy (`import.meta.glob`, `?raw`) or a content library. This is a design task, not a
  configuration switch. **Judgement**, based on the absence of a content layer in the Start
  feature list ([Start overview](https://tanstack.com/start/latest/docs/framework/react/overview)).
- Because there is no built-in image optimiser and Vercel's matrix marks Image Optimization
  `N/A` for TanStack, the existing `astro:assets` pipeline must be replaced with pre-generated
  assets or an external image service
  ([Vercel matrix](https://vercel.com/docs/frameworks#frameworks-infrastructure-support-matrix)).

### Deployment checklist

1. Add `nitro` and `nitro()` to `vite.config.ts` ([Vercel: TanStack Start](https://vercel.com/docs/frameworks/full-stack/tanstack-start#nitro-configuration)).
2. Pin `engines.node` to `22.x` or `24.x` in `package.json`; Vercel supports 22/24/26 and Start
   requires >= 22.12.0 ([Nitro: Vercel runtime](https://v3.nitro.build/deploy/providers/vercel#runtime),
   [npm registry](https://registry.npmjs.org/@tanstack/react-start/latest)).
3. Keep `vite` at >= 8 and React at 18/19 ([npm registry](https://registry.npmjs.org/@tanstack/react-start/latest)).
4. Test on a Preview deployment, which uses Preview env vars and gets a noindex header by default
   ([Vercel: Environments](https://vercel.com/docs/deployments/environments#preview-environment-pre-production)).
5. Verify that every intended-static route is actually prerendered; otherwise it will run as a
   function and be billed as one ([Static Prerendering](https://tanstack.com/start/latest/docs/framework/react/guide/static-prerendering)).

## Open questions / risks

1. **Does route `headers` apply to prerendered output?** The docs describe it as applying "when
   this route is rendered during SSR", and prerendering is a separate build-time path. For
   prerendered pages, assume the header must be set in Nitro `routeRules` or `vercel.json` until
   verified in a build. This is the main unknown for `/music` if it becomes static.
2. **Exact prerender behaviour for dynamic content routes.** `autoStaticPathsDiscovery` excludes
   path-parameter routes; blog and album detail pages will need explicit `pages` entries or
   `crawlLinks` coverage. Verify that all current URLs are emitted.
3. **Image optimisation replacement.** No decision yet on pre-generated `srcset` assets versus a
   third-party image service. This affects build time, repository size and Vercel bandwidth.
4. **Content layer replacement.** Vite glob imports are viable for a small site but do not give
   Astro's schema validation or collection query API. Decide whether to use a library or a
   hand-rolled loader.
5. **Hydration cost.** Full React hydration will likely increase client JS versus Astro islands.
   Measure the current Astro bundle and set a budget before committing to the migration.
6. **Function invocation cost.** Every non-prerendered route becomes a Vercel Function invocation.
   The site is small, so this is likely acceptable, but the prerender list should be deliberate.
7. **Vercel framework detection.** Vercel lists TanStack Start as a supported framework, but its
   setup page still requires Nitro. Confirm that a fresh project with `nitro()` is detected as
   TanStack Start and does not fall back to a generic Vite preset
   ([Vercel: supported frameworks](https://vercel.com/docs/frameworks/more-frameworks)).
8. **Version churn.** Start is on a rapid `1.169.x` cadence (853 published versions, latest
   2026-11-19). Pin exact versions and re-check the docs at migration time
   ([npm versions](https://www.npmjs.com/package/@tanstack/react-start?activeTab=versions)).

## Sources

- [TanStack Start overview](https://tanstack.com/start/latest/docs/framework/react/overview)
- [TanStack Start quick start](https://tanstack.com/start/latest/docs/framework/react/quick-start)
- [TanStack Start build from scratch](https://tanstack.com/start/latest/docs/framework/react/build-from-scratch)
- [TanStack Start routing](https://tanstack.com/start/latest/docs/framework/react/guide/routing)
- [TanStack Start server functions](https://tanstack.com/start/latest/docs/framework/react/guide/server-functions)
- [TanStack Start server routes](https://tanstack.com/start/latest/docs/framework/react/guide/server-routes)
- [TanStack Start hosting](https://tanstack.com/start/latest/docs/framework/react/guide/hosting)
- [TanStack Start environment variables](https://tanstack.com/start/latest/docs/framework/react/guide/environment-variables)
- [TanStack Start execution model](https://tanstack.com/start/latest/docs/framework/react/guide/execution-model)
- [TanStack Start selective SSR](https://tanstack.com/start/latest/docs/framework/react/guide/selective-ssr)
- [TanStack Start static prerendering](https://tanstack.com/start/latest/docs/framework/react/guide/static-prerendering)
- [TanStack Start middleware](https://tanstack.com/start/latest/docs/framework/react/guide/middleware)
- [TanStack Start server entry point](https://tanstack.com/start/latest/docs/framework/react/guide/server-entry-point)
- [TanStack Start import protection](https://tanstack.com/start/latest/docs/framework/react/guide/import-protection)
- [TanStack Router SSR guide](https://tanstack.com/router/latest/docs/framework/react/guide/ssr)
- [TanStack Router RouteOptions](https://tanstack.com/router/latest/docs/framework/react/api/router/RouteOptionsType)
- [TanStack Router redirect function](https://tanstack.com/router/latest/docs/framework/react/api/router/redirectFunction)
- [TanStack Router Redirect type](https://tanstack.com/router/latest/docs/framework/react/api/router/RedirectType)
- [TanStack Router notFound function](https://tanstack.com/router/latest/docs/framework/react/api/router/notFoundFunction)
- [TanStack Router server loader source (not-found status 404)](https://github.com/TanStack/router/blob/main/packages/router-core/src/load-server.ts)
- [npm: @tanstack/react-start](https://www.npmjs.com/package/@tanstack/react-start)
- [npm registry: latest metadata](https://registry.npmjs.org/@tanstack/react-start/latest)
- [TanStack Router example: start-basic package.json](https://github.com/TanStack/router/blob/main/examples/react/start-basic/package.json)
- [Vercel: TanStack Start](https://vercel.com/docs/frameworks/full-stack/tanstack-start)
- [Vercel: frameworks and support matrix](https://vercel.com/docs/frameworks)
- [Vercel: supported frameworks](https://vercel.com/docs/frameworks/more-frameworks)
- [Vercel: Functions runtimes](https://vercel.com/docs/functions/runtimes)
- [Vercel: Node.js versions](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions)
- [Vercel: Functions limits](https://vercel.com/docs/functions/limitations)
- [Vercel: environments](https://vercel.com/docs/deployments/environments)
- [Vercel: CDN cache](https://vercel.com/docs/caching/cdn-cache)
- [Nitro: Vercel provider](https://v3.nitro.build/deploy/providers/vercel)
- [Astro: on-demand rendering](https://docs.astro.build/en/guides/on-demand-rendering/)
- [Astro: Vercel adapter](https://docs.astro.build/en/guides/integrations-guide/vercel/)
- [Astro: content collections](https://docs.astro.build/en/guides/content-collections/)
- [Astro: images](https://docs.astro.build/en/guides/images/)
- [Astro: islands](https://docs.astro.build/en/concepts/islands/)
- [Astro: endpoints](https://docs.astro.build/en/guides/endpoints/)
- [Astro: middleware](https://docs.astro.build/en/guides/middleware/)
