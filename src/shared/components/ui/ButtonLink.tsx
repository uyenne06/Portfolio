import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { cn } from "@/shared/utils";

type Variant = "primary" | "secondary";

const variants: Record<Variant, string> = {
  // Pink fill with black text: 10.2:1 contrast in both themes.
  primary: "bg-accent-decor text-on-accent hover:bg-ink hover:text-paper",
  secondary: "border border-ink/80 text-ink hover:border-accent hover:text-accent",
};

type ButtonLinkProps = ComponentPropsWithoutRef<"a"> & {
  variant?: Variant;
  icon?: ReactNode;
};

/** Plain anchor styled as a button (external links, in-page anchors, mailto). */
export function ButtonLink({
  variant = "secondary",
  icon,
  className,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <a
      className={cn(
        "inline-flex min-h-11 items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-colors duration-200 ease-paper",
        variants[variant],
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </a>
  );
}
