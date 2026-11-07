"use client";

import dynamic from "next/dynamic";
import { useRef, useState } from "react";

import {
  useInView,
  useLowPowerDevice,
  usePrefersReducedMotion,
  useScrollProgress,
} from "@/shared/hooks";
import { cn } from "@/shared/utils";

import { PeriodicStack, type PeriodicStackProps } from "./PeriodicStack";

// Each scene is its own lazy chunk; only the selected one is downloaded.
const ExplodedStackScene = dynamic(() => import("./three/ExplodedStackScene"), { ssr: false });
const ConstellationScene = dynamic(() => import("./three/ConstellationScene"), { ssr: false });

type View = "stack" | "constellation";

export type StackViewsProps = PeriodicStackProps & {
  viewLabels: { group: string; stack: string; constellation: string };
  hint: { stack: string; constellation: string };
  /** "Used in N of M projects", keyed by N. */
  usedInCount: Record<number, string>;
  sceneLabel: string;
};

/**
 * Methods figure: two 3D readings of the same tool × project data — an exploded stack of
 * layers (towers = tools, height = projects using them) and a constellation (projects are
 * stars, threads tie each tool to its projects). Reduced motion gets the periodic table.
 */
export function StackViews(props: StackViewsProps) {
  const { projects, groups, labels, viewLabels, hint, usedInCount, sceneLabel } = props;
  const reduced = usePrefersReducedMotion();
  const lowPower = useLowPowerDevice();
  const figure = useRef<HTMLDivElement>(null);
  const visible = useInView(figure, "200px");
  // Load three.js only when the figure is about a screen away, then keep it mounted.
  const near = useInView(figure, "100% 0px");
  const [mounted, setMounted] = useState(false);
  if (near && !mounted) setMounted(true);
  const [view, setView] = useState<View>("stack");
  const [project, setProject] = useState<number | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const progress = useRef(0);
  useScrollProgress(figure, "cross", (value) => {
    progress.current = value;
  });

  if (reduced) return <PeriodicStack projects={projects} groups={groups} labels={labels} />;

  const hoveredRow = groups.flatMap((group) => group.rows).find((row) => row.label === hovered);
  const sceneProps = {
    groups,
    progress,
    activeProject: project,
    hoveredTool: hovered,
    onHoverTool: setHovered,
    lowPower,
    paused: !visible,
    onReady: () => setReady(true),
  };

  return (
    <div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
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
                  lit
                    ? "border-accent-decor bg-accent-decor text-on-accent"
                    : selected && projectIndex >= 0
                      ? "border-ink bg-ink text-paper"
                      : selected
                        ? "border-ink text-ink"
                        : "border-rule text-ink hover:border-ink",
                  hoveredRow !== undefined && projectIndex >= 0 && !lit && "opacity-35",
                )}
              >
                {entry.label}
              </button>
            );
          })}
        </div>

        <div
          role="radiogroup"
          aria-label={viewLabels.group}
          className="inline-flex shrink-0 self-start rounded-full border border-ink p-1"
        >
          {(["stack", "constellation"] as const).map((option) => (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={view === option}
              onClick={() => {
                setView(option);
                setReady(false);
                setHovered(null);
              }}
              className={cn(
                "min-h-9 rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-300",
                view === option ? "bg-ink text-paper" : "text-ink hover:text-accent",
              )}
            >
              {viewLabels[option]}
            </button>
          ))}
        </div>
      </div>

      <div
        ref={figure}
        className="relative mt-6 h-[78dvh] min-h-[30rem] w-full overflow-hidden rounded-xl border border-rule max-sm:h-[66dvh]"
      >
        <div aria-hidden="true" className="graph-paper absolute inset-0 opacity-70" />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_45%,var(--accent-soft),transparent_65%)]"
        />
        <div
          role="img"
          aria-label={sceneLabel}
          className={cn(
            "absolute inset-0 transition-opacity duration-700",
            ready ? "opacity-100" : "opacity-0",
          )}
        >
          {!mounted ? null : view === "stack" ? (
            <ExplodedStackScene key="stack" {...sceneProps} />
          ) : (
            <ConstellationScene key="constellation" {...sceneProps} projects={projects} />
          )}
        </div>

        {/* Reading panel: what the pointer is on, in plain text. */}
        <div className="pointer-events-none absolute right-4 bottom-4 left-4 sm:top-4 sm:bottom-auto sm:left-auto sm:w-72">
          <div
            aria-live="polite"
            className="rounded-lg border border-rule bg-paper/85 p-4 backdrop-blur-md"
          >
            {hoveredRow ? (
              <>
                <p className="font-mono text-xs text-accent">{hoveredRow.symbol}</p>
                <p className="mt-1 font-display text-2xl leading-tight font-medium">
                  {hoveredRow.label}
                </p>
                <p className="mt-1 font-mono text-xs text-muted">{usedInCount[hoveredRow.count]}</p>
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {projects
                    .filter((_, index) => hoveredRow.uses[index])
                    .map((entry) => (
                      <li
                        key={entry.id}
                        className="rounded-full bg-accent-decor px-2 py-0.5 text-xs text-on-accent"
                      >
                        {entry.label}
                      </li>
                    ))}
                </ul>
              </>
            ) : (
              <p className="text-sm text-muted">{hint[view]}</p>
            )}
          </div>
        </div>
      </div>

      {/* Same data as text for assistive technology. */}
      <ul className="sr-only">
        {groups.flatMap((group) =>
          group.rows.map((row) => <li key={row.label}>{labels.usedIn[row.label] ?? row.label}</li>),
        )}
      </ul>
    </div>
  );
}
