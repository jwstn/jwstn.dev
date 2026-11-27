import { createFileRoute } from "@tanstack/react-router";
import { getScaffoldStatus } from "#/server/functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [{ title: "jwstn.dev" }],
  }),
  loader: () => getScaffoldStatus(),
  component: Home,
});

function Home() {
  const status = Route.useLoaderData();

  return (
    <div className="iso-shell iso-stack">
      <h1 className="iso-h1">jwstn.dev is moving to TanStack Start</h1>
      <p className="iso-hero-copy">
        The scaffold is live. The Effect runtime is {status.ok ? "ready" : "down"}; Node {status.node}. Last.fm is{" "}
        {status.lastfmConfigured ? "configured" : "not configured"}.
      </p>
      <p className="iso-hero-copy">
        The next phases port the content layer, the image pipeline, the pages and the Three.js scene.
      </p>
    </div>
  );
}
