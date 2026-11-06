"use client";

import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { Component, useRef, useState, type ReactNode } from "react";

import { useInView, useLowPowerDevice } from "@/shared/hooks";
import { cn } from "@/shared/utils";

import { RidgeLegend } from "./RidgeLegend";
import type { RidgeSeries, RidgeTimeline } from "./types";
import { WorkRidgesStill } from "./WorkRidgesStill";

// Three.js stays out of the server bundle and the initial client chunk.
const CommitFieldScene = dynamic(() => import("./CommitFieldScene"), { ssr: false });

class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

type HeroExperienceProps = {
  timeline: RidgeTimeline;
  /** Server-rendered title block (h1, role, affiliations, calls to action). */
  intro: ReactNode;
  /** Server-rendered "Fig. 1" caption with its citation. */
  caption: ReactNode;
  figureAlt: string;
  legendLabel: string;
  scrollHint: string;
};

function goTo(series: RidgeSeries) {
  if (series.href) window.location.hash = series.href.replace(/^#/, "");
}

/**
 * Scroll-driven hero. A sticky stage holds the WebGL field: every particle is one commit,
 * floating as a cloud behind the title, then flying into place as you scroll until the cloud
 * becomes the chart (week × project). Reduced motion gets a static title and the SVG chart.
 */
export function HeroExperience({
  timeline,
  intro,
  caption,
  figureAlt,
  legendLabel,
  scrollHint,
}: HeroExperienceProps) {
  const wrapper = useRef<HTMLElement>(null);
  const reduced = useReducedMotion() ?? false;
  const lowPower = useLowPowerDevice();
  const visible = useInView(wrapper, "0px");
  const { resolvedTheme } = useTheme();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  const { scrollYProgress } = useScroll({ target: wrapper, offset: ["start start", "end end"] });
  const progress = useRef(0);
  useMotionValueEvent(scrollYProgress, "change", (value) => {
    progress.current = value;
  });

  const introOpacity = useTransform(scrollYProgress, [0, 0.24], [1, 0]);
  const introY = useTransform(scrollYProgress, [0, 0.3], ["0%", "-10%"]);
  const introEvents = useTransform(scrollYProgress, (value) => (value < 0.2 ? "auto" : "none"));
  const hintOpacity = useTransform(scrollYProgress, [0, 0.06], [1, 0]);
  const figureOpacity = useTransform(scrollYProgress, [0.7, 0.86], [0, 1]);
  const figureEvents = useTransform(scrollYProgress, (value) => (value > 0.78 ? "auto" : "none"));

  return (
    <section
      ref={wrapper}
      aria-labelledby="hero-heading"
      className="relative h-[260dvh] motion-reduce:h-auto"
    >
      <div className="sticky top-0 h-dvh overflow-hidden bg-[radial-gradient(ellipse_at_62%_42%,var(--accent-soft),transparent_62%)] motion-reduce:static motion-reduce:h-auto motion-reduce:overflow-visible">
        {!reduced && !failed ? (
          <div
            role="img"
            aria-label={figureAlt}
            className={cn(
              "absolute inset-0 transition-opacity duration-1000",
              ready ? "opacity-100" : "opacity-0",
            )}
          >
            <SceneBoundary>
              <CommitFieldScene
                timeline={timeline}
                progress={progress}
                activeId={activeId}
                dark={resolvedTheme === "dark"}
                lowPower={lowPower}
                paused={!visible}
                onHover={setActiveId}
                onSelect={goTo}
                onReady={() => setReady(true)}
                onContextLost={() => setFailed(true)}
              />
            </SceneBoundary>
          </div>
        ) : null}

        <motion.div
          style={
            reduced ? undefined : { opacity: introOpacity, y: introY, pointerEvents: introEvents }
          }
          className="relative z-10 flex h-full flex-col justify-end bg-linear-to-t from-paper from-30% via-paper/70 via-55% to-transparent to-75% pt-24 pb-16 motion-reduce:h-auto motion-reduce:bg-none motion-reduce:pt-10 lg:pb-20"
        >
          {intro}
        </motion.div>

        <motion.p
          aria-hidden="true"
          style={reduced ? undefined : { opacity: hintOpacity }}
          className="pointer-events-none absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 font-mono text-xs text-muted motion-reduce:hidden sm:flex"
        >
          {scrollHint}
          <span className="h-8 w-px animate-pulse bg-accent-decor" />
        </motion.p>

        <motion.div
          style={reduced ? undefined : { opacity: figureOpacity, pointerEvents: figureEvents }}
          className="absolute inset-x-0 top-0 z-10 motion-reduce:hidden"
        >
          <div className="mx-auto max-w-page px-4 pt-24 sm:px-6 lg:px-10">
            <div className="max-w-xl text-sm leading-relaxed text-muted">{caption}</div>
          </div>
        </motion.div>

        <motion.div
          style={reduced ? undefined : { opacity: figureOpacity, pointerEvents: figureEvents }}
          className="absolute inset-x-0 bottom-0 z-10 motion-reduce:hidden"
        >
          <div className="mx-auto max-w-page px-4 pb-6 sm:px-6 lg:px-10">
            <RidgeLegend
              className="max-sm:-mx-4 max-sm:flex-nowrap max-sm:overflow-x-auto max-sm:px-4 max-sm:pb-2"
              series={timeline.series}
              activeId={activeId}
              onActiveChange={setActiveId}
              label={legendLabel}
            />
          </div>
        </motion.div>
      </div>

      {/* Reduced motion: the same data as a static chart under the title. */}
      <div className="hidden motion-reduce:block">
        <div className="mx-auto max-w-page px-4 pb-16 sm:px-6 lg:px-10">
          <figure>
            <div
              role="img"
              aria-label={figureAlt}
              className="graph-paper relative aspect-[4/3] w-full sm:aspect-video lg:aspect-[21/9]"
            >
              <WorkRidgesStill
                timeline={timeline}
                activeId={activeId}
                className="absolute inset-0 size-full"
              />
            </div>
            <RidgeLegend
              className="mt-6"
              series={timeline.series}
              activeId={activeId}
              onActiveChange={setActiveId}
              label={legendLabel}
            />
            <figcaption className="mt-4 max-w-measure text-sm text-muted">{caption}</figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
