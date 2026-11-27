import { createFileRoute, notFound, useLoaderData } from "@tanstack/react-router";
import { Prose } from "#/components/Prose";
import { buildHead } from "#/lib/site";
import type { BlogPost as BlogPostData } from "#/server/content.server";
import { getPost } from "#/server/functions";

export const Route = createFileRoute("/blog/$slug")({
  head: ({ match }) => buildHead({ title: "Blog | jwstn.dev", pathname: match.pathname }),
  loader: async ({ params }): Promise<BlogPostData> => {
    const post = await getPost({ data: params.slug });

    if (!post) throw notFound();

    return post;
  },
  component: BlogPost,
});

function BlogPost() {
  // TanStack Router's registered loader data collapses to `never` for dynamic
  // routes under the current TypeScript version; the loader above is typed.
  const post = useLoaderData({ from: "/blog/$slug" }) as BlogPostData;

  return (
    <div className="iso-shell iso-stack">
      <a className="iso-backlink" href="/blog/">
        Blog
      </a>
      <article className="iso-article">
        <h1 className="iso-article-title">{post.title}</h1>
        <p className="iso-muted">{post.description}</p>
        <Prose html={post.html} />
      </article>
    </div>
  );
}
