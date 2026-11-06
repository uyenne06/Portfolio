"use client";

import dynamic from "next/dynamic";
import { Component, useRef, useState, type ReactNode } from "react";

import { useInView, useLowPowerDevice, usePrefersReducedMotion } from "@/shared/hooks";
import { cn } from "@/shared/utils";

import type { RidgeSeries, RidgeTimeline } from "./types";
import { WorkRidgesStill } from "./WorkRidgesStill";

// Three.js stays out of the server bundle and the initial client chunk.
const WorkRidgesScene = dynamic(() => import("./WorkRidgesScene"), { ssr: false });

class FallbackBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

type WorkTimelineFigureProps = {
  timeline: RidgeTimeline;
  /** Accessible summary of the figure; the legend below carries the details. */
  label: string;
  legendLabel: string;
};

function goTo(series: RidgeSeries) {
  if (series.href) window.location.hash = series.href.replace(/^#/, "");
}

/**
 * Fig. 1 — commits per week, one ridge per project. Hovering a ridge or a legend entry
 * highlights that project; selecting it jumps to the project in "Selected work".
 * WebGL loads lazily on the client; the SVG version is used for reduced motion, while
 * loading and if WebGL fails. Low-power devices render still frames; off-screen pauses.
 */
export function WorkTimelineFigure({ timeline, label, legendLabel }: WorkTimelineFigureProps) {
  const container = useRef<HTMLDivElement>(null);
  const inView = useInView(container, "160px");
  const reducedMotion = usePrefersReducedMotion();
  const lowPower = useLowPowerDevice();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [contextLost, setContextLost] = useState(false);

  const show3d = !reducedMotion && !contextLost;
  const still = (
    <WorkRidgesStill
      timeline={timeline}
      activeId={activeId}
      className="absolute inset-0 size-full"
    />
  );

  return (
    <div>
      <div
        ref={container}
        role="img"
        aria-label={label}
        className={cn(
          "graph-paper relative aspect-[4/3] w-full overflow-hidden sm:aspect-video lg:aspect-[21/9]",
          activeId && "cursor-pointer",
        )}
      >
        {!show3d || !ready ? still : null}
        {show3d ? (
          <FallbackBoundary fallback={still}>
            <div
              className={cn(
                "absolute inset-0 transition-opacity duration-700",
                ready ? "opacity-100" : "opacity-0",
              )}
            >
              <WorkRidgesScene
                timeline={timeline}
                activeId={activeId}
                animate={!lowPower}
                paused={!inView}
                onHover={setActiveId}
                onSelect={goTo}
                onReady={() => setReady(true)}
                onContextLost={() => setContextLost(true)}
              />
            </div>
          </FallbackBoundary>
        ) : null}
      </div>

      <ul
        aria-label={legendLabel}
        className="mt-6 grid grid-cols-1 gap-x-8 border-t border-rule sm:grid-cols-2 lg:grid-cols-4"
      >
        {timeline.series.map((series) => {
          const active = series.id === activeId;
          const content = (
            <>
              <span
                aria-hidden="true"
                className={cn(
                  "mt-1.5 size-2.5 shrink-0 rounded-full transition-colors",
                  active ? "bg-accent-decor" : "bg-ink/30",
                )}
              />
              <span className="min-w-0">
                <span
                  className={cn("block font-medium transition-colors", active && "text-accent")}
                >
                  {series.label}
                </span>
                <span className="block font-mono text-xs text-muted">{series.detail}</span>
              </span>
            </>
          );
          const handlers = {
            onMouseEnter: () => setActiveId(series.id),
            onMouseLeave: () => setActiveId(null),
            onFocus: () => setActiveId(series.id),
            onBlur: () => setActiveId(null),
          };
          return (
            <li key={series.id} className="border-b border-rule">
              {series.href ? (
                <a href={series.href} className="flex gap-3 py-3 text-sm" {...handlers}>
                  {content}
                </a>
              ) : (
                <span className="flex gap-3 py-3 text-sm" {...handlers}>
                  {content}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
