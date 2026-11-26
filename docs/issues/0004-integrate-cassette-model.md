# 0004 — Integrate the cassette model fluently

**Status:** open · **Scope:** isometric `CassetteScene.astro` + `theme.css`

## Context

The cassette scene currently sits in a bordered, captioned figure box ("FIG. 00 — cassette
study…"). The box reads like a separate panel; the model should feel part of the page.

## Tasks

- [ ] Remove the caption/subtext under the model (the `FIG. 00` line).
- [ ] Remove the border, background and frame around the scene.
- [ ] Keep the drafting-paper page showing through; let the model float directly on the page.
- [ ] Keep sizing, orbit/drag behaviour and the WebGL fallback working; keep the mobile
      static-scene behaviour (no scroll trapping).

## Acceptance

- No visible box around the model; no caption.
- Scene still interactive on pointer-fine devices and static/safe on touch.
