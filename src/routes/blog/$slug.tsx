import { createFileRoute, notFound, useLoaderData } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { FormattedDate } from "#/components/FormattedDate";
import { Prose } from "#/components/Prose";
import { ResponsiveImage } from "#/components/ResponsiveImage";
import { heroImages } from "#/lib/images";
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
      <p className="iso-backrow">
        <a className="iso-backlink" href="/blog/">
          <ArrowLeft size={14} /> Blog
        </a>
      </p>

      <article className="iso-article">
        <header>
          <p className="iso-kicker">Blog &mdash; sheet {post._meta.path}</p>
          <h1 className="iso-article-title">{post.title}</h1>
          <div className="iso-meta-row">
            <span className="iso-chip">
              Plotted <FormattedDate date={post.pubDate} />
            </span>
            {post.updatedDate && (
              <span className="iso-chip">
                Revised <FormattedDate date={post.updatedDate} />
              </span>
            )}
          </div>
          {post.description && (
            <p className="iso-note iso-note--margin">
              <span className="iso-note-label">Abstract</span>
              {post.description}
            </p>
          )}
        </header>

        {post.heroImage && (
          <div className="iso-frame">
            <ResponsiveImage
              className="iso-heroimg"
              image={heroImages[post.heroImage.key]}
              alt={`Cover image for ${post.title}`}
              sizes="(min-width: 72rem) 46rem, 92vw"
            />
          </div>
        )}

        <Prose html={post.html} />
      </article>
    </div>
  );
}
