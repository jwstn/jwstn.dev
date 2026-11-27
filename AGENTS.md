## Development

When starting the dev server, run it in the background:

```
pnpm dev
```

Use the harness/terminal background process controls to stop it. Verify production builds with
`pnpm build` and `pnpm start`.

## Code rules

- Don't extract code into its own file/function unless it is used in more than one place.
  Route-specific data fetching and markup live directly in the route file that needs them.
- Always render images through the shared `ResponsiveImage` component
  (`src/components/ResponsiveImage.tsx`) — never raw `<img>` — so they get optimized formats,
  responsive srcset and correct dimensions.

- Never use text arrow characters (→, ↗, ←, ↑, ↓) in UI copy. Use named `lucide-react` icons
  (e.g. `import { ArrowRight } from "lucide-react"`).

- Wrappers that only re-export or rename an existing API (e.g. `getPosts` around
  `getCollection("blog")`) are unnecessary — call the underlying API at the point of use.

## Design rules

- No page-head bars that repeat the navigation; route names use a visually hidden `<h1>`.
- Content headings (album/post titles) are plain typography, never boxed.
- Don't repeat information already on the page (nav labels, counts) in decorative chrome.
- Isometric depth is built from real planes, **never `box-shadow`**: a face, a solid offset
  back face (`translate(d, d)`, `--iso-side` fill, `--iso-line` outline) and three diagonal
  connectors. The face sinks on press. Buttons use `IsoButton`; nav keys, slabs, stamps,
  panels and frames share the same pseudo-element pattern in `src/styles/theme.css`.
- Gallery thumbnails are flat and uncropped on the detail wall; text appears on hover.

## Task tracking

- Create a GitHub issue **before** starting any change — including a one-line fix or a follow-up
  requested in the middle of another task. New requests get their own issue immediately so
  nothing is lost, and it stays open until the change is committed and pushed.
- Track tasks and follow-ups as GitHub issues in this repository (`gh issue create`), not as
  local issue files. Reference issue numbers in commit messages where useful.
- Work through every issue opened in a review burst, even when new requests arrive quickly.

## Documentation

Full documentation: https://tanstack.com/start/latest/docs/framework/react/overview

Consult these guides before working on related tasks:

- [Routing](https://tanstack.com/router/latest/docs/framework/react/guide/routing)
- [Server functions](https://tanstack.com/start/latest/docs/framework/react/guide/server-functions)
- [Environment variables](https://tanstack.com/start/latest/docs/framework/react/guide/environment-variables)
- [Hosting and Vercel](https://tanstack.com/start/latest/docs/framework/react/guide/hosting)
- [Content Collections](https://www.content-collections.dev/docs)
- [Effect](https://effect.website/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
