import { createFileRoute, notFound, redirect, useLoaderData } from "@tanstack/react-router";
import { clsx } from "clsx";
import { ArrowLeft } from "lucide-react";
import { FormattedDate } from "#/components/FormattedDate";
import { ResponsiveImage } from "#/components/ResponsiveImage";
import { galleryImages } from "#/lib/images";
import { buildHead } from "#/lib/site";
import type { Gallery as GalleryData } from "#/server/content.server";
import { getGallery } from "#/server/functions";

export const Route = createFileRoute("/gallery/$slug")({
  head: ({ match }) => buildHead({ title: "Gallery | jwstn.dev", pathname: match.pathname }),
  loader: async ({ params }): Promise<GalleryData> => {
    if (params.slug === "fall-2026") {
      throw redirect({ href: "/gallery/japan-2026/", statusCode: 301 });
    }

    const album = await getGallery({ data: params.slug });

    if (!album) throw notFound();

    return album;
  },
  component: GalleryDetail,
});

function GalleryDetail() {
  // TanStack Router's registered loader data collapses to `never` for dynamic
  // routes under the current TypeScript version; the loader above is typed.
  const album = useLoaderData({ from: "/gallery/$slug" }) as GalleryData;

  return (
    <div className="iso-shell iso-stack">
      <p className="iso-backrow">
        <a className="iso-backlink" href="/gallery/">
          <ArrowLeft size={14} /> Gallery
        </a>
      </p>

      <header className="iso-pagehead">
        <h1 className="iso-pagehead-title">{album.title}</h1>
        <p className="iso-pagehead-meta">
          <FormattedDate date={album.pubDate} /> · {album.photos.length} exposures
        </p>
      </header>

      <ul className="iso-wall" aria-label="Photographs">
        {album.photos.map((photo, index) => {
          const ratio = photo.image.width / photo.image.height;
          const isWide = ratio >= 1.6;
          const isTall = ratio < 0.9;

          return (
            <li
              className={clsx("iso-plate", isWide && "iso-plate--wide", isTall && "iso-plate--tall")}
              key={photo.image.key}
            >
              <figure className="iso-platefig">
                <div className="iso-plane">
                  <ResponsiveImage
                    image={galleryImages[photo.image.key]}
                    alt={photo.title}
                    sizes="(min-width: 80rem) 26rem, (min-width: 48rem) 40vw, 92vw"
                  />
                </div>
                <figcaption className="iso-plate-cap">
                  <span className="iso-plate-ref">EXP {String(index + 1).padStart(2, "0")}</span>
                  <span className="iso-plate-title">{photo.title}</span>
                  {photo.caption && <span className="iso-plate-note">{photo.caption}</span>}
                </figcaption>
              </figure>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
