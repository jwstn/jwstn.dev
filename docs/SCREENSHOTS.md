# Portfolio theme variants — screenshot report

Twenty-seven selectable themes now live on this branch: your current design (**classic**, still the default)
plus twenty-six directions. Every screenshot below was captured from the dev server at full page.

**Browse them live:** run `pnpm astro dev`, then either use the floating picker (bottom-right of every
page) or deep-link with `?theme=<id>` — e.g. `http://localhost:4322/?theme=retro-os`. The picker saves
your choice in `localStorage` (source of truth) and mirrors it to a cookie so the server can render the
right structural theme; it survives navigation without any URL parameter. `?theme=` is a preview/share
link only — the picker removes it when you switch.

**New to these styles?** [`STYLES.md`](STYLES.md) is a field guide to every direction — where each
style comes from, what defines it, how to recognise it, and when (not) to use it.

Routes per theme: Home · Projects · Project detail (`spotui`) · Blog (empty state) · Gallery · Album
detail (`spring-2026`), each in desktop (1440 px) and mobile (375 px), plus a dark-mode Home capture.
The blog currently has zero posts, so Blog pages show each theme's designed empty state.

An overview contact sheet of all theme homes: [`_overview.png`](screenshots/_overview.png)

---

## 0b. Isometric — 2.5D drafting table

Space Grotesk + Geist Mono, drafting-paper grid (dark: night drafting desk with a glowing grid), pure-CSS
bobbing cubes by the hero, exploded-view project slabs with grid references, dimension-line furniture,
gallery photos tilted onto isometric planes that straighten on hover.

| | | |
|---|---|---|
| ![isometric home](screenshots/isometric/home-desktop.png) | ![isometric projects](screenshots/isometric/projects-desktop.png) | ![isometric album](screenshots/isometric/album-desktop.png) |
| ![isometric dark](screenshots/isometric/home-dark.png) | ![isometric blog](screenshots/isometric/blog-desktop.png) | ![isometric mobile](screenshots/isometric/home-mobile.png) |

<details>
<summary>All isometric captures</summary>

![home desktop](screenshots/isometric/home-desktop.png)
![home mobile](screenshots/isometric/home-mobile.png)
![home dark](screenshots/isometric/home-dark.png)
![projects desktop](screenshots/isometric/projects-desktop.png)
![projects mobile](screenshots/isometric/projects-mobile.png)
![project desktop](screenshots/isometric/project-desktop.png)
![project mobile](screenshots/isometric/project-mobile.png)
![blog desktop](screenshots/isometric/blog-desktop.png)
![blog mobile](screenshots/isometric/blog-mobile.png)
![gallery desktop](screenshots/isometric/gallery-desktop.png)
![gallery mobile](screenshots/isometric/gallery-mobile.png)
![album desktop](screenshots/isometric/album-desktop.png)
![album mobile](screenshots/isometric/album-mobile.png)

</details>

---

## 0. Classic — your current design (default)

The baseline, kept selectable for comparison. Geist Mono, quiet purple accents.

| | | |
|---|---|---|
| ![classic home desktop](screenshots/classic/home-desktop.png) | ![classic projects desktop](screenshots/classic/projects-desktop.png) | ![classic gallery desktop](screenshots/classic/gallery-desktop.png) |

<details>
<summary>All classic captures</summary>

![home desktop](screenshots/classic/home-desktop.png)
![home mobile](screenshots/classic/home-mobile.png)
![home dark](screenshots/classic/home-dark.png)
![projects desktop](screenshots/classic/projects-desktop.png)
![projects mobile](screenshots/classic/projects-mobile.png)
![project desktop](screenshots/classic/project-desktop.png)
![project mobile](screenshots/classic/project-mobile.png)
![blog desktop](screenshots/classic/blog-desktop.png)
![blog mobile](screenshots/classic/blog-mobile.png)
![gallery desktop](screenshots/classic/gallery-desktop.png)
![gallery mobile](screenshots/classic/gallery-mobile.png)
![album desktop](screenshots/classic/album-desktop.png)
![album mobile](screenshots/classic/album-mobile.png)

</details>

---

## 1. Editorial — Swiss magazine

Newsreader serif headlines, hairline grid, international-orange accents, numbered index lists,
masthead with issue numbering, colophon footer.

| | | |
|---|---|---|
| ![editorial home](screenshots/editorial/home-desktop.png) | ![editorial projects](screenshots/editorial/projects-desktop.png) | ![editorial album](screenshots/editorial/album-desktop.png) |
| ![editorial dark](screenshots/editorial/home-dark.png) | ![editorial blog](screenshots/editorial/blog-desktop.png) | ![editorial mobile](screenshots/editorial/home-mobile.png) |

<details>
<summary>All editorial captures</summary>

![home desktop](screenshots/editorial/home-desktop.png)
![home mobile](screenshots/editorial/home-mobile.png)
![home dark](screenshots/editorial/home-dark.png)
![projects desktop](screenshots/editorial/projects-desktop.png)
![projects mobile](screenshots/editorial/projects-mobile.png)
![project desktop](screenshots/editorial/project-desktop.png)
![project mobile](screenshots/editorial/project-mobile.png)
![blog desktop](screenshots/editorial/blog-desktop.png)
![blog mobile](screenshots/editorial/blog-mobile.png)
![gallery desktop](screenshots/editorial/gallery-desktop.png)
![gallery mobile](screenshots/editorial/gallery-mobile.png)
![album desktop](screenshots/editorial/album-desktop.png)
![album mobile](screenshots/editorial/album-mobile.png)

</details>

---

## 2. Brutalist — neo-brutalism

Archivo Black, thick borders, hard offset shadows, acid colors, marquee tag ticker, press-down hovers,
hard step easings — no soft fades anywhere.

