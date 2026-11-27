import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, ExternalLink } from "lucide-react";
import { FormattedDate } from "#/components/FormattedDate";
import { IsoButton } from "#/components/IsoButton";
import { buildHead } from "#/lib/site";
import { getProjects } from "#/server/functions";

export const Route = createFileRoute("/projects/")({
  head: ({ match }) => buildHead({ title: "Projects | jwstn.dev", pathname: match.pathname }),
  loader: () => getProjects(),
  component: ProjectsIndex,
});

function ProjectsIndex() {
  const projects = Route.useLoaderData();

  return (
    <div className="iso-shell iso-stack">
      <h1 className="sr-only">Projects</h1>

      <section className="iso-explode" aria-label="Project list">
        {projects.map((project) => (
          <article className="iso-slab iso-block" key={project._meta.path}>
            <h2 className="iso-block-title">
              <a href={`/projects/${project._meta.path}/`}>{project.title}</a>
            </h2>
            <p className="iso-block-date">
              <FormattedDate date={project.pubDate} />
            </p>
            <p className="iso-block-desc">{project.description}</p>
            <ul className="iso-stamps" aria-label="Technologies used">
              {project.tags.map((tag) => (
                <li className="iso-stamp" key={tag}>
                  {tag}
                </li>
              ))}
            </ul>
            <div className="iso-block-actions">
              <IsoButton href={`/projects/${project._meta.path}/`}>
                Open <ArrowRight size={16} />
              </IsoButton>
              <IsoButton href={project.href} variant="ghost" external>
                Source <ExternalLink size={16} />
              </IsoButton>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
