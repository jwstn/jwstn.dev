import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { FormattedDate } from "#/components/FormattedDate";
import { ResponsiveImage } from "#/components/ResponsiveImage";
import { galleryImages } from "#/lib/images";
import { buildHead } from "#/lib/site";
import { getGalleries } from "#/server/functions";

export const Route = createFileRoute("/gallery/")({
  head: ({ match }) => buildHead({ title: "Gallery | jwstn.dev", pathname: match.pathname }),
  loader: () => getGalleries(),
  component: GalleryIndex,
});

function GalleryIndex() {
  const albums = Route.useLoaderData();

  return (
    <div className="iso-shell iso-stack iso-gallery">
      <header className="iso-pagehead">
        <h1 className="iso-pagehead-title">Pictures of JW</h1>
      </header>

      <p className="iso-lede">
        On my trip to Japan in March 2026 I bought a camera since I wanted one for some years now. Here are some
        pictures I took with it.
      </p>

      <ul className="iso-albums" aria-label="Albums">
        {albums.map((album) => (
          <li key={album.slug}>
            <a className="iso-slab iso-album" href={`/gallery/${album.slug}/`}>
              <div className="iso-strip" aria-hidden="true">
                {album.photos.slice(0, 4).map((photo) => (
                  <ResponsiveImage
                    key={photo.image.key}
                    image={galleryImages[photo.image.key]}
                    alt={photo.title}
                    sizes="(min-width: 48rem) 10rem, 22vw"
                  />
                ))}
              </div>
              <div className="iso-album-info">
                <h2 className="iso-album-title">{album.title}</h2>
                <p className="iso-album-meta">
                  <FormattedDate date={album.pubDate} /> · {album.photos.length} exposures
                </p>
                <span className="iso-album-cta">
                  Open plate <ArrowRight size={12} />
                </span>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