| | | |
|---|---|---|
| ![brutalist home](screenshots/brutalist/home-desktop.png) | ![brutalist projects](screenshots/brutalist/projects-desktop.png) | ![brutalist album](screenshots/brutalist/album-desktop.png) |
| ![brutalist dark](screenshots/brutalist/home-dark.png) | ![brutalist blog](screenshots/brutalist/blog-desktop.png) | ![brutalist mobile](screenshots/brutalist/home-mobile.png) |

<details>
<summary>All brutalist captures</summary>

![home desktop](screenshots/brutalist/home-desktop.png)
![home mobile](screenshots/brutalist/home-mobile.png)
![home dark](screenshots/brutalist/home-dark.png)
![projects desktop](screenshots/brutalist/projects-desktop.png)
![projects mobile](screenshots/brutalist/projects-mobile.png)
![project desktop](screenshots/brutalist/project-desktop.png)
![project mobile](screenshots/brutalist/project-mobile.png)
![blog desktop](screenshots/brutalist/blog-desktop.png)
![blog mobile](screenshots/brutalist/blog-mobile.png)
![gallery desktop](screenshots/brutalist/gallery-desktop.png)
![gallery mobile](screenshots/brutalist/gallery-mobile.png)
![album desktop](screenshots/brutalist/album-desktop.png)
![album mobile](screenshots/brutalist/album-mobile.png)

</details>

---

## 3. Terminal — CRT console *(reworked with [8bitcn/ui](https://www.8bitcn.com/) patterns)*

Phosphor green on black (light mode is an amber "paper terminal"), scanlines, typed boot-sequence home
page, `cat ~/projects.txt` output blocks — now with 8bitcn chrome: radius-0 slab shadows, press-physics
buttons, pixel window controls, and a Press Start 2P + Space Mono pairing (MIT-attributed port).

| | | |
|---|---|---|
| ![terminal home](screenshots/terminal/home-desktop.png) | ![terminal projects](screenshots/terminal/projects-desktop.png) | ![terminal album](screenshots/terminal/album-desktop.png) |
| ![terminal dark](screenshots/terminal/home-dark.png) | ![terminal blog](screenshots/terminal/blog-desktop.png) | ![terminal mobile](screenshots/terminal/home-mobile.png) |

<details>
<summary>All terminal captures</summary>

![home desktop](screenshots/terminal/home-desktop.png)
![home mobile](screenshots/terminal/home-mobile.png)
![home dark](screenshots/terminal/home-dark.png)
![projects desktop](screenshots/terminal/projects-desktop.png)
![projects mobile](screenshots/terminal/projects-mobile.png)
![project desktop](screenshots/terminal/project-desktop.png)
![project mobile](screenshots/terminal/project-mobile.png)
![blog desktop](screenshots/terminal/blog-desktop.png)
![blog mobile](screenshots/terminal/blog-mobile.png)
![gallery desktop](screenshots/terminal/gallery-desktop.png)
![gallery mobile](screenshots/terminal/gallery-mobile.png)
![album desktop](screenshots/terminal/album-desktop.png)
![album mobile](screenshots/terminal/album-mobile.png)

</details>

---

## 4. Neon — cyberpunk night city

Orbitron display type, magenta→cyan glow over deep indigo (light mode is a pale-lilac day city),
translucent panels with 1 px neon edges, chromatic-aberration title hovers, EQ-bar empty blog state.

| | | |
|---|---|---|
| ![neon home](screenshots/neon/home-desktop.png) | ![neon projects](screenshots/neon/projects-desktop.png) | ![neon album](screenshots/neon/album-desktop.png) |
| ![neon dark](screenshots/neon/home-dark.png) | ![neon blog](screenshots/neon/blog-desktop.png) | ![neon mobile](screenshots/neon/home-mobile.png) |

<details>
<summary>All neon captures</summary>

![home desktop](screenshots/neon/home-desktop.png)
![home mobile](screenshots/neon/home-mobile.png)
![home dark](screenshots/neon/home-dark.png)
![projects desktop](screenshots/neon/projects-desktop.png)
![projects mobile](screenshots/neon/projects-mobile.png)
![project desktop](screenshots/neon/project-desktop.png)
![project mobile](screenshots/neon/project-mobile.png)
![blog desktop](screenshots/neon/blog-desktop.png)
![blog mobile](screenshots/neon/blog-mobile.png)
![gallery desktop](screenshots/neon/gallery-desktop.png)
![gallery mobile](screenshots/neon/gallery-mobile.png)
![album desktop](screenshots/neon/album-desktop.png)
![album mobile](screenshots/neon/album-mobile.png)

</details>

---

## 5. Riso — risograph zine

Warm paper with grain, two-ink duotone (riso blue + fluoro pink), crop and registration marks,
misregistered headline offsets, Caveat margin notes and hand arrows, taped album prints.

| | | |
|---|---|---|
| ![riso home](screenshots/riso/home-desktop.png) | ![riso projects](screenshots/riso/projects-desktop.png) | ![riso album](screenshots/riso/album-desktop.png) |
| ![riso dark](screenshots/riso/home-dark.png) | ![riso blog](screenshots/riso/blog-desktop.png) | ![riso mobile](screenshots/riso/home-mobile.png) |

<details>
<summary>All riso captures</summary>

![home desktop](screenshots/riso/home-desktop.png)
![home mobile](screenshots/riso/home-mobile.png)
![home dark](screenshots/riso/home-dark.png)
![projects desktop](screenshots/riso/projects-desktop.png)
![projects mobile](screenshots/riso/projects-mobile.png)
![project desktop](screenshots/riso/project-desktop.png)
![project mobile](screenshots/riso/project-mobile.png)
![blog desktop](screenshots/riso/blog-desktop.png)
![blog mobile](screenshots/riso/blog-mobile.png)
![gallery desktop](screenshots/riso/gallery-desktop.png)
![gallery mobile](screenshots/riso/gallery-mobile.png)
![album desktop](screenshots/riso/album-desktop.png)
![album mobile](screenshots/riso/album-mobile.png)

