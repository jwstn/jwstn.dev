// Central registry of all selectable themes.
// `classic` is the pre-existing design and the default for visitors without a cookie.

export const THEME_COOKIE = "site-theme";
export const DEFAULT_THEME = "classic";

export interface ThemeMeta {
  id: string;
  label: string;
  blurb: string;
}

export const THEMES: ThemeMeta[] = [
  { id: "classic", label: "Classic", blurb: "The original jwstn.dev look." },
  { id: "editorial", label: "Editorial", blurb: "Swiss magazine: grid lines, oversized headlines, index numbering." },
  { id: "brutalist", label: "Brutalist", blurb: "Thick borders, hard offset shadows, acid colors." },
  { id: "terminal", label: "Terminal", blurb: "Phosphor green, scanlines, boot-sequence intro." },
  { id: "neon", label: "Neon", blurb: "Dark gradients, glow, chromatic accents." },
  { id: "riso", label: "Riso Zine", blurb: "Warm paper, duotone ink, grain, registration marks." },
  { id: "sticker", label: "Sticker", blurb: "Rounded blobs, bouncy springs, hand-drawn arrows." },
  { id: "aurora", label: "Aurora", blurb: "Frosted translucent panels, gradient-mesh skies." },
  { id: "luxe", label: "Minimal Luxe", blurb: "Huge whitespace, elegant serif, whisper-quiet." },
  { id: "retro-os", label: "Retro OS", blurb: "Windows-95 window chrome, taskbar, bevels." },
  { id: "kinetic", label: "Kinetic", blurb: "Marquees, oversized sliding type, scroll-driven reveals." },
];

export const THEME_IDS = THEMES.map((t) => t.id);

export type ThemeId = (typeof THEMES)[number]["id"];

export function isThemeId(value: string | undefined | null): value is ThemeId {
  return THEME_IDS.includes(value as ThemeId);
}

export function themeLabel(id: string): string {
  return THEMES.find((t) => t.id === id)?.label ?? id;
}
