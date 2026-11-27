import { createFileRoute, notFound, useLoaderData } from "@tanstack/react-router";
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
      <a className="iso-backlink" href="/projects/">
        Projects
      </a>
      <article className="iso-article">
        <h1 className="iso-article-title">{project.title}</h1>
        <p className="iso-muted">{project.description}</p>
        <Prose html={project.html} />
        <p>
          <a href={project.href} target="_blank" rel="noopener noreferrer">
            View live
          </a>
        </p>
      </article>
    </div>
  );
}