</details>

---

## 6. Sticker — playful sticker book

Baloo 2 rounded type, candy-dot cream background (dark: purple night with pastel stickers), sticker
cards with white borders, wobbling starbursts, trading-card projects with holo sheen, bouncy springs.

| | | |
|---|---|---|
| ![sticker home](screenshots/sticker/home-desktop.png) | ![sticker projects](screenshots/sticker/projects-desktop.png) | ![sticker album](screenshots/sticker/album-desktop.png) |
| ![sticker dark](screenshots/sticker/home-dark.png) | ![sticker blog](screenshots/sticker/blog-desktop.png) | ![sticker mobile](screenshots/sticker/home-mobile.png) |

<details>
<summary>All sticker captures</summary>

![home desktop](screenshots/sticker/home-desktop.png)
![home mobile](screenshots/sticker/home-mobile.png)
![home dark](screenshots/sticker/home-dark.png)
![projects desktop](screenshots/sticker/projects-desktop.png)
![projects mobile](screenshots/sticker/projects-mobile.png)
![project desktop](screenshots/sticker/project-desktop.png)
![project mobile](screenshots/sticker/project-mobile.png)
![blog desktop](screenshots/sticker/blog-desktop.png)
![blog mobile](screenshots/sticker/blog-mobile.png)
![gallery desktop](screenshots/sticker/gallery-desktop.png)
![gallery mobile](screenshots/sticker/gallery-mobile.png)
![album desktop](screenshots/sticker/album-desktop.png)
![album mobile](screenshots/sticker/album-mobile.png)

</details>

---

## 7. Aurora — glass over gradient skies

Outfit type, animated gradient-mesh sky (dawn light / vivid night aurora dark, with starfield),
frosted glass cards and floating nav pill, soft lift hovers.

| | | |
|---|---|---|
| ![aurora home](screenshots/aurora/home-desktop.png) | ![aurora projects](screenshots/aurora/projects-desktop.png) | ![aurora album](screenshots/aurora/album-desktop.png) |
| ![aurora dark](screenshots/aurora/home-dark.png) | ![aurora blog](screenshots/aurora/blog-desktop.png) | ![aurora mobile](screenshots/aurora/home-mobile.png) |

<details>
<summary>All aurora captures</summary>

![home desktop](screenshots/aurora/home-desktop.png)
![home mobile](screenshots/aurora/home-mobile.png)
![home dark](screenshots/aurora/home-dark.png)
![projects desktop](screenshots/aurora/projects-desktop.png)
![projects mobile](screenshots/aurora/projects-mobile.png)
![project desktop](screenshots/aurora/project-desktop.png)
![project mobile](screenshots/aurora/project-mobile.png)
![blog desktop](screenshots/aurora/blog-desktop.png)
![blog mobile](screenshots/aurora/blog-mobile.png)
![gallery desktop](screenshots/aurora/gallery-desktop.png)
![gallery mobile](screenshots/aurora/gallery-mobile.png)
![album desktop](screenshots/aurora/album-desktop.png)
![album mobile](screenshots/aurora/album-mobile.png)

</details>

---

## 8. Luxe — minimal luxury

Cormorant Garamond at huge sizes, gallery-white whitespace (dark: near-black with champagne gold),
hairlines, leader-dot table-of-contents projects, full-bleed cinematic gallery plates, near-zero motion.

| | | |
|---|---|---|
| ![luxe home](screenshots/luxe/home-desktop.png) | ![luxe projects](screenshots/luxe/projects-desktop.png) | ![luxe album](screenshots/luxe/album-desktop.png) |
| ![luxe dark](screenshots/luxe/home-dark.png) | ![luxe blog](screenshots/luxe/blog-desktop.png) | ![luxe mobile](screenshots/luxe/home-mobile.png) |

<details>
<summary>All luxe captures</summary>

![home desktop](screenshots/luxe/home-desktop.png)
![home mobile](screenshots/luxe/home-mobile.png)
![home dark](screenshots/luxe/home-dark.png)
![projects desktop](screenshots/luxe/projects-desktop.png)
![projects mobile](screenshots/luxe/projects-mobile.png)
![project desktop](screenshots/luxe/project-desktop.png)
![project mobile](screenshots/luxe/project-mobile.png)
![blog desktop](screenshots/luxe/blog-desktop.png)
![blog mobile](screenshots/luxe/blog-mobile.png)
![gallery desktop](screenshots/luxe/gallery-desktop.png)
![gallery mobile](screenshots/luxe/gallery-mobile.png)
![album desktop](screenshots/luxe/album-desktop.png)
![album mobile](screenshots/luxe/album-mobile.png)

</details>

---

## 9. Retro OS — Windows 95 desktop *(reworked with [8bitcn/ui](https://www.8bitcn.com/) patterns)*

The Win95 desktop kept — taskbar nav with live systray clock, Explorer details view, Notepad windows,
"No files found" blog dialog — rebuilt with 8bitcn chrome: thick ink borders with hard offset shadows,
Press Start 2P title bars + VT323 body, rect-grid pixel window controls (MIT-attributed port).
Dark mode is "Windows 98 night".

| | | |
|---|---|---|
| ![retro-os home](screenshots/retro-os/home-desktop.png) | ![retro-os projects](screenshots/retro-os/projects-desktop.png) | ![retro-os album](screenshots/retro-os/album-desktop.png) |
| ![retro-os dark](screenshots/retro-os/home-dark.png) | ![retro-os blog](screenshots/retro-os/blog-desktop.png) | ![retro-os mobile](screenshots/retro-os/home-mobile.png) |

