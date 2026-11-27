import type { Img } from "vite-imagetools";

export const galleryImages = import.meta.glob("/src/assets/**/*.{JPG,jpg,jpeg,png,PNG}", {
  eager: true,
  query: "?w=96;128;160;640;960;1280;1600;1920&format=webp&quality=80&as=img",
  import: "default",
}) as Record<string, Img>;

export const heroImages = import.meta.glob("/src/assets/**/*.{JPG,jpg,jpeg,png,PNG}", {
  eager: true,
  query: "?w=800;1024;1280&format=webp&quality=80&as=img",
  import: "default",
}) as Record<string, Img>;
