import { createFileRoute, notFound, useLoaderData } from "@tanstack/react-router";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { FormattedDate } from "#/components/FormattedDate";
import { IsoButton } from "#/components/IsoButton";
import { Prose } from "#/components/Prose";
import { buildHead } from "#/lib/site";
import type { Project as ProjectData } from "#/server/content.server";
import { getProject } from "#/server/functions";

export const Route = createFileRoute("/projects/$slug")({
  head: ({ match }) => buildHead({ title: "Projects | jwstn.dev", pathname: match.pathname }),
  loader: async ({ params }): Promise<ProjectData> => {
    const project = await getProject({ data: params.slug });

    if (!project) throw notFound();

    return project;
  },
  component: ProjectDetail,
});

function ProjectDetail() {
  // TanStack Router's registered loader data collapses to `never` for dynamic
  // routes under the current TypeScript version; the loader above is typed.
  const project = useLoaderData({ from: "/projects/$slug" }) as ProjectData;

  return (
    <div className="iso-shell iso-stack">
      <p className="iso-backrow">
        <a className="iso-backlink" href="/projects/">
          <ArrowLeft size={14} /> Projects
        </a>
      </p>

      <article className="iso-article">
        <header>
          <h1 className="iso-article-title">{project.title}</h1>
          <div className="iso-meta-row">
            <span className="iso-chip">
              <FormattedDate date={project.pubDate} />
            </span>
          </div>
          {project.tags.length > 0 && (
            <ul className="iso-stamps iso-meta-row" aria-label="Technologies used">
              {project.tags.map((tag) => (
                <li className="iso-stamp" key={tag}>
                  {tag}
                </li>
              ))}
            </ul>
          )}
          {project.description && (
            <p className="iso-note iso-note--margin">
              <span className="iso-note-label">General note</span>
              {project.description}
            </p>
          )}
        </header>

        <Prose html={project.html} />

        <div className="iso-block-actions">
          <IsoButton href={project.href} external>
            View live assembly <ExternalLink size={16} />
          </IsoButton>
        </div>
      </article>
    </div>
  );
}
