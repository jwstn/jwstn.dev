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
  { id: "isometric", label: "Isometric", blurb: "2.5D cubes, extruded panels, drafting-table grid." },
  { id: "claymorphism", label: "Claymorphism", blurb: "Puffy 3D clay shapes, soft shadows, squishy pastels." },
  { id: "cybercore", label: "Cybercore", blurb: "Industrial HUD panels, glitch text, hazard stripes." },
  { id: "scrapbook", label: "Scrapbook", blurb: "Polaroids, washi tape, torn paper, handwritten notes." },
  { id: "surrealism", label: "Surrealism", blurb: "Dream logic: floating objects, impossible scenes, sharp serif." },
  { id: "y2k", label: "Y2K", blurb: "Chrome bubbles, holographic gradients, bubbly tech optimism." },
  { id: "pixel", label: "Pixel Art", blurb: "8-bit RPG quest log: XP bars, save slots, sprite furniture." },
  { id: "synthwave", label: "Synthwave", blurb: "80s sunset grid, chrome type, neon horizon glow." },
  { id: "neumorphism", label: "Neumorphism", blurb: "Soft extruded UI, monochrome, dual-shadow carvings." },
  { id: "bento", label: "Bento", blurb: "Apple-style bento grid: modular cards, mixed sizes." },
  { id: "maximalism", label: "Maximalism", blurb: "More is more: clashing type, layered ornament, dense joy." },
  { id: "sketch", label: "Sketch", blurb: "Pencil concept sketches, scribble borders, graph paper." },
  { id: "ethereal", label: "Ethereal", blurb: "Misty pastel light, floating elements, whisper-quiet serif." },
  { id: "bohemian", label: "Bohemian", blurb: "Desert earth tones, textile patterns, sun-baked serif." },
  { id: "victorian", label: "Victorian", blurb: "Letterpress rules, ornamental borders, engraved serif." },
  { id: "wabi-sabi", label: "Wabi-Sabi", blurb: "Imperfect quietude: raw textures, off-center asymmetry." },
];

export const THEME_IDS = THEMES.map((t) => t.id);

export type ThemeId = (typeof THEMES)[number]["id"];

export function isThemeId(value: string | undefined | null): value is ThemeId {
  return THEME_IDS.includes(value as ThemeId);
}

export function themeLabel(id: string): string {
  return THEMES.find((t) => t.id === id)?.label ?? id;
}
