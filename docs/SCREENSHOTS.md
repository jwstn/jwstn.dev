# Portfolio theme variants — screenshot report

Eleven selectable themes now live on this branch: your current design (**classic**, still the default)
plus ten new directions. Every screenshot below was captured from the dev server at full page.

**Browse them live:** run `pnpm astro dev`, then either use the floating picker (bottom-right of every
page) or deep-link with `?theme=<id>` — e.g. `http://localhost:4322/?theme=retro-os`. The chosen theme
persists via cookie across visits.

Routes per theme: Home · Projects · Project detail (`spotui`) · Blog (empty state) · Gallery · Album
detail (`spring-2026`), each in desktop (1440 px) and mobile (375 px), plus a dark-mode Home capture.
The blog currently has zero posts, so Blog pages show each theme's designed empty state.

An overview contact sheet of all theme homes: [`_overview.png`](_overview.png)

---

## 0. Classic — your current design (default)

The baseline, kept selectable for comparison. Geist Mono, quiet purple accents.

| | | |
|---|---|---|
| ![classic home desktop](classic/home-desktop.png) | ![classic projects desktop](classic/projects-desktop.png) | ![classic gallery desktop](classic/gallery-desktop.png) |

<details>
<summary>All classic captures</summary>

![home desktop](classic/home-desktop.png)
![home mobile](classic/home-mobile.png)
![home dark](classic/home-dark.png)
![projects desktop](classic/projects-desktop.png)
![projects mobile](classic/projects-mobile.png)
![project desktop](classic/project-desktop.png)
![project mobile](classic/project-mobile.png)
![blog desktop](classic/blog-desktop.png)
![blog mobile](classic/blog-mobile.png)
![gallery desktop](classic/gallery-desktop.png)
![gallery mobile](classic/gallery-mobile.png)
![album desktop](classic/album-desktop.png)
![album mobile](classic/album-mobile.png)

</details>

---

## 1. Editorial — Swiss magazine

Newsreader serif headlines, hairline grid, international-orange accents, numbered index lists,
masthead with issue numbering, colophon footer.

| | | |
|---|---|---|
| ![editorial home](editorial/home-desktop.png) | ![editorial projects](editorial/projects-desktop.png) | ![editorial album](editorial/album-desktop.png) |
| ![editorial dark](editorial/home-dark.png) | ![editorial blog](editorial/blog-desktop.png) | ![editorial mobile](editorial/home-mobile.png) |

<details>
<summary>All editorial captures</summary>

![home desktop](editorial/home-desktop.png)
![home mobile](editorial/home-mobile.png)
![home dark](editorial/home-dark.png)
![projects desktop](editorial/projects-desktop.png)
![projects mobile](editorial/projects-mobile.png)
![project desktop](editorial/project-desktop.png)
![project mobile](editorial/project-mobile.png)
![blog desktop](editorial/blog-desktop.png)
![blog mobile](editorial/blog-mobile.png)
![gallery desktop](editorial/gallery-desktop.png)
![gallery mobile](editorial/gallery-mobile.png)
![album desktop](editorial/album-desktop.png)
![album mobile](editorial/album-mobile.png)

</details>

---

## 2. Brutalist — neo-brutalism

Archivo Black, thick borders, hard offset shadows, acid colors, marquee tag ticker, press-down hovers,
hard step easings — no soft fades anywhere.

| | | |
|---|---|---|
| ![brutalist home](brutalist/home-desktop.png) | ![brutalist projects](brutalist/projects-desktop.png) | ![brutalist album](brutalist/album-desktop.png) |
| ![brutalist dark](brutalist/home-dark.png) | ![brutalist blog](brutalist/blog-desktop.png) | ![brutalist mobile](brutalist/home-mobile.png) |

<details>
<summary>All brutalist captures</summary>

