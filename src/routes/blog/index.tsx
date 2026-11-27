import { createFileRoute } from "@tanstack/react-router";
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
      <h1 className="iso-h1">Blog</h1>
      {posts.length === 0 ? (
        <p className="iso-hero-copy">Nothing has been plotted yet.</p>
      ) : (
        <ul className="iso-postlist">
          {posts.map((post) => (
            <li className="iso-slab" key={post._meta.path}>
              <a className="iso-postlist-link" href={`/blog/${post._meta.path}/`}>
                <h2 className="iso-postlist-title">{post.title}</h2>
                <p className="iso-muted">{post.description}</p>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