<details>
<summary>All retro-os captures</summary>

![home desktop](screenshots/retro-os/home-desktop.png)
![home mobile](screenshots/retro-os/home-mobile.png)
![home dark](screenshots/retro-os/home-dark.png)
![projects desktop](screenshots/retro-os/projects-desktop.png)
![projects mobile](screenshots/retro-os/projects-mobile.png)
![project desktop](screenshots/retro-os/project-desktop.png)
![project mobile](screenshots/retro-os/project-mobile.png)
![blog desktop](screenshots/retro-os/blog-desktop.png)
![blog mobile](screenshots/retro-os/blog-mobile.png)
![gallery desktop](screenshots/retro-os/gallery-desktop.png)
![gallery mobile](screenshots/retro-os/gallery-mobile.png)
![album desktop](screenshots/retro-os/album-desktop.png)
![album mobile](screenshots/retro-os/album-mobile.png)

</details>

---

## 10. Kinetic — motion-first poster

Anton at poster scale, sliding clip-mask headlines, infinite marquees, scroll-driven reveals
(`animation-timeline: view()` with fallbacks), electric blue on paper / acid yellow on black.
Marquees, reveals and slides all stop under `prefers-reduced-motion`.

| | | |
|---|---|---|
| ![kinetic home](screenshots/kinetic/home-desktop.png) | ![kinetic projects](screenshots/kinetic/projects-desktop.png) | ![kinetic album](screenshots/kinetic/album-desktop.png) |
| ![kinetic dark](screenshots/kinetic/home-dark.png) | ![kinetic blog](screenshots/kinetic/blog-desktop.png) | ![kinetic mobile](screenshots/kinetic/home-mobile.png) |

<details>
<summary>All kinetic captures</summary>

![home desktop](screenshots/kinetic/home-desktop.png)
![home mobile](screenshots/kinetic/home-mobile.png)
![home dark](screenshots/kinetic/home-dark.png)
![projects desktop](screenshots/kinetic/projects-desktop.png)
![projects mobile](screenshots/kinetic/projects-mobile.png)
![project desktop](screenshots/kinetic/project-desktop.png)
![project mobile](screenshots/kinetic/project-mobile.png)
![blog desktop](screenshots/kinetic/blog-desktop.png)
![blog mobile](screenshots/kinetic/blog-mobile.png)
![gallery desktop](screenshots/kinetic/gallery-desktop.png)
![gallery mobile](screenshots/kinetic/gallery-mobile.png)
![album desktop](screenshots/kinetic/album-desktop.png)
![album mobile](screenshots/kinetic/album-mobile.png)

</details>

## Claymorphism — puffy 3D clay

Baloo 2, inflated rounded shapes with two-layer soft shadows, squishy press states, tags as clay blobs. Cream playroom light / deep plum night dark.

| | | |
|---|---|---|
| ![claymorphism home](screenshots/claymorphism/home-desktop.png) | ![claymorphism projects](screenshots/claymorphism/projects-desktop.png) | ![claymorphism album](screenshots/claymorphism/album-desktop.png) |
| ![claymorphism dark](screenshots/claymorphism/home-dark.png) | ![claymorphism blog](screenshots/claymorphism/blog-desktop.png) | ![claymorphism mobile](screenshots/claymorphism/home-mobile.png) |

<details>
<summary>All claymorphism captures</summary>

![home-desktop](screenshots/claymorphism/home-desktop.png)
![home-mobile](screenshots/claymorphism/home-mobile.png)
![home-dark](screenshots/claymorphism/home-dark.png)
![projects-desktop](screenshots/claymorphism/projects-desktop.png)
![projects-mobile](screenshots/claymorphism/projects-mobile.png)
![project-desktop](screenshots/claymorphism/project-desktop.png)
![project-mobile](screenshots/claymorphism/project-mobile.png)
![blog-desktop](screenshots/claymorphism/blog-desktop.png)
![blog-mobile](screenshots/claymorphism/blog-mobile.png)
![gallery-desktop](screenshots/claymorphism/gallery-desktop.png)
![gallery-mobile](screenshots/claymorphism/gallery-mobile.png)
![album-desktop](screenshots/claymorphism/album-desktop.png)
![album-mobile](screenshots/claymorphism/album-mobile.png)

</details>

---

## Cybercore — industrial HUD

Archivo Black + Space Mono, L-bracket HUD frames, hazard tape, classification stamps ([WIP]/[ACTIVE]), hover RGB-split glitch. Lab spec-sheet light / matte-black HUD dark.

| | | |
|---|---|---|
| ![cybercore home](screenshots/cybercore/home-desktop.png) | ![cybercore projects](screenshots/cybercore/projects-desktop.png) | ![cybercore album](screenshots/cybercore/album-desktop.png) |
| ![cybercore dark](screenshots/cybercore/home-dark.png) | ![cybercore blog](screenshots/cybercore/blog-desktop.png) | ![cybercore mobile](screenshots/cybercore/home-mobile.png) |

<details>
<summary>All cybercore captures</summary>

![home-desktop](screenshots/cybercore/home-desktop.png)
![home-mobile](screenshots/cybercore/home-mobile.png)
![home-dark](screenshots/cybercore/home-dark.png)
![projects-desktop](screenshots/cybercore/projects-desktop.png)
![projects-mobile](screenshots/cybercore/projects-mobile.png)
![project-desktop](screenshots/cybercore/project-desktop.png)
![project-mobile](screenshots/cybercore/project-mobile.png)
![blog-desktop](screenshots/cybercore/blog-desktop.png)
![blog-mobile](screenshots/cybercore/blog-mobile.png)
![gallery-desktop](screenshots/cybercore/gallery-desktop.png)
![gallery-mobile](screenshots/cybercore/gallery-mobile.png)
![album-desktop](screenshots/cybercore/album-desktop.png)
![album-mobile](screenshots/cybercore/album-mobile.png)

