import mdx from "@astrojs/mdx"
import sitemap from "@astrojs/sitemap"
import { defineConfig, fontProviders } from "astro/config"

import tailwindcss from "@tailwindcss/vite"

import vercel from "@astrojs/vercel"

// https://astro.build/config
export default defineConfig({
  site: "https://jwstn.dev",
  integrations: [mdx(), sitemap()],

  vite: {
    plugins: [tailwindcss()],
  },

  adapter: vercel(),
})
