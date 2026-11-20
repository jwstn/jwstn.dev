import { THEME_IDS, type ThemeId } from "./registry";

// biome-ignore lint/suspicious/noExplicitAny: Astro components used as values
// are plain callables; fine-grained typing here adds no safety.
type AnyComponent = any;

export interface ThemeModule {
  Layout: AnyComponent;
  Home: AnyComponent;
  Projects: AnyComponent;
  Project: AnyComponent;
  Blog: AnyComponent;
  Post: AnyComponent;
  Gallery: AnyComponent;
  Album: AnyComponent;
}

import * as aurora from "./aurora";
import * as brutalist from "./brutalist";
import * as classic from "./classic";
import * as editorial from "./editorial";
import * as isometric from "./isometric";
import * as kinetic from "./kinetic";
import * as luxe from "./luxe";
import * as neon from "./neon";
import * as retro_os from "./retro-os";
import * as riso from "./riso";
import * as sticker from "./sticker";
import * as terminal from "./terminal";

const modules: Record<ThemeId, ThemeModule> = {
  classic: classic as ThemeModule,
  editorial: editorial as ThemeModule,
  brutalist: brutalist as ThemeModule,
  terminal: terminal as ThemeModule,
  neon: neon as ThemeModule,
  riso: riso as ThemeModule,
  sticker: sticker as ThemeModule,
  aurora: aurora as ThemeModule,
  luxe: luxe as ThemeModule,
  "retro-os": retro_os as ThemeModule,
  kinetic: kinetic as ThemeModule,
  isometric: isometric as ThemeModule,
};

export function themeModule(id: string): ThemeModule {
  return modules[(THEME_IDS as string[]).includes(id) ? (id as ThemeId) : "classic"];
}
