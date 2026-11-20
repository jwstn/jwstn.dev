# Portfolio theme variants — screenshot report

Eleven selectable themes now live on this branch: your current design (**classic**, still the default)
plus ten new directions. Every screenshot below was captured from the dev server at full page.

**Browse them live:** run `pnpm astro dev`, then either use the floating picker (bottom-right of every
page) or deep-link with `?theme=<id>` — e.g. `http://localhost:4322/?theme=retro-os`. The chosen theme
persists via cookie across visits.

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

---

## Production notes

- Switching: cookie `site-theme` + floating picker on every page; `?theme=<id>` deep links work too.
- Light/dark: shared toggle bottom-right; each theme designs both modes.
- The theme system is structural: each variant owns its full layout (`src/themes/<id>/`), not just tokens.
- `SCREENSHOTS.md` regenerable: `bash docs/screenshots.sh` with the dev server running on :4322.
- All facts in rewritten copy remain true (Cologne, TanStack/Hono/Elysia/Effect, Japan 2026 trip, real projects).
