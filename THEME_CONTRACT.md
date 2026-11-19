# Theme Contract — portfolio-variants

You are implementing ONE theme of a multi-theme portfolio site. This document is the binding contract.
Read it fully before writing any code.

## How the theme system works

- The site runs in SSR mode. `src/middleware.ts` reads the `site-theme` cookie into `Astro.locals.theme`.
- Route pages in `src/pages/**` are thin dispatchers: they load data, pick the theme module from
  `src/themes/manifest.ts`, and render `<T.Layout><T.SomePage /></T.Layout>`.
- Each theme lives in `src/themes/<id>/` and is completely self-contained: it must never import from
  another theme's directory, from `src/layouts/**`, or from `src/components/ui/**` (those belong to `classic`).
- The visitor switches themes via the shared floating picker (`src/themes/shared/ThemeSwitcher.astro`) and
  light/dark mode via the mode script in `src/themes/shared/MetaTags.astro`. You include both; you never
  reimplement them.
- `classic` (`src/themes/classic/`) is the original site design, kept as the default. Do not modify it.

## Files you create — exactly this shape

```
src/themes/<id>/
  index.ts        # exports: Layout, Home, Projects, Project, Blog, Post, Gallery, Album (all default exports)
  Layout.astro    # full <html> document: head, nav, footer, switcher
  Home.astro
  Projects.astro
  Project.astro
  Blog.astro
  Post.astro
  Gallery.astro
  Album.astro
  theme.css       # your fonts + scoped CSS variables + custom CSS
  + any helper .astro components you want, imported relatively
```

`index.ts` must re-export the eight page components exactly like `src/themes/classic/index.ts` does
(`export { default as Album } from "./Album.astro";` etc.). Replace the placeholder
`export ... from "#/themes/_stub"` line that currently sits in your `index.ts`.

## Component signatures (binding — the dispatchers pass exactly these props)

Typed in `src/themes/types.ts` — import the matching `*Props` type from there and cast `Astro.props`.

| Component    | Props                                            |
| ------------ | ------------------------------------------------ |
| `Layout`     | `{ title: string; description?: string }`        |
| `Home`       | none                                             |
| `Projects`   | `{ projects: Project[] }`                       |
| `Project`    | `{ project: Project; Content: ContentComponent }` |
| `Blog`       | `{ posts: Post[] }`                              |
| `Post`       | `{ post: Post; Content: ContentComponent }`      |
| `Gallery`    | `{ albums: Album[] }`                            |
| `Album`      | `{ album: Album }`                               |

Render the markdown body as `<Content />` inside `Project` and `Post`.

## Layout requirements (every theme)

- `<html lang="en" class="theme-<id>">` — the class is your CSS scope, keep it.
- `<head>`: render `<MetaTags title={title} description={description} />` from `#/themes/shared/MetaTags.astro`
  (it imports the shared Tailwind entry and handles mode + view transitions). Then import your `./theme.css`
  in the frontmatter. You may pass `transitions={false}` to MetaTags if your animations need full page loads
  (kinetic, terminal: consider this).
