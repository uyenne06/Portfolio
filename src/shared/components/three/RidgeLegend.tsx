"use client";

import { cn } from "@/shared/utils";

import type { RidgeSeries } from "./types";

type RidgeLegendProps = {
  series: RidgeSeries[];
  activeId: string | null;
  onActiveChange: (id: string | null) => void;
  label: string;
  className?: string;
};

/**
 * Accessible counterpart of the figure: one chip per project. Hover/focus highlights the
 * project in the figure; project chips link to the project in "Selected work".
 */
export function RidgeLegend({
  series,
  activeId,
  onActiveChange,
  label,
  className,
}: RidgeLegendProps) {
  return (
    <ul aria-label={label} className={cn("flex flex-wrap gap-2", className)}>
      {series.map((entry) => {
        const active = entry.id === activeId;
        const handlers = {
          onMouseEnter: () => onActiveChange(entry.id),
          onMouseLeave: () => onActiveChange(null),
          onFocus: () => onActiveChange(entry.id),
          onBlur: () => onActiveChange(null),
        };
        const chipClass = cn(
          "inline-flex min-h-11 items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm backdrop-blur-sm transition-colors duration-200",
          active
            ? "border-accent-decor bg-accent-decor text-on-accent"
            : "border-rule bg-paper/70 text-ink hover:border-ink",
        );
        const content = (
          <>
            <span
              aria-hidden="true"
              className={cn("size-2 rounded-full", active ? "bg-on-accent" : "bg-accent-decor")}
            />
            <span className="font-medium">{entry.label}</span>
            <span className={cn("font-mono text-xs", active ? "text-on-accent" : "text-muted")}>
              {entry.detail}
            </span>
          </>
        );
        return (
          <li key={entry.id} className="shrink-0">
            {entry.href ? (
              <a href={entry.href} className={chipClass} {...handlers}>
                {content}
              </a>
            ) : (
              <span tabIndex={0} className={chipClass} {...handlers}>
                {content}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