![home desktop](brutalist/home-desktop.png)
![home mobile](brutalist/home-mobile.png)
![home dark](brutalist/home-dark.png)
![projects desktop](brutalist/projects-desktop.png)
![projects mobile](brutalist/projects-mobile.png)
![project desktop](brutalist/project-desktop.png)
![project mobile](brutalist/project-mobile.png)
![blog desktop](brutalist/blog-desktop.png)
![blog mobile](brutalist/blog-mobile.png)
![gallery desktop](brutalist/gallery-desktop.png)
![gallery mobile](brutalist/gallery-mobile.png)
![album desktop](brutalist/album-desktop.png)
![album mobile](brutalist/album-mobile.png)

</details>

---

## 3. Terminal — CRT console

Geist Mono, phosphor green on black (light mode is an amber "paper terminal"), scanlines, typed
boot-sequence home page, projects as `cat ~/projects.txt` output, taskbar-free command-bar nav.

| | | |
|---|---|---|
| ![terminal home](terminal/home-desktop.png) | ![terminal projects](terminal/projects-desktop.png) | ![terminal album](terminal/album-desktop.png) |
| ![terminal dark](terminal/home-dark.png) | ![terminal blog](terminal/blog-desktop.png) | ![terminal mobile](terminal/home-mobile.png) |

<details>
<summary>All terminal captures</summary>

![home desktop](terminal/home-desktop.png)
![home mobile](terminal/home-mobile.png)
![home dark](terminal/home-dark.png)
![projects desktop](terminal/projects-desktop.png)
![projects mobile](terminal/projects-mobile.png)
![project desktop](terminal/project-desktop.png)
![project mobile](terminal/project-mobile.png)
![blog desktop](terminal/blog-desktop.png)
![blog mobile](terminal/blog-mobile.png)
![gallery desktop](terminal/gallery-desktop.png)
![gallery mobile](terminal/gallery-mobile.png)
![album desktop](terminal/album-desktop.png)
![album mobile](terminal/album-mobile.png)

</details>

---

## 4. Neon — cyberpunk night city

Orbitron display type, magenta→cyan glow over deep indigo (light mode is a pale-lilac day city),
translucent panels with 1 px neon edges, chromatic-aberration title hovers, EQ-bar empty blog state.

| | | |
|---|---|---|
| ![neon home](neon/home-desktop.png) | ![neon projects](neon/projects-desktop.png) | ![neon album](neon/album-desktop.png) |
| ![neon dark](neon/home-dark.png) | ![neon blog](neon/blog-desktop.png) | ![neon mobile](neon/home-mobile.png) |

<details>
<summary>All neon captures</summary>

![home desktop](neon/home-desktop.png)
![home mobile](neon/home-mobile.png)
![home dark](neon/home-dark.png)
![projects desktop](neon/projects-desktop.png)
![projects mobile](neon/projects-mobile.png)
![project desktop](neon/project-desktop.png)
![project mobile](neon/project-mobile.png)
![blog desktop](neon/blog-desktop.png)
![blog mobile](neon/blog-mobile.png)
![gallery desktop](neon/gallery-desktop.png)
![gallery mobile](neon/gallery-mobile.png)
![album desktop](neon/album-desktop.png)
![album mobile](neon/album-mobile.png)

</details>

---

## 5. Riso — risograph zine

Warm paper with grain, two-ink duotone (riso blue + fluoro pink), crop and registration marks,
misregistered headline offsets, Caveat margin notes and hand arrows, taped album prints.

| | | |
|---|---|---|
| ![riso home](riso/home-desktop.png) | ![riso projects](riso/projects-desktop.png) | ![riso album](riso/album-desktop.png) |
| ![riso dark](riso/home-dark.png) | ![riso blog](riso/blog-desktop.png) | ![riso mobile](riso/home-mobile.png) |

<details>
<summary>All riso captures</summary>

