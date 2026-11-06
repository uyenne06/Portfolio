"use client";

import { useState, type CSSProperties } from "react";

import { RevealOnView } from "@/shared/components/ui";
import { cn } from "@/shared/utils";

type SpecimenRow = { label: string; uses: boolean[]; count: number };

export type TechSpecimenProps = {
  projects: { id: string; label: string }[];
  groups: { id: string; label: string; rows: SpecimenRow[] }[];
  labels: {
    filter: string;
    all: string;
    toolCount: (count: number) => string;
    usage: (row: SpecimenRow) => string;
  };
};

/** Type size encodes how many projects use a tool (1 … 6 projects → xl … 6xl). */
const SIZE_BY_COUNT = [
  "text-xl",
  "text-xl",
  "text-2xl",
  "text-3xl sm:text-4xl",
  "text-4xl sm:text-5xl",
  "text-5xl sm:text-6xl",
  "text-5xl sm:text-7xl",
] as const;

/**
 * Stack as a type specimen, one stratum per layer. Selecting a project lights up its tools;
 * hovering or focusing a tool lights up the projects that use it.
 */
export function TechSpecimen({ projects, groups, labels }: TechSpecimenProps) {
  const [project, setProject] = useState<number | null>(null);
  const [toolLabel, setToolLabel] = useState<string | null>(null);
  const tool = groups.flatMap((group) => group.rows).find((row) => row.label === toolLabel) ?? null;

  return (
    <div>
      <div role="group" aria-label={labels.filter} className="flex flex-wrap items-center gap-2">
        <span className="mr-2 font-mono text-xs text-muted">{labels.filter}</span>
        {[{ id: "all", label: labels.all }, ...projects].map((entry, index) => {
          const projectIndex = index - 1;
          const selected = projectIndex === -1 ? project === null : project === projectIndex;
          const usesHoveredTool = tool !== null && projectIndex >= 0 && tool.uses[projectIndex];
          return (
            <button
              key={entry.id}
              type="button"
              aria-pressed={selected}
              onClick={() => setProject(projectIndex === -1 || selected ? null : projectIndex)}
              className={cn(
                "inline-flex min-h-11 items-center rounded-full border px-4 py-2 text-sm font-medium transition-all duration-300",
                selected || usesHoveredTool
                  ? "border-accent-decor bg-accent-decor text-on-accent"
                  : "border-rule text-ink hover:border-ink",
                tool !== null && projectIndex >= 0 && !usesHoveredTool && "opacity-35",
              )}
            >
              {entry.label}
            </button>
          );
        })}
      </div>

      <div className="mt-10 border-t-2 border-ink">
        {groups.map((group, groupIndex) => (
          <RevealOnView
            key={group.id}
            className="grid grid-cols-1 gap-x-8 gap-y-5 border-b border-rule py-8 lg:grid-cols-12 lg:py-10"
          >
            <div className="lg:col-span-3">
              <p className="font-mono text-xs text-accent">
                {String.fromCharCode(65 + groupIndex)} —
              </p>
              <h3 className="mt-1 font-display text-subtitle font-medium">{group.label}</h3>
              <p className="mt-1 font-mono text-xs text-muted">
                {labels.toolCount(group.rows.length)}
              </p>
            </div>

            <ul className="flex flex-wrap items-baseline gap-x-6 gap-y-3 lg:col-span-9">
              {group.rows.map((row, rowIndex) => {
                const inProject = project === null || row.uses[project];
                const hovered = toolLabel === row.label;
                return (
                  <li key={row.label}>
                    <span
                      tabIndex={0}
                      aria-label={labels.usage(row)}
                      onMouseEnter={() => setToolLabel(row.label)}
                      onMouseLeave={() => setToolLabel(null)}
                      onFocus={() => setToolLabel(row.label)}
                      onBlur={() => setToolLabel(null)}
                      className={cn(
                        "reveal-word cursor-default font-display leading-none font-medium tracking-tight transition-[color,opacity] duration-300",
                        SIZE_BY_COUNT[Math.min(row.count, 6)],
                        !inProject && "opacity-15",
                        (hovered || (project !== null && inProject)) && "text-accent",
                      )}
                    >
                      <span style={{ "--rise-index": rowIndex } as CSSProperties}>
                        {row.label}
                        <sup className="ml-1 font-mono text-xs font-normal text-muted">
                          {row.count}
                        </sup>
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </RevealOnView>
        ))}
      </div>
    </div>
  );
}
