import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { AppLink } from "#/components/AppLink";
import { IsoButton } from "#/components/IsoButton";
import { CassetteScene } from "#/components/isometric/CassetteScene";
import { buildHead } from "#/lib/site";

const DOORS = [
  { href: "/projects/", num: "01", title: "Projects", cta: "Open assemblies" },
  { href: "/blog/", num: "02", title: "Blog", cta: "Inspect the sheet" },
  { href: "/gallery/", num: "03", title: "Gallery", cta: "View plates" },
] as const;

export const Route = createFileRoute("/")({
  head: ({ match }) =>
    buildHead({
      title: "jwstn.dev — JW, full-stack developer in Cologne",
      pathname: match.pathname,
    }),
  component: Home,
});

function Home() {
  return (
    <div className="iso-shell">
      <section className="iso-hero">
        <div className="iso-hero-inner">
          <h1 className="iso-h1">
            Hey, I'm <span className="iso-name">JW</span>! a Full-Stack Developer from Cologne, Germany
          </h1>
          <p className="iso-hero-copy">
            I'm focusing on building web applications with{" "}
            <a href="https://tanstack.com/" target="_blank" rel="noopener noreferrer">
              TanStack
            </a>
            . Since it provides most of the features you need to build a web app, even some more complex ones, with
            server actions or middleware, I didn't get the chance to test out any backend frameworks like{" "}
            <a href="https://hono.dev/" target="_blank" rel="noopener noreferrer">
              Hono
            </a>{" "}
            or{" "}
            <a href="https://elysiajs.com/" target="_blank" rel="noopener noreferrer">
              Elysia
            </a>
            . But what I got around to test out is{" "}
            <a href="https://effect.website/" target="_blank" rel="noopener noreferrer">
              Effect
            </a>
            , which has been amazing fun so far and proved to be a great opportunity to learn a new way of programming.
          </p>
          <div className="iso-actions">
            <IsoButton href="/projects/">
              View projects <ArrowRight size={16} />
            </IsoButton>
            <IsoButton href="/gallery/" variant="ghost">
              Open the gallery <ArrowRight size={16} />
            </IsoButton>
          </div>
        </div>

        <CassetteScene />
      </section>

      <section aria-label="Parts list">
        <h2 className="iso-sectionlabel">Parts list &mdash; where everything is filed</h2>
        <ul className="iso-doors">
          {DOORS.map((door) => (
            <li key={door.href}>
              <AppLink className="iso-slab iso-door" href={door.href}>
                <span className="iso-door-tab" aria-hidden="true">
                  {door.num}
                </span>
                <h3 className="iso-door-title">{door.title}</h3>
                <span className="iso-door-cta">
                  {door.cta} <ArrowRight size={14} />
                </span>
              </AppLink>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
