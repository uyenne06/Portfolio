import type { ReactNode } from "react";

import { cn } from "@/shared/utils";

export function Tag({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-rule px-2.5 py-0.5 font-mono text-xs text-muted",
        className,
      )}
    >
      {children}
    </span>
  );
}
