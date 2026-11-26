# 0008 — Simplify the footer to the copyright line

**Status:** done · **Scope:** isometric `Layout.astro` + `theme.css`

## Context

The footer currently renders a drafting title block: `© 2026 jwstn · Sheet 01 — drawn in
Cologne · Scale 1:1 · social links`, inside a bordered bar.

## Tasks

- [x] Remove the `Sheet 01 — drawn in Cologne` and `Scale 1:1` cells.
- [x] Remove the title-block bar itself (border, shadow, cell dividers).
- [x] Keep only `© 2026 jwstn`.

## Acceptance

- Footer shows a single quiet copyright line; no bar, no extra cells.