- Nav must link: **jwstn.dev → /**, **Projects → /projects**, **Blog → /blog**, **Gallery → /gallery**
  (blog is in the nav for all new themes), plus GitHub and Bluesky from `SOCIALS` in `#/lib/content`.
- Footer: `© <current year> jwstn` + the social links. Styling is yours.
- Include `<ThemeSwitcher />` from `#/themes/shared/ThemeSwitcher.astro` once, inside `<body>`.
- Mobile: navigation must be usable at 375 px width (drawer, wrap, or collapsing menu — your call).
- Set body classes freely (`bg-background text-foreground` etc.).

## CSS rules (critical — 11 themes ship in one bundle)

- **Never** write `@import "tailwindcss"` — `MetaTags` already loads it via `shared/base.css`.
- Your `theme.css` MUST scope everything: raw variables and custom selectors under `html.theme-<id>`
  (dark mode: `html.theme-<id>.dark { … }`). Never style bare `body`, `h1`, `a` — those would leak
  into other themes.
- Tailwind utility classes (bg-background, text-foreground, font-display, …) are safe: they resolve
  through the variable indirection in `shared/base.css`.
- Define at least these raw vars in `html.theme-<id>` and `html.theme-<id>.dark`:
  `--background --foreground --primary --primary-foreground --secondary --muted --muted-foreground
  --accent --border --card --font-display --font-body --font-mono` — plus anything custom you need.
- Tailwind's `dark:` variant works (base.css declares it). Use it freely in markup.
- Fonts: `@import` only from the installed fontsource packages listed below, inside `theme.css`.
- Motion: CSS only (keyframes, transitions, `@starting-style`, scroll-driven `animation-timeline` if you
  like). Every animation must be disabled or toned down under `@media (prefers-reduced-motion: reduce)`.

## Data you receive (already loaded by the dispatchers)

- **Projects** (`projects` prop): 4 entries. Fields: `id` (slug), `data.title`, `data.description`,
  `data.pubDate` (Date), `data.href` (external link), `data.tags` (string[]), plus markdown body via `Content`.
  Link detail pages as `/projects/${project.id}/`.
- **Blog** (`posts` prop): currently **0 posts — the collection is empty**. Your `Blog.astro` must ship a
  designed empty state ("nothing here yet" in your theme's voice); it will still be screenshot.
  Keep list markup ready for real posts (`data.title`, `data.description`, `data.pubDate`, optional
  `data.heroImage`, `data.updatedDate`; link `/blog/${post.id}/`). `Post.astro` is unreachable for now —
  build it to the same standard anyway (sensible defaults for a hypothetical post are fine).
- **Gallery** (`albums` prop): 3 albums, fields `data.title`, `data.pubDate`, `data.slug`, `data.photos[]`
  with `image` (ImageMetadata: `.src`, `.width`, `.height`), `title`, optional `caption`.
  Link `/gallery/${album.data.slug}/`. Prefer `Image` from `astro:assets` with `widths`/`sizes` like
  `src/themes/classic/Album.astro` does.
- Socials: `SOCIALS` export from `#/lib/content`.
- Format dates with `#/components/FormattedDate.astro` or your own markup.

## Copy rules

Facts stay true (Cologne, TanStack/Hono/Elysia/Effect experiments, Japan 2026 camera trip, the real
project names). Tone is yours to rewrite — lean into your theme's voice (peers/personality audience).
Small presentational additions (section labels, kickers, footnotes, nav wording) are encouraged.
Do not invent achievements, jobs, or awards.

## Fonts installed (only these — no new packages)

| Package                              | Font                   |
| ------------------------------------ | ---------------------- |
| `@fontsource-variable/inter`         | Inter (body/general)   |
| `@fontsource-variable/newsreader`    | Newsreader (serif)     |
| `@fontsource-variable/cormorant-garamond` | Cormorant Garamond (display serif) |
| `@fontsource/archivo-black`          | Archivo Black (display)|
| `@fontsource/anton`                  | Anton (display)        |
| `@fontsource-variable/space-grotesk` | Space Grotesk          |
| `@fontsource/orbitron`               | Orbitron (techy)       |
| `@fontsource/caveat`                 | Caveat (handwriting)   |
| `@fontsource-variable/baloo-2`       | Baloo 2 (rounded)      |
| `@fontsource-variable/outfit`        | Outfit (geometric)     |
| `@fontsource/vt323`                  | VT323 (pixel)          |
| `@fontsource-variable/geist-mono`    | Geist Mono (already used by classic) |

Reference as `font-family: var(--font-display)` etc. by setting `--font-display/--font-body/--font-mono`
to the imported font families in your theme vars, e.g.
`@import "@fontsource-variable/newsreader"; … --font-display: "Newsreader Variable", serif;`

## Hard constraints

- Touch ONLY `src/themes/<id>/` (plus nothing else). Shared files, registry, manifest, pages, package.json
  are off-limits — other agents own them or they are already wired.
- No `pnpm`/`npm` commands, no `astro dev`/`astro build`, no git commits. The integrator (me) does those.
- No new dependencies, no JS frameworks — Astro components + CSS only (inline `<script>` is allowed where
  genuinely needed, keep it tiny).
- Accessibility: semantic landmarks (header/nav/main/footer), alt text on every image, visible focus
  styles, hit areas ≥ 44 px on touch, contrast that passes WCAG AA in BOTH modes.
- Both light and dark modes are required and must both look designed, not inverted leftovers.
- Keep every page usable: real links, no dead ends, nothing clipped or overflowing at 375 px and 1440 px.

## Definition of done (self-check before you report back)

- [ ] `index.ts` exports all eight components from your own files
- [ ] All eight components exist and match the prop contract
- [ ] `theme.css` fully scoped; no bare element selectors; fonts from the list only
- [ ] Light + dark both designed; dark reachable via the shared toggle
- [ ] Blog empty state designed; all other lists render real data
- [ ] Nav works on mobile widths; footer present; `ThemeSwitcher` included once
- [ ] Animations respect `prefers-reduced-motion`
- [ ] No imports outside your dir, `#/themes/shared/**`, `#/themes/types`, `#/lib/content`,
      `#/components/FormattedDate.astro`, `astro:assets`, `astro:content` types

---

# Theme briefs

Each brief describes the direction, not the pixel spec — you own layout and details.
Signature ideas are mandatory; everything else is your craft.

## 1. editorial — Swiss magazine
- **Fonts:** Newsreader for display (use optical sizing, tight leading, big weights), Inter for body.
- **Feel:** gallery-wall white (light) / ink-black (dark); one accent (international orange or klein blue).
- **Signature:** visible grid — thin hairline rules framing the page, masthead with issue numbering
  ("JW — issue №04"), index-style project list (01, 02, 03 …) with hanging indents, huge serif headlines
  with tight tracking. Footer as a colophon.
- **Motion:** hairlines draw in on load, headlines fade-up staggered. Restrained.
- **Gallery:** contact-sheet rows with generous gutters and caption typography like figure listings.

## 2. brutalist — neo-brutalism
- **Fonts:** Archivo Black display, Space Grotesk body.
- **Feel:** raw paper or dark slate, acid accents (lime/magenta/yellow), thick 2–3 px borders everywhere,
  hard offset shadows (translate-on-hover), rotated stickers/badges for tags.
- **Signature:** cards with offset shadow blocks; section titles in full-width black bars; marquee-ish
  ticker for tags; hover states physically "press" elements (translate + shadow collapse).
- **Motion:** hard snaps (steps easing), no soft fades.
- **Dark:** same energy, neon-on-black borders.

## 3. terminal — CRT console
- **Fonts:** Geist Mono everywhere (already installed).
- **Feel:** phosphor green-on-black (light mode = "paper white/amber terminal" e.g. amber-on-cream —
  still terminal, not a normal light theme). Scanline overlay, subtle text glow.
- **Signature:** boot-sequence home page (`$ whoami` typed out, then the bio as command output),
  nav as a command bar or `ls`-style directory listing, projects as `cat projects.txt`-style output
  blocks, ASCII dividers. Title bar with window controls.
- **Motion:** typing/cursor blink, line-by-line reveal. Use `transitions={false}` if view transitions
  break the boot effect.
- **Dark is the hero mode; light is the "old paper terminal".**

## 4. neon — cyberpunk night city
- **Fonts:** Orbitron display, Space Grotesk body.
- **Feel:** dark-first: deep indigo/near-black with magenta→cyan gradient glows. Light mode =
  "day city" — pale lilac glass with the same accents.
- **Signature:** glowing gradient text or borders on the hero, cards as translucent panels with
  1 px neon edges, chromatic-aberration hover on titles, subtle animated background gradient mesh.
- **Motion:** slow hue drift, glow pulses. GLOW, not blur soup — keep text AA-readable.

## 5. riso — risograph zine
- **Fonts:** Archivo Black or Anton for shouty headlines, Caveat for handwritten annotations, Inter
  body (or a mono if you prefer).
- **Feel:** warm off-white paper with visible grain (CSS noise via repeating gradients/SVG data-URI),
  two-ink duotone (e.g. riso blue + riso red/fluoro pink; dark mode = inverted paper, ink stays).
- **Signature:** registration marks + crop marks in page corners, misaligned "second pass" offset on
  headline (text-shadow in the second ink), hand-drawn arrows (SVG) pointing at things, stamps/labels
  rotated slightly. Photos treated with duotone-ish filters (`filter: grayscale + mix-blend`).
- **Motion:** minimal — paper doesn't animate. Page-load "stamp in" ok.

## 6. sticker — playful sticker book
- **Fonts:** Baloo 2 everywhere; heavy weights.
- **Feel:** bright candy background (light = cream with colored dots; dark = deep purple night with
  pastel stickers), chunky rounded cards with white sticker borders + soft drop shadows.
- **Signature:** elements as peel-able stickers (slight random rotations via nth-child), wobbly SVG
  blob shapes behind headings, hand-drawn underlines, bouncy springy hover (scale 1.05 with overshoot),
  sticker-like tags. Projects as trading cards.
- **Motion:** bouncy (cubic-bezier with overshoot), squishy active states.

## 7. aurora — glass over gradient skies
- **Fonts:** Outfit for everything, light weights for display.
- **Feel:** animated gradient-mesh sky background (aurora greens/blues/violets); frosted glass cards
  (backdrop-blur, translucent white borders). Light = morning sky, dark = night aurora (vivid!).
- **Signature:** glass nav pill floating with backdrop blur, cards catching the sky, soft inner glow,
  photos in glass frames. Restrained elegance — no neon.
- **Motion:** sky drifts slowly (respect reduced-motion), cards lift gently on hover.

## 8. luxe — minimal luxury
- **Fonts:** Cormorant Garamond for display at huge sizes, Inter light body, generous letter-spacing
  on small caps labels.
- **Feel:** gallery-white / near-black, gold or champagne single accent, hairline borders, enormous
  whitespace. Type does all the work.
- **Signature:** centered editorial hero, vertical rhythm measured in ems, index pages as elegant
  table-of-contents with leader dots, images full-bleed with generous margins. No cards, no shadows.
- **Motion:** near-none — 150 ms opacity fades at most. Quiet confidence.

## 9. retro-os — Windows 95 desktop
- **Fonts:** VT323 for in-window UI text (or Space Grotesk if VT323 hurts readability at small sizes —
  your call, maybe VT323 for chrome/headings, Inter for long prose).
- **Feel:** teal desktop (light = classic teal, dark = "windows 98 plus! night" dark grey/teal),
  beveled 2 px borders (outset/inset), title bars with gradient, checkerboard or solid desktop.
- **Signature:** every page section is a window with title bar + min/max/close buttons; nav is the
  taskbar (start button = home, taskbar buttons for sections, clock in the systray showing real time);
  projects as desktop icons or Explorer list view; blog empty state = empty folder with a "no files
  found" dialog; footer as status bar with sunken panels.
- **Motion:** near-none. Instant. This theme's charm is chrome, not motion.

## 10. kinetic — motion-first poster site
- **Fonts:** Anton for oversized display, Space Grotesk body.
- **Feel:** poster-like: massive type filling the viewport, high contrast, one electric accent
  (e.g. electric blue on off-white / acid yellow on black for dark).
- **Signature:** marquees (infinite scrolling text bands between sections), huge sliding headline
  on load, scroll-driven reveals (translate/opacity via `animation-timeline: view()` where supported,
  graceful fallback), numbers as graphics. The home hero should MOVE within 1 s of landing.
- **Motion rules still apply:** everything off under `prefers-reduced-motion`. Consider
  `transitions={false}` if ClientRouter fights your scroll animations.
