import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { FormattedDate } from "#/components/FormattedDate";
import { IsoButton } from "#/components/IsoButton";
import { buildHead } from "#/lib/site";
import { getPosts } from "#/server/functions";

export const Route = createFileRoute("/blog/")({
  head: ({ match }) => buildHead({ title: "Blog | jwstn.dev", pathname: match.pathname }),
  loader: () => getPosts(),
  component: BlogIndex,
});

function BlogIndex() {
  const posts = Route.useLoaderData();

  return (
    <div className="iso-shell iso-stack">
      <h1 className="sr-only">Blog</h1>

      {posts.length === 0 ? (
        <div className="iso-slab iso-empty">
          <ul className="iso-stamps" aria-label="Status">
            <li className="iso-stamp">Status: blank sheet</li>
            <li className="iso-stamp">Ink level: pending</li>
          </ul>
          <h2 className="iso-empty-title">Nothing has been plotted yet.</h2>
          <p className="iso-empty-text">
            The blog is an empty viewport — zero posts drawn, inked, or filed. The drafts are still flat on the drafting
            table under tracing paper. When a piece has been measured twice and cut once, it appears here first; until
            then, the code and the photographs carry the story.
          </p>
          <div className="iso-viewbox" aria-hidden="true">
            <span className="iso-viewbox-label">No objects in view &mdash; scale 1:1</span>
          </div>
          <div className="iso-actions">
            <IsoButton href="/projects/">
              Inspect the projects <ArrowRight size={16} />
            </IsoButton>
            <IsoButton href="/gallery/" variant="ghost">
              View the plates <ArrowRight size={16} />
            </IsoButton>
          </div>
        </div>
      ) : (
        <ul className="iso-postlist">
          {posts.map((post) => (
            <li className="iso-slab" key={post._meta.path}>
              <a className="iso-postlist-link" href={`/blog/${post._meta.path}/`}>
                <h2 className="iso-postlist-title">{post.title}</h2>
                <p className="iso-muted">
                  <FormattedDate date={post.pubDate} /> — {post.description}
                </p>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
