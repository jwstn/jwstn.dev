# Theme Contract — portfolio-variants

You are implementing ONE theme of a multi-theme portfolio site. This document is the binding contract.
Read it fully before writing any code.

## How the theme system works

- The site runs in SSR mode. `src/middleware.ts` reads the `site-theme` cookie into `Astro.locals.theme`.
- Route pages in `src/pages/**` are thin dispatchers: they load data, pick the theme module from
  `src/themes/manifest.ts`, and render **only your page component** (e.g. `<T.Projects projects={…} />`).
- **Your page components MUST self-wrap**: each renders its own `<Layout title={…} description={…}>`
  from your theme directory around its content — exactly like `src/themes/classic/Home.astro` and
  `src/themes/_stub/*.astro` do. The dispatcher never wraps `Layout` for you.
- Each theme lives in `src/themes/<id>/` and is completely self-contained: it must never import from
  another theme's directory, from `src/layouts/**`, or from `src/components/ui/**` (those belong to `classic`).
- The visitor switches themes via the shared floating picker (`src/themes/shared/ThemeSwitcher.astro`) and
  light/dark mode via the mode script in `src/themes/shared/MetaTags.astro`. You include both; you never
  reimplement them.
  - The picker stores the choice in `localStorage` and mirrors it to the `site-theme` cookie (the server
    needs it because themes are structural). `?theme=<id>` is a preview/share link only; the picker
    strips it when switching so the saved theme wins.
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
| `@fontsource/press-start-2p`         | Press Start 2P (8-bit pixel display) |
| `@fontsource/space-mono`             | Space Mono (retro mono)              |
| `@fontsource-variable/dm-sans`       | DM Sans (retro-clean body)           |
| `@fontsource/audiowide`              | Audiowide (synthwave chrome display) |
| `@fontsource-variable/fraunces`      | Fraunces (earthy/wonky display serif)|
| `@fontsource/permanent-marker`       | Permanent Marker (marker annotations)|

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

## 3. terminal — CRT console (reworked with 8bitcn/ui patterns)
- **Fonts:** Geist Mono everywhere (already installed).
- **Feel:** phosphor green-on-black (light mode = "paper white/amber terminal" e.g. amber-on-cream —
  still terminal, not a normal light theme). Scanline overlay, subtle text glow.
- **Signature:** boot-sequence home page (`$ whoami` typed out, then the bio as command output),
  nav as a command bar or `ls`-style directory listing, projects as `cat projects.txt`-style output
  blocks, ASCII dividers. Title bar with window controls.
- **Motion:** typing/cursor blink, line-by-line reveal. Use `transitions={false}` if view transitions
  break the boot effect.
- **Dark is the hero mode; light is the "old paper terminal".**
- **8bitcn rework direction:** keep the phosphor-CRT identity (scanlines, boot
  sequence, green-on-black hero mode). Upgrade the chrome using 8bitcn/ui patterns
  from `docs/reference/8bitcn/`: rebuild your window frames, buttons, badges, tables
  and the blog empty-state dialog with their radius-0 chunky-border recipe, adopt
  their token-pairing discipline (see retro-globals.css), and consider Press Start
  2P for headings with Space Mono for prose if it reads better than Geist Mono.
  Attribution comment in theme.css required.

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

## 9. retro-os — Windows 95 desktop (reworked with 8bitcn/ui patterns)
- **Fonts:** VT323 for in-window UI text (or Space Grotesk if VT323 hurts readability at small sizes —
  your call, maybe VT323 for chrome/headings, Inter for long prose).
- **Feel:** teal desktop (light = classic teal, dark = "windows 98 plus! night" dark grey/teal),
  beveled 2 px borders (outset/inset), title bars with gradient, checkerboard or solid desktop.
- **Signature:** every page section is a window with title bar + min/max/close buttons; nav is the
  taskbar (start button = home, taskbar buttons for sections, clock in the systray showing real time);
  projects as desktop icons or Explorer list view; blog empty state = empty folder with a "no files
  found" dialog; footer as status bar with sunken panels.
- **Motion:** near-none. Instant. This theme's charm is chrome, not motion.
- **8bitcn rework direction:** keep the Win95 desktop structure (taskbar, Explorer,
  Notepad windows, status bars, systray clock) but rebuild the chrome with 8bitcn/ui
  patterns from `docs/reference/8bitcn/`: swap subtle 2px bevels for their radius-0
  thick-border + hard-shadow recipe, use their retro token palettes as light/dark
  pairs (retro-globals.css has several proven sets), Press Start 2P for title bars
  and menu labels + VT323 for body, and study `retro-mode-switcher.tsx` +
  `dialog.tsx` + `alert.tsx` for the blog empty-state and window-chrome structure.
  Attribution comment in theme.css required.