![home desktop](riso/home-desktop.png)
![home mobile](riso/home-mobile.png)
![home dark](riso/home-dark.png)
![projects desktop](riso/projects-desktop.png)
![projects mobile](riso/projects-mobile.png)
![project desktop](riso/project-desktop.png)
![project mobile](riso/project-mobile.png)
![blog desktop](riso/blog-desktop.png)
![blog mobile](riso/blog-mobile.png)
![gallery desktop](riso/gallery-desktop.png)
![gallery mobile](riso/gallery-mobile.png)
![album desktop](riso/album-desktop.png)
![album mobile](riso/album-mobile.png)

</details>

---

## 6. Sticker — playful sticker book

Baloo 2 rounded type, candy-dot cream background (dark: purple night with pastel stickers), sticker
cards with white borders, wobbling starbursts, trading-card projects with holo sheen, bouncy springs.

| | | |
|---|---|---|
| ![sticker home](sticker/home-desktop.png) | ![sticker projects](sticker/projects-desktop.png) | ![sticker album](sticker/album-desktop.png) |
| ![sticker dark](sticker/home-dark.png) | ![sticker blog](sticker/blog-desktop.png) | ![sticker mobile](sticker/home-mobile.png) |

<details>
<summary>All sticker captures</summary>

![home desktop](sticker/home-desktop.png)
![home mobile](sticker/home-mobile.png)
![home dark](sticker/home-dark.png)
![projects desktop](sticker/projects-desktop.png)
![projects mobile](sticker/projects-mobile.png)
![project desktop](sticker/project-desktop.png)
![project mobile](sticker/project-mobile.png)
![blog desktop](sticker/blog-desktop.png)
![blog mobile](sticker/blog-mobile.png)
![gallery desktop](sticker/gallery-desktop.png)
![gallery mobile](sticker/gallery-mobile.png)
![album desktop](sticker/album-desktop.png)
![album mobile](sticker/album-mobile.png)

</details>

---

## 7. Aurora — glass over gradient skies

Outfit type, animated gradient-mesh sky (dawn light / vivid night aurora dark, with starfield),
frosted glass cards and floating nav pill, soft lift hovers.

| | | |
|---|---|---|
| ![aurora home](aurora/home-desktop.png) | ![aurora projects](aurora/projects-desktop.png) | ![aurora album](aurora/album-desktop.png) |
| ![aurora dark](aurora/home-dark.png) | ![aurora blog](aurora/blog-desktop.png) | ![aurora mobile](aurora/home-mobile.png) |

<details>
<summary>All aurora captures</summary>

![home desktop](aurora/home-desktop.png)
![home mobile](aurora/home-mobile.png)
![home dark](aurora/home-dark.png)
![projects desktop](aurora/projects-desktop.png)
![projects mobile](aurora/projects-mobile.png)
![project desktop](aurora/project-desktop.png)
![project mobile](aurora/project-mobile.png)
![blog desktop](aurora/blog-desktop.png)
![blog mobile](aurora/blog-mobile.png)
![gallery desktop](aurora/gallery-desktop.png)
![gallery mobile](aurora/gallery-mobile.png)
![album desktop](aurora/album-desktop.png)
![album mobile](aurora/album-mobile.png)

</details>

---

## 8. Luxe — minimal luxury

Cormorant Garamond at huge sizes, gallery-white whitespace (dark: near-black with champagne gold),
hairlines, leader-dot table-of-contents projects, full-bleed cinematic gallery plates, near-zero motion.

| | | |
|---|---|---|
| ![luxe home](luxe/home-desktop.png) | ![luxe projects](luxe/projects-desktop.png) | ![luxe album](luxe/album-desktop.png) |
| ![luxe dark](luxe/home-dark.png) | ![luxe blog](luxe/blog-desktop.png) | ![luxe mobile](luxe/home-mobile.png) |

<details>
<summary>All luxe captures</summary>

