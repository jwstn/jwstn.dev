import sitemap from "@astrojs/sitemap";
import vercel from "@astrojs/vercel";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://www.jwstn.dev",
  output: "server",
  integrations: [sitemap()],


  vite: {
    plugins: [tailwindcss()],
  },

  adapter: vercel(),
});
