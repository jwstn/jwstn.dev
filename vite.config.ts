import contentCollections from "@content-collections/vite";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";
import { imagetools } from "vite-imagetools";

export default defineConfig({
  server: {
    port: 3000,
  },
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    contentCollections({ environment: "ssr" }),
    imagetools({ include: /\.(jpe?g|png|webp|avif)(\?.*)?$/i }),
    tanstackStart(),
    nitro(),
    // React's Vite plugin must come after Start's plugin.
    viteReact(),
    tailwindcss(),
  ],
});
