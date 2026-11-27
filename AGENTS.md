## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Code rules

- Don't extract code into its own file/function unless it is used in more than one place.
  Route-specific data fetching and markup live directly in the route file that needs them.
- Wrappers that only re-export or rename an existing API (e.g. `getPosts` around
  `getCollection("blog")`) are unnecessary — call the underlying API at the point of use.

## Design rules

- No page-head bars that repeat the navigation; route names use a visually hidden `<h1>`.
- Content headings (album/post titles) are plain typography, never boxed.
- Don't repeat information already on the page (nav labels, counts) in decorative chrome.
- Isometric primitives use line-drawn depth: face + offset back + three diagonal connectors,
  with the face sinking on press. Buttons use `IsoButton`.
- Gallery thumbnails are flat and uncropped on the detail wall; text appears on hover.

## Task tracking

- Track tasks and follow-ups as GitHub issues in this repository (`gh issue create`), not as local issue files. Reference issue numbers in commit messages where useful.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
