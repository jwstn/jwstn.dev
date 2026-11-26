# 0005 — Mobile navigation for the isometric theme

**Status:** open · **Scope:** isometric `Layout.astro` + `theme.css`

## Context

At mobile widths the isometric header still shows the desktop control-panel keys (wrapped
into rows). It needs a navigation designed for small screens.

## Tasks

- [ ] Add a burger toggle visible below `48rem`, with an accessible label and `aria-expanded`.
- [ ] Collapse Projects / Blog / Gallery + GitHub / Bluesky into a panel that opens from the
      header plate (drafting/control-panel styling, not a generic drawer).
- [ ] Close on link activation and on `Escape`; reset state on view-transition navigation.
- [ ] Keep the desktop layout unchanged at `≥48rem`.
- [ ] Ensure 44 px touch targets and visible focus styles.

## Acceptance

- At 375 px the header shows brand + burger only; the panel opens with all five links.
- Desktop nav is visually identical to before.
- Keyboard: toggle reachable, `aria-expanded` correct, `Escape` closes.
