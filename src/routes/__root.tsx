import "#/styles/base.css";
import "#/styles/theme.css";
import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { SITE_DESCRIPTION, SITE_TITLE } from "#/lib/site";

const themeScript = `(() => {
  const applyMode = (mode) => {
    document.documentElement.classList.toggle("dark", mode === "dark");
  };
  const currentMode = () => {
    const saved = localStorage.getItem("theme");
    if (saved) return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  };
  applyMode(currentMode());
})();`;

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width,initial-scale=1" },
      { title: SITE_TITLE },
      { name: "description", content: SITE_DESCRIPTION },
      { name: "supported-color-schemes", content: "light dark" },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className="theme-isometric">
      <head>
        <HeadContent />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="bg-background text-foreground font-body">
        <a className="iso-skip" href="#iso-main">
          Skip to content
        </a>
        <main id="iso-main" className="iso-main" tabIndex={-1}>
          {children}
        </main>
        <Scripts />
      </body>
    </html>
  );
}
