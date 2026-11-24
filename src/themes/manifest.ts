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
import * as bento from "./bento";
import * as bohemian from "./bohemian";
import * as brutalist from "./brutalist";
import * as claymorphism from "./claymorphism";
import * as classic from "./classic";
import * as cybercore from "./cybercore";
import * as editorial from "./editorial";
import * as ethereal from "./ethereal";
import * as isometric from "./isometric";
import * as kinetic from "./kinetic";
import * as luxe from "./luxe";
import * as maximalism from "./maximalism";
import * as neon from "./neon";
import * as neumorphism from "./neumorphism";
import * as pixel from "./pixel";
import * as retro_os from "./retro-os";
import * as riso from "./riso";
import * as scrapbook from "./scrapbook";
import * as sketch from "./sketch";
import * as sticker from "./sticker";
import * as surrealism from "./surrealism";
import * as synthwave from "./synthwave";
import * as terminal from "./terminal";
import * as victorian from "./victorian";
import * as wabi_sabi from "./wabi-sabi";
import * as y2k from "./y2k";

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
  claymorphism: claymorphism as ThemeModule,
  cybercore: cybercore as ThemeModule,
  scrapbook: scrapbook as ThemeModule,
  surrealism: surrealism as ThemeModule,
  y2k: y2k as ThemeModule,
  pixel: pixel as ThemeModule,
  synthwave: synthwave as ThemeModule,
  neumorphism: neumorphism as ThemeModule,
  bento: bento as ThemeModule,
  maximalism: maximalism as ThemeModule,
  sketch: sketch as ThemeModule,
  ethereal: ethereal as ThemeModule,
  bohemian: bohemian as ThemeModule,
  victorian: victorian as ThemeModule,
  "wabi-sabi": wabi_sabi as ThemeModule,
};

export function themeModule(id: string): ThemeModule {
  return modules[(THEME_IDS as string[]).includes(id) ? (id as ThemeId) : "classic"];
}
