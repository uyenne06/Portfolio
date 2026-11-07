"use client";

import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import {
  Component,
  useEffect,
  useRef,
  useState,
  type PointerEvent,
  type ReactNode,
} from "react";

import {
  mapRange,
  useInView,
  useLowPowerDevice,
  usePrefersReducedMotion,
  useScrollProgress,
} from "@/shared/hooks";
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
  /** Hint for the hold-to-gather interaction (fine pointers only). */
  gatherHint: string;
  /** Total commits in the figure, counted up in the middle of the scroll. */
  total: number;
  /** Label under the big counter, e.g. "commits · Jun – Nov 2026". */
  counterLabel: string;
};

/** Fallback start for visitors who never move, scroll or tap. */
const ARM_TIMEOUT_MS = 7000;
const ARM_EVENTS = ["pointermove", "pointerdown", "wheel", "touchstart", "keydown", "scroll"] as const;

/**
 * Defers the WebGL scene (three.js is the heaviest part of the page) until the visitor first
 * interacts — in practice the first mouse move or scroll — so the initial load only has to
 * paint and hydrate the text. The title and glow are already on screen in the meantime, and
 * the scene's burst-in animation plays the moment it starts.
 */
function useArmOnInteraction(enabled: boolean): boolean {
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (!enabled) return;
    const arm = () => {
      setArmed(true);
      cleanup();
    };
    const timer = window.setTimeout(arm, ARM_TIMEOUT_MS);
    ARM_EVENTS.forEach((type) => window.addEventListener(type, arm, { passive: true }));
    function cleanup() {
      window.clearTimeout(timer);
      ARM_EVENTS.forEach((type) => window.removeEventListener(type, arm));
    }
    return cleanup;
  }, [enabled]);
  return armed;
}

type HeroLayers = {
  intro: HTMLDivElement | null;
  hint: HTMLParagraphElement | null;
  counter: HTMLDivElement | null;
  counterText: HTMLSpanElement | null;
  figure: (HTMLDivElement | null)[];
};

/** Scroll choreography of the overlay text, written straight to the DOM (no re-renders). */
function applyHeroProgress(layers: HeroLayers, p: number, total: number) {
  const { intro, hint, counter, counterText, figure } = layers;
  if (intro) {
    intro.style.opacity = String(mapRange(p, [0, 0.24], [1, 0]));
    intro.style.transform = `translateY(${mapRange(p, [0, 0.3], [0, -10])}%)`;
    intro.style.pointerEvents = p < 0.2 ? "auto" : "none";
  }
  if (hint) hint.style.opacity = String(mapRange(p, [0, 0.06], [1, 0]));
  // Mid-flight: a colossal counter tallies the commits as they fall into place.
  if (counter) {
    counter.style.opacity = String(mapRange(p, [0.2, 0.3, 0.56, 0.68], [0, 1, 1, 0]));
    counter.style.transform = `scale(${mapRange(p, [0.2, 0.68], [0.85, 1.12])})`;
  }
  if (counterText) {
    counterText.textContent = Math.round(mapRange(p, [0.24, 0.6], [0, total])).toLocaleString();
  }
  for (const layer of figure) {
    if (!layer) continue;
    layer.style.opacity = String(mapRange(p, [0.7, 0.86], [0, 1]));
    layer.style.pointerEvents = p > 0.78 ? "auto" : "none";
  }
}

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
  gatherHint,
  total,
  counterLabel,
}: HeroExperienceProps) {
  const wrapper = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();
  const lowPower = useLowPowerDevice();
  const visible = useInView(wrapper, "0px");
  const { resolvedTheme } = useTheme();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const armed = useArmOnInteraction(!reduced);

  const progress = useRef(0);
  const gather = useRef(0);
  const introRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLParagraphElement>(null);
  const counterRef = useRef<HTMLDivElement>(null);
  const counterTextRef = useRef<HTMLSpanElement>(null);
  const captionRef = useRef<HTMLDivElement>(null);
  const legendRef = useRef<HTMLDivElement>(null);

  useScrollProgress(wrapper, "contain", (value) => {
    progress.current = value;
    if (reduced) return;
    applyHeroProgress(
      {
        intro: introRef.current,
        hint: hintRef.current,
        counter: counterRef.current,
        counterText: counterTextRef.current,
        figure: [captionRef.current, legendRef.current],
      },
      value,
      total,
    );
  });

  // Hold the mouse button anywhere on the opening scene to gather the commits.
  const startGather = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse" || event.button !== 0) return;
    if ((event.target as HTMLElement).closest("a, button")) return;
    gather.current = 1;
  };
  const stopGather = () => {
    gather.current = 0;
  };

  return (
    <section
      ref={wrapper}
      aria-labelledby="hero-heading"
      className="relative h-[260dvh] motion-reduce:h-auto"
    >
      <div
        onPointerDown={startGather}
        onPointerUp={stopGather}
        onPointerLeave={stopGather}
        className="sticky top-0 h-dvh overflow-hidden bg-[radial-gradient(ellipse_at_62%_42%,var(--accent-soft),transparent_62%)] select-none motion-reduce:static motion-reduce:h-auto motion-reduce:overflow-visible"
      >
        {armed && !failed ? (
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
                gather={gather}
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

        <div
          ref={introRef}
          className="relative z-10 flex h-full flex-col justify-end bg-linear-to-t from-paper from-30% via-paper/70 via-55% to-transparent to-75% pt-24 pb-16 motion-reduce:h-auto motion-reduce:bg-none motion-reduce:pt-10 lg:pb-20"
        >
          {intro}
        </div>

        <p
          ref={hintRef}
          aria-hidden="true"
          className="pointer-events-none absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 font-mono text-xs text-muted motion-reduce:hidden sm:flex"
        >
          <span className="hidden text-accent pointer-fine:inline">{gatherHint}</span>
          {scrollHint}
          <span className="h-8 w-px animate-pulse bg-accent-decor" />
        </p>

        <div
          ref={counterRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center opacity-0 motion-reduce:hidden"
        >
          <span
            ref={counterTextRef}
            className="font-display text-colossal leading-none font-medium text-outline tabular-nums"
          >
            0
          </span>
          <span className="mt-2 font-mono text-sm text-muted">{counterLabel}</span>
        </div>

        <div
          ref={captionRef}
          className="pointer-events-none absolute inset-x-0 top-0 z-10 opacity-0 motion-reduce:hidden"
        >
          <div className="mx-auto max-w-page px-4 pt-24 sm:px-6 lg:px-10">
            <div className="max-w-xl text-sm leading-relaxed text-muted">{caption}</div>
          </div>
        </div>

        <div
          ref={legendRef}
          className="pointer-events-none absolute inset-x-0 bottom-0 z-10 opacity-0 motion-reduce:hidden"
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
        </div>
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
