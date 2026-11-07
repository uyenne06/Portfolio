"use client";

import { useMemo, useState, type CSSProperties } from "react";

import { RevealOnView } from "@/shared/components/ui";
import { cn } from "@/shared/utils";

import { ElementTile, type ElementTileData } from "./ElementTile";

type Row = { label: string; symbol: string; uses: boolean[]; count: number };

export type PeriodicStackProps = {
  projects: { id: string; label: string }[];
  groups: { id: string; label: string; rows: Row[] }[];
  labels: {
    filter: string;
    all: string;
    flip: string;
    /** Accessible "used in N of M projects: …" sentence per tool, keyed by tool label. */
    usedIn: Record<string, string>;
    legend: string;
    legendSteps: string[];
  };
};

/** Up to three elements per column, so blocks grow sideways like the periodic table. */
const ROWS_PER_BLOCK = 3;

/**
 * "The periodic table of my stack": each layer is a block, each tool an element whose
 * atomic number is its usage rank and whose shading shows how many projects use it.
 * Pick a project to light up its elements; hovering an element lights up its projects.
 */
export function PeriodicStack({ projects, groups, labels }: PeriodicStackProps) {
  const [project, setProject] = useState<number | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const total = projects.length;

  const ranks = useMemo(() => {
    const all = groups.flatMap((group) => group.rows);
    const ordered = [...all].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
    return new Map(ordered.map((row, index) => [row.label, index + 1]));
  }, [groups]);

  const hoveredRow = groups.flatMap((group) => group.rows).find((row) => row.label === hovered);
  let tileIndex = 0;

  return (
    <div>
      <div role="group" aria-label={labels.filter} className="flex flex-wrap items-center gap-2">
        <span className="mr-2 font-mono text-xs text-muted">{labels.filter}</span>
        {[{ id: "all", label: labels.all }, ...projects].map((entry, index) => {
          const projectIndex = index - 1;
          const selected = projectIndex === -1 ? project === null : project === projectIndex;
          const lit =
            hoveredRow !== undefined && projectIndex >= 0 && hoveredRow.uses[projectIndex];
          return (
            <button
              key={entry.id}
              type="button"
              aria-pressed={selected}
              onClick={() => setProject(projectIndex === -1 || selected ? null : projectIndex)}
              className={cn(
                "inline-flex min-h-11 items-center rounded-full border px-4 py-2 text-sm font-medium transition-all duration-300",
                selected && projectIndex >= 0 && "border-ink bg-ink text-paper",
                selected && projectIndex === -1 && "border-ink text-ink",
                lit && "border-accent-decor bg-accent-decor text-on-accent",
                !selected && !lit && "border-rule text-ink hover:border-ink",
                hoveredRow !== undefined && projectIndex >= 0 && !lit && "opacity-35",
              )}
            >
              {entry.label}
            </button>
          );
        })}
      </div>

      <RevealOnView className="mt-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:gap-3">
        {groups.map((group, groupIndex) => {
          const columns = Math.max(1, Math.ceil(group.rows.length / ROWS_PER_BLOCK));
          return (
            <section
              key={group.id}
              aria-label={group.label}
              className="min-w-0 lg:grow-(--cols) lg:basis-0"
              style={{ "--cols": columns } as CSSProperties}
            >
              <header className="mb-2 flex items-baseline gap-2 border-b border-ink pb-1.5">
                <span className="font-mono text-xs text-accent">
                  {String.fromCharCode(65 + groupIndex)}
                </span>
                <span className="truncate font-display text-base font-medium">{group.label}</span>
              </header>
              <div
                className="grid grid-cols-3 gap-1.5 sm:grid-cols-4 lg:grid-cols-(--cols)"
                style={{ "--cols": `repeat(${columns}, minmax(0, 1fr))` } as CSSProperties}
              >
                {group.rows.map((row) => {
                  const index = tileIndex++;
                  const inProject = project === null || row.uses[project];
                  const tile: ElementTileData = {
                    label: row.label,
                    symbol: row.symbol,
                    rank: ranks.get(row.label) ?? 0,
                    count: row.count,
                    total,
                    projects: projects.filter((_, i) => row.uses[i]).map((entry) => entry.label),
                  };
                  return (
                    <ElementTile
                      key={row.label}
                      tile={tile}
                      index={index}
                      state={!inProject ? "dim" : project !== null ? "lit" : "normal"}
                      labels={{ usedIn: labels.usedIn[row.label] ?? row.label, flip: labels.flip }}
                      onHoverChange={setHovered}
                    />
                  );
                })}
              </div>
            </section>
          );
        })}
      </RevealOnView>

      <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted">
        <span className="font-mono">{labels.legend}</span>
        {[
          "border-accent-decor bg-accent-decor",
          "border-accent-decor bg-accent-soft",
          "hatch border-ink/40",
          "border-ink bg-paper",
          "border-dashed border-ink/40 bg-paper",
        ].map((swatch, index) => (
          <span key={swatch} className="inline-flex items-center gap-2">
            <span aria-hidden="true" className={cn("size-4 rounded-sm border", swatch)} />
            {labels.legendSteps[index]}
          </span>
        ))}
      </div>
    </div>
  );
}
