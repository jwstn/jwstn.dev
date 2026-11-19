import { DEFAULT_THEME, THEME_COOKIE, isThemeId } from "#/themes/registry";
import { defineMiddleware } from "astro:middleware";

// Resolve the visitor's selected theme and expose it to all pages through
// `Astro.locals.theme`. Precedence:
//   1. ?theme=<id> query param — one-off preview / deep links to a theme
//   2. the `site-theme` cookie — the visitor's saved choice
//   3. the default theme ("classic", i.e. the current design)
export const onRequest = defineMiddleware((context, next) => {
  const query = context.url.searchParams.get("theme");
  const cookie = context.cookies.get(THEME_COOKIE)?.value;
  context.locals.theme = isThemeId(query) ? query : isThemeId(cookie) ? cookie : DEFAULT_THEME;
  return next();
});
