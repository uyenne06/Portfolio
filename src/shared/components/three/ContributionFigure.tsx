"use client";

import dynamic from "next/dynamic";
import { Component, useRef, useState, type ReactNode } from "react";

import { useInView, useLowPowerDevice, usePrefersReducedMotion } from "@/shared/hooks";
import { cn } from "@/shared/utils";

import { ContributionRidges } from "./ContributionRidges";

// Three.js stays out of the server bundle and the initial client chunk.
const TerrainScene = dynamic(() => import("./TerrainScene"), { ssr: false });

type FallbackBoundaryProps = { fallback: ReactNode; children: ReactNode };

/** Shows the static figure if WebGL cannot be initialised. */
class FallbackBoundary extends Component<FallbackBoundaryProps, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

type ContributionFigureProps = {
  heights: number[][];
  /** Accessible description of the figure (the canvas itself is decorative). */
  label: string;
};

/**
 * Hero figure. Loads the WebGL scene lazily on the client only; shows the static
 * ridge drawing for reduced motion, until the canvas is ready, and when WebGL fails.
 * Low-power devices get a single still frame; off-screen rendering is paused.
 */
export function ContributionFigure({ heights, label }: ContributionFigureProps) {
  const container = useRef<HTMLDivElement>(null);
  const inView = useInView(container, "120px");
  const reducedMotion = usePrefersReducedMotion();
  const lowPower = useLowPowerDevice();
  const [contextLost, setContextLost] = useState(false);
  const [ready, setReady] = useState(false);

  const show3d = !reducedMotion && !contextLost;
  const still = <ContributionRidges heights={heights} className="absolute inset-0 size-full" />;

  return (
    <div
      ref={container}
      role="img"
      aria-label={label}
      className="relative aspect-[4/3] w-full overflow-hidden sm:aspect-video lg:aspect-[21/9]"
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
            <TerrainScene
              heights={heights}
              animate={!lowPower}
              paused={!inView}
              onReady={() => setReady(true)}
              onContextLost={() => setContextLost(true)}
            />
          </div>
        </FallbackBoundary>
      ) : null}
    </div>
  );
}
