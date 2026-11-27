import { createFileRoute } from "@tanstack/react-router";
import { buildHead } from "#/lib/site";

export const Route = createFileRoute("/music")({
  headers: () => ({
    "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
  }),
  head: ({ match }) => buildHead({ title: "Music | jwstn.dev", pathname: match.pathname }),
  component: Music,
});

function Music() {
  return (
    <div className="iso-shell iso-stack">
      <h1 className="iso-h1">Music</h1>
      <p className="iso-hero-copy">Last.fm data arrives in Phase 3.</p>
    </div>
  );
}