</details>

---

## Scrapbook — polaroids and washi tape

Permanent Marker + Caveat, kraft-paper desk, polaroid frames with handwritten captions, washi tape, ruled notebook sheets, doodle arrows. The gallery spreads are its crown jewel.

| | | |
|---|---|---|
| ![scrapbook home](screenshots/scrapbook/home-desktop.png) | ![scrapbook projects](screenshots/scrapbook/projects-desktop.png) | ![scrapbook album](screenshots/scrapbook/album-desktop.png) |
| ![scrapbook dark](screenshots/scrapbook/home-dark.png) | ![scrapbook blog](screenshots/scrapbook/blog-desktop.png) | ![scrapbook mobile](screenshots/scrapbook/home-mobile.png) |

<details>
<summary>All scrapbook captures</summary>

![home-desktop](screenshots/scrapbook/home-desktop.png)
![home-mobile](screenshots/scrapbook/home-mobile.png)
![home-dark](screenshots/scrapbook/home-dark.png)
![projects-desktop](screenshots/scrapbook/projects-desktop.png)
![projects-mobile](screenshots/scrapbook/projects-mobile.png)
![project-desktop](screenshots/scrapbook/project-desktop.png)
![project-mobile](screenshots/scrapbook/project-mobile.png)
![blog-desktop](screenshots/scrapbook/blog-desktop.png)
![blog-mobile](screenshots/scrapbook/blog-mobile.png)
![gallery-desktop](screenshots/scrapbook/gallery-desktop.png)
![gallery-mobile](screenshots/scrapbook/gallery-mobile.png)
![album-desktop](screenshots/scrapbook/album-desktop.png)
![album-mobile](screenshots/scrapbook/album-mobile.png)

</details>

---

## Surrealism — dream logic

Newsreader serif, floating hero words at impossible scales, gapped horizons with a door in the gap, wandering fish, projects as museum exhibits with plates. Pale dream sky / midnight gallery.

| | | |
|---|---|---|
| ![surrealism home](screenshots/surrealism/home-desktop.png) | ![surrealism projects](screenshots/surrealism/projects-desktop.png) | ![surrealism album](screenshots/surrealism/album-desktop.png) |
| ![surrealism dark](screenshots/surrealism/home-dark.png) | ![surrealism blog](screenshots/surrealism/blog-desktop.png) | ![surrealism mobile](screenshots/surrealism/home-mobile.png) |

<details>
<summary>All surrealism captures</summary>

![home-desktop](screenshots/surrealism/home-desktop.png)
![home-mobile](screenshots/surrealism/home-mobile.png)
![home-dark](screenshots/surrealism/home-dark.png)
![projects-desktop](screenshots/surrealism/projects-desktop.png)
![projects-mobile](screenshots/surrealism/projects-mobile.png)
![project-desktop](screenshots/surrealism/project-desktop.png)
![project-mobile](screenshots/surrealism/project-mobile.png)
![blog-desktop](screenshots/surrealism/blog-desktop.png)
![blog-mobile](screenshots/surrealism/blog-mobile.png)
![gallery-desktop](screenshots/surrealism/gallery-desktop.png)
![gallery-mobile](screenshots/surrealism/gallery-mobile.png)
![album-desktop](screenshots/surrealism/album-desktop.png)
![album-mobile](screenshots/surrealism/album-mobile.png)

</details>

---

## Y2K — chrome bubbles

Baloo 2 + Audiowide, chrome/liquid-metal gradient text, glossy pills with shine sweeps, holographic gradient-border cards, candy loading bars stuck at 'first post pending — 12%'.

| | | |
|---|---|---|
| ![y2k home](screenshots/y2k/home-desktop.png) | ![y2k projects](screenshots/y2k/projects-desktop.png) | ![y2k album](screenshots/y2k/album-desktop.png) |
| ![y2k dark](screenshots/y2k/home-dark.png) | ![y2k blog](screenshots/y2k/blog-desktop.png) | ![y2k mobile](screenshots/y2k/home-mobile.png) |

<details>
<summary>All y2k captures</summary>

![home-desktop](screenshots/y2k/home-desktop.png)
![home-mobile](screenshots/y2k/home-mobile.png)
![home-dark](screenshots/y2k/home-dark.png)
![projects-desktop](screenshots/y2k/projects-desktop.png)
![projects-mobile](screenshots/y2k/projects-mobile.png)
![project-desktop](screenshots/y2k/project-desktop.png)
![project-mobile](screenshots/y2k/project-mobile.png)
![blog-desktop](screenshots/y2k/blog-desktop.png)
![blog-mobile](screenshots/y2k/blog-mobile.png)
![gallery-desktop](screenshots/y2k/gallery-desktop.png)
![gallery-mobile](screenshots/y2k/gallery-mobile.png)
![album-desktop](screenshots/y2k/album-desktop.png)
![album-mobile](screenshots/y2k/album-mobile.png)

</details>

---

## Pixel Art — 8-bit RPG quest log *(built on our mirrored [8bitcn/ui](https://www.8bitcn.com/) reference — MIT attributed)*

Press Start 2P + VT323, ported 8bitcn/ui patterns (MIT attributed): character sheet home, quest log with XP rewards and stamps, save-slot blog empty state, item-bag gallery, XP-bar footer.

