import { createFileRoute, notFound, redirect, useLoaderData } from "@tanstack/react-router";
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
      <a className="iso-backlink" href="/gallery/">
        Gallery
      </a>
      <h1 className="iso-h1">{album.title}</h1>
      <ul className="iso-wall">
        {album.photos.map((photo) => (
          <li className="iso-plate" key={photo.image.key}>
            <figure className="iso-platefig">
              <div className="iso-plane">
                <ResponsiveImage
                  image={galleryImages[photo.image.key]}
                  alt={photo.title}
                  sizes="(min-width: 80rem) 26rem, (min-width: 48rem) 40vw, 92vw"
                />
              </div>
              <figcaption className="iso-plate-cap">{photo.title}</figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </div>
  );
}
