import mdx from "@astrojs/mdx"
import sitemap from "@astrojs/sitemap"
import { defineConfig } from "astro/config"

import tailwindcss from "@tailwindcss/vite"

import vercel from "@astrojs/vercel"

import react from "@astrojs/react"

export default defineConfig({
  site: "https://www.jwstn.dev",
  integrations: [mdx(), sitemap(), react()],

  vite: {
    plugins: [tailwindcss()],
  },

  adapter: vercel(),
})
