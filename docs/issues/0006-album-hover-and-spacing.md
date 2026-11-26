# 0006 — Album wall: remove photo hover effect, tighten caption spacing

**Status:** open · **Scope:** isometric `Album.astro` + `theme.css`

## Tasks

- [ ] Remove the hover/focus effect that straightens the tilted photos (and its transition).
      The static isometric tilt stays.
- [ ] Remove the now-inaccurate line "Plates straighten on approach — scale 1:1" from the
      album page.
- [ ] Slightly reduce the vertical gap between a photo caption and the next photo
      (row gap `2.6rem` → about `2rem`).

## Acceptance

- Photos keep their tilt while hovered/focused; nothing animates on hover.
- Caption → next image spacing is visibly tighter but still breathable.