## 10. kinetic — motion-first poster site
- **Fonts:** Anton for oversized display, Space Grotesk body.
- **Feel:** poster-like: massive type filling the viewport, high contrast, one electric accent
  (e.g. electric blue on off-white / acid yellow on black for dark).
- **Signature:** marquees (infinite scrolling text bands between sections), huge sliding headline
  on load, scroll-driven reveals (translate/opacity via `animation-timeline: view()` where supported,
  graceful fallback), numbers as graphics. The home hero should MOVE within 1 s of landing.
- **Motion rules still apply:** everything off under `prefers-reduced-motion`. Consider
  `transitions={false}` if ClientRouter fights your scroll animations.

## 11. isometric — 2.5D drafting table
- **Fonts:** Space Grotesk (display + body), Geist Mono for measurements, labels and axis annotations.
- **Feel:** light = drafting-paper workshop (warm off-white with a fine 30° isometric grid);
  dark = night drafting desk (deep blue-black with a glowing grid). One technical accent
  (drafting blue or safety orange).
- **Signature:** everything sits in space. Cards are extruded 2.5D panels — build cube faces with CSS
  (a top face via `transform: rotateX(60deg) rotateZ(45deg)`-style planes, or skewed pseudo-elements);
  hero headline beside a **live three.js cassette study** (JW's walkman + tape shelf model, ported to
  `src/themes/isometric/three/` and framed like a drafting figure — tapes draggable into the deck, space
  draggable to orbit); measurement ticks, dimension lines with arrowheads and coordinate labels
  (N3 E12 etc.) as decorative furniture; projects as blocks on an exploded-view diagram; nav as a flat
  "control panel" plate.
- **Photos:** place gallery photos onto isometric planes (transform: skew) — a photo wall of tilted
  frames; straighten on hover/focus for viewing.
- **Motion:** cubes bob (small translateY loops, staggered), panels gain depth on hover
  (translateZ/shadow growth), grid can subtly scroll. All off under `prefers-reduced-motion`.
- **Restraint:** isometric flourishes decorate; text stays flat and readable (no skew on body copy).
  AA contrast in both modes.

---

# Second-wave theme briefs (style-list additions)

Same rules as above: every theme structural, both modes designed, CSS scoped, motion matched to
character, reduced-motion respected, facts true, tone free.

## 12. claymorphism — puffy 3D clay
- **Fonts:** Baloo 2 (display + body — rounded like the shapes), Geist Mono for small labels.
- **Feel:** light = cream/mint/pastel playroom, dark = deep plum with candy-clay pastels. Everything
  looks pressable: inflated rounded rectangles (radius ≥ 1.5rem), two-layer soft shadows (dark below,
  light above) creating a chunky 3D clay depth.
- **Signature:** clay nav pills, clay project cards with inner "pressed-in" labels, hero headline on a
  big clay slab, tags as little clay blobs. Photos in puffy clay frames with thick rounded mats.
- **Motion:** squish — press scales 0.97 with soft ease; hover lifts gently. Feels like touching clay.

## 13. cybercore — industrial HUD / glitch tech
- **Fonts:** Archivo Black (stencil-ish display), Space Mono (mono body), Geist Mono for data.
- **Feel:** light = "lab spec sheet" (white + hazard yellow + industrial gray); dark = matte black +
  acid green HUD with cyan data accents. NOT neon-glow cyberpunk — this is industrial/military tech.
- **Signature:** HUD frame corners on panels (L-shaped brackets), hazard/striped tape dividers, glitch
  text effect on hover (RGB-split via text-shadow), data readout rows (timestamped, monospaced), barcode
  furniture, blinking status dots. Projects as "mission files" with classification stamps
  (e.g. [ACTIVE], [WIP]).
- **Motion:** abrupt glitch snaps; everything off under reduced-motion. Glitch must never impede reading.

## 14. scrapbook — polaroids and washi tape
- **Fonts:** Permanent Marker (headlines/annotations), Caveat (handwritten captions), Inter (body).
- **Feel:** light = kraft-paper desk (hero); dark = late-night desk lamp (dark kraft, warm lamp glow,
  same paper furniture). Paper everywhere: torn edges, ruled notebook sections, graph-paper blocks.
- **Signature:** photos as polaroids with thick white frames + handwritten captions, washi-tape strips
  holding cards (semi-transparent colored rectangles, slight rotation), doodle underlines/arrows (SVG),
  dates as stamped ink. Gallery pages shine here — treat every album as a scrapbook spread.