| | | |
|---|---|---|
| ![pixel home](screenshots/pixel/home-desktop.png) | ![pixel projects](screenshots/pixel/projects-desktop.png) | ![pixel album](screenshots/pixel/album-desktop.png) |
| ![pixel dark](screenshots/pixel/home-dark.png) | ![pixel blog](screenshots/pixel/blog-desktop.png) | ![pixel mobile](screenshots/pixel/home-mobile.png) |

<details>
<summary>All pixel captures</summary>

![home-desktop](screenshots/pixel/home-desktop.png)
![home-mobile](screenshots/pixel/home-mobile.png)
![home-dark](screenshots/pixel/home-dark.png)
![projects-desktop](screenshots/pixel/projects-desktop.png)
![projects-mobile](screenshots/pixel/projects-mobile.png)
![project-desktop](screenshots/pixel/project-desktop.png)
![project-mobile](screenshots/pixel/project-mobile.png)
![blog-desktop](screenshots/pixel/blog-desktop.png)
![blog-mobile](screenshots/pixel/blog-mobile.png)
![gallery-desktop](screenshots/pixel/gallery-desktop.png)
![gallery-mobile](screenshots/pixel/gallery-mobile.png)
![album-desktop](screenshots/pixel/album-desktop.png)
![album-mobile](screenshots/pixel/album-mobile.png)

</details>

---

## Synthwave — 80s sunset grid

Audiowide chrome over a perspective grid pinned in-flow (never under text), scanline sun, magenta duotone photo hovers, tracklist projects. Dayglo daytime light / sunset hero dark.

| | | |
|---|---|---|
| ![synthwave home](screenshots/synthwave/home-desktop.png) | ![synthwave projects](screenshots/synthwave/projects-desktop.png) | ![synthwave album](screenshots/synthwave/album-desktop.png) |
| ![synthwave dark](screenshots/synthwave/home-dark.png) | ![synthwave blog](screenshots/synthwave/blog-desktop.png) | ![synthwave mobile](screenshots/synthwave/home-mobile.png) |

<details>
<summary>All synthwave captures</summary>

![home-desktop](screenshots/synthwave/home-desktop.png)
![home-mobile](screenshots/synthwave/home-mobile.png)
![home-dark](screenshots/synthwave/home-dark.png)
![projects-desktop](screenshots/synthwave/projects-desktop.png)
![projects-mobile](screenshots/synthwave/projects-mobile.png)
![project-desktop](screenshots/synthwave/project-desktop.png)
![project-mobile](screenshots/synthwave/project-mobile.png)
![blog-desktop](screenshots/synthwave/blog-desktop.png)
![blog-mobile](screenshots/synthwave/blog-mobile.png)
![gallery-desktop](screenshots/synthwave/gallery-desktop.png)
![gallery-mobile](screenshots/synthwave/gallery-mobile.png)
![album-desktop](screenshots/synthwave/album-desktop.png)
![album-mobile](screenshots/synthwave/album-mobile.png)

</details>

---

## Neumorphism — soft extruded UI

Outfit on a single-field design: raised and pressed-in states carved with paired shadows, no borders anywhere. Gray-beige field light / deep graphite dark.

| | | |
|---|---|---|
| ![neumorphism home](screenshots/neumorphism/home-desktop.png) | ![neumorphism projects](screenshots/neumorphism/projects-desktop.png) | ![neumorphism album](screenshots/neumorphism/album-desktop.png) |
| ![neumorphism dark](screenshots/neumorphism/home-dark.png) | ![neumorphism blog](screenshots/neumorphism/blog-desktop.png) | ![neumorphism mobile](screenshots/neumorphism/home-mobile.png) |

<details>
<summary>All neumorphism captures</summary>

![home-desktop](screenshots/neumorphism/home-desktop.png)
![home-mobile](screenshots/neumorphism/home-mobile.png)
![home-dark](screenshots/neumorphism/home-dark.png)
![projects-desktop](screenshots/neumorphism/projects-desktop.png)
![projects-mobile](screenshots/neumorphism/projects-mobile.png)
![project-desktop](screenshots/neumorphism/project-desktop.png)
![project-mobile](screenshots/neumorphism/project-mobile.png)
![blog-desktop](screenshots/neumorphism/blog-desktop.png)
![blog-mobile](screenshots/neumorphism/blog-mobile.png)
![gallery-desktop](screenshots/neumorphism/gallery-desktop.png)
![gallery-mobile](screenshots/neumorphism/gallery-mobile.png)
![album-desktop](screenshots/neumorphism/album-desktop.png)
![album-mobile](screenshots/neumorphism/album-mobile.png)

</details>

---

## Bento Grid — modular cards

Inter + Geist Mono, the layout IS the identity: mixed-span bento cells (2x2, 2x1, 1x1) summing to full rectangles — identity grid home, importance-sized projects, reserved slot blog empty state, photo mosaic gallery.

| | | |
|---|---|---|
| ![bento home](screenshots/bento/home-desktop.png) | ![bento projects](screenshots/bento/projects-desktop.png) | ![bento album](screenshots/bento/album-desktop.png) |
| ![bento dark](screenshots/bento/home-dark.png) | ![bento blog](screenshots/bento/blog-desktop.png) | ![bento mobile](screenshots/bento/home-mobile.png) |

<details>
<summary>All bento captures</summary>

![home-desktop](screenshots/bento/home-desktop.png)
![home-mobile](screenshots/bento/home-mobile.png)
![home-dark](screenshots/bento/home-dark.png)
![projects-desktop](screenshots/bento/projects-desktop.png)
![projects-mobile](screenshots/bento/projects-mobile.png)
![project-desktop](screenshots/bento/project-desktop.png)
![project-mobile](screenshots/bento/project-mobile.png)
![blog-desktop](screenshots/bento/blog-desktop.png)
![blog-mobile](screenshots/bento/blog-mobile.png)
![gallery-desktop](screenshots/bento/gallery-desktop.png)
![gallery-mobile](screenshots/bento/gallery-mobile.png)
![album-desktop](screenshots/bento/album-desktop.png)
![album-mobile](screenshots/bento/album-mobile.png)

