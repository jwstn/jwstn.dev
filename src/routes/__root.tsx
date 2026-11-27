import "#/styles/base.css";
import "#/styles/theme.css";
import { createRootRoute, HeadContent, Outlet, Scripts, useRouterState } from "@tanstack/react-router";
import { clsx } from "clsx";
import { ExternalLink } from "lucide-react";
import { StrictMode, useEffect, useRef, useState } from "react";
import { SITE_DESCRIPTION, SITE_TITLE } from "#/consts";

const THEME_SCRIPT = `(() => {
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

const NAV_ITEMS = [
  { label: "Projects", href: "/projects" },
  { label: "Gallery", href: "/gallery" },
  { label: "Music", href: "/music" },
] as const;

const SOCIALS = [
  { label: "GitHub", href: "https://github.com/jwstn" },
  { label: "Bluesky", href: "https://bsky.app/profile/jwstn.bsky.social" },
] as const;

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width,initial-scale=1" },
      { title: SITE_TITLE },
      { name: "description", content: SITE_DESCRIPTION },
      { name: "supported-color-schemes", content: "light dark" },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "icon", href: "/favicon.ico" },
    ],
  }),
  component: RootComponent,
  notFoundComponent: NotFound,
});

function NotFound() {
  return (
    <div className="iso-shell iso-stack">
      <h1 className="iso-h1">Not found</h1>
      <p className="iso-hero-copy">The page you asked for does not exist.</p>
    </div>
  );
}

function RootComponent() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const path = pathname.replace(/\/+$/, "") || "/";
  const [isOpen, setIsOpen] = useState(false);
  const burgerRef = useRef<HTMLButtonElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const previousPath = useRef(pathname);
  const firstRender = useRef(true);
  const year = new Date().getFullYear();

  const isActive = (href: string) => path === href || path.startsWith(`${href}/`);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setIsOpen(false);
      burgerRef.current?.focus();
    };

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest("#iso-mobile-nav") || target.closest("#iso-burger")) return;
      setIsOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [isOpen]);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 48rem)");
    const onChange = (event: MediaQueryListEvent) => {
      if (event.matches) setIsOpen(false);
    };

    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      previousPath.current = pathname;
      return;
    }

    if (previousPath.current === pathname) return;

    previousPath.current = pathname;
    setIsOpen(false);
    mainRef.current?.focus();
  }, [pathname]);

  return (
    <StrictMode>
      <html lang="en" className="theme-isometric" suppressHydrationWarning>
        <head>
          <HeadContent />
          <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        </head>
        <body className="bg-background text-foreground font-body">
          <a className="iso-skip" href="#iso-main">
            Skip to content
          </a>

          <header className={clsx("iso-header", isOpen && "is-menu-open")}>
            <div className="iso-shell">
              <div className="iso-plate iso-slab">
                <a className="iso-key iso-key--logo" href="/" aria-current={path === "/" ? "page" : undefined}>
                  jwstn.dev
                </a>

                <button
                  ref={burgerRef}
                  className={clsx("iso-burger", isOpen && "is-open")}
                  id="iso-burger"
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls="iso-mobile-nav"
                  aria-label={isOpen ? "Close menu" : "Open menu"}
                  onClick={() => setIsOpen((open) => !open)}
                >
                  <span className="iso-burger-icon" aria-hidden="true" />
                </button>

                <nav className="iso-keys iso-keys--desktop" aria-label="Main navigation">
                  {NAV_ITEMS.map((item) => (
                    <a
                      className="iso-key"
                      href={item.href}
                      key={item.href}
                      aria-current={isActive(item.href) ? "page" : undefined}
                    >
                      {item.label}
                    </a>
                  ))}
                </nav>
                <nav className="iso-keys iso-keys--desktop" aria-label="Social links">
                  {SOCIALS.map((social) => (
                    <a
                      className="iso-key iso-key--ghost"
                      href={social.href}
                      key={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {social.label} <ExternalLink size={12} />
                    </a>
                  ))}
                </nav>
              </div>

              <div className="iso-mobile-panel" id="iso-mobile-nav" hidden={!isOpen}>
                <nav className="iso-mobile-keys" aria-label="Main navigation">
                  {NAV_ITEMS.map((item) => (
                    <a
                      className="iso-key"
                      href={item.href}
                      key={item.href}
                      aria-current={isActive(item.href) ? "page" : undefined}
                      onClick={() => setIsOpen(false)}
                    >
                      {item.label}
                    </a>
                  ))}
                </nav>
                <nav className="iso-mobile-keys iso-mobile-keys--social" aria-label="Social links">
                  {SOCIALS.map((social) => (
                    <a
                      className="iso-key iso-key--ghost"
                      href={social.href}
                      key={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {social.label} <ExternalLink size={12} />
                    </a>
                  ))}
                </nav>
              </div>
            </div>
          </header>

          <main id="iso-main" className="iso-main" tabIndex={-1} ref={mainRef}>
            <Outlet />
          </main>

          <footer className="iso-footer">
            <div className="iso-shell">
              <p className="iso-copyright">&copy; {year} jwstn</p>
            </div>
          </footer>

          <Scripts />
        </body>
      </html>
    </StrictMode>
  );
}