- **Motion:** none — paper doesn't move. Maybe a gentle tape "press-down" on hover.

## 15. surrealism — dream logic
- **Fonts:** Newsreader (elegant serif display, italic for the uncanny), Inter body.
- **Feel:** light = pale dream sky with impossible floating objects; dark = midnight gallery with
  spotlight-on-art. Either way: unexpected scale juxtapositions.
- **Signature:** hero headline with words floating at different scales/rotations, a floating object or
  two in CSS (a door, a fish, an eye — simple shapes fine), horizon lines in impossible places,
  projects as "exhibits" with museum-style labels. Copy can lean into the dream voice while staying true.
- **Motion:** slow drifts (float loops, 8-15s, small amplitude) — dreamlike, never busy.

## 16. y2k — chrome bubbles and holographic optimism
- **Fonts:** Baloo 2 (bubbly display, heavy weights) or Audiowide for tech accents, Inter body.
- **Feel:** light = frosted-holographic pastels (lavender, baby blue, silver chrome); dark = deep
  purple/navy with iridescent gradients. Early-2000s tech optimism: glossy, bubbly, optimistic.
- **Signature:** chrome/liquid-metal gradients on display text (gradient text + highlight), bubbly
  pill buttons with glossy top highlights (inset shadow), holographic card borders (gradient border via
  background-clip), bubbly "loading bar" furniture, sparkle/divot texture via radial-gradient dots.
- **Motion:** bubble pops (scale with overshoot), glossy shine sweeps on hover.

## 17. pixel — 8-bit RPG quest log
- **Fonts:** Press Start 2P (display/chrome), VT323 (body prose).
- **Feel:** light = "overworld" day palette (pale sky, grass greens, warm accents); dark = "cave/
  dungeon" palette (deep navy, torch orange). RPG dialogue boxes throughout.
- **Signature:** USE the 8bitcn/ui reference in docs/reference/8bitcn/ (MIT, attribution comment
  required): retro-globals.css has full light/dark token pairs; study the game blocks on
  https://www.8bitcn.com/docs/blocks (Quest Log, Save Slots, XP Milestones, Enemy Health) and port
  equivalents in scoped CSS. Home = character sheet / main menu (JW, class: Full-Stack Developer,
  Cologne guild). Projects as quests with XP rewards and status. Blog empty state = empty save-slot
  screen. Footer = XP bar. Gallery = item inventory grid.
- **Motion:** steps() only; 2-frame idle bobs; everything off under reduced-motion.

## 18. synthwave — 80s sunset grid
- **Fonts:** Audiowide (chrome display), Space Grotesk body.
- **Feel:** dark = the hero: deep purple-to-black sky, magenta/cyan gradient sun with scanline slits,
  perspective grid floor (CSS transform), horizon glow. Light = "dayglo 80s daytime" (pale pink/lilac
  sky, same grid in ink) — must still read clearly as synthwave.
- **Signature:** perspective grid at the page bottom (fixed, subtle), gradient chrome text on the hero,
  cards as chrome-framed panels with neon edge lighting, track lines. Photos get a subtle magenta duotone
  treatment on hover.
- **Motion:** slow sun/grid shimmer; neon pulse on hover. Distinguish from neon theme: this is retro
  1984, not a modern city.

## 19. neumorphism — soft extruded UI
- **Fonts:** Outfit (clean geometric sans, light weights for display).
- **Feel:** the mode IS the design: light = single soft gray-beige field; dark = single deep graphite
  field. One accent color used sparingly. The signature is the dual-shadow carving: extruded raised
  (light top-left shadow + dark bottom-right) and pressed-in (inverted) states on the same background.
- **Signature:** nav as a raised bar, cards raised, active/pressed states sunken, toggles/dates as
  carved-in text, progress-like tag chips carved. Photos in extruded frames.
- **Restraint:** neumorphism lives on subtle contrast — ensure AA: keep text ≥ 4.5:1 against the field,
  carve with shadows not color. No harsh borders anywhere.

## 20. bento — modular grid
- **Fonts:** Inter (everything, tight sizes) with Geist Mono for metadata labels.
- **Feel:** light = Apple-keynote white with soft-shadowed rounded cards; dark = macOS-dark graphite.
  The layout is the identity: a dense, orderly bento grid — mixed card sizes (2x2, 2x1, 1x1) that sum
  to a full-width rectangle on desktop and stack cleanly on mobile.
- **Signature:** home = bento of identity (big intro card, tech-stack card, photo-of-the-day card,
  stats card, social card); projects index = bento cards sized by importance (most recent = large);
  gallery = bento photo mosaic with mixed spans; footer = a full-width flat card. Card chrome: generous
  radius, very soft shadows, tiny icon accents (inline SVG).