</details>

---

## Maximalism — more is more

Four clashing type voices (Archivo Black, Newsreader italic, Caveat, Inter), zigzag band edges, pattern backdrops, rotating starbursts, marquee topline. Saturated party light / midnight carnival dark.

| | | |
|---|---|---|
| ![maximalism home](screenshots/maximalism/home-desktop.png) | ![maximalism projects](screenshots/maximalism/projects-desktop.png) | ![maximalism album](screenshots/maximalism/album-desktop.png) |
| ![maximalism dark](screenshots/maximalism/home-dark.png) | ![maximalism blog](screenshots/maximalism/blog-desktop.png) | ![maximalism mobile](screenshots/maximalism/home-mobile.png) |

<details>
<summary>All maximalism captures</summary>

![home-desktop](screenshots/maximalism/home-desktop.png)
![home-mobile](screenshots/maximalism/home-mobile.png)
![home-dark](screenshots/maximalism/home-dark.png)
![projects-desktop](screenshots/maximalism/projects-desktop.png)
![projects-mobile](screenshots/maximalism/projects-mobile.png)
![project-desktop](screenshots/maximalism/project-desktop.png)
![project-mobile](screenshots/maximalism/project-mobile.png)
![blog-desktop](screenshots/maximalism/blog-desktop.png)
![blog-mobile](screenshots/maximalism/blog-mobile.png)
![gallery-desktop](screenshots/maximalism/gallery-desktop.png)
![gallery-mobile](screenshots/maximalism/gallery-mobile.png)
![album-desktop](screenshots/maximalism/album-desktop.png)
![album-mobile](screenshots/maximalism/album-mobile.png)

</details>

---

## Sketch — pencil concept art

Permanent Marker + Space Mono on graph paper: wobbly double-stroke borders, scribble hatching, dimension lines, 'hero_v4_FINAL_final' margin notes, photos as taped reference prints. Red-pencil corrections. Blueprint-paper dark mode.

| | | |
|---|---|---|
| ![sketch home](screenshots/sketch/home-desktop.png) | ![sketch projects](screenshots/sketch/projects-desktop.png) | ![sketch album](screenshots/sketch/album-desktop.png) |
| ![sketch dark](screenshots/sketch/home-dark.png) | ![sketch blog](screenshots/sketch/blog-desktop.png) | ![sketch mobile](screenshots/sketch/home-mobile.png) |

<details>
<summary>All sketch captures</summary>

![home-desktop](screenshots/sketch/home-desktop.png)
![home-mobile](screenshots/sketch/home-mobile.png)
![home-dark](screenshots/sketch/home-dark.png)
![projects-desktop](screenshots/sketch/projects-desktop.png)
![projects-mobile](screenshots/sketch/projects-mobile.png)
![project-desktop](screenshots/sketch/project-desktop.png)
![project-mobile](screenshots/sketch/project-mobile.png)
![blog-desktop](screenshots/sketch/blog-desktop.png)
![blog-mobile](screenshots/sketch/blog-mobile.png)
![gallery-desktop](screenshots/sketch/gallery-desktop.png)
![gallery-mobile](screenshots/sketch/gallery-mobile.png)
![album-desktop](screenshots/sketch/album-desktop.png)
![album-mobile](screenshots/sketch/album-mobile.png)

</details>

---

## Ethereal — mist and light

Cormorant Garamond at airy sizes, edge-anchored drifting mist (never behind text), near-transparent veils, soft-edged memory photos. Fog-white light / indigo night-mist dark.

| | | |
|---|---|---|
| ![ethereal home](screenshots/ethereal/home-desktop.png) | ![ethereal projects](screenshots/ethereal/projects-desktop.png) | ![ethereal album](screenshots/ethereal/album-desktop.png) |
| ![ethereal dark](screenshots/ethereal/home-dark.png) | ![ethereal blog](screenshots/ethereal/blog-desktop.png) | ![ethereal mobile](screenshots/ethereal/home-mobile.png) |

<details>
<summary>All ethereal captures</summary>

![home-desktop](screenshots/ethereal/home-desktop.png)
![home-mobile](screenshots/ethereal/home-mobile.png)
![home-dark](screenshots/ethereal/home-dark.png)
![projects-desktop](screenshots/ethereal/projects-desktop.png)
![projects-mobile](screenshots/ethereal/projects-mobile.png)
![project-desktop](screenshots/ethereal/project-desktop.png)
![project-mobile](screenshots/ethereal/project-mobile.png)
![blog-desktop](screenshots/ethereal/blog-desktop.png)
![blog-mobile](screenshots/ethereal/blog-mobile.png)
![gallery-desktop](screenshots/ethereal/gallery-desktop.png)
![gallery-mobile](screenshots/ethereal/gallery-mobile.png)
![album-desktop](screenshots/ethereal/album-desktop.png)
![album-mobile](screenshots/ethereal/album-mobile.png)

</details>

---

## Bohemian — desert artisan

Fraunces on sun-bleached desert tones: kilim woven dividers, tassel and diamond motifs, CSS desert sun, arched photo frames, market-goods project cards with hand-stamped labels, loom blog empty state.

| | | |
|---|---|---|
| ![bohemian home](screenshots/bohemian/home-desktop.png) | ![bohemian projects](screenshots/bohemian/projects-desktop.png) | ![bohemian album](screenshots/bohemian/album-desktop.png) |
| ![bohemian dark](screenshots/bohemian/home-dark.png) | ![bohemian blog](screenshots/bohemian/blog-desktop.png) | ![bohemian mobile](screenshots/bohemian/home-mobile.png) |

