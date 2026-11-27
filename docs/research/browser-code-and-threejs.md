# Browser-only code and Three.js scene inventory

Research for ticket [#61](https://github.com/jwstn/jwstn.dev/issues/61) (map: [#56](https://github.com/jwstn/jwstn.dev/issues/56)).
Read-only inventory of `main` at `9c1f456`.

## Headline conclusion

The site ships **three** pieces of browser JavaScript and nothing else: the Three.js cassette
scene on the home page, the mobile-nav script in the layout, and the pre-paint theme script in
the head. There are **no `client:*` framework directives, no inline event attributes, no scripts
in `public/`, and no third-party embeds/iframes** — `@lucide/astro` renders static SVG, so no
component is an island. Most of this ports mechanically: the scene's
`<figure>`/`<div>` markup and the fallback paragraph are server-renderable as-is, so the canvas
should be created inside a `useEffect` (never during render) and torn down on unmount. The scene
is **not** ready to move unchanged, though: today it tears down only on Astro's
`astro:before-swap`, and it never calls `OrbitControls.dispose()`, never disposes per-object
geometries/materials/textures (≈34 canvas textures per mount), never disposes the PMREM render
target it assigns to `scene.environment`, and never releases the WebGL context. Under React
StrictMode's development double-mount that becomes a context/texture leak, so a complete
teardown is a prerequisite for the port, not a nicety.

## Method & sources

* Read the working tree at `main` (`9c1f456`): every file under `src/`, `package.json`,
  `astro.config.mjs`, `pnpm-lock.yaml`, `tsconfig.json`.
* Versions confirmed from the lockfile/installed packages: `astro@7.4.12`, `three@0.187.0`,
  `@tailwindcss/vite@4.3.1`, `tailwindcss@4.3.1`.
* Primary external sources for lifecycle/cleanup claims:
  * Astro — [Scripts and event handling](https://docs.astro.build/en/guides/client-side-scripts/)
    (script processing, dedupe, `is:inline`).
  * Astro — [View transitions](https://docs.astro.build/en/guides/view-transitions/)
    (bundled module scripts execute once; `astro:page-load` fires on initial load and on every
    navigation; `astro:before-swap` fires before the DOM swap).
  * React — [`useEffect`](https://react.dev/reference/react/useEffect) ("Effects only run on the
    client. They don't run during server rendering"; extra dev setup+cleanup cycle).
  * React — [`<StrictMode>`](https://react.dev/reference/react/StrictMode) (development-only
    setup → cleanup → setup).
  * React — [`hydrateRoot`](https://react.dev/reference/react-dom/client/hydrateRoot) (server and
    client markup must be identical; mismatches are bugs).
  * Three.js `r187` source — `node_modules/three/src/renderers/WebGLRenderer.js`,
    `src/extras/PMREMGenerator.js`, `examples/jsm/controls/OrbitControls.js`
    ([r187 on GitHub](https://github.com/mrdoob/three.js/tree/r187)).
  * MDN — [`ResizeObserver.disconnect()`](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver/disconnect),
    [WebGL best practices](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices)
    ("delete objects eagerly", "lose contexts eagerly").
  * TanStack Start — [Overview](https://tanstack.com/start/latest/docs/framework/react/overview)
    (full-document SSR + separate client/server builds; no client-only primitive assumed here).

Facts below are cited to file/line; anything marked **Judgement** is a recommendation, not a
verified claim.

---

## 1. Surface map — every piece of browser JS

| # | Entry point | Kind | Pages | What it does |
|---|---|---|---|---|
| 1 | [`src/components/isometric/CassetteScene.astro:24`](../../src/components/isometric/CassetteScene.astro#L24) | bundled module `<script>` (TypeScript), imports `three` + 4 local modules | home only ([`index.astro:45`](../../src/pages/index.astro#L45)) | builds the WebGL scene, input, loop, teardown |
| 2 | [`src/layouts/Layout.astro:125`](../../src/layouts/Layout.astro#L125) | bundled module `<script>` | every page | mobile nav open/close, Escape, media query, `astro:page-load` reset |
| 3 | [`src/components/MetaTags.astro:41`](../../src/components/MetaTags.astro#L41) | `<script is:inline>` in `<head>` | every page | applies `dark` class before first paint, listens for `astro:page-load` |

Everything else is build-time/server output:

* No `client:*` / `server:*` / `transition:*` directives anywhere (`grep` over `src`).
* No `onclick=`/`onload=` attributes, no `<form>`, no `contenteditable`.
* `public/` contains only `favicon.ico` and `favicon.svg`.
* Icons come from `@lucide/astro`, which renders SVG markup at render time
  (`node_modules/@lucide/astro/src/Icon.astro`, `sideEffects: false`) — no client script.
* `src/lib/lastfm.ts` is server-only: it reads `import.meta.env` then `process.env`
  ([`lastfm.ts:36-40`](../../src/lib/lastfm.ts#L36)) and is awaited in the `/music` frontmatter
  ([`music.astro:19-25`](../../src/pages/music.astro#L19)); no `window`/`document`.
* `src/pages/{rss,blog,gallery}.xml.js` are server endpoints; `@astrojs/sitemap` is build-time.

Consequence: with Astro's per-page script dedupe and bundling
([Astro docs](https://docs.astro.build/en/guides/client-side-scripts/#script-processing)), the
scene script is only included on the page that renders the component — today only `/`.
**Judgement:** preserve that by importing the scene module only from the home route component in
TanStack Start, not from a root layout.

---

## 2. The cassette scene — `CassetteScene.astro`

### 2.1 Markup and mount

* Markup is static and fully server-renderable: `<figure class="iso-cassette" data-cassette>`
  containing `.iso-cassette-stage` with `role="img"` + `aria-label`, and a hidden fallback
  paragraph ([lines 13-22](../../src/components/isometric/CassetteScene.astro#L13)).
  No attributes depend on browser state at render time — `data-ready`, `is-fallback` and the
  `<canvas>` are all added client-side.
* Mount is a **document-level query**, not component-scoped:
  `boot()` finds `[data-cassette]:not([data-ready])`, sets `data-ready="1"`, then calls `init`
  ([468-478](../../src/components/isometric/CassetteScene.astro#L468)). `boot()` runs once at
  module evaluation and again on every `astro:page-load`
  ([480-481](../../src/components/isometric/CassetteScene.astro#L480)).
  Because bundled module scripts execute only once per document
  ([Astro docs](https://docs.astro.build/en/guides/view-transitions/#script-re-execution)), the
  `astro:page-load` listener is what re-arms the scene after client-side navigation.
* On first load `boot()` effectively runs twice (module eval + `astro:page-load`, which fires on
  initial navigation too — [docs](https://docs.astro.build/en/guides/view-transitions/#astropage-load));
  the `:not([data-ready])` guard makes it idempotent.
* `data-ready` is set **before** `init` runs ([471](../../src/components/isometric/CassetteScene.astro#L471)),
  so a throwing `init` marks the node as handled and the fallback class is added, but it can never
  retry ([472-477](../../src/components/isometric/CassetteScene.astro#L472)).
* Failures: renderer construction is wrapped in `try/catch` → `is-fallback`
  ([49-55](../../src/components/isometric/CassetteScene.astro#L49)); same on boot failure.
* The global query means a second instance of the component on a page would never initialise.
  (Only one instance exists today — [`index.astro:45`](../../src/pages/index.astro#L45).)

### 2.2 Renderer, camera, controls

* `new THREE.WebGLRenderer({ antialias: true, alpha: true })`
  ([51](../../src/components/isometric/CassetteScene.astro#L51)); pixel ratio capped at 2
  ([57](../../src/components/isometric/CassetteScene.astro#L57)); PCF soft shadows, ACES tone
  mapping, exposure 1.15 ([58-61](../../src/components/isometric/CassetteScene.astro#L58)).
* Canvas is appended to the stage ([62](../../src/components/isometric/CassetteScene.astro#L62));
  CSS sizes it to 100% × 100% with `!important`
  ([`theme.css:482-491`](../../src/styles/theme.css#L482)), which is why `setSize(w, h, false)` is
  used later (no style writes).
* Camera: `PerspectiveCamera(38, 1, 0.1, 100)`, position `(1.35, 6.9, 13.1)`
  ([65-66](../../src/components/isometric/CassetteScene.astro#L65)); aspect is corrected by
  `resize()`.
* `OrbitControls` with damping 0.06, `enablePan = false`, distance 8–28, polar clamp
  ([68-76](../../src/components/isometric/CassetteScene.astro#L68)).
* Coarse pointers (`(pointer: coarse)`) disable controls and set `touchAction = "pan-y"` so the
  page still scrolls ([78-82](../../src/components/isometric/CassetteScene.astro#L78)). Order
  matters: `OrbitControls` sets `domElement.style.touchAction = 'none'` in its constructor
  (`connect()`), so this assignment must stay *after* construction.
* Environment: `PMREMGenerator.fromScene(new RoomEnvironment(), 0.04)` assigned to
  `scene.environment` ([84-86](../../src/components/isometric/CassetteScene.astro#L84)). The render
  target returned by `fromScene` is **not retained**, so it cannot be disposed later — see §2.7.
* Lighting: key/fill/rim directional lights, 2048² shadow map
  ([88-109](../../src/components/isometric/CassetteScene.astro#L88)); a transparent
  `ShadowMaterial` ground plane rather than a background
  ([112-115](../../src/components/isometric/CassetteScene.astro#L112)).

### 2.3 Sizing

* `resize()` reads `stage.clientWidth/clientHeight`, calls `renderer.setSize(w, h, false)`,
  updates `camera.aspect` + `updateProjectionMatrix`, and bails on zero size
  ([407-414](../../src/components/isometric/CassetteScene.astro#L407)).
* A `ResizeObserver` on the stage drives it, plus one immediate call
  ([415-417](../../src/components/isometric/CassetteScene.astro#L415)). The stage height comes from
  CSS (`clamp(320px, 32vw, 470px)`; `clamp(280px, 55vw, 380px)` under 64rem —
  [`theme.css:477-480`](../../src/styles/theme.css#L477),
  [`theme.css:511-520`](../../src/styles/theme.css#L511)), so container-driven sizing is correct
  and should be preserved.
* Device pixel ratio is sampled **once** at init
  ([57](../../src/components/isometric/CassetteScene.astro#L57)); there is no re-read on monitor
  change or browser zoom.

### 2.4 Input

* Raycaster + NDC pointer computed from `canvas.getBoundingClientRect()`
  ([217-230](../../src/components/isometric/CassetteScene.astro#L217)).
* `pointerdown` and `pointermove` are bound to `renderer.domElement`; `pointerup` is bound to
  **`window`** so a drag can end outside the canvas
  ([402-404](../../src/components/isometric/CassetteScene.astro#L402)).
* Hover picking runs a raycast against pressable keys, click blockers and all tapes on **every**
  `pointermove`, not just during a drag ([389-397](../../src/components/isometric/CassetteScene.astro#L389)).
* Drag state machine: `startDrag` / `moveDrag` / `endDrag`
  ([277-357](../../src/components/isometric/CassetteScene.astro#L277)), tweens for world-space
  flight ([155-215](../../src/components/isometric/CassetteScene.astro#L155)), drop zones supplied
  by the player and shelf modules ([232-236](../../src/components/isometric/CassetteScene.astro#L232)).
* Mobile is intentionally a static showpiece: all pointer handlers early-return on `coarse`
  ([377](../../src/components/isometric/CassetteScene.astro#L377),
  [390](../../src/components/isometric/CassetteScene.astro#L390)).

### 2.5 Animation loop and visibility

* `renderer.setAnimationLoop(...)` (not a hand-rolled rAF)
  ([427](../../src/components/isometric/CassetteScene.astro#L427)); three documents this as the
  recommended loop (`node_modules/three/src/renderers/WebGLRenderer.js:1607-1620`).
* `dt` clamped to 0.05s; tweens → `player.update` → `controls.update` → `render`
  ([429-445](../../src/components/isometric/CassetteScene.astro#L429)).
* An `IntersectionObserver` on the root sets `visible`; the loop early-returns when not visible
  ([419-423](../../src/components/isometric/CassetteScene.astro#L419),
  [428](../../src/components/isometric/CassetteScene.astro#L428)). The callback still runs every
  frame; only rendering is skipped.
* No `prefers-reduced-motion` check in the scene (`grep matchMedia` finds only the pointer query).
* No `webglcontextlost`/`webglcontextrestored` handling anywhere.

### 2.6 Teardown today

Only one path exists: a `document` listener for `astro:before-swap`, registered `{ once: true }`
([448-460](../../src/components/isometric/CassetteScene.astro#L448)):

| Done | Missing |
|---|---|
| `dead = true` (loop guard) | `controls.dispose()` |
| `window.removeEventListener("pointerup", …)` | per-object geometry/material/texture dispose |
| `observer.disconnect()` (ResizeObserver) | environment render-target dispose |
| `io.disconnect()` (IntersectionObserver) | `renderer.forceContextLoss()` |
| `renderer.setAnimationLoop(null)` | removing the canvas from the stage |
| `renderer.dispose()` | `delete window.__isoCassette` (dev) |
| `pmrem.dispose()` | resetting `is-fallback` / `data-ready` if the node is reused |

### 2.7 Concrete leaks/gaps (verified against three r187 source)

1. **OrbitControls listeners survive teardown.** `OrbitControls.connect()` adds a
   `keydown` listener in the **capture phase on `ownerDocument`** (for the control key) and
   listeners on the canvas; `dispose()` → `disconnect()` removes them and restores
   `touchAction`/`cursor` (`examples/jsm/controls/OrbitControls.js`, r187 `connect`/`disconnect`).
   The current code never calls it, so each visit to `/` leaves a document-level listener holding
   a disposed controls instance.
2. **Environment render target leaks.** `PMREMGenerator.fromScene()` allocates and returns a
   `WebGLRenderTarget` (`src/extras/PMREMGenerator.js:92-103`); `PMREMGenerator.dispose()` frees
   its internal materials/box mesh but **not** that target
   (`PMREMGenerator.js:214-226`). The code keeps only `.texture`
   ([85](../../src/components/isometric/CassetteScene.astro#L85)), so the target and its texture
   are unreachable and never disposed.
3. **Scene resources are never disposed.** `cassette.js`/`player.js`/`shelf.js` create fresh
   geometries, materials and `CanvasTexture`s on every call; nothing traverses the scene on
   teardown. Counting texture allocations per mount: 8 tapes × 3 (`label`, `strip`, `spine`) =
   24, plus 6 key icons, 1 badge, 3 tiny labels (`VOLUME`, `PHONES`, `STEREO`) = **34 canvas
   textures**, plus the PMREM texture. `renderer.dispose()` clears three's GPU-side caches
   (`WebGLRenderer.js:1090-1108`) but does not dispose the JS-side objects.
4. **The WebGL context is never released.** `renderer.dispose()` does not simulate context loss;
   `forceContextLoss()` exists separately (`WebGLRenderer.js:605-613`) and MDN recommends losing
   contexts eagerly ([best practices](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices)).
   Without it, repeated mounts (StrictMode dev, back/forward to `/`) accumulate live contexts.
5. **`RoomEnvironment()` is constructed inline** ([85](../../src/components/isometric/CassetteScene.astro#L85))
   and dropped; its meshes/materials are never disposed (small, same class of issue).
6. **No context-loss fallback**: if the GPU drops the context the stage goes blank while
   `is-fallback` stays off.
7. **Debug global is permanent** in dev: `window.__isoCassette` set at
   [462-464](../../src/components/isometric/CassetteScene.astro#L462) with no teardown.

---

## 3. `src/components/isometric/three/*` — plain modules

| File | Browser APIs | Lifecycle today | Port decision |
|---|---|---|---|
| [`cassette.js`](../../src/components/isometric/three/cassette.js) | none (only `THREE`) | factory `createCassette({title, accent})` returns `{ group, reelL, reelR, title, accent }` ([34-153](../../src/components/isometric/three/cassette.js#L34)) | keep as plain ES module, unchanged |
| [`player.js`](../../src/components/isometric/three/player.js) | none | factory with closures + `hooks`, `install/remove/press/update`, debug getters ([361-414](../../src/components/isometric/three/player.js#L361)) | keep unchanged; call from the effect |
| [`shelf.js`](../../src/components/isometric/three/shelf.js) | none | factory returns `{ group, slots, zone }` ([71](../../src/components/isometric/three/shelf.js#L71)) | keep unchanged |
| [`textures.js`](../../src/components/isometric/three/textures.js) | `document.createElement("canvas")` at **call** time ([4](../../src/components/isometric/three/textures.js#L4), [184](../../src/components/isometric/three/textures.js#L184)) | none; every call allocates a `CanvasTexture` | keep; must not be called during SSR/render |

Notes:

* No module in `three/` touches `window`/`document` at import time, so importing them on the
  server is safe; `three` itself also imports cleanly in Node (verified: `import('three')` →
  `REVISION 187`). **Judgement:** keep the import boundary at the scene component so `three` never
  reaches another route; whether it is a static import or a lazy `three/mount.js` chunk is
  decision 3 in §9.
* `player.js` exports transport constants "youtube.js reads these too"
  ([8-12](../../src/components/isometric/three/player.js#L8)) — no `youtube.js` exists in this
  repo; they are only used internally now. Dead export surface, harmless.
* `makeGroundTexture` ([183-197](../../src/components/isometric/three/textures.js#L183)) is never
  imported. Dead code; drop or keep, no client impact.
* Texture fonts are hard-coded (`"DejaVu Sans", Arial`, `Georgia`) and drawn on canvas, so they do
  **not** depend on the page's fontsource loading — no FOUT risk for the labels.
* Each factory owns its materials/geometries (no sharing between tapes), which makes a
  traversal-based dispose safe.

---

## 4. Layout nav script — `Layout.astro`

* Markup: burger button `#iso-burger` ([48-57](../../src/layouts/Layout.astro#L48)), panel
  `#iso-mobile-nav` with `hidden` ([84-111](../../src/layouts/Layout.astro#L84)).
* Script ([125-176](../../src/layouts/Layout.astro#L125)):
  * `document.getElementById` lookups per call ([129-130](../../src/layouts/Layout.astro#L129)).
  * `setOpen` toggles `hidden`, `aria-expanded`, `aria-label`, `.is-open`, and
    `.iso-header.is-menu-open` ([132-144](../../src/layouts/Layout.astro#L132)).
  * **Document-level delegated** `click` handler for open/close/outside-click
    ([146-161](../../src/layouts/Layout.astro#L146)) and `keydown` for Escape + focus return
    ([163-167](../../src/layouts/Layout.astro#L163)).
  * `matchMedia("(min-width: 48rem)")` listener closes the panel when growing
    ([170-173](../../src/layouts/Layout.astro#L170)); never removed.
  * `astro:page-load` resets the panel on navigation
    ([175](../../src/layouts/Layout.astro#L175)).
* CSS depends on the JS-added classes: `.iso-header.is-menu-open .iso-plate`
  ([`theme.css:304`](../../src/styles/theme.css#L304)) and `.iso-burger.is-open` plus its
  pseudo-elements ([`theme.css:331-370`](../../src/styles/theme.css#L331)).
* Everything is scoped to global class names, not to Astro islands — no hydration boundary to
  preserve, just behaviour.

---

## 5. Theme bootstrap — `MetaTags.astro`

* Imports the Tailwind entry (`#/styles/base.css`) ([4](../../src/components/MetaTags.astro#L4))
  and renders Astro's `<ClientRouter />` ([5](../../src/components/MetaTags.astro#L5),
  [39](../../src/components/MetaTags.astro#L39)).
* `<script is:inline>` ([41-58](../../src/components/MetaTags.astro#L41)) runs before first paint,
  reads `localStorage["theme"]`, falls back to `prefers-color-scheme`, toggles `dark` on
  `<html>` ([46-57](../../src/components/MetaTags.astro#L46)).
* It is wrapped in an IIFE precisely because view transitions re-execute inline scripts
  ([43-45](../../src/components/MetaTags.astro#L43)); Astro documents that inline scripts may
  re-run ([view transitions docs](https://docs.astro.build/en/guides/view-transitions/#script-re-execution)).
* `astro:page-load` re-applies the mode after navigation
  ([56](../../src/components/MetaTags.astro#L56)).
* The theme id itself is **not** scripted: `<html lang="en" class="theme-isometric">` is hardcoded
  ([`Layout.astro:28`](../../src/layouts/Layout.astro#L28)).

---

## 6. CSS, Tailwind and font entry points

* **Tailwind entry:** [`src/styles/base.css`](../../src/styles/base.css) — header comment explains
  the single-entry rule ([1-11](../../src/styles/base.css#L1)), `@import "tailwindcss"`
  ([13](../../src/styles/base.css#L13)), `@custom-variant dark (&:is(.dark *))`
  ([15](../../src/styles/base.css#L15)), `@theme inline` mapping utilities to raw vars
  ([17-38](../../src/styles/base.css#L17)). Imported once, by `MetaTags.astro:4`.
* **Tailwind wiring:** `@tailwindcss/vite` is already used as a **Vite plugin** in
  `astro.config.mjs` ([3](../../astro.config.mjs#L3), [12-14](../../astro.config.mjs#L12)) — this
  moves to `vite.config.ts` unchanged; no Astro-specific Tailwind config exists.
* **Theme CSS:** [`src/styles/theme.css`](../../src/styles/theme.css) — 1613 lines, all selectors
  prefixed `html.theme-isometric …`; light tokens at
  [14-42](../../src/styles/theme.css#L14), dark overrides at
  [47+](../../src/styles/theme.css#L47) under `html.theme-isometric.dark`. Imported by
  `Layout.astro:4`.
  * Consequence: the `theme-isometric` class **must be present on `<html>` in the SSR document
    shell**. If it were added by a React effect, every themed rule would miss first paint.
  * The file's header comment still mentions multiple themes ("11 structural themes" in
    `base.css:9`), but only `theme-isometric` exists in this repo. Doc drift, no behavioural
    impact.
* **Fonts:** `@import "@fontsource-variable/space-grotesk"` and
  `@import "@fontsource-variable/geist-mono"` at the top of `theme.css`
  ([7-8](../../src/styles/theme.css#L7)); families are referenced through `--font-display`,
  `--font-body`, `--font-mono` ([33-35](../../src/styles/theme.css#L33)). These are ordinary CSS
  imports with `url()` font files, resolved by Vite — no Astro font API, no `<link>` tags, no
  client JS. `fraunces` is a dependency but is not imported anywhere.
* **CSS scoping:** there are no `<style>` blocks in `.astro` files (all styling is the two global
  stylesheets), so no scoped-hash class names need rewriting.

---

## 7. CSS-only interactions and JS-coupled class names

CSS-only (no port work, just verify selectors still match React class names):

* Isometric depth is pseudo-element based, with `:hover`/`:focus-visible`/`:active` states —
  e.g. `.iso-key:hover` ([`theme.css:246`](../../src/styles/theme.css#L246)),
  `.iso-btn:hover .iso-btn-face` ([722](../../src/styles/theme.css#L722)),
  `.iso-door:focus-visible .iso-door-title` ([589](../../src/styles/theme.css#L589)).
* Gallery captions reveal on hover/focus-within, not JS
  ([`theme.css:1256-1274`](../../src/styles/theme.css#L1256)).
* Reduced-motion rules for CSS transitions/animations
  ([`theme.css:763`](../../src/styles/theme.css#L763),
  [1301](../../src/styles/theme.css#L1301), [1604](../../src/styles/theme.css#L1604));
  `(pointer: coarse)` hides plate captions ([1295-1298](../../src/styles/theme.css#L1295)).

JS-coupled class names that must keep their exact names because CSS targets them:

| Class / attribute | Added by | CSS |
|---|---|---|
| `is-open` on burger + `is-menu-open` on header | nav script | `theme.css:304`, `331-370` |
| `is-fallback` on `.iso-cassette` | scene init/boot | `theme.css:504-509` |
| `dark` on `<html>` | theme inline script | every `html.theme-isometric.dark` block |
| `data-ready` | scene boot | **not styled**; internal guard only |

---

## 8. Hydration matrix

Server-renderable (no browser APIs during render):

* All routes, layout, header/footer, gallery, blog/project prose, `IsoButton`, `FormattedDate`,
  the cassette `<figure>` + stage `<div>` + fallback `<p>`, and `<head>` metadata.

Client-only work (must happen after mount):

* WebGL renderer/canvas creation, scene construction, ResizeObserver, IntersectionObserver,
  pointer listeners, animation loop.
* Theme decision (`localStorage` + `prefers-color-scheme`) — but this one must run **before**
  first paint, i.e. as a blocking inline script in the document head, not as an effect.

Things that must not run during SSR:

* `textures.js` draw functions (`document.createElement("canvas")`) — only reachable from scene
  init today.
* `window.matchMedia`, `devicePixelRatio`, `getBoundingClientRect` in the scene.
* `src/lib/lastfm.ts` — server-only by design; do not import it from a client component.

Hydration risks:

1. **`FormattedDate` uses locale/timezone-dependent formatting at render**
   ([`FormattedDate.astro:9-17`](../../src/components/FormattedDate.astro#L9)):
   `date.toLocaleDateString("en-us", …)`. Under Astro it renders only on the server, so there is
   no mismatch; under React hydration the client recomputes in the browser's timezone and React
   requires identical markup ([hydrateRoot docs](https://react.dev/reference/react-dom/client/hydrateRoot)).
   **Judgement:** pass a preformatted string (format once on the server, with an explicit
   `timeZone`) or render the date as static server-only content.
2. **`html` class contract.** `theme-isometric` at [`Layout.astro:28`](../../src/layouts/Layout.astro#L28)
   and `dark` from the inline script must both be on `<html>` in the streamed shell. If React
   owns `<html>` attributes only after hydration, the first paint is unthemed.
3. **Canvas must not exist in SSR markup.** Adding it in an effect keeps the server and client
   trees identical; appending it during render would be a mismatch and a StrictMode double-append.
4. `data-ready`/`is-fallback` are client-only mutations of class/attribute state that React also
   renders; if React renders them as `false`/absent, effects must not fight React's DOM diffing.
   **Judgement:** drop `data-ready` entirely (refs replace it) and drive `is-fallback` through
   React state so the className stays React-owned.

---

## 9. React port approach (file-keyed)

Naming assumes TanStack Start's `src/` layout and the repo's `#/*` alias, which is a TS `paths`
mapping ([`tsconfig.json:7-9`](../../tsconfig.json#L7)) and ports as-is.

| File | Port to | Shape |
|---|---|---|
| `src/components/isometric/CassetteScene.astro` | `CassetteScene.tsx` | server-renderable presentational component: `<figure className="iso-cassette">`, stage `<div ref={stageRef} role="img" aria-label=…>`, fallback `<p>`; one `useEffect` owns the whole scene |
| `…/three/cassette.js`, `player.js`, `shelf.js` | same files (optionally `.ts`) | plain ES modules, no React awareness; imported by the scene component (static, or via `three/mount.js` if lazy) |
| `…/three/textures.js` | same file | plain module; called only from scene init |
| `src/layouts/Layout.astro` nav `<script>` | `Header.tsx` (within the layout component) | `useState` for open; React `onClick` on burger/panel/links; `useEffect` for Escape, media query, and close-on-pathname-change |
| `src/components/MetaTags.astro` theme `<script>` | root document shell (`__root.tsx` `head`/script slot or `index.html`) | keep the **same inline source string**, pre-paint, IIFE not required but harmless |
| `src/styles/base.css`, `theme.css` | same files | import once in the root route, in the current order (`base.css` then `theme.css`) |
| `src/components/FormattedDate.astro` | server-formatted value | see hydration risk 1 |
| `src/lib/lastfm.ts`, `*.xml.js` endpoints | server functions/routes | out of scope here (no browser code) |

### The scene effect (decision-level)

```ts
useEffect(() => {
  const stage = stageRef.current
  if (!stage) return

  const teardown = initScene(stage)   // returns a complete disposer
  return teardown
}, [])
```

(`initScene` is today's `init()` moved into the component file and made to return its teardown;
if the lazy-loading option below is chosen it lives in `three/mount.js` instead and `initScene`
is awaited from a dynamic `import()` with a `cancelled` flag.)

Decisions that follow from the inventory:

1. **One effect, one disposer.** `init()` today returns nothing; the ported version must return
   its teardown closure (or the effect tracks every handle locally with `let`). No Astro events:
   delete both `astro:page-load` and `astro:before-swap` listeners.
2. **`useEffect`, not `useLayoutEffect`.** Effects only run on the client
   ([React docs](https://react.dev/reference/react/useEffect)); the ResizeObserver already
   corrects the first measurement, so a one-frame empty stage is acceptable. `useLayoutEffect`
   adds an SSR warning for no visual gain.
3. **Where `three` is imported — two options, pick one in #66.**
   * *Default:* keep `initScene` in `CassetteScene.tsx` and import `three` statically at the top
     of that file. Vite's route-level split still keeps `three` off every other route; the cost is
     that the server module graph for `/` includes `three` (it imports cleanly in Node, verified),
     parsed on cold start.
   * *Lazy:* move `initScene` to `three/mount.js` and `await import("./three/mount")` inside the
     effect, with a `cancelled` flag so an unmount before resolve tears down immediately. This
     keeps `three` out of the SSR graph and the initial route chunk. The extra module is justified
     by the lazy boundary, not by reuse, which is the one sanctioned reason to add a file under the
     repo's "don't extract unless used twice" rule.
   Strict-mode safety is identical either way; the lazy option needs the `cancelled` branch.
4. **Instance-scoped DOM.** Replace `document.querySelector("[data-cassette]")` and
   `data-ready` with a ref; the scene no longer needs to be idempotent because React mounts once
   (in production) and cleanup mirrors setup (StrictMode).
5. **Outcome state via React.** WebGL-unavailable (`is-fallback`) should be component state set
   from the effect, so React owns the class and a remount can retry. Today's `data-ready`-before-init
   behaviour makes failure permanent.
6. **Keep the mobile behaviour** (`(pointer: coarse)` → no orbit/drag, `touchAction: pan-y`) and
   the `role="img"` + `aria-label` markup unchanged for parity. **Judgement:** revisit the label
   ("drag a tape…") for touch users in the a11y ticket rather than silently changing copy.
7. **Keep class names and CSS untouched.** The React component must render the same
   `iso-cassette`, `iso-cassette-stage`, `iso-cassette-fallback` names, because the stylesheet
   targets them.
8. **Dev hook**: keep `window.__isoCassette` behind `import.meta.env.DEV`, set in the effect and
   `delete`d in cleanup. Useful for the screenshot/parity harness; must not leak.
9. **No global cursor styles.** The scene writes `canvas.style.cursor` directly
   ([284](../../src/components/isometric/CassetteScene.astro#L284),
   [336](../../src/components/isometric/CassetteScene.astro#L336),
   [396](../../src/components/isometric/CassetteScene.astro#L396)); keep it on the canvas (safe
   under React, which does not manage that node's style), and drop the stylesheet's
   `cursor: grab` duplicate only if parity allows.

### Nav port (decision-level)

* Replace document-level delegation with element handlers: no `document.addEventListener("click")`,
  no `getElementById`.
* Keep Escape handling in a `useEffect` that adds/removes `keydown` on `document`; restore focus to
  the burger as today ([166](../../src/layouts/Layout.astro#L166)).
* Replace `window.matchMedia` listener with an effect subscription (or `useSyncExternalStore`),
  cleaned up on unmount.
* Replace `astro:page-load → setOpen(false)` with either router state (`useRouterState` pathname)
  in a dependency array or rely on the header remounting per route. **Judgement:** close on
  pathname change via effect — the layout persists across routes, so unmount will not fire.
* Keep `aria-expanded`, `aria-label`, `hidden` semantics identical; CSS keys off `.is-open` and
  `.is-menu-open`.

### Theme port (decision-level)

* Ship the same script as a render-blocking inline script in the document head, before any CSS
  that could paint. It cannot become a `useEffect` without a flash of the wrong theme.
* Apply `class="theme-isometric"` on `<html>` in the SSR shell so `theme.css` matches on first
  paint.
* Keep the `localStorage` key `"theme"` and the `prefers-color-scheme` fallback
  ([51-53](../../src/components/MetaTags.astro#L51)) — parity for returning visitors.
* Remove the `astro:page-load` re-apply; with an SPA the class persists. If a future theme
  switcher exists, it must set the class directly rather than relying on navigation events.

---

## 10. Teardown checklist for the scene (input for #66)

Ordered so that a StrictMode setup → cleanup → setup cycle is invisible to the user:

1. Set a `dead` guard first (stops loop work and any pending async continuation).
2. `renderer.setAnimationLoop(null)`.
3. `intersectionObserver.disconnect()`, `resizeObserver.disconnect()`, remove the `window`
   `pointerup` listener (and any document-level listeners added).
4. `controls.dispose()` — removes canvas + document capture listeners and restores `touchAction`.
5. Dispose the environment: keep the `WebGLRenderTarget` returned by `PMREMGenerator.fromScene`,
   call `target.dispose()`, then `pmrem.dispose()`; dispose the `RoomEnvironment` scene graph
   (retain the instance instead of constructing it inline).
6. `scene.traverse`: `geometry.dispose()`, `material.dispose()`, and dispose every texture slot
   used (`map`, `envMap`, …) — all are per-mount `CanvasTexture`s here.
7. `renderer.dispose()` then `renderer.forceContextLoss()`.
8. `canvas.remove()` from the stage (needed when StrictMode reuses the same DOM node).
9. Clear the classes/styles the effect added (`is-fallback` if React does not own it, inline
   cursor) and `delete window.__isoCassette` (DEV).
10. Verify with the browser devtools: navigating away from `/` and back repeatedly should keep the
    WebGL context count flat and not grow `document` listeners.

---

## 11. Practical implications for this project

* The migration's client-JS surface is small and well-bounded: one heavy component, one nav
  behaviour, one pre-paint script. Nothing else needs a hydration boundary.
* The only real porting risk is the Three scene. Everything else is mechanical React state.
* CSS can move verbatim: Tailwind v4 already runs as a Vite plugin, all styling is global, and no
  Astro-scoped hashes exist. The two hard constraints are (a) `theme-isometric` on `<html>` at SSR
  and (b) keeping `iso-*` class names.
* The scene should be the **only** place `three` is imported, from the home route — this
  preserves today's per-page bundling and keeps the SSR bundle clean (static or lazy chunk,
  per §9 decision 3).
* The scene's current teardown is insufficient for React. Ticket #66 should be planned around the
  checklist in §10, not around "wrap `init()` in `useEffect`".
* Two parity traps unrelated to WebGL: `FormattedDate`'s timezone-dependent string, and the
  hardcoded `<html>` theme class. Both are cheap to get right and expensive to debug later.
* `src/lib/lastfm.ts` must stay server-side; any accidental client import would break the env
  lookup ([`lastfm.ts:36-40`](../../src/lib/lastfm.ts#L36)) and expose the API key if the bundler
  ever inlines it.

## 12. Open questions / risks

1. **Route scoping of the scene.** Confirm the scene stays exclusive to `/` in the new router
   (affects chunking and whether the effect can assume a single instance).
2. **Camera/scene state across client-side navigation.** Today every arrival at `/` rebuilds from
   scratch (tape 0 installed, camera at the default). Preserve that, or restore on back
   navigation? Map #56 lists "client-side navigation, scroll restoration and focus behaviour
   parity" as unspecified — this belongs there.
3. **StrictMode policy.** If the new app enables `StrictMode` (recommended), the teardown in §10 is
   mandatory; otherwise development will leak contexts and make screenshots flaky.
4. **Context loss and no-WebGL UX.** Keep the paragraph-only fallback, or add a retry/“reload to
   restore” affordance? Current code cannot recover from either.
5. **Reduced motion.** The scene animates whenever visible and ignores
   `prefers-reduced-motion`, while CSS honours it. Decide: static first frame, interaction-only
   rendering, or status quo.
6. **Touch parity.** Coarse pointers get a static scene (no orbit/drag) and the `aria-label` still
   advertises dragging. Decide whether parity means keeping that as-is (a11y ticket).
7. **DPR changes.** Pixel ratio is sampled once; moving the window between displays will render
   soft/hard until reload. Cheap to fix with a `resolution` media query listener in the effect.
8. **Dev-only hook.** Confirm whether `window.__isoCassette` is needed by the parity/screenshot
   tooling before dropping it.
9. **Image component parity** (`astro:assets` `<Image>` → Vite/Vercel pipeline) is out of scope
   here but is the other build-time dependency that touches rendered markup.
10. **Font delivery.** Fontsource CSS imports should port unchanged; verify first-paint text
    metrics against `docs/screenshots` baselines since font loading timing changes with the new
    entry graph.
