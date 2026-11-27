import type { Img } from "vite-imagetools";

interface ResponsiveImageProps {
  image: Img | undefined;
  alt: string;
  sizes?: string;
  className?: string;
  loading?: "eager" | "lazy";
}

export function ResponsiveImage({ image, alt, sizes, className, loading = "lazy" }: ResponsiveImageProps) {
  if (!image || typeof image !== "object" || !image.src) {
    throw new Error(`Missing or unprocessed image manifest entry for "${alt}"`);
  }

  return (
    <img
      src={image.src}
      srcSet={image.srcset}
      width={image.w}
      height={image.h}
      sizes={sizes}
      loading={loading}
      decoding="async"
      alt={alt}
      className={className}
    />
  );
}