![home desktop](luxe/home-desktop.png)
![home mobile](luxe/home-mobile.png)
![home dark](luxe/home-dark.png)
![projects desktop](luxe/projects-desktop.png)
![projects mobile](luxe/projects-mobile.png)
![project desktop](luxe/project-desktop.png)
![project mobile](luxe/project-mobile.png)
![blog desktop](luxe/blog-desktop.png)
![blog mobile](luxe/blog-mobile.png)
![gallery desktop](luxe/gallery-desktop.png)
![gallery mobile](luxe/gallery-mobile.png)
![album desktop](luxe/album-desktop.png)
![album mobile](luxe/album-mobile.png)

</details>

---

## 9. Retro OS — Windows 95 desktop

VT323 chrome, teal desktop with taskbar nav and live systray clock, every section a beveled window
with title bar, projects in Explorer details view, blog as an empty folder + "No files found" dialog.
Dark mode is "Windows 98 night".

| | | |
|---|---|---|
| ![retro-os home](retro-os/home-desktop.png) | ![retro-os projects](retro-os/projects-desktop.png) | ![retro-os album](retro-os/album-desktop.png) |
| ![retro-os dark](retro-os/home-dark.png) | ![retro-os blog](retro-os/blog-desktop.png) | ![retro-os mobile](retro-os/home-mobile.png) |

<details>
<summary>All retro-os captures</summary>

![home desktop](retro-os/home-desktop.png)
![home mobile](retro-os/home-mobile.png)
![home dark](retro-os/home-dark.png)
![projects desktop](retro-os/projects-desktop.png)
![projects mobile](retro-os/projects-mobile.png)
![project desktop](retro-os/project-desktop.png)
![project mobile](retro-os/project-mobile.png)
![blog desktop](retro-os/blog-desktop.png)
![blog mobile](retro-os/blog-mobile.png)
![gallery desktop](retro-os/gallery-desktop.png)
![gallery mobile](retro-os/gallery-mobile.png)
![album desktop](retro-os/album-desktop.png)
![album mobile](retro-os/album-mobile.png)

</details>

---

## 10. Kinetic — motion-first poster

Anton at poster scale, sliding clip-mask headlines, infinite marquees, scroll-driven reveals
(`animation-timeline: view()` with fallbacks), electric blue on paper / acid yellow on black.
Marquees, reveals and slides all stop under `prefers-reduced-motion`.

| | | |
|---|---|---|
| ![kinetic home](kinetic/home-desktop.png) | ![kinetic projects](kinetic/projects-desktop.png) | ![kinetic album](kinetic/album-desktop.png) |
| ![kinetic dark](kinetic/home-dark.png) | ![kinetic blog](kinetic/blog-desktop.png) | ![kinetic mobile](kinetic/home-mobile.png) |

<details>
<summary>All kinetic captures</summary>

![home desktop](kinetic/home-desktop.png)
![home mobile](kinetic/home-mobile.png)
![home dark](kinetic/home-dark.png)
![projects desktop](kinetic/projects-desktop.png)
![projects mobile](kinetic/projects-mobile.png)
![project desktop](kinetic/project-desktop.png)
![project mobile](kinetic/project-mobile.png)
![blog desktop](kinetic/blog-desktop.png)
![blog mobile](kinetic/blog-mobile.png)
![gallery desktop](kinetic/gallery-desktop.png)
![gallery mobile](kinetic/gallery-mobile.png)
![album desktop](kinetic/album-desktop.png)
![album mobile](kinetic/album-mobile.png)

</details>

---

## Production notes

- Switching: cookie `site-theme` + floating picker on every page; `?theme=<id>` deep links work too.
- Light/dark: shared toggle bottom-right; each theme designs both modes.
- The theme system is structural: each variant owns its full layout (`src/themes/<id>/`), not just tokens.
- `SCREENSHOTS.md` regenerable: `bash docs/screenshots.sh` with the dev server running on :4322.
- All facts in rewritten copy remain true (Cologne, TanStack/Hono/Elysia/Effect, Japan 2026 trip, real projects).
