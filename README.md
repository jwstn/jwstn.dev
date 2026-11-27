# jwstn.dev

Personal site for JW: projects, photographs, the occasional blog post and recent
Last.fm listening.

## Stack

- TanStack Start + React 19 + Vite 8
- Tailwind v4 with the isometric theme in `src/styles`
- Effect TS for all server-side execution
- Content Collections + Effect Schema for Markdown/JSON content
- `vite-imagetools` for build-time WebP derivatives
- Three.js for the home cassette scene
- Nitro on Vercel

## Commands

```sh
pnpm dev            # Vite dev server on http://localhost:3000
pnpm build          # content + feeds + images + app
pnpm start          # run the built Nitro server
pnpm content:build  # regenerate typed collections and Markdown HTML
pnpm feeds:build    # emit RSS feeds and sitemaps into public/
pnpm check:ci       # non-mutating Biome check
pnpm typecheck      # tsc --noEmit
pnpm test           # Vitest (@effect/vitest)
pnpm smoke          # route/feed/sitemap/cache smoke test (server running)
pnpm screenshots    # capture the TanStack site into docs/screenshots-tanstack
pnpm visual:diff    # pixel-diff against docs/screenshots
```

## Content

- Blog posts: `src/content/blog/*.md`
- Projects: `src/content/projects/*.md`
- Albums: `src/content/gallery/*.json`
- Images: `src/assets/<album>/`
- Dates are ISO `YYYY-MM-DD`; image paths are relative to the content file.

The `docs/screenshots` baseline was captured from the final Astro site with its dev
toolbar disabled. `/music` is excluded from the pixel diff because it renders live
Last.fm data; its three states are covered by the service tests and smoke checks.

## Deployment

The app builds through Nitro for Vercel. `LASTFM_API_KEY` is server-only;
`LASTFM_USERNAME` defaults to `jwstn`. See `docs/migration-tanstack-start.md` for
the full architecture and cutover plan.
