import { createFileRoute } from "@tanstack/react-router";
import { ResponsiveImage } from "#/components/ResponsiveImage";
import { galleryImages } from "#/lib/images";
import { getGalleries, getProjects } from "#/server/functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [{ title: "jwstn.dev" }],
  }),
  loader: async () => {
    const [projects, galleries] = await Promise.all([getProjects(), getGalleries()]);

    return {
      projectCount: projects.length,
      galleryCount: galleries.length,
      firstPhoto: galleries[0]?.photos[0],
    };
  },
  component: Home,
});

function Home() {
  const { projectCount, galleryCount, firstPhoto } = Route.useLoaderData();

  return (
    <div className="iso-shell iso-stack">
      <h1 className="iso-h1">jwstn.dev is moving to TanStack Start</h1>
      <p className="iso-hero-copy">
        The scaffold is live. {projectCount} projects and {galleryCount} albums are wired through the new content layer.
      </p>

      {firstPhoto && (
        <figure className="iso-frame" style={{ maxWidth: "22rem" }}>
          <ResponsiveImage image={galleryImages[firstPhoto.image.key]} alt={firstPhoto.title} sizes="22rem" />
        </figure>
      )}

      <p className="iso-hero-copy">The next phases port the pages, the Last.fm cache and the Three.js scene.</p>
    </div>
  );
}
