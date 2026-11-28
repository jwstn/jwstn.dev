import { Link } from "@tanstack/react-router";
import type { AnchorHTMLAttributes, ReactNode } from "react";

interface AppLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  href: string;
  children: ReactNode;
}

const projectPath = /^\/projects\/([^/]+)$/;
const blogPath = /^\/blog\/([^/]+)$/;
const galleryPath = /^\/gallery\/([^/]+)$/;

export function AppLink({ href, children, ...props }: AppLinkProps) {
  if (!href.startsWith("/")) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  }

  const path = href.replace(/\/+$/, "") || "/";

  if (path === "/") {
    return (
      <Link to="/" viewTransition {...props}>
        {children}
      </Link>
    );
  }
  if (path === "/blog") {
    return (
      <Link to="/blog/" viewTransition {...props}>
        {children}
      </Link>
    );
  }
  if (path === "/projects") {
    return (
      <Link to="/projects/" viewTransition {...props}>
        {children}
      </Link>
    );
  }
  if (path === "/gallery") {
    return (
      <Link to="/gallery/" viewTransition {...props}>
        {children}
      </Link>
    );
  }
  if (path === "/music") {
    return (
      <Link to="/music/" viewTransition {...props}>
        {children}
      </Link>
    );
  }

  const project = projectPath.exec(path);
  if (project) {
    return (
      <Link to="/projects/$slug/" params={{ slug: project[1] }} viewTransition {...props}>
        {children}
      </Link>
    );
  }

  const blog = blogPath.exec(path);
  if (blog) {
    return (
      <Link to="/blog/$slug/" params={{ slug: blog[1] }} viewTransition {...props}>
        {children}
      </Link>
    );
  }

  const gallery = galleryPath.exec(path);
  if (gallery) {
    return (
      <Link to="/gallery/$slug/" params={{ slug: gallery[1] }} viewTransition {...props}>
        {children}
      </Link>
    );
  }

  return (
    <a href={href} {...props}>
      {children}
    </a>
  );
}
