# Effect TS integration with TanStack Start

Research ticket: [jwstn.dev#59](https://github.com/jwstn/jwstn.dev/issues/59) (map: [#56](https://github.com/jwstn/jwstn.dev/issues/56))
Status: research complete, no application code changed.

## Answer / recommendation

Use **Effect 4.1.7** (`effect@4.1.7`, the current `latest` on npm, released 2026-11-27), not the v3
line. v4 is the stable, long-term-support major: `4.0.0` shipped 2026-10-01 and v4 carries a
three-year support guarantee. It requires TypeScript ≥ 5.9 and Node.js ≥ 22.19 — the repo's Node
`engines` floor (`>=22.12.0`) is below that and should be raised.

Run a **single module-level `ManagedRuntime` per server process**, not one per request. TanStack
Start server functions and server routes are thin request handlers; Vercel (via Nitro) runs them on
Fluid compute, where several invocations share one instance and its module state concurrently. A
`ManagedRuntime` built once per instance and reused across calls gives the cache, HTTP client,
config and logger a real lifetime; a per-request runtime would rebuild all of that on every
invocation and make the cache useless. Keep request-scoped values out of module state and inject
them per call.

Treat **expected failures as values** at the `createServerFn` boundary (a serializable result
object the page renders as "unavailable"/"stale") and let **defects escape as 500s**. Do not lean on
thrown `Schema.TaggedError` instances for client-side typing: TanStack serialises thrown errors, but
the class identity does not survive the wire.

Skip `@effect/atom-react`. It is a client-side reactive Atom store with SSR *dehydration* helpers
(`"use client"` modules, React ≥ 19 peer). The site fetches data during SSR and hands it to the
route; that is router-loader territory, not Atom territory.

## Method & sources

Primary sources only, unless marked otherwise:

- Effect source at the released tag
  [`effect@4.1.7`](https://github.com/Effect-TS/effect/tree/effect%404.1.7) and its
  [README](https://github.com/Effect-TS/effect/blob/effect%404.1.7/README.md),
  [release notes](https://github.com/Effect-TS/effect/releases/tag/effect%404.0.0) and the
  [npm registry metadata](https://registry.npmjs.org/effect) (`dist-tags`).
- TanStack Start documentation in the TanStack Router repo (`docs/start/framework/react/guide/*`),
  rendered at <https://tanstack.com/start/latest/docs/framework/react/guide/…>, plus
  `start-server-core` / `start-client-core` / `start-plugin-core` source for runtime behaviour the
  prose does not pin down.
- Vercel documentation (`.md` endpoints of the docs site) for Fluid compute, the TanStack Start
  framework guide, Node.js versions, environment variables and function limits.
- seroval source for what actually crosses the server-function wire when an `Error` is thrown.
- The local `effect` skill (`~/.agents/skills/effect`, reviewed against 4.0.0) for the house style
  (services, layers, config, cache, testing); every API it recommends was re-checked against the
  4.1.7 source before appearing here.

Facts below carry links. Recommendations are labelled **[judgement]**.

## Findings

### 1. Version: v4, and the compatibility floor is higher than this repo's

| Fact | Source |
| --- | --- |
| `effect` `latest` = **4.1.7**; `prev` = 3.22.5; `beta`/`rc` are 4.x prereleases, `staging` mirrors `latest` | [npm registry `dist-tags`](https://registry.npmjs.org/effect) |
| `effect@4.0.0` published **2026-10-01**, non-prerelease | [release `effect@4.0.0`](https://github.com/Effect-TS/effect/releases/tag/effect%404.0.0) |
| v4 is an **LTS** release: ≥ 3 years of support, bug fixes 1 year and security fixes 2 years after the next major | [README › Long-term support](https://github.com/Effect-TS/effect/blob/effect%404.1.7/README.md) |
| v3 lives on the [`v3` branch](https://github.com/Effect-TS/effect/tree/v3); v4 is the mainline | [README › Effect v3](https://github.com/Effect-TS/effect/blob/effect%404.1.7/README.md) |
| Requirements: **TypeScript ≥ 5.9** (TS 7 recommended), **Node.js ≥ 22.19**, `strict: true` | [README › Requirements](https://github.com/Effect-TS/effect/blob/effect%404.1.7/README.md) |
| `@effect/platform-node@4.1.7` declares `engines.node >= 22.19.0` | [package.json](https://github.com/Effect-TS/effect/blob/effect%404.1.7/packages/platform/node/package.json) |
| Type-level tests run against `tstyche --target '>=5.9'` | [root package.json](https://github.com/Effect-TS/effect/blob/effect%404.1.7/package.json) |
| All monorepo packages are released in lockstep (`effect`, `@effect/platform-node`, `@effect/vitest`, `@effect/atom-react` all 4.1.7) | [README › Packages](https://github.com/Effect-TS/effect/blob/effect%404.1.7/README.md), [npm](https://registry.npmjs.org/@effect%2Fvitest) |

Repo baseline (this worktree): `package.json` has `"engines": { "node": ">=22.12.0" }`,
`.nvmrc` is `v24.22.3`, TypeScript is `^6.0.3`, and `tsconfig.json` extends
`astro/tsconfigs/strict` (so `strict` is on). Node 24.22.3 satisfies Effect; the declared
`>=22.12.0` floor does **not** — `@effect/platform-node` declares `>=22.19.0`, which pnpm will at
least warn about (and fail, with `engine-strict` enabled).

Two version traps worth writing down:

- In v4 the platform abstractions moved **into the core package**: `FileSystem`, `Path`,
  `Terminal`, HTTP, SQL, RPC and Schema all live under `effect` subpaths
  ([`packages/effect/src`](https://github.com/Effect-TS/effect/tree/effect%404.1.7/packages/effect/src),
  [`package.json` exports](https://github.com/Effect-TS/effect/blob/effect%404.1.7/packages/effect/package.json)).
  `@effect/platform` on npm is still the **v3** package (latest `0.97.2`) — do not install it
  alongside v4. Platform *implementations* such as `@effect/platform-node` are still separate and
  now versioned 4.x.
- Prerelease import paths are gone: `effect/unstable/http` → `effect/http`, root `TestClock` →
  `effect/testing`
  ([V4 API notes](https://github.com/Effect-TS/effect/blob/effect%404.1.7/packages/effect/package.json),
  [`src/testing/index.ts`](https://github.com/Effect-TS/effect/blob/effect%404.1.7/packages/effect/src/testing/index.ts)).

TanStack Start's own floor is looser: `@tanstack/react-start@1.169.7` declares
`engines.node >=22.12.0` and peers `vite >=8`, `react >=18 || >=19`
([npm](https://registry.npmjs.org/@tanstack%2Freact-start/1.169.7)). Effect therefore sets the
effective Node floor for the migrated app.

Vercel offers Node **22.x, 24.x and 26.x**, defaulting new projects to 26.x, and reads the major
version from `engines#node` or project settings
([Vercel › Supported Node.js versions](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions)).
Node 24 is a safe pin: inside Effect's supported range and one of Vercel's current majors.

### 2. Runtime lifecycle: one `ManagedRuntime` per instance, built lazily

What `ManagedRuntime` actually does, from the 4.1.7 source:

- "Runs many effects against services built once from a `Layer`… builds the services from a layer,
  keeps those services available for repeated effect runs, and releases acquired resources when it
  is disposed"
  ([`ManagedRuntime.ts`](https://github.com/Effect-TS/effect/blob/effect%404.1.7/packages/effect/src/ManagedRuntime.ts)).
- `make(layer)` is **lazy**: the layer build fiber is created inside `contextEffect` on the *first*
  run, and the resulting context is cached in `cachedContext` for later runs (same file). Importing
  a module that calls `ManagedRuntime.make` therefore costs almost nothing; the first request on a
  fresh instance pays layer acquisition.
- The build result is memoised in a single `buildFiber`. If the layer build **fails**, that failed
  fiber stays in place: every later run on that instance re-observes the same failure instead of
  retrying (same file, `if (!buildFiber)` with no reset path). **[judgement]** Do not put fallible
  network or credential validation in layer construction; make the layer acquire and then degrade,
  or the instance is poisoned until Vercel recycles it.
- `runPromise` rejects with `Cause.squash(cause)` — a typed failure rejects with the error value, a
  defect rejects with the original thrown `Error`
  ([`internal/effect.ts`](https://github.com/Effect-TS/effect/blob/effect%404.1.7/packages/effect/src/internal/effect.ts)).
- `RunOptions.signal?: AbortSignal` is accepted by the runners, so a request's `AbortSignal` can
  interrupt the fiber
  ([`Effect.ts` › `RunOptions`](https://github.com/Effect-TS/effect/blob/effect%404.1.7/packages/effect/src/Effect.ts)).

What Vercel does with that process:

- TanStack Start apps on Vercel are built with Nitro and "use Fluid Compute by default"
  ([Vercel › TanStack Start](https://vercel.com/docs/frameworks/full-stack/tanstack-start)).
- Fluid compute "allows multiple invocations to share a single function instance"; "instead of
  using a microVM for each function invocation, multiple invocations can share the same physical
  instance (a global state/process) **concurrently**"
  ([Vercel › Fluid compute › Optimized concurrency / Isolation boundaries](https://vercel.com/docs/functions/fluid-compute)).
- Bytecode caching (Node 20+) speeds up JS startup in production deployments but not preview/dev
  ([Vercel › Bytecode caching](https://vercel.com/docs/functions/fluid-compute)).
- Uncaught exceptions and unhandled rejections are logged, in-flight requests are allowed to
  finish, then the process stops (same page). Effect defects are captured per fiber, so an
  awaited `runPromise` rejection does not become an unhandled rejection.

**Implication.** Module scope is process scope, shared by concurrent requests — it is *not*
request scope. Per-instance state (the Last.fm cache) is real, survives between invocations,
is shared by concurrent requests on that instance, and disappears when the instance is recycled.
Cold-start cost of the Effect runtime is one lazy layer acquisition with no I/O, on top of JS
startup that Vercel already bytecode-caches.

**[judgement]** Do not build a `ManagedRuntime` inside `createServerFn`. Per request that means:
layer rebuild (config parse, client/cache construction), a cold cache on every call, and an extra
`dispose`. Reserve per-request runtimes for request-scoped authority (auth headers, a tenant id) —
and even then prefer one module-level runtime plus
`effect.pipe(Effect.provideService(RequestContext, ctx))`.

### 3. Services and layers for this site

v4's service idiom is a class-style `Context.Service` key plus an explicit `Layer`:

- `Context.Service<Self, Shape>()("Key")` creates the key; the string is the runtime identity
  ([`Context.ts`](https://github.com/Effect-TS/effect/blob/effect%404.1.7/packages/effect/src/Context.ts)).
- Build real implementations with `Layer.effect(Service, Effect.gen(...))` and return
  `Service.of({ ... })` (house style in `SERVICES_LAYERS.md`; `Layer.effect` is documented in
  [`Layer.ts`](https://github.com/Effect-TS/effect/blob/effect%404.1.7/packages/effect/src/Layer.ts)).

Per service:

- **Config** — `Config.String` / `Config.Boolean` / `Config.Redacted` / `Config.Int` are functions on
  the `Config` module, with `Config.option`, `Config.withDefault`, `Config.map`, `Config.mapEffect`
  ([`Config.ts`](https://github.com/Effect-TS/effect/blob/effect%404.1.7/packages/effect/src/Config.ts)).
  The active `ConfigProvider` is a `Context.Reference` whose default is `ConfigProvider.fromEnv()`,
  so `Config.*` reads `process.env` when the recipe is evaluated — i.e. during lazy layer
  acquisition, not at import
  ([`ConfigProvider.ts`](https://github.com/Effect-TS/effect/blob/effect%404.1.7/packages/effect/src/ConfigProvider.ts)).
  This happens to satisfy TanStack Start's own rule: "read env per-request, not at module scope"
  ([TanStack › Environment Variables](https://tanstack.com/start/latest/docs/framework/react/guide/environment-variables)).
- **HttpClient** — the service is `effect/http`'s `HttpClient`; `FetchHttpClient.layer` supplies a
  `globalThis.fetch`-backed implementation that works on Node, edge and browsers
  ([`http/HttpClient.ts`](https://github.com/Effect-TS/effect/blob/effect%404.1.7/packages/effect/src/http/HttpClient.ts),
  [`http/FetchHttpClient.ts`](https://github.com/Effect-TS/effect/blob/effect%404.1.7/packages/effect/src/http/FetchHttpClient.ts)).
  Response decoding helpers include `HttpClientResponse.schemaJson`, `schemaNoBody`,
  `filterStatusOk`; retries via `client.pipe(HttpClient.retryTransient({ times }))`
  ([`http/HttpClientResponse.ts`](https://github.com/Effect-TS/effect/blob/effect%404.1.7/packages/effect/src/http/HttpClientResponse.ts),
  [`HttpClient.retryTransient`](https://github.com/Effect-TS/effect/blob/effect%404.1.7/packages/effect/src/http/HttpClient.ts)).
  Note `HttpClient`, `FetchHttpClient` and the response helpers are annotated
  `@stability unstable` in 4.1.7 — usable, but they can change in minor releases.
- **Cache** — `Cache.make({ capacity, lookup, timeToLive })` or
  `Cache.makeWith(lookup, { capacity, timeToLive: (exit, key) => ... })`; `capacity` is required,
  concurrent `get`s for a missing key share one pending lookup, and the cache stores the `Exit`, so
  failed lookups are cached until expiry/invalidation unless the TTL function returns zero
  ([`Cache.ts`](https://github.com/Effect-TS/effect/blob/effect%404.1.7/packages/effect/src/Cache.ts)).
  Cache construction is effectful: build it in the owning layer's scope, once per runtime, not per
  call (same file + `CACHING.md`).
- **Schema** — `Schema.Struct` for records, `Schema.TaggedError` for typed errors (`TaggedError`
  produces a `YieldableError`, i.e. a real `Error` subclass), and
  `Schema.decodeUnknownEffect(schema)(input)` at wire boundaries
  ([`Schema.ts`](https://github.com/Effect-TS/effect/blob/effect%404.1.7/packages/effect/src/Schema.ts)).
- **Logger** — `Logger.layer([...])` replaces the current logger set;
  `Logger.consoleJson` / `consoleStructured` emit one-line JSON to the console (Vercel turns each
  stdout/stderr write into a runtime log entry and maps `console.error` to `error`
  ([Vercel › Runtime Logs](https://vercel.com/docs/logs/runtime))), and `Logger.tracerLogger` turns
  logs into span events
  ([`Logger.ts`](https://github.com/Effect-TS/effect/blob/effect%404.1.7/packages/effect/src/Logger.ts)).
- **FileSystem** — core `effect` exposes the `FileSystem` service; Node's implementation is
  `NodeFileSystem.layer` from `@effect/platform-node`
  ([`FileSystem.ts`](https://github.com/Effect-TS/effect/blob/effect%404.1.7/packages/effect/src/FileSystem.ts),
  [`NodeFileSystem.ts`](https://github.com/Effect-TS/effect/blob/effect%404.1.7/packages/platform/node/src/NodeFileSystem.ts)).
  **[judgement]** It has no place in the request-serving layer for this site: content collections
  and other file reads happen in the build, outside Vercel Functions. If a build script wants
  Effect, it can use `NodeFileSystem.layer` there without touching request code.

### 4. Failure → HTTP mapping at the `createServerFn` boundary

How TanStack Start actually behaves, from source:

- Handler results and inputs must be serialisable; `Response` is allowed as a return value
  ([TanStack › Server Functions › Serialization Type Checking](https://tanstack.com/start/latest/docs/framework/react/guide/server-functions)).
- A thrown error is serialised back to the caller as `{ error }` and rethrown client-side; the docs'
  example reads `error.message`
  ([same page › Error Handling](https://tanstack.com/start/latest/docs/framework/react/guide/server-functions),
  [`createServerFn.ts`](https://github.com/TanStack/router/blob/main/packages/start-client-core/src/createServerFn.ts)).
- The HTTP status for a thrown error is resolved from `error.status` / `error.statusCode`, then
  `error.cause.status` / `cause.statusCode`, then a status set via `setResponseStatus`; otherwise
  **500**, and the error is `console.error`'d unless it carries HTTP-error metadata
  ([`internal-request-response.ts`](https://github.com/TanStack/router/blob/main/packages/start-server-core/src/internal-request-response.ts)).
  `notFound()` becomes a 404, and a thrown `Response` is passed through
  ([`server-functions-handler.ts`](https://github.com/TanStack/router/blob/main/packages/start-server-core/src/server-functions-handler.ts)).
- A successful call is a serialised envelope; its status is unset unless a response helper set one
  (a `Response` without an explicit status is 200), and the payload is the result, not a
  status-carrying body
  ([`server-functions-handler.ts`](https://github.com/TanStack/router/blob/main/packages/start-server-core/src/server-functions-handler.ts)).
- On the wire, seroval serialises an `Error` by recording its standard constructor tag, `message`,
  and **all own property names** as options
  ([`seroval/utils/error.ts`](https://github.com/lxsmnsyc/seroval/blob/main/packages/seroval/src/core/utils/error.ts)).
  So a thrown `Schema.TaggedError`'s fields (`_tag`, payload) travel as own properties, but the class
  and `instanceof` do not: the client gets an `Error`, not your tagged class.

**[judgement]** For this site the right split is:

- **Expected failures** (`LastfmUnavailable`, `NotConfigured`, upstream 5xx, decode failure) are
  *results*, not throws. The service maps them into a serialisable union such as
  `{ status: "live" | "stale" | "unavailable", data }`; the handler returns it with HTTP 200 and the
  page renders a degraded state. This keeps the cache's stale value usable and avoids turning a
  third-party outage into a 500 for the visitor.
- **Defects and genuinely unexpected errors** escape `runPromise`, so Start returns 500 and logs
  them. Log the cause with `Effect.logError`/`Logger` *before* it escapes if you want structured
  context; `Cause.squash` preserves the original `Error` and stack.
- **Server routes** (RSS, sitemap, anything fetched by an external client) are the place to use real
  status codes and `Response.json(..., { status })`, because they are ordinary HTTP handlers
  ([TanStack › Server Routes](https://tanstack.com/start/latest/docs/framework/react/guide/server-routes)).

Do not throw `TaggedError` at a `createServerFn` boundary and expect the client to keep the tagged
union: the status hint works (`.status` is an own property) but the type does not.

### 5. Env/config on Vercel and degraded mode without `LASTFM_API_KEY`

- Vercel injects project environment variables into the build **and** into function execution;
  changes only apply to new deployments
  ([Vercel › Environment variables](https://vercel.com/docs/environment-variables)).
- TanStack Start auto-loads `.env*` files for dev/build, exposes only `VITE_`-prefixed variables to
  client code, and warns that module-scope `process.env` reads leak into client bundles and break on
  runtimes that inject env per request
  ([TanStack › Environment Variables](https://tanstack.com/start/latest/docs/framework/react/guide/environment-variables)).
- `.env.example` in this repo already documents `LASTFM_API_KEY` (server-only) and
  `LASTFM_USERNAME`; `src/lib/lastfm.ts` treats an empty/missing key as "not configured" via
  `Boolean(envVar(...))` and throws `missing-key` only if `request()` is reached anyway.

**[judgement]** Model absence explicitly, at the type level, and never let it fail the layer:

```ts
// src/server/config.server.ts
export class AppConfig extends Context.Service<AppConfig, {
  readonly lastfmApiKey: Option.Option<Redacted.Redacted<string>>
  readonly lastfmUsername: string
}>()("@jwstn/AppConfig") {}

export const layer = Layer.effect(
  AppConfig,
  Effect.gen(function* () {
    const lastfmApiKey = yield* Config.option(Config.Redacted("LASTFM_API_KEY")).pipe(
      // An empty value in Vercel/dotenv means "not configured", matching today's Boolean() check.
      Config.map(Option.filter((key) => Redacted.value(key).trim() !== "")),
    )
    const lastfmUsername = yield* Config.String("LASTFM_USERNAME").pipe(
      Config.withDefault("jwstn"),
    )
    return AppConfig.of({ lastfmApiKey, lastfmUsername })
  }),
)
```

Then choose the implementation with `Layer.unwrap` on the option: a live Last.fm client when the key
is present, a `NotConfigured` client that returns the same `unavailable` result when it is not. The
service interface and the page stay identical in both modes. `Config.Redacted` keeps the key out of
logs/inspect output; `Redacted.value` is the explicit unwrap
([`Redacted.ts`](https://github.com/Effect-TS/effect/blob/effect%404.1.7/packages/effect/src/Redacted.ts)).

Do **not** use `Config.String("LASTFM_API_KEY")` in a layer that must succeed: that turns a missing
optional integration into a permanently failed layer build (see §2) and a 500 for every request on
that instance.

### 6. Cache with stale fallback

The current implementation is a module-level `Map` with a 5-minute TTL and a "serve last good
response" catch. The v4 equivalents, per [`Cache.ts`](https://github.com/Effect-TS/effect/blob/effect%404.1.7/packages/effect/src/Cache.ts):

- `Cache.makeWith(lookup, { capacity, timeToLive })` gives per-entry TTL derived from the lookup
  `Exit` — the documented way to cache successes and skip caching failures
  (return `Duration.zero` for a failed exit).
- Concurrent `get`s for the same key share one pending lookup; no hand-rolled in-flight map.
- The cache stores the `Exit`, so a failed lookup is replayed until the entry expires; a zero TTL
  avoids that.
- `Cache.invalidate` / `Cache.refresh` exist for explicit staleness.

The cache alone cannot serve "last good value after the TTL has expired", because an expired entry
is gone. **[judgement]** Keep two things in the Last.fm service layer:

1. a `Cache` for the fresh window (5 minutes, successes only), and
2. a `Ref<Option<LastfmSnapshot>>` holding the last successful snapshot.

On a cache miss, fetch; on typed upstream failure, fall back to the `Ref` and return
`{ status: "stale", data }`. That is a direct translation of today's behaviour, minus the unbounded
`Map` (capacity-bound now) and with the fallback visible in the result type instead of hidden in a
`catch`.

Remember that this cache lives **per Vercel instance** (§2). It reduces upstream calls per instance,
but it is not shared across instances, and each instance can hold a different stale snapshot. The
CDN cache header the page already sets (`public, s-maxage=300, stale-while-revalidate=600` in
`src/pages/music.astro`) remains the first line of defence and is the only layer shared by all
visitors. In TanStack Start, page-level cache headers belong on the route's `headers` function
([TanStack › ISR › Using cache headers](https://tanstack.com/start/latest/docs/framework/react/guide/isr)).

### 7. Testing: `@effect/vitest` + `TestClock` + `HttpClient.make`

- `@effect/vitest@4.1.7` peers `effect ^4.1.7` and `vitest >=5.0.0 <6.0.0`; current vitest is 5.1.2,
  whose own `vite` peer range is `^6.4.0 || ^7.0.0 || ^8.0.0` — so vitest 5.1.2 is compatible with
  TanStack Start's `vite >=8` peer
  ([npm `@effect/vitest`](https://registry.npmjs.org/@effect%2Fvitest/4.1.7),
  [npm `vitest@5.1.2`](https://registry.npmjs.org/vitest/5.1.2)).
- `TestClock` lives at `effect/testing`, not the root barrel
  ([`testing/index.ts`](https://github.com/Effect-TS/effect/blob/effect%404.1.7/packages/effect/src/testing/index.ts)).
  Use `it.effect` for virtual time, `it.live` only when real time is the subject; fork sleeping
  effects before advancing the clock (`TESTING.md`).
- Mock the HTTP boundary at the `HttpClient` service, not at `fetch`:
  `HttpClient.make((request, url, signal, fiber) => Effect.succeed(...))` constructs a client from a
  low-level runner, and `HttpClientResponse.fromWeb(request, new Response(...))` turns a Web
  `Response` into the Effect response type
  ([`HttpClient.make`](https://github.com/Effect-TS/effect/blob/effect%404.1.7/packages/effect/src/http/HttpClient.ts),
  [`HttpClientResponse.fromWeb`](https://github.com/Effect-TS/effect/blob/effect%404.1.7/packages/effect/src/http/HttpClientResponse.ts)).
- Compose a `testLayer` from the real Last.fm layer, the mock `HttpClient` layer, a `ConfigProvider`
  from `ConfigProvider.fromUnknown({...})`, and `TestClock`; then
  `effect.pipe(Effect.provide(testLayer))` in `it.effect` (house style in `TESTING.md`).
- What is worth testing here: TTL expiry (advance `TestClock`), stale fallback on a 503, decode
  failure on a malformed body, `Cache` dedupe under `Effect.forEach(..., { concurrency: "unbounded" })`,
  and the "no API key" branch returning `unavailable` without any HTTP call.

### 8. React/SSR bindings: `@effect/atom-react` is not warranted

- `@effect/atom-react` is "React bindings for Atom, the reactive state management modules";
  it peers `react >=19 <20` and ships `HydrationBoundary` / dehydration helpers, in modules marked
  `"use client"` and `@stability unstable`
  ([README](https://github.com/Effect-TS/effect/blob/effect%404.1.7/packages/atom/react/README.md),
  [package.json](https://github.com/Effect-TS/effect/blob/effect%404.1.7/packages/atom/react/package.json),
  [`ReactHydration.ts`](https://github.com/Effect-TS/effect/blob/effect%404.1.7/packages/atom/react/src/ReactHydration.ts)).
- TanStack Start route loaders are isomorphic: they run on the server during SSR and in the browser
  on client-side navigation, and server functions are the supported way to reach server-only code
  from a loader
  ([TanStack › Execution Model](https://tanstack.com/start/latest/docs/framework/react/guide/execution-model),
  [TanStack › Server Functions](https://tanstack.com/start/latest/docs/framework/react/guide/server-functions)).

**[judgement]** The data flow here is: server function → route loader → component props. Atom would
add a second, client-side cache/registry, hydration plumbing and an unstable dependency to solve a
problem the router already solves. Revisit only if a page needs live client-side polling or
optimistic updates over Effect-backed state.

## Practical implications for this project

1. **Pin the version and the floor.** `effect@^4.1.7`, `@effect/platform-node@^4.1.7`,
   `@effect/vitest@^4.1.7` (dev). Bump `engines.node` to `>=22.19.0` (or `24.x` to match `.nvmrc`);
   leave `strict` on. Do not add `@effect/platform` (v3).
2. **One runtime module.** Create `src/server/runtime.server.ts`:

   ```ts
   import { Layer, Logger, ManagedRuntime } from "effect"
   import { FetchHttpClient } from "effect/http"
   import { AppConfig } from "./config.server"
   import { Lastfm } from "./lastfm.server"

   const AppLayer = Layer.mergeAll(
     AppConfig.layer,
     Lastfm.layer.pipe(
       Layer.provide(AppConfig.layer),
       Layer.provide(FetchHttpClient.layer),
     ),
     Logger.layer([Logger.consoleJson]),
   )

   export const runtime = ManagedRuntime.make(AppLayer)
   ```

   Import it from `.server.ts` modules only; the `.server.` suffix is TanStack Start's import
   protection marker
   ([TanStack › Execution Model › Marking whole files](https://tanstack.com/start/latest/docs/framework/react/guide/execution-model)).
3. **Handlers stay thin.** `.handler(async ({ data }) => runtime.runPromise(program))`, plus
   `setResponseHeader` / `setResponseStatus` where a real status or cache header is needed
   ([TanStack › Server Functions › Server Context & Request Handling](https://tanstack.com/start/latest/docs/framework/react/guide/server-functions)).
   Pass `{ signal: getRequest().signal }` if you want client aborts to interrupt the fiber.
4. **Don't put request data on the runtime.** Read `getRequest()`/headers inside the handler and
   inject with `Effect.provideService`; module state is shared by concurrent invocations on an
   instance (§2).
5. **Keep Effect out of the client bundle.** Services, layers and the runtime live in `.server.ts`
   modules; do not import `effect` from components or route files. TanStack Start's import
   protection enforces the boundary at build time
   ([TanStack › Import Protection](https://tanstack.com/start/latest/docs/framework/react/guide/import-protection)).
6. **Logging.** Provide `Logger.consoleJson` in the layer so function logs are single-line JSON on
   Vercel, and annotate spans/logs with the Last.fm method name. Avoid buffered/finalizer-dependent
   logging: there is no documented shutdown hook for a Vercel function, so a `ManagedRuntime` is
   never disposed in production — anything requiring a graceful flush is a bad fit.
7. **Tests run outside TanStack.** Unit-test the service layers with `@effect/vitest`; only a thin
   handler adapter needs TanStack-level testing. That keeps the Effect code testable without a
   server.

## Open questions / risks

1. **Module duplication.** TanStack Start emits an SSR entry and separate server-function chunks; a
   bundler may instantiate the runtime module more than once per instance, giving two caches. Not
   verified. Mitigation if it happens: key the runtime on `globalThis` (and dispose on
   `import.meta.hot` in dev). Worth one temporary log line after migration.
2. **Failed layer builds are permanent per instance** (source, §2). Config must degrade rather than
   fail; anything that can fail transiently must be acquired lazily inside the service, not in
   `Layer.effect`.
3. **No graceful disposal on Vercel.** Nothing documents a shutdown hook for Functions, so
   `ManagedRuntime.dispose` runs only in tests/dev. Any future resource needing flush/close (file
   handles, background log shipping) conflicts with this model.
4. **`@stability unstable` surface.** `HttpClient`, `FetchHttpClient`, HTTP response helpers and
   `@effect/atom-react` are unstable in 4.1.7; minor releases may change them. Pin exactly and read
   release notes on upgrade.
5. **Cache semantics under client abort.** Request cancellation interrupts the calling fiber; whether
   an interrupted waiter affects a shared in-flight `Cache` lookup for other fibers is not documented
   in the public `Cache` page. Test before wiring `AbortSignal` into handlers that share cache keys.
6. **TypeScript 6.0 vs Effect's tested matrix.** Effect's type tests target `>=5.9` and the tooling
   recommendation is TS 7 (`tsgo`); the repo is on TS `^6.0.3`. Expect it to work, but type-check
   time on the migrated app should be measured rather than assumed.
7. **TanStack Start server-function status is not a data channel.** Successful calls carry a
   serialised payload at 200 unless a helper changes the status; if the map expects per-error status
   codes on `createServerFn`, that expectation needs revisiting — statuses only matter for thrown
   errors, `notFound()`, `setResponseStatus`, and real server routes.
