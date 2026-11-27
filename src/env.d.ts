/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    theme: import("#/themes/registry").ThemeId;
  }
}

interface ImportMetaEnv {
  readonly LASTFM_API_KEY?: string;
  readonly LASTFM_USERNAME?: string;
}
