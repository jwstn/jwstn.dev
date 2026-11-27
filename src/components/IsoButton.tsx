import { clsx } from "clsx";
import type { AnchorHTMLAttributes, ReactNode } from "react";

interface IsoButtonProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  href: string;
  variant?: "solid" | "ghost" | "accent";
  external?: boolean;
  children: ReactNode;
}

export function IsoButton({
  href,
  variant = "solid",
  external = false,
  className,
  children,
  ...props
}: IsoButtonProps) {
  return (
    <a
      className={clsx("iso-btn", `iso-btn--${variant}`, className)}
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      {...props}
    >
      <span className="iso-btn-depth" aria-hidden="true" />
      <span className="iso-btn-face">{children}</span>
    </a>
  );
}
