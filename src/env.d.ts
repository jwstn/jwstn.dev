/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    theme: import("#/themes/registry").ThemeId;
  }
}
