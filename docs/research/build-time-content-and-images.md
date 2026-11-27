# Build-time markdown and image pipeline in Vite

Research for wayfinder ticket [#58](https://github.com/jwstn/jwstn.dev/issues/58), in the
Astro 7 → TanStack Start migration map [#56](https://github.com/jwstn/jwstn.dev/issues/56).

## Answer / recommendation

Use **`@content-collections/vite` + `@content-collections/core`** for the markdown/JSON
collections, and **`vite-imagetools`** for build-time image derivatives. Content Collections is
the closest match to Astro content collections and has an official TanStack Start quickstart and
sample; it covers globbed files, Standard-Schema validation, generated TypeScript types,
`_meta.path` IDs, transforms, watch mode and a per-document cache. `vite-imagetools` is the
closest image equivalent to `<Image>`/`<Picture>`: Sharp resizing at build time, `srcset`,
per-format `<picture>` sources, intrinsic width/height and Vite-hashed URLs. Effect Schema can
replace Zod as the collection schema through `Schema.toStandardSchemaV1`; keep it in the
Node-only `content-collections.ts` (or a `.server.ts` module), never in a route or loader.
The one architectural rule is to keep image imports in a module that is part of the **client**
build graph: TanStack Start loaders are isomorphic, and a server-only collection can otherwise
hide image assets from the client output.

Do **not** start with a custom Sharp/Vite plugin or pre-generated derivatives. The repo has 22
gallery images (133.6 MB, 512 MP); `vite-imagetools` plus its disk cache is enough, and a custom
pipeline would have to re-implement derivative naming, hashing, caching, watch behaviour and
types.

## Method and sources

- Read the ticket and the current repo: `src/content.config.ts`, the gallery/blog/project routes,
  `astro.config.mjs`, and the 22 source JPEGs under `src/assets/`.
- Went to primary sources: Content Collections docs and source, Vite docs, `vite-imagetools`
  docs and source, Sharp docs, Effect Schema docs, Astro docs, and the TanStack Start docs.
- Ran a local Sharp benchmark on one representative 6000×4000 JPEG to size the image-build cost
  for the current gallery volume (method and numbers below).
- Treats the checked-in `dist/` as an observation only, not as a guaranteed fresh build.

## Baseline: what Astro does today

Current content model, from
[`src/content.config.ts`](https://github.com/jwstn/jwstn.dev/blob/main/src/content.config.ts):

- **blog**: `glob` over `src/content/blog/**/*.{md,mdx}`; schema `title`, `description`,
  `pubDate`, optional `updatedDate`, optional `heroImage: image()`.
- **projects**: `glob` over `src/content/projects/**/*.{md,mdx}`; schema `title`, `description`,
  `pubDate`, `href`, `tags`.
- **gallery**: `glob` over `src/content/gallery/**/*.json`; schema `title`, `pubDate`, `slug`,
  and `photos[]` with `image: image()`, `title`, optional `caption`.

There is currently no `src/content/blog/` directory, four project Markdown files (about 5.8 KB
total), three gallery JSON files, and 22 photos. The gallery uses five widths
(`640, 960, 1280, 1600, 1920`) and a responsive `sizes` string; the blog hero uses three widths
(`800, 1024, 1280`) — see
[`src/pages/gallery/[...slug].astro`](https://github.com/jwstn/jwstn.dev/blob/main/src/pages/gallery/%5B...slug%5D.astro)
and
[`src/pages/blog/[...slug].astro`](https://github.com/jwstn/jwstn.dev/blob/main/src/pages/blog/%5B...slug%5D.astro).

What Astro provides for that model:

- `glob()` generates a URL-friendly `id` from the filename, with a frontmatter/JSON `slug`
  override, and `getCollection()`/`render()` query and render entries
  ([Astro content collections guide](https://docs.astro.build/en/guides/content-collections/#the-glob-loader)).
- The `image()` helper validates an image path from frontmatter and turns it into imported
  metadata (`src`, `width`, `height`, `format`)
  ([Astro images guide — images in content collections](https://docs.astro.build/en/guides/images/#images-in-content-collections)).
- `<Image>` produces `width`/`height` to avoid layout shift, `srcset` from `widths`, a `sizes`
  attribute you pass, and a hashed `/_astro/...` URL. For **prerendered** pages this happens at
  build time; for pages rendered on demand it happens per request through `/_image?...`
  ([Astro images guide — `<Image />`](https://docs.astro.build/en/guides/images/#image-),
  [responsive behaviour](https://docs.astro.build/en/guides/images/#responsive-image-behavior)).
- `<Image>` defaults to WebP; `<Picture>` defaults to `['webp']` sources
  ([`astro:assets` reference](https://docs.astro.build/en/reference/modules/astro-assets/#format)).
- Astro caches processed images in `./node_modules/.astro` by default
  ([Astro images guide — asset caching](https://docs.astro.build/en/guides/images/#asset-caching)).

**Important local observation:** `astro.config.mjs` uses `output: "server"` with the Vercel
adapter, so the gallery/blog routes are rendered on demand. The `dist/` present in this checkout
is 135 MB and contains 22 unprocessed `.JPG` files and no WebP derivatives, which is consistent
with Astro doing image transforms at request time rather than build time for those routes. The
migration requirement in the ticket is explicitly **build-time**, so this pipeline will be a
behaviour change as well as a framework change.

## Markdown/JSON collections: options compared

### Option A — Content Collections (recommended)

**What it gives you.** A root `content-collections.ts` defines collections with a `directory`,
`include`/`exclude` glob, a parser (`frontmatter`, `frontmatter-only`, `json`, `yaml`, or a
custom parser), a Standard-Schema `schema`, an optional `transform`, and an optional `onSuccess`
hook ([configuration docs](https://www.content-collections.dev/docs/configuration)). It writes
plain JS data plus a `.d.ts` file into `.content-collections/generated`, which you import as
`import { allPosts } from "content-collections"`; the Vite plugin aliases that bare import to
the generated directory ([Vite adapter docs](https://www.content-collections.dev/docs/adapter/vite),
[plugin source](https://github.com/sdorra/content-collections/blob/main/packages/vite/src/index.ts)).

**Type safety.** Generated types are real TypeScript declarations derived from the schema and
transform return type
([writer source](https://github.com/sdorra/content-collections/blob/main/packages/core/src/writer.ts),
[quick start](https://www.content-collections.dev/docs)). The transform return type is checked
against what can be serialized; static imports are the documented exception
([serialization docs](https://www.content-collections.dev/docs/serialization)).

**Schema validation.** Any Standard Schema V1 library works: Zod, Valibot, ArkType, etc.
([configuration docs](https://www.content-collections.dev/docs/configuration)). Validation runs
before the transform, and Content Collections `await`s `schema["~standard"].validate(data)`, so
an async Standard Schema is supported
([transformer source](https://github.com/sdorra/content-collections/blob/main/packages/core/src/transformer.ts)).

**Slug / ID.** Every document gets `_meta` with `filePath`, `fileName`, `directory`, `path` and
`extension`; `path` is the file path without its extension, and a trailing `/index` is removed
([config source](https://github.com/sdorra/content-collections/blob/main/packages/core/src/config.ts),
[transformer source](https://github.com/sdorra/content-collections/blob/main/packages/core/src/transformer.ts)).
For the gallery JSON, the explicit `slug` field remains the public URL; `_meta.path` is the
filename-derived fallback.

**Drafts.** There is no magic `draft` flag. The transform context exposes `skip(reason)`, and the
docs show exactly the `if (doc.draft) return skip(...)` pattern
([transform docs — skipping documents](https://www.content-collections.dev/docs/transform#skipping-documents)).
This is the same manual model as Astro’s `getCollection(..., ({ data }) => data.draft !== true)`
filter ([Astro filtering docs](https://docs.astro.build/en/guides/content-collections/#filtering-collection-queries)).

**Hot reload / watch.** The Vite plugin runs `builder.watch()` in `configureServer()` and
rebuilds when content or the config changes
([plugin source](https://github.com/sdorra/content-collections/blob/main/packages/vite/src/index.ts)).
The README claims updates without restarting the server or refreshing the browser; the plugin
itself starts a watcher and rewrites the generated modules, leaving HMR propagation to Vite’s
normal file-watch behaviour (exercise this in the TanStack Start multi-environment dev server —
see open questions)
([README](https://github.com/sdorra/content-collections#readme),
[builder source](https://github.com/sdorra/content-collections/blob/main/packages/core/src/builder.ts)).

**MDX.** Two supported routes:

- `@content-collections/mdx`: compiles MDX in the transform with `mdx-bundler` and renders via
  `MDXContent` at runtime ([MDX docs](https://www.content-collections.dev/docs/content/mdx)).
- `frontmatter-only` + `createDefaultImport` + `@mdx-js/rollup`: let Vite compile the `.mdx` file
  and return a static import from the transform. This is the pattern in the official TanStack
  Start sample ([sample README](https://github.com/sdorra/content-collections/blob/main/samples/tanstack-start-cf-mdx/README.md),
  [`@mdx-js/rollup` docs](https://github.com/mdx-js/mdx/blob/main/packages/rollup/readme.md)).
  The sample uses the static-import route because `@content-collections/mdx` uses `new Function()`,
  which Cloudflare Workers block; static imports also let the app bundler resolve imports inside
  MDX.

For plain Markdown, `@content-collections/markdown` compiles to HTML with remark/rehype and caches
the result in the transform cache
([Markdown docs](https://www.content-collections.dev/docs/content/markdown)).

**TanStack Start fit.** There is an official quickstart for TanStack Start `v1.121.0+` and a
sample using the Vite adapter, `environment: "ssr"`, a `server-only` writer hook, server
functions and optional RSC
([TanStack Start quickstart](https://www.content-collections.dev/docs/quickstart/tanstack-start),
[sample](https://github.com/sdorra/content-collections/blob/main/samples/tanstack-start-cf-mdx)).
That is the strongest primary-source signal of the options compared here.

### Option B — `import.meta.glob` + a front-matter parser

`import.meta.glob` is a Vite-only transform that turns a glob into a map of static imports; with
`eager: true` it becomes static imports, and with `query: '?raw'`/`import: 'default'` you can read
Markdown as a string ([Vite glob import docs](https://vite.dev/guide/features#glob-import)). You
then parse front matter yourself (e.g. `gray-matter`; Content Collections uses
`@11ty/gray-matter` internally — [parser source](https://github.com/sdorra/content-collections/blob/main/packages/core/src/parser.ts))
and compile the body with remark, `marked`, or `@mdx-js/rollup`.

- **Type safety:** manual. The glob returns `Record<string, unknown>` unless you write your own
  types or generate them. There is no schema-to-type inference.
- **Schema validation:** manual. You can run Zod/Effect Schema yourself, but nothing wires it into
  the import graph or fails the build with a collection-level error.
- **Hot reload:** native Vite HMR; each matched file is a module dependency of the glob-importing
  module ([Vite glob docs](https://vite.dev/guide/features#glob-import)).
- **Slug / ID:** the glob key is the path; you strip the extension and normalize. No `_meta`
  object, no index-file convention unless you write it.
- **Drafts:** manual filter after parsing.
- **MDX:** add `@mdx-js/rollup` and import `.mdx` directly
  ([`@mdx-js/rollup` docs](https://github.com/mdx-js/mdx/blob/main/packages/rollup/readme.md)).
- **JSON:** Vite imports JSON natively, including named exports
  ([Vite JSON docs](https://vite.dev/guide/features#json)).
- **Caching:** none beyond Vite’s module cache; expensive Markdown/MDX compilation re-runs when
  the module or its imports change.
- **Caveats:** glob arguments must be literals; patterns must be relative, absolute from project
  root, or aliases ([Vite glob caveats](https://vite.dev/guide/features#glob-import-caveats)).

This is a reasonable **gallery-image** helper (see below), but a weak replacement for a content
collection because every schema, type and error path is bespoke.

### Option C — a custom Vite plugin

Vite’s plugin API gives you `resolveId`/`load` for virtual modules, `transform` for custom file
types, `buildStart`, `configureServer`, `handleHotUpdate` and `this.addWatchFile`
([Vite plugin API](https://vite.dev/guide/api-plugin)). You could read Markdown/JSON, parse
front matter, validate, compile, emit a virtual module and invalidate it on change.

The cost is that you re-implement the collection layer: glob discovery, schema integration, type
generation, slug rules, draft filtering, caching, watch/HMR, and error reporting. Vite’s docs
explicitly recommend checking existing plugins/features before writing one
([Vite plugin API — authoring a plugin](https://vite.dev/guide/api-plugin#authoring-a-plugin)).
For this repo, a custom plugin only makes sense if a requirement (e.g. a non-Standard-Schema
validation library, or a content source Content Collections cannot model) blocks the two options
above.

### Comparison table

| Criterion | Content Collections | `import.meta.glob` + front matter | Custom Vite plugin |
| --- | --- | --- | --- |
| Authoring | `content-collections.ts`, directory + glob + parser + schema ([docs](https://www.content-collections.dev/docs/configuration)) | Glob + parser in app code ([Vite](https://vite.dev/guide/features#glob-import)) | Your own config + plugin |
| Schema | Any Standard Schema (Zod/Valibot/ArkType/Effect) ([docs](https://www.content-collections.dev/docs/configuration)) | DIY | DIY |
| Type generation | Generated `.d.ts` from schema/transform ([writer](https://github.com/sdorra/content-collections/blob/main/packages/core/src/writer.ts)) | Manual | DIY |
| Slug / `_meta` | `_meta.path`, `filePath`, `fileName`, `directory`, `extension` ([source](https://github.com/sdorra/content-collections/blob/main/packages/core/src/transformer.ts)) | Glob key; manual normalization | DIY |
| Drafts | `skip(reason)` in transform ([docs](https://www.content-collections.dev/docs/transform#skipping-documents)) | Manual filter | DIY |
| MDX | `@content-collections/mdx` or `frontmatter-only` + `@mdx-js/rollup` ([docs](https://www.content-collections.dev/docs/content/mdx)) | `@mdx-js/rollup` direct | DIY |
| Watch / HMR | `builder.watch()` in the Vite plugin ([source](https://github.com/sdorra/content-collections/blob/main/packages/vite/src/index.ts)) | Native Vite HMR | `handleHotUpdate` yourself |
| Cache | Per-document transform cache keyed by config+input ([cache source](https://github.com/sdorra/content-collections/blob/main/packages/core/src/cache.ts)) | None built in | DIY |
| TanStack Start | Official quickstart + sample ([quickstart](https://www.content-collections.dev/docs/quickstart/tanstack-start), [sample](https://github.com/sdorra/content-collections/blob/main/samples/tanstack-start-cf-mdx)) | Works, but no integration layer | Works, but all custom |
| Effort | Lowest | Medium (schema/types/errors) | Highest |

## Front matter validation with Effect Schema

**Can Effect Schema replace Zod here?** Yes, with one adapter call. Content Collections accepts
any Standard Schema V1 implementation, and Effect provides
`Schema.toStandardSchemaV1(schema)` to expose an Effect schema through the Standard Schema
interface ([Content Collections configuration](https://www.content-collections.dev/docs/configuration),
[Effect Schema → Standard Schema](https://effect.website/docs/v4/schema/standard-schema)).
The Effect docs state the schema must not require decoding services: `DecodingServices` must be
`never`; ordinary `Schema.Struct`/`Schema.String`/`Schema.optional` schemas satisfy that.

**Async validation.** Standard Schema `validate` returns a Promise if the schema contains an async
transformation or check, and Content Collections `await`s the validation result, so this is
compatible ([Effect docs](https://effect.website/docs/v4/schema/standard-schema),
[transformer source](https://github.com/sdorra/content-collections/blob/main/packages/core/src/transformer.ts)).
That said, keep the schema pure: filesystem resolution and Sharp metadata belong in `transform`,
where they can be cached per document and reported with a useful transform error.

**Does Effect reach the browser?** Not if it stays in `content-collections.ts`. Content
Collections compiles the config with esbuild and imports the compiled module from Node; the
config is not part of the app’s Vite module graph
([configuration reader source](https://github.com/sdorra/content-collections/blob/main/packages/core/src/configurationReader.ts),
[README — “parsed and validated during the build process”](https://github.com/sdorra/content-collections#readme)).
The generated files are plain data plus type declarations; the only runtime import they add is
the type-only `GetTypeByName` import in the `.d.ts`
([writer source](https://github.com/sdorra/content-collections/blob/main/packages/core/src/writer.ts)).
TanStack Start is isomorphic by default, so the risk is not Content Collections — it is importing
`effect` (or a schema module that imports it) from a route, loader, component or other
client-reachable file. Keep the schema in `content-collections.ts` or a `.server.ts` module, and
use the sample’s writer hook to mark generated data server-only
([TanStack execution model](https://tanstack.com/start/latest/docs/framework/react/guide/execution-model),
[sample README](https://github.com/sdorra/content-collections/blob/main/samples/tanstack-start-cf-mdx/README.md)).

**What about Astro’s `image()` transform?** `image()` is not just validation: it resolves a path,
checks the file, reads dimensions and returns `ImageMetadata`
([Astro docs](https://docs.astro.build/en/guides/images/#images-in-content-collections)). Effect
Schema can validate the **string** shape at the schema layer, but the file resolution and metadata
read are I/O. Put them in `transform` (calling Sharp’s `metadata()`) and return a static image
import or a normalized key. If you try to do it inside an async Effect Schema, it works
mechanically, but you lose the clean separation between validation and transformation and make the
schema cache-hostile.

## Images: options compared

### Option A — `vite-imagetools` (recommended)

`vite-imagetools` is a Vite plugin that applies Sharp transforms from import query directives
([README](https://github.com/JonasKruckenberg/imagetools#readme)). Directives include `w`, `h`,
`format`, `quality`, `fit`, `position`, `effort`, `blur`, `rotate`, etc.
([directives docs](https://github.com/JonasKruckenberg/imagetools/blob/main/docs/directives.md)).
It supports multiple values per directive:

```ts
import picture from "example.jpg?w=640;960;1280;1600;1920&format=avif;webp&as=picture";
```

Output formats ([source](https://github.com/JonasKruckenberg/imagetools/blob/main/packages/core/src/output-formats.ts)):

- `as=url` (default): one URL, or an array of URLs for multiple outputs.
- `as=srcset`: a `srcset` string with `w` descriptors (or `x` descriptors with `basePixels`).
- `as=img`: `{ src, w, h, srcset? }`; the largest image provides `src`/`w`/`h`, and `srcset` is
  included only when at least two images are produced.
- `as=picture`: `{ sources: Record<format, srcset>, img: { src, w, h } }`; the fallback format is
  the **last** format in the directive.
- `as=metadata`/`as=meta`: flat Sharp metadata plus `width`, `height`, `format`, `src`; an
  optional whitelist keeps the bundle small.

Build behaviour: in build, each derivative is emitted with `this.emitFile({ type: "asset", ... })`
and the returned URL contains Vite’s asset placeholder, so Vite hashes the filename and copies it
into the asset directory; in dev, a middleware serves the generated bytes and the URL is the
request path ([plugin source](https://github.com/JonasKruckenberg/imagetools/blob/main/packages/vite/src/index.ts),
[Vite assets guide](https://vite.dev/guide/assets/#importing-asset-as-url)). That matches Astro’s
hashed `/_astro/...` output.

Caching: enabled by default, stored in `./node_modules/.cache/imagetools`, keyed by the source
bytes and the transform config; unchanged sources reuse the cached derivatives
([caching docs](https://github.com/JonasKruckenberg/imagetools/blob/main/docs/guide/caching.md),
[plugin source](https://github.com/JonasKruckenberg/imagetools/blob/main/packages/vite/src/index.ts)).

Metadata removal: `removeMetadata` defaults to `true`, so EXIF/GPS is stripped
([plugin options](https://github.com/JonasKruckenberg/imagetools/blob/main/docs/vite/src/types/interfaces/VitePluginOptions.md)).

**Gaps versus Astro `<Image>`:**

- `sizes` is not generated. `as=img` gives `srcset`/`w`/`h`; you still write
  `sizes="(min-width: 80rem) 26rem, ..."` in JSX. Astro’s `layout` can generate `sizes`; with
  imagetools you own the responsive breakpoints ([Astro responsive docs](https://docs.astro.build/en/guides/images/#responsive-image-behavior)).
- No automatic `loading="lazy"`/`decoding="async"`; write them on the `<img>`.
- The default `include` regex is case-sensitive and only matches lowercase extensions
  (`avif|gif|heif|jpeg|jpg|png|tiff|webp`); this repo’s `.JPG` files will be skipped unless you
  pass a case-insensitive `include` or rename them
  ([plugin source](https://github.com/JonasKruckenberg/imagetools/blob/main/packages/vite/src/index.ts)).
- The plugin only processes imports that carry directives; a plain `import img from "./x.jpg"`
  falls through to Vite’s normal asset handling.

### Option B — `@responsive-image/vite-plugin`

A higher-level multi-framework library: Vite plugin + React component, Sharp processing, widths,
formats, LQIP (blurhash/thumbhash/colour), and layout modes. It uses an explicit `?responsive`
query marker and supports `w`, `format`, `quality`, `lqip`, etc. as query params
([Vite build docs](https://responsive-image.dev/build/vite),
[local images docs](https://responsive-image.dev/usage/local-images),
[repo](https://github.com/simonihmig/responsive-image)). Defaults are widths
`[640, 750, 828, 1080, 1200, 1920, 2048, 3840]` and formats `['original', 'webp']`
([local images reference](https://responsive-image.dev/usage/local-images#core-parameters)).

It is a credible alternative if you want its React component, LQIP and layout modes out of the
box. It is more opinionated and adds its own runtime/component layer; `vite-imagetools` is lower
level and produces plain `srcset`/`picture` data you can render with your own markup. For this
repo’s custom isometric layout, plain `picture` data is likely the better fit.

### Option C — `unplugin-imagemin`

`unplugin-imagemin` compresses and converts images at build time using Squoosh/WASM, with a cache;
it supports PNG/JPEG/WebP/AVIF/SVG/TIFF and conversion pairs
([README](https://github.com/unplugin/unplugin-imagemin#readme)). It does **not** generate
responsive width sets, `srcset`, `picture` sources or intrinsic dimensions. It is a compressor,
not an `<Image>` replacement. Useful only as an additional optimisation pass.

### Option D — a custom Sharp Vite plugin

You can write a plugin that reads image imports, calls Sharp, emits derivatives with `emitFile`,
returns a virtual module with `src`/`srcset`/`w`/`h`, and caches by source hash. Vite’s plugin API
supports all of it ([Vite plugin API](https://vite.dev/guide/api-plugin)). But you would duplicate
`vite-imagetools`’ directive parsing, output formats, cache and dev middleware. Sharp itself is
fast and well documented ([Sharp resize](https://sharp.pixelplumbing.com/api-resize),
[Sharp output](https://sharp.pixelplumbing.com/api-output)), so a custom plugin is not technically
risky — it is just unnecessary maintenance unless you need a transform `vite-imagetools` cannot
express.

### Option E — pre-generated derivatives

Run a script (Sharp) that writes `public/images/<name>-<width>.<format>` plus a manifest JSON, and
have content reference manifest keys. `public/` files are copied to the output as-is and are never
processed or hashed by Vite ([Vite assets guide — public directory](https://vite.dev/guide/assets/#the-public-directory)).
Pros: zero build cost, stable URLs, no plugin. Cons: you own hashing/cache-busting, staleness
detection, width/format manifests, and the script must run before every build (or be committed).
For 22 images this is manageable, but it moves complexity from a maintained plugin into repo
scripts.

### Image comparison table

| Criterion | `vite-imagetools` | `@responsive-image/vite-plugin` | `unplugin-imagemin` | Custom Sharp plugin | Pre-generated |
| --- | --- | --- | --- | --- | --- |
| Resize / `srcset` | Yes (`as=srcset`/`img`/`picture`) ([source](https://github.com/JonasKruckenberg/imagetools/blob/main/packages/core/src/output-formats.ts)) | Yes, widths + layout ([docs](https://responsive-image.dev/usage/local-images)) | No | You implement | You implement |
| Width/height | `as=img` gives `w`/`h`; `as=picture` fallback `w`/`h` ([source](https://github.com/JonasKruckenberg/imagetools/blob/main/packages/core/src/output-formats.ts)) | Component handles dimensions | No | You implement | Manifest |
| Modern formats | `format=avif;webp;jpg` ([directives](https://github.com/JonasKruckenberg/imagetools/blob/main/docs/directives.md)) | `format` option ([docs](https://responsive-image.dev/usage/local-images)) | Converts one output | You implement | Script |
| `sizes` | Manual | Component/layout | No | You implement | Manual |
| Hashed URLs | Vite `emitFile` ([source](https://github.com/JonasKruckenberg/imagetools/blob/main/packages/vite/src/index.ts)) | Vite asset pipeline | Vite asset pipeline | You implement | You implement |
| Dev serving | Middleware ([source](https://github.com/JonasKruckenberg/imagetools/blob/main/packages/vite/src/index.ts)) | Yes | Yes | You implement | Static `/public` |
| Cache | Disk cache on by default ([docs](https://github.com/JonasKruckenberg/imagetools/blob/main/docs/guide/caching.md)) | Yes (`cache` option) ([types](https://github.com/simonihmig/responsive-image/blob/main/packages/vite-plugin/src/types.ts)) | Yes ([README](https://github.com/unplugin/unplugin-imagemin#readme)) | You implement | N/A |
| Runtime layer | None; plain data | React/Vue/Svelte/etc. components | None | None | None |
| Effort | Low | Low–medium | Low (but not a replacement) | High | Medium |
| Fit here | **Best** | Good if you want its component/LQIP | Supplementary only | Overkill | Viable fallback |

**Version note.** `vite-imagetools@12.0.2` declares a peer dependency on `vite >=8` and
`node >=22`, while Content Collections’ Vite adapter supports `vite ^6 || ^7 || ^8`; the official
TanStack Start sample pins Vite `^8.3.8`
([vite-imagetools package](https://github.com/JonasKruckenberg/imagetools/blob/main/packages/vite/package.json),
[Content Collections Vite package](https://github.com/sdorra/content-collections/blob/main/packages/vite/package.json),
[sample package](https://github.com/sdorra/content-collections/blob/main/samples/tanstack-start-cf-mdx/package.json)).
The current repo is Astro `7.4.12`; plan the migration on Vite 8 rather than trying to keep the
Astro toolchain’s Vite version.

## Mapping the current content model

### Gallery JSON (`photos[].image`)

The JSON stores paths relative to the JSON file, e.g.
`"../../assets/japan-2026/DSC01660.JPG"` (see
[`src/content/gallery/japan-2026.json`](https://github.com/jwstn/jwstn.dev/blob/main/src/content/gallery/japan-2026.json)).
Content Collections’ `json` parser gives you the object; `_meta.filePath` is relative to the
collection directory (`japan-2026.json` for a top-level file), so the transform can resolve:

```ts
const absolute = path.resolve("src/content/gallery", path.dirname(doc._meta.filePath), photo.image);
const meta = await sharp(absolute).metadata(); // existence + width/height
```

That replaces the file-existence/dimension part of Astro’s `image()` helper. To turn the path into
build-time derivatives, the cleanest pattern is a **client-safe image manifest** using
`import.meta.glob` with an imagetools query:

```ts
// src/lib/gallery-images.ts — imported by the gallery route/component
import type { Picture } from "vite-imagetools";

export const galleryImages = import.meta.glob(
  "/src/assets/**/*.{JPG,jpg,jpeg,png}",
  {
    eager: true,
    query: "?w=640;960;1280;1600;1920&format=avif;webp&as=picture",
    import: "default",
  },
) as Record<string, Picture>;
```

Vite’s glob supports absolute paths from the project root and custom `query` strings
([Vite glob docs](https://vite.dev/guide/features#glob-import)). Content Collections can store a
normalized `/src/assets/...` key on each photo; the route looks it up in `galleryImages`. This
keeps the JSON authoring unchanged, gives one uniform derivative preset for every gallery photo,
and — importantly — puts the image imports in the **client** graph so the client build emits the
derivatives.

If you prefer everything to go through Content Collections, `createDefaultImport` can return a
static import from the transform:

```ts
import { createDefaultImport } from "@content-collections/core";
import type { Picture } from "vite-imagetools";

return {
  ...photo,
  image: createDefaultImport<Picture>(
    `~/assets/japan-2026/DSC01660.JPG?w=640;960;1280;1600;1920&format=avif;webp&as=picture`,
  ),
};
```

The serializer writes `import __v_1 from "..."` with the path verbatim
([serializer source](https://github.com/sdorra/content-collections/blob/main/packages/core/src/serializer.ts)),
so the query survives. This is elegant, but the generated collection file then contains one
static import per photo; use an alias (`~/...`) because Vite’s `tsconfigPaths` does not apply to
the generated files (the sample README calls this out explicitly —
[sample README](https://github.com/sdorra/content-collections/blob/main/samples/tanstack-start-cf-mdx/README.md)).
Because of the asset-emission issue below, the glob manifest is the safer default for gallery
images.

### Markdown hero image (`heroImage`)

The same pattern applies. In the transform:

1. Resolve `heroImage` relative to `_meta.filePath`.
2. Check it with `sharp(absolute).metadata()`.
3. Either return `createDefaultImport<Picture>('~/assets/...?w=800;1024;1280&format=avif;webp&as=picture')`,
   or store a normalized key and resolve it through a client-safe `import.meta.glob` manifest with
   the hero widths.

The static-import route is convenient for a single optional hero; the glob route is better if
you want all hero imports visible to the client build and a uniform preset. Either way, the
`heroImage` field changes from Astro `ImageMetadata` to an imagetools `Picture`/`Img` object, so
the JSX changes from `<Image src={heroImage} ... />` to a small `<picture>`/`<img>` renderer.

### Rendering `as=picture` output

`as=picture` returns `{ sources, img }`; `sources` is keyed by format and contains a `srcset`,
and `img` is the fallback with `src`, `w`, `h`
([source](https://github.com/JonasKruckenberg/imagetools/blob/main/packages/core/src/output-formats.ts)):

```tsx
const picture = galleryImages[key];

<picture>
  {Object.entries(picture.sources).map(([format, srcset]) => (
    <source key={format} srcSet={srcset} type={`image/${format}`} />
  ))}
  <img
    src={picture.img.src}
    width={picture.img.w}
    height={picture.img.h}
    sizes="(min-width: 80rem) 26rem, (min-width: 48rem) 40vw, 92vw"
    loading="lazy"
    decoding="async"
    alt={photo.title}
  />
</picture>
```

For a single-format case, `as=img` gives a simpler `{ src, w, h, srcset? }` and can be spread onto
`<img>`.

### Asset emission and the server/client boundary

This is the main architectural trap. TanStack Start is **isomorphic by default**: all code is in
both server and client bundles unless constrained, and route loaders run on both server (SSR) and
client (navigation) ([TanStack execution model](https://tanstack.com/start/latest/docs/framework/react/guide/execution-model)).
The official Content Collections sample therefore:

- passes `environment: "ssr"` to the Vite plugin so it only runs in the SSR environment
  ([adapter docs](https://www.content-collections.dev/docs/adapter/vite));
- adds `import '@tanstack/react-start/server-only'` to the generated data/JS via a writer hook so
  importing the collection from a client module fails
  ([sample README](https://github.com/sdorra/content-collections/blob/main/samples/tanstack-start-cf-mdx/README.md));
- reads the collection inside `createServerFn` and returns serializable data to a loader; MDX is
  streamed with RSC when it cannot be serialized
  ([sample `posts.tsx`](https://github.com/sdorra/content-collections/blob/main/samples/tanstack-start-cf-mdx/src/utils/posts.tsx)).

The trap: Vite does **not** emit static assets during non-client builds by default
(`build.emitAssets` defaults to `false`; `build.ssrEmitAssets` likewise), because the framework is
expected to merge assets from the client build
([Vite build options](https://vite.dev/config/build-options#build-emitassets)). If image imports
exist only in a server-only collection, `vite-imagetools` may emit derivatives into the SSR build
but not into the client output, while the serialized URLs still point at `/assets/...`. Keep the
image imports in a client-reachable module (the glob manifest above), or configure asset emission
for the SSR environment and merge the outputs. Test this explicitly in the TanStack Start build;
it is not covered by the Content Collections sample.

## Build performance and caching

### Repo volume (measured)

- 22 source JPEGs under `src/assets/`: 10 Japan, 8 spring, 4 summer.
- Total **133.6 MB**, **511.9 MP**; most are 6000×4000 (24 MP), two are 4608×3456.
- Three gallery JSON files, 22 photos; four project Markdown files (5.8 KB); no blog files.

### Local Sharp benchmark (single representative image)

Method: Sharp 0.34.3 from this repo, `sharp(src).resize({ width, withoutEnlargement: true })`,
five widths `640, 960, 1280, 1600, 1920`, all widths/formats run concurrently, output to
`/tmp/opencode/imgbench`. Source: `DSC01660.JPG`, 6000×4000, 6.5 MB. Machine: AMD Ryzen 7 5800X
(8 cores/16 threads), Node 24.22.3.

| Output set | Outputs | Time | Total bytes |
| --- | ---: | ---: | ---: |
| WebP only | 5 | 336 ms | 0.62 MB |
| AVIF + WebP | 10 | 6,074 ms | 1.02 MB |
| AVIF + WebP + JPEG | 15 | 6,034 ms | 1.93 MB |

Read this as a **rough order-of-magnitude** measurement, not a full build benchmark. AVIF encoding
dominates; JPEG adds almost nothing once AVIF is in the set because the jobs run concurrently.
Extrapolating linearly to 22 images: WebP-only ≈ 7.4 CPU-seconds (roughly 1–2 s wall on 8 cores),
AVIF+WebP ≈ 134 CPU-seconds (roughly 20–40 s wall cold, depending on Sharp/libvips concurrency
and memory). Sharp’s own benchmark reports similar JPEG/PNG throughput and explains the libuv /
libvips thread pools ([Sharp performance](https://sharp.pixelplumbing.com/performance)).

This matters because Astro’s current `<Image>` default is WebP, not AVIF. Matching today’s output
is the cheap path; adding AVIF is a deliberate quality/bytes trade-off with a real build-time cost.

### Cache behaviour

| Layer | Location | Key / invalidation | Source |
| --- | --- | --- | --- |
| Content Collections transform cache | `.content-collections/cache` | config checksum + input + cache key; per document | [cache source](https://github.com/sdorra/content-collections/blob/main/packages/core/src/cache.ts) |
| `vite-imagetools` derivative cache | `./node_modules/.cache/imagetools` | source bytes hash + resolved config; enabled by default | [caching docs](https://github.com/JonasKruckenberg/imagetools/blob/main/docs/guide/caching.md), [source](https://github.com/JonasKruckenberg/imagetools/blob/main/packages/vite/src/index.ts) |
| Astro image cache (current) | `./node_modules/.astro` | Astro-managed local/remote cache | [Astro docs](https://docs.astro.build/en/guides/images/#asset-caching) |
| Vite module cache | in-memory/dev | module graph | [Vite docs](https://vite.dev/guide/features) |

For CI, cache `.content-collections/cache` and `node_modules/.cache/imagetools` alongside the
package-manager cache. A cold CI build pays the image cost; a warm build should skip unchanged
sources. The content layer itself is tiny (5.8 KB of Markdown, 3 small JSON files), so markdown/MDX
compilation is not the bottleneck — images are.

## Practical implications for this project

1. **Adopt Content Collections, not a bespoke loader.** Model blog/projects/gallery as three
   collections in `content-collections.ts` with `frontmatter` (or `frontmatter-only` + Vite MDX)
   and `json` parsers. This preserves the “authors write Markdown/JSON + image files” workflow
   and gives generated types, `_meta.path`, watch mode and a transform cache.
2. **Use Effect Schema via `Schema.toStandardSchemaV1`.** Keep the schema module Node-only. Port
   the current Zod fields directly: `title`, `description`, `pubDate` (string → Date), optional
   `updatedDate`, `href`, `tags`, `slug`, and the `photos` array. Validate image paths as strings
   in the schema; resolve/check them in `transform`.
3. **Do image work in `transform` or a client-safe manifest, not in the schema.** `image()`’s file
   resolution is I/O; use `sharp().metadata()` for existence/dimensions, and `vite-imagetools` for
   derivatives. This also keeps the transform cache useful.
4. **Use `vite-imagetools` with `as=picture` (or `as=img`).** Start with WebP-only to match
   Astro’s current default and keep builds fast; add AVIF only if the bytes win is worth the
   measured cost. Reuse the existing `sizes` strings; imagetools does not generate them.
5. **Put gallery/hero image imports in a client-visible module.** A `src/lib/gallery-images.ts`
   using `import.meta.glob('/src/assets/**/*.{JPG,...}', { query: '?...&as=picture', eager: true })`
   is the safest way to guarantee client asset emission. Content Collections can validate the
   paths and store normalized keys; the route resolves them through the manifest.
6. **Keep Content Collections server-only and expose it through server functions.** Use
   `environment: "ssr"`, the writer hook with `@tanstack/react-start/server-only`, and
   `createServerFn` for loaders. If MDX is needed, use `frontmatter-only` + `@mdx-js/rollup` +
   `createDefaultImport` (the sample pattern), or RSC if you need to stream compiled MDX.
7. **Fix the `.JPG` case issue.** Either pass a case-insensitive `include` to `vite-imagetools` or
   normalize/rename image extensions. The default include regex will not match uppercase `.JPG`.
8. **Keep `src/assets`, not `public/`.** Imported assets participate in Vite’s asset graph and get
   hashed URLs; `public/` files are copied as-is and are not processed
   ([Vite assets guide](https://vite.dev/guide/assets/#the-public-directory)).
9. **Add a build-time smoke test.** Build the TanStack Start app with a cold image cache, assert
   that every referenced derivative exists in the client output, and assert that no `effect` or
   content-collection module appears in the client bundle.

## Open questions and risks

1. **SSR-only asset emission.** Does TanStack Start’s SSR build emit `vite-imagetools` assets, or
   only the client build? Vite defaults `build.emitAssets` to `false` for non-client builds
   ([Vite docs](https://vite.dev/config/build-options#build-emitassets)). The client-visible glob
   manifest avoids the question; confirm with a build before relying on server-only image
   imports.
2. **`sizes` is manual.** Astro’s `layout` generates `sizes`; imagetools does not. The existing
   gallery/hero `sizes` strings must be carried over and tested at the breakpoints
   ([Astro responsive docs](https://docs.astro.build/en/guides/images/#responsive-image-behavior)).
3. **Uppercase extensions.** The default imagetools `include` is case-sensitive; this repo uses
   `.JPG` ([source](https://github.com/JonasKruckenberg/imagetools/blob/main/packages/vite/src/index.ts)).
4. **AVIF cost.** The local benchmark shows ~18× the WebP-only time for AVIF+WebP on one 24 MP
   image. Decide whether AVIF is required or whether WebP matches the current experience.
5. **Effect Schema v4 API stability.** `Schema.toStandardSchemaV1` requires
   `DecodingServices = never`, and Standard Schema validation may be sync or async
   ([Effect docs](https://effect.website/docs/v4/schema/standard-schema)). Pin the Effect version
   and test the adapter against the Content Collections version in use.
6. **Content Collections is 0.x.** Core `0.15.3`, Vite adapter `0.3.1`
   ([core package](https://github.com/sdorra/content-collections/blob/main/packages/core/package.json),
   [vite package](https://github.com/sdorra/content-collections/blob/main/packages/vite/package.json)).
   Pin versions and watch the changelog; the API has moved (legacy schemas, `content` vs
   `collections`) before.
7. **`createDefaultImport` + query + alias.** The serializer emits the path verbatim
   ([source](https://github.com/sdorra/content-collections/blob/main/packages/core/src/serializer.ts)),
   but Vite must resolve the alias and the query from the generated file. The sample explicitly
   requires a Vite alias because `tsconfigPaths` does not apply to generated files
   ([sample README](https://github.com/sdorra/content-collections/blob/main/samples/tanstack-start-cf-mdx/README.md)).
   Test with the actual gallery/hero paths before committing to this pattern.
8. **MDX strategy.** `@content-collections/mdx` uses `mdx-bundler` and `new Function()`, which
   Cloudflare Workers block; the static-import + `@mdx-js/rollup` route is more portable
   ([sample README](https://github.com/sdorra/content-collections/blob/main/samples/tanstack-start-cf-mdx/README.md)).
   The repo currently has no MDX files, so plain Markdown → HTML is enough initially.
9. **Server function payload size.** Returning full compiled HTML/MDX through a server function
   serializes it into the loader payload. RSC/streaming is the escape hatch if post bodies get
   large ([sample README](https://github.com/sdorra/content-collections/blob/main/samples/tanstack-start-cf-mdx/README.md)).
10. **Gallery key normalization.** JSON paths are relative to the JSON file (`../../assets/...`),
    while Vite glob keys are relative to the importing module or project root. Normalize to one
    canonical key (e.g. `/src/assets/...`) in the Content Collections transform and use the same
    key in the client manifest. Test Windows path separators as well.
11. **Hash stability and cache.** Vite hashes assets by content; a re-encode can change every URL.
    That is fine for cache-busting, but it means derivative crawls/OG images must read the
    current data, not hard-code old hashes. `vite-imagetools`’ disk cache keyed by source bytes
    avoids re-encoding unchanged sources.
12. **Dev vs production URLs.** In dev, imagetools serves generated bytes from a middleware and
    the URL is the request path; in build, the URL is a hashed asset. Do not assume the dev URL
    shape in tests or data ([plugin source](https://github.com/JonasKruckenberg/imagetools/blob/main/packages/vite/src/index.ts)).
13. **Content Collections watch + TanStack HMR.** The plugin starts `builder.watch()`, but the
    exact HMR invalidation path in TanStack Start’s multi-environment dev server should be
    exercised (edit a Markdown file, a JSON file, and an image; confirm the page updates without a
    restart). The docs claim it works; the sample is the best reference
    ([plugin source](https://github.com/sdorra/content-collections/blob/main/packages/vite/src/index.ts),
    [README](https://github.com/sdorra/content-collections#readme)).

## References

Primary sources used above:

- Content Collections: [docs](https://www.content-collections.dev/docs), [configuration](https://www.content-collections.dev/docs/configuration), [transform](https://www.content-collections.dev/docs/transform), [Markdown](https://www.content-collections.dev/docs/content/markdown), [MDX](https://www.content-collections.dev/docs/content/mdx), [Vite adapter](https://www.content-collections.dev/docs/adapter/vite), [TanStack Start quickstart](https://www.content-collections.dev/docs/quickstart/tanstack-start), [repo](https://github.com/sdorra/content-collections), [TanStack Start sample](https://github.com/sdorra/content-collections/blob/main/samples/tanstack-start-cf-mdx).
- Content Collections source: [config/`_meta`](https://github.com/sdorra/content-collections/blob/main/packages/core/src/config.ts), [transformer](https://github.com/sdorra/content-collections/blob/main/packages/core/src/transformer.ts), [cache](https://github.com/sdorra/content-collections/blob/main/packages/core/src/cache.ts), [serializer](https://github.com/sdorra/content-collections/blob/main/packages/core/src/serializer.ts), [Vite plugin](https://github.com/sdorra/content-collections/blob/main/packages/vite/src/index.ts).
- Vite: [glob import](https://vite.dev/guide/features#glob-import), [static assets](https://vite.dev/guide/assets), [plugin API](https://vite.dev/guide/api-plugin), [build options](https://vite.dev/config/build-options).
- `vite-imagetools`: [README](https://github.com/JonasKruckenberg/imagetools#readme), [directives](https://github.com/JonasKruckenberg/imagetools/blob/main/docs/directives.md), [caching](https://github.com/JonasKruckenberg/imagetools/blob/main/docs/guide/caching.md), [output formats source](https://github.com/JonasKruckenberg/imagetools/blob/main/packages/core/src/output-formats.ts), [Vite plugin source](https://github.com/JonasKruckenberg/imagetools/blob/main/packages/vite/src/index.ts).
- Sharp: [resize](https://sharp.pixelplumbing.com/api-resize), [output](https://sharp.pixelplumbing.com/api-output), [performance](https://sharp.pixelplumbing.com/performance).
- Effect: [Schema → Standard Schema](https://effect.website/docs/v4/schema/standard-schema), [Schema getting started](https://effect.website/docs/v4/schema/getting-started).
- Astro: [content collections](https://docs.astro.build/en/guides/content-collections/), [images](https://docs.astro.build/en/guides/images/), [`astro:assets` reference](https://docs.astro.build/en/reference/modules/astro-assets/).
- TanStack Start: [execution model](https://tanstack.com/start/latest/docs/framework/react/guide/execution-model), [server functions](https://tanstack.com/start/latest/docs/framework/react/guide/server-functions).
- Other image options: [`@responsive-image/vite-plugin`](https://github.com/simonihmig/responsive-image), [ResponsiveImage Vite docs](https://responsive-image.dev/build/vite), [`unplugin-imagemin`](https://github.com/unplugin/unplugin-imagemin).
