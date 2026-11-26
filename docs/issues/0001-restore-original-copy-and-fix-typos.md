# 0001 — Restore original copy and fix typos

**Status:** open · **Scope:** isometric theme copy + site content (projects, gallery, consts)

## Context

Several pages of the isometric theme use copy written during the build. The original
draft text (from the pre-theme site) must be restored wherever it exists, and typos in
the site's own content must be corrected. No new prose.

## Tasks

- [ ] Home hero: keep the original draft verbatim — fix typos only:
  - `Elisya` → `Elysia`
  - `EffectTs` → `Effect`
  - `proved as great opportunity` → `proved to be a great opportunity`
- [ ] Gallery index: restore original title "Pictures of JW" and original intro (typo-fixed:
      "since I wanted **one** for some years now"), replace the rewritten lede.
- [ ] Content — `src/content/gallery/*.json`: fix spelling typos in titles/captions, keep the
      author's voice and phrasing (Chery→Cherry, Stumbeld apon→Stumbled upon, baught→bought,
      lense→lens, challange→challenge, resturant/restrautn→restaurant, incapsules→encapsulates,
      quite→quiet where meant, neighbor hood→neighborhood, for ever→forever, bring it→bringing,
      tokyo/City/cologne capitalisation, hightland→highland, cow's→cows, do symbolize→to symbolize,
      init→innit, Lady Bug→Ladybug, Mothers Day→Mother's Day, missing "rained", etc.).
- [ ] Content — `src/content/projects/*.md`: fix typos and product-name spellings only
      (to scared→too scared, atleast→at least, Tanstack→TanStack, EffectTs→Effect,
      nodejs→Node.js, electron→Electron, tailwindcss→Tailwind CSS, Codemirror→CodeMirror,
      React Query capitalisation).
- [ ] `src/consts.ts`: fix punctuation/spelling of `SITE_DESCRIPTION` (no rewrite).

## Acceptance

- No agent-written prose replaces original draft text on Home or Gallery.
- Content reads as the author's text with spelling/grammar corrected.
- Build passes; no layout regressions.