<details>
<summary>All bohemian captures</summary>

![home-desktop](screenshots/bohemian/home-desktop.png)
![home-mobile](screenshots/bohemian/home-mobile.png)
![home-dark](screenshots/bohemian/home-dark.png)
![projects-desktop](screenshots/bohemian/projects-desktop.png)
![projects-mobile](screenshots/bohemian/projects-mobile.png)
![project-desktop](screenshots/bohemian/project-desktop.png)
![project-mobile](screenshots/bohemian/project-mobile.png)
![blog-desktop](screenshots/bohemian/blog-desktop.png)
![blog-mobile](screenshots/bohemian/blog-mobile.png)
![gallery-desktop](screenshots/bohemian/gallery-desktop.png)
![gallery-mobile](screenshots/bohemian/gallery-mobile.png)
![album-desktop](screenshots/bohemian/album-desktop.png)
![album-mobile](screenshots/bohemian/album-mobile.png)

</details>

---

## Victorian — letterpress engraving

Cormorant Garamond in engraved capitals, double-rule frames with corner flourishes, drop caps, roman-numeral catalogue entries, fleuron dividers, printer's-imprint footer. Ivory light / midnight-leather + gold-foil dark.

| | | |
|---|---|---|
| ![victorian home](screenshots/victorian/home-desktop.png) | ![victorian projects](screenshots/victorian/projects-desktop.png) | ![victorian album](screenshots/victorian/album-desktop.png) |
| ![victorian dark](screenshots/victorian/home-dark.png) | ![victorian blog](screenshots/victorian/blog-desktop.png) | ![victorian mobile](screenshots/victorian/home-mobile.png) |

<details>
<summary>All victorian captures</summary>

![home-desktop](screenshots/victorian/home-desktop.png)
![home-mobile](screenshots/victorian/home-mobile.png)
![home-dark](screenshots/victorian/home-dark.png)
![projects-desktop](screenshots/victorian/projects-desktop.png)
![projects-mobile](screenshots/victorian/projects-mobile.png)
![project-desktop](screenshots/victorian/project-desktop.png)
![project-mobile](screenshots/victorian/project-mobile.png)
![blog-desktop](screenshots/victorian/blog-desktop.png)
![blog-mobile](screenshots/victorian/blog-mobile.png)
![gallery-desktop](screenshots/victorian/gallery-desktop.png)
![gallery-mobile](screenshots/victorian/gallery-mobile.png)
![album-desktop](screenshots/victorian/album-desktop.png)
![album-mobile](screenshots/victorian/album-mobile.png)

</details>

---

## Wabi-Sabi — imperfect quietude

Newsreader on unbleached washi: off-center hero with open ma, staggered rows, torn-paper ink dividers, hanko date stamps, quiet persimmon accent. Charcoal-ink night dark.

| | | |
|---|---|---|
| ![wabi-sabi home](screenshots/wabi-sabi/home-desktop.png) | ![wabi-sabi projects](screenshots/wabi-sabi/projects-desktop.png) | ![wabi-sabi album](screenshots/wabi-sabi/album-desktop.png) |
| ![wabi-sabi dark](screenshots/wabi-sabi/home-dark.png) | ![wabi-sabi blog](screenshots/wabi-sabi/blog-desktop.png) | ![wabi-sabi mobile](screenshots/wabi-sabi/home-mobile.png) |

<details>
<summary>All wabi-sabi captures</summary>

![home-desktop](screenshots/wabi-sabi/home-desktop.png)
![home-mobile](screenshots/wabi-sabi/home-mobile.png)
![home-dark](screenshots/wabi-sabi/home-dark.png)
![projects-desktop](screenshots/wabi-sabi/projects-desktop.png)
![projects-mobile](screenshots/wabi-sabi/projects-mobile.png)
![project-desktop](screenshots/wabi-sabi/project-desktop.png)
![project-mobile](screenshots/wabi-sabi/project-mobile.png)
![blog-desktop](screenshots/wabi-sabi/blog-desktop.png)
![blog-mobile](screenshots/wabi-sabi/blog-mobile.png)
![gallery-desktop](screenshots/wabi-sabi/gallery-desktop.png)
![gallery-mobile](screenshots/wabi-sabi/gallery-mobile.png)
![album-desktop](screenshots/wabi-sabi/album-desktop.png)
![album-mobile](screenshots/wabi-sabi/album-mobile.png)

</details>

---

## Music — Last.fm listening stats (`/music`)

Isometric page: the **top three artists of the last 30 days** as boxed cards (artist name + play
count, no artwork area), a **recent-scrobbles bullet list** with a now-playing state, and the required
Last.fm attribution link. No artwork is shown — Last.fm's terms exclude it from the API licence.
Other themes get a small fallback pointing at the isometric version.

| | |
|---|---|
| ![music desktop](screenshots/isometric/music-desktop.png) | ![music mobile](screenshots/isometric/music-mobile.png) |

Fallback for other themes:

![music fallback](screenshots/classic/music-desktop.png)

> **Account requirement:** from 1 December 2026 the Last.fm account owning the API key needs
> Last.fm Pro; without it the read methods stop and the page shows its “Last.fm is out of reach”
> state. Responses are cached for five minutes and stale data is served during outages.

---

## Production notes

- Switching: cookie `site-theme` + floating picker on every page; `?theme=<id>` deep links work too.
- Light/dark: shared toggle bottom-right; each theme designs both modes.
- The theme system is structural: each variant owns its full layout (`src/themes/<id>/`), not just tokens.
- `SCREENSHOTS.md` regenerable: `bash docs/screenshots.sh` with the dev server running on :4322.
- All facts in rewritten copy remain true (Cologne, TanStack/Hono/Elysia/Effect, Japan 2026 trip, real projects).
