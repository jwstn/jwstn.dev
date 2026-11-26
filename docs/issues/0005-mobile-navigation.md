# 0005 — Mobile navigation for the isometric theme

**Status:** done (incl. follow-up) · **Scope:** isometric `Layout.astro` + `theme.css`

## Context

At mobile widths the isometric header still shows the desktop control-panel keys (wrapped
into rows). It needs a navigation designed for small screens.

## Tasks

- [x] Add a burger toggle visible below `48rem`, with an accessible label and `aria-expanded`.
- [x] Collapse Projects / Blog / Gallery + GitHub / Bluesky into a panel that opens from the
      header plate (drafting/control-panel styling, not a generic drawer).
- [x] Close on link activation and on `Escape`; reset state on view-transition navigation.
- [x] Keep the desktop layout unchanged at `≥48rem`.
- [x] Ensure 44 px touch targets and visible focus styles.

## Acceptance

- At 375 px the header shows brand + burger only; the panel opens with all five links.
- Desktop nav is visually identical to before.
- Keyboard: toggle reachable, `aria-expanded` correct, `Escape` closes.

## Follow-up (state model fix)

- [x] Outside clicks close the open panel (previously only the burger toggled it).
- [x] The header plate no longer lifts on hover — hover movement removed from the header.
- [x] The burger's visual state is driven by the menu being open (pressed into the plate,
      primary fill), not by hover; `aria-expanded` stays in sync.
- [x] Resizing to desktop widths closes the panel.
