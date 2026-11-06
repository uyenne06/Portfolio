import type { ReactNode } from "react";

import { cn } from "@/shared/utils";

type FigureProps = {
  label: string;
  caption: ReactNode;
  children: ReactNode;
  className?: string;
};

/** Academic-style figure: content followed by "Fig. n" and a caption. */
export function Figure({ label, caption, children, className }: FigureProps) {
  return (
    <figure className={cn("min-w-0", className)}>
      {children}
      <figcaption className="mt-3 max-w-measure text-sm leading-relaxed text-muted">
        <span className="mr-2 font-mono text-xs text-ink">{label}</span>
        {caption}
      </figcaption>
    </figure>
  );
}
