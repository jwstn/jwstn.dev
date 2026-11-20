# 8bitcn/ui reference (for the terminal + retro-os reworks)

Source: https://www.8bitcn.com/ — 8bitcn/ui by OrcDev & contributors, MIT License
(https://github.com/TheOrcDev/8bitcn-ui). The files in this directory are verbatim
extracts of their component sources and design tokens, mirrored here as reference
material for reworking the `terminal` and `retro-os` themes. Keep the MIT
attribution comment in any theme.css that ports substantial CSS from these files.

## What's here

- `globals.css` — their full token/util stylesheet (pixel utilities, animations like
  `pixel-nudge-right`, theme classes e.g. `.theme-pixel-forest`)
- `retro-globals.css` — their built-in retro THEME token sets, each with light AND
  dark variants. Three font pairings to know:
  - `--font-*: VT323` (~line 761) — pixel terminal look
  - `--font-*: "Press Start 2P"` (~line 877) — 8-bit arcade look, with
    `--radius: 0rem` and `--tracking-normal: 0.05rem`
  - `--font-sans: DM Sans; --font-mono: Space Mono` (~line 645) — retro-clean look
- Component sources (React/Tailwind, port the PATTERNS to Astro + scoped CSS, do not
  install or import these as JS): `button.tsx`, `card.tsx`, `dialog.tsx`,
  `alert.tsx`, `badge.tsx`, `table.tsx`, `tabs.tsx`, `separator.tsx`,
  `input.tsx`, `retro-mode-switcher.tsx`

## How to use it

These are React components from a shadcn-style library — our themes are Astro +
CSS only. Port the visual language, not the framework:

- Read the token sets in `retro-globals.css` and adapt the palettes (scoped under
  your `html.theme-<id>` / `.dark` blocks) — they are proven light+dark pairs.
- Read component sources for structure ideas (card/dialog/alert/table markup and
  their Tailwind class stacks) and rebuild them as scoped CSS in your `theme.css`.
- 8bitcn's signature: `--radius: 0rem`, thick high-contrast borders, hard offset
  shadows, steps() easing, pixel fonts (Press Start 2P / VT323), generous tracking.
- Fonts are preinstalled: `@fontsource/press-start-2p`, `@fontsource/space-mono`,
  `@fontsource-variable/dm-sans`, plus the previously installed `@fontsource/vt323`.
  Import them in your `theme.css` like any other fontsource package.

## Constraints (unchanged)

All the normal contract rules still apply: only touch your own theme directory, no
package installs, no builds, no commits, all CSS scoped, both modes designed, WCAG
AA, `prefers-reduced-motion` respected, facts in copy stay true.
