import { createFileRoute } from "@tanstack/react-router";
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
      <h1 className="iso-h1">Projects</h1>
      <ul className="iso-explode">
        {projects.map((project) => (
          <li className="iso-slab iso-block" key={project._meta.path}>
            <h2 className="iso-block-title">
              <a href={`/projects/${project._meta.path}/`}>{project.title}</a>
            </h2>
            <p className="iso-block-desc">{project.description}</p>
            <ul className="iso-stamps" aria-label="Technologies used">
              {project.tags.map((tag) => (
                <li className="iso-stamp" key={tag}>
                  {tag}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}
