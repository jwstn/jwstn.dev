import { defineMiddleware } from "astro:middleware";
import { DEFAULT_THEME, isThemeId, THEME_COOKIE } from "#/themes/registry";

// Resolve the visitor's selected theme from the cookie and expose it to all
// pages through `Astro.locals.theme`. Invalid or missing values fall back to
// the default theme ("classic", i.e. the current design).
export const onRequest = defineMiddleware((context, next) => {
  const cookie = context.cookies.get(THEME_COOKIE)?.value;
  context.locals.theme = isThemeId(cookie) ? cookie : DEFAULT_THEME;
  return next();
});
