import { createFileRoute } from "@tanstack/react-router";
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
    <div className="iso-shell iso-stack">
      <h1 className="iso-h1">Gallery</h1>
      <ul className="iso-albums">
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
                <p className="iso-album-meta">{album.photos.length} exposures</p>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
