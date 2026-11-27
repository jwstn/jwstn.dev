# jwstn.dev — screenshot report

The Isometric design is now the site's only theme. These captures cover every route in both
viewports, plus the dark-mode home.

**Browse:** `pnpm dev` → <http://localhost:3000>

The `docs/screenshots` baseline was captured from the final Astro site with the dev toolbar disabled. Capture the TanStack port with `pnpm screenshots` (server running on :3000), then compare with `pnpm visual:diff`. `/music` is excluded from the pixel diff because it renders live Last.fm data.

---

## Home

| Desktop | Mobile |
|---|---|
| ![home desktop](home-desktop.png) | ![home mobile](home-mobile.png) |

Dark mode:

![home dark](home-dark.png)

## Projects

| Desktop | Mobile |
|---|---|
| ![projects desktop](projects-desktop.png) | ![projects mobile](projects-mobile.png) |

## Project detail

| Desktop | Mobile |
|---|---|
| ![project desktop](project-desktop.png) | ![project mobile](project-mobile.png) |

## Blog

The blog collection is empty; the page shows its designed empty state.

| Desktop | Mobile |
|---|---|
| ![blog desktop](blog-desktop.png) | ![blog mobile](blog-mobile.png) |

## Gallery

| Desktop | Mobile |
|---|---|
| ![gallery desktop](gallery-desktop.png) | ![gallery mobile](gallery-mobile.png) |

## Album

Dense photo mosaic; captions appear on hover/focus.

| Desktop | Mobile |
|---|---|
| ![album desktop](album-desktop.png) | ![album mobile](album-mobile.png) |

## Music

Top three artists of the last 30 days and recent scrobbles from Last.fm. Requires
`LASTFM_API_KEY`; without it the page shows a graceful “not connected” state. The account owning
the key needs Last.fm Pro (from 1 Dec 2026).

| Desktop | Mobile |
|---|---|
| ![music desktop](music-desktop.png) | ![music mobile](music-mobile.png) |