- **Motion:** subtle lift on hover; nothing else. Orderly, confident, premium.

## 21. maximalism — more is more
- **Fonts:** deliberately clashing: Archivo Black display, Newsreader italic interjections, Caveat
  annotations, Inter body. Different voices per element.
- **Feel:** light = saturated party (confetti colors on cream, patterns behind patterns); dark =
  midnight carnival (rich jewel tones). Density is the point — but AA contrast and readability per
  element still required.
- **Signature:** layered ornament (rotated starbursts, marquee ribbons, patterned section backdrops
  via repeating-gradients), overlapping elements with hard shadows, every section a different accent
  color, tags as exclamation-chips, giant emoji-free iconography (SVG sparkles/stars/bursts). Where
  other themes say less, this one says more — more labels, more annotations, more joy.
- **Motion:** busy but respectful: rotating bursts, marquee ticker, hover wiggles. All off under
  reduced-motion.

## 22. sketch — pencil concept art on paper
- **Fonts:** Permanent Marker (headlines), Caveat (body-ish notes where legible), Space Mono (wireframe
  labels and measurements).
- **Feel:** light = white graph paper (fine gray grid); dark = blueprint paper inverted (deep navy
  sheet, pale lines). Pencil-gray ink with one red-pencil accent for corrections/annotations.
- **Signature:** every element looks hand-drawn: wobbly borders (border-radius jitter or SVG paths),
  scribble-fill hatching (repeating-linear-gradient), doodle arrows, "v4 FINAL final" style annotations,
  photos as taped-in reference prints with corner ticks, body text on ruled lines. Projects as concept
  sheets with callouts pointing to features.
- **Motion:** pencil "draw-in" on borders (stroke-dashoffset) if cheap; else none.

## 23. ethereal — mist and light
- **Fonts:** Cormorant Garamond (light, airy serif, large sizes, generous leading), Outfit light for
  small labels.
- **Feel:** light = fog-white with pale rose/lavender tints; dark = deep indigo night mist with soft
  moonlit glow. Everything breathes: huge vertical whitespace, near-transparent surfaces.
- **Signature:** blurred gradient "clouds" drifting behind content (fixed, very low contrast, never
  under body text), headlines with wide tracking and italic accents, images as soft-edged memories
  (generous radius + faint bloom shadow), links as quiet underlines that deepen on hover.
- **Motion:** extremely slow cloud drift; opacity-only hovers; nothing else. The quietest theme.

## 24. bohemian — desert artisan
- **Fonts:** Fraunces (earthy, slightly wonky display serif — use optical sizing), Inter body.
- **Feel:** light = sun-bleached desert (sand, terracotta, sage, clay rose); dark = dusk over the
  desert (deep umber, warm lamplight accents, same palette darkened). Textile warmth.
- **Signature:** woven-pattern section dividers (repeating-gradient stripes/geometrics like kilim
  bands), tassel/diamond motifs, sun and arch shapes (arched photo frames — border-radius on top),
  projects as market-goods cards with hand-stamped labels, gallery as a woven blanket grid.
- **Motion:** near-none; warm 150ms fades.

## 25. victorian — letterpress engraving
- **Fonts:** Cormorant Garamond (display, small caps + letterspacing), Inter for UI labels only.
- **Feel:** light = aged ivory paper stock, ink black, oxblood-red accent; dark = midnight leather
  binding with gold-foil accent. Ornament with discipline.
- **Signature:** ornamental borders (double rules, corner flourishes via CSS/SVG), drop caps on prose,
  roman numerals for lists, horizontal rules as fleuron bands (❦-like SVG), headlines in engraved
  capitals, projects as catalogue entries ("No. IV — On the Construction of..."), dates in old-style
  figures. Footer as a printer's imprint.
- **Motion:** none. Static dignity.

## 26. wabi-sabi — imperfect quietude
- **Fonts:** Newsreader (serif with human warmth), Inter for tiny labels.
- **Feel:** light = unbleached washi paper, sumi-ink grays, one muted persimmon accent; dark = charcoal
  ink night with the same accent warmed. Beauty of the unfinished: asymmetry, emptiness, raw texture.
- **Signature:** off-center compositions (hero pushed left with a wide empty right), elements slightly
  rotated or imperfectly aligned on purpose, visible "raw edges" (torn-paper dividers, rough texture
  via SVG noise — subtle), plenty of ma (negative space), dates as small hanko-style stamps. Photos in
  thin ink frames with generous paper margins.
- **Motion:** one gentle fade per page; nothing else. Imperfection never jitters.
