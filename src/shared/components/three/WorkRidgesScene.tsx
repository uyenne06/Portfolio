"use client";

import { Line } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import { BufferGeometry, DoubleSide, Float32BufferAttribute, Vector3, type Group } from "three";

import { cn } from "@/shared/utils";

import { activeSamples, seriesMax } from "./ridge-geometry";
import type { RidgeSeries, RidgeTimeline } from "./types";
import { useThemeColors, type SceneColors } from "./useThemeColors";

const SPAN_X = 12;
const GAP_Z = 1.35;
const PEAK = 2.3;
/** Seconds each ridge takes to rise; ridges start one after another. */
const RISE = 1.1;
const STAGGER = 0.14;
/** Shift the stack right so the row labels at the left end of each baseline fit in frame. */
const OFFSET_X = 0.9;

type Point = [number, number, number];
type Layout = { z: number }[];

function riseProgress(index: number, elapsed: number, animate: boolean): number {
  if (!animate) return 1;
  const linear = Math.min(1, Math.max(0, (elapsed - index * STAGGER) / RISE));
  return 1 - (1 - linear) ** 3;
}

const xAt = (index: number, weekCount: number) =>
  ((weekCount > 1 ? index / (weekCount - 1) : 0) - 0.5) * SPAN_X;

/** Curve over the project's active weeks only; the rest of the stratum is a faint baseline. */
function ridgePoints(values: number[], max: number): Point[] {
  return activeSamples(values, max, 8).map(({ t, h }) => [(t - 0.5) * SPAN_X, h * PEAK, 0]);
}

/** Vertical "curtain" between baseline and ridge; opaque so ridges behind are hidden. */
function curtainGeometry(points: Point[]): BufferGeometry {
  const positions: number[] = [];
  for (let i = 0; i < points.length - 1; i += 1) {
    const [x1, y1] = points[i] ?? [0, 0];
    const [x2, y2] = points[i + 1] ?? [0, 0];
    positions.push(x1, 0, 0, x2, 0, 0, x2, y2, 0, x1, 0, 0, x2, y2, 0, x1, y1, 0);
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  return geometry;
}

type RidgeProps = {
  series: RidgeSeries;
  index: number;
  z: number;
  max: number;
  colors: SceneColors;
  activeId: string | null;
  animate: boolean;
  onHover: (id: string | null) => void;
  onSelect: (series: RidgeSeries) => void;
};

function Ridge({
  series,
  index,
  z,
  max,
  colors,
  activeId,
  animate,
  onHover,
  onSelect,
}: RidgeProps) {
  const group = useRef<Group>(null);
  const points = useMemo(() => ridgePoints(series.values, max), [series.values, max]);
  const curtain = useMemo(() => curtainGeometry(points), [points]);
  useEffect(() => () => curtain.dispose(), [curtain]);

  const active = series.id === activeId;
  const dimmed = activeId !== null && !active;

  useFrame((state) => {
    const node = group.current;
    if (node) node.scale.y = Math.max(0.001, riseProgress(index, state.clock.elapsedTime, animate));
  });

  return (
    <group ref={group} position={[0, 0, z]}>
      <mesh
        geometry={curtain}
        onPointerOver={(event) => {
          event.stopPropagation();
          onHover(series.id);
        }}
        onPointerOut={() => onHover(null)}
        onClick={(event) => {
          event.stopPropagation();
          onSelect(series);
        }}
      >
        <meshBasicMaterial color={active ? colors.accentSoft : colors.paper} side={DoubleSide} />
      </mesh>
      <Line
        points={[
          [-SPAN_X / 2, 0, 0.001],
          [SPAN_X / 2, 0, 0.001],
        ]}
        color={active ? colors.accent : colors.ink}
        lineWidth={1}
        transparent
        opacity={active ? 0.6 : 0.18}
      />
      {points.length > 1 ? (
        <Line
          points={points}
          color={active ? colors.accent : colors.ink}
          lineWidth={active ? 3 : 1.5}
          transparent
          opacity={dimmed ? 0.25 : 1}
          position={[0, 0, 0.002]}
        />
      ) : null}
    </group>
  );
}

/** Frames the stack for the current aspect ratio and adds a gentle pointer parallax. */
function CameraRig({ animate }: { animate: boolean }) {
  // The camera is mutated through the store (`get()` / frame state), not a hook value.
  const get = useThree((state) => state.get);
  const size = useThree((state) => state.size);
  const base = useRef(new Vector3());
  const target = useMemo(() => new Vector3(0.3, -0.1, 0.5), []);

  useEffect(() => {
    const { camera, invalidate } = get();
    const aspect = size.width / Math.max(1, size.height);
    // Horizontal extent to fit: the 12-unit time axis plus room for row labels (~16 units).
    // Visible width at distance d is 2·d·tan(fov/2)·aspect ≈ 0.536·d·aspect for fov 30°.
    const distance = Math.min(26, Math.max(11, 17 / (0.536 * aspect)));
    // Straight-on and slightly above, so every stratum stays horizontal.
    base.current.set(0, distance * 0.62, distance);
    camera.position.copy(base.current);
    camera.lookAt(target);
    invalidate();
  }, [get, size, target]);

  useFrame((state, delta) => {
    if (!animate) return;
    const { camera, pointer } = state;
    const damping = Math.min(1, delta * 2);
    camera.position.x += (base.current.x + pointer.x * 0.6 - camera.position.x) * damping;
    camera.position.y += (base.current.y + pointer.y * 0.3 - camera.position.y) * damping;
    camera.lookAt(target);
  });

  return null;
}

type ProjectorProps = {
  layout: Layout;
  timeline: RidgeTimeline;
  frontZ: number;
  animate: boolean;
  labelRefs: RefObject<(HTMLSpanElement | null)[]>;
  monthRefs: RefObject<(HTMLSpanElement | null)[]>;
};

/**
 * Positions the DOM labels over the canvas each frame by projecting their 3D anchors to
 * screen space. Uses percentages of the canvas box, so no pixel values are written.
 */
function LabelProjector({
  layout,
  timeline,
  frontZ,
  animate,
  labelRefs,
  monthRefs,
}: ProjectorProps) {
  const scratch = useMemo(() => new Vector3(), []);

  useFrame((state) => {
    const place = (
      element: HTMLSpanElement | null | undefined,
      x: number,
      y: number,
      z: number,
    ) => {
      if (!element) return;
      scratch.set(x, y, z).project(state.camera);
      element.style.left = `${((scratch.x + 1) / 2) * 100}%`;
      element.style.top = `${((1 - scratch.y) / 2) * 100}%`;
    };

    layout.forEach(({ z }, index) => {
      const progress = riseProgress(index, state.clock.elapsedTime, animate);
      const element = labelRefs.current[index];
      place(element, OFFSET_X - SPAN_X / 2 - 0.12, 0, z);
      if (element) element.style.opacity = progress > 0.2 ? "1" : "0";
    });

    timeline.months.forEach((month, index) => {
      place(
        monthRefs.current[index],
        OFFSET_X + xAt(month.index, timeline.weekCount),
        0,
        frontZ + 0.55,
      );
    });
  });

  return null;
}

type SceneContentProps = Omit<WorkRidgesSceneProps, "paused" | "onReady" | "onContextLost"> & {
  layout: Layout;
  frontZ: number;
  labelRefs: RefObject<(HTMLSpanElement | null)[]>;
  monthRefs: RefObject<(HTMLSpanElement | null)[]>;
};

function SceneContent({
  timeline,
  activeId,
  animate,
  onHover,
  onSelect,
  layout,
  frontZ,
  labelRefs,
  monthRefs,
}: SceneContentProps) {
  const colors = useThemeColors();
  const max = seriesMax(timeline.series);

  return (
    <>
      <CameraRig animate={animate} />
      <group position={[OFFSET_X, 0, 0]}>
        {timeline.series.map((series, index) => (
          <Ridge
            key={series.id}
            series={series}
            index={index}
            z={layout[index]?.z ?? 0}
            max={max}
            colors={colors}
            activeId={activeId}
            animate={animate}
            onHover={onHover}
            onSelect={onSelect}
          />
        ))}
        {timeline.months.map((month) => (
          <Line
            key={`${month.index}-${month.label}`}
            points={[
              [xAt(month.index, timeline.weekCount), 0, frontZ + 0.05],
              [xAt(month.index, timeline.weekCount), 0, frontZ + 0.35],
            ]}
            color={colors.muted}
            lineWidth={1}
          />
        ))}
      </group>
      <LabelProjector
        layout={layout}
        timeline={timeline}
        frontZ={frontZ}
        animate={animate}
        labelRefs={labelRefs}
        monthRefs={monthRefs}
      />
    </>
  );
}

export type WorkRidgesSceneProps = {
  timeline: RidgeTimeline;
  activeId: string | null;
  /** Rise animation and parallax. False renders still frames (low-power devices). */
  animate: boolean;
  /** Pause rendering entirely while off-screen. */
  paused: boolean;
  onHover: (id: string | null) => void;
  onSelect: (series: RidgeSeries) => void;
  onReady: () => void;
  onContextLost: () => void;
};

export default function WorkRidgesScene({
  paused,
  onReady,
  onContextLost,
  ...props
}: WorkRidgesSceneProps) {
  const { timeline, activeId } = props;
  const labelRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const monthRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const { layout, frontZ } = useMemo(() => {
    const front = ((timeline.series.length - 1) / 2) * GAP_Z;
    return {
      frontZ: front,
      layout: timeline.series.map((_, index) => ({ z: front - index * GAP_Z })),
    };
  }, [timeline]);

  return (
    <div className="relative size-full">
      <Canvas
        flat
        frameloop={paused ? "never" : props.animate ? "always" : "demand"}
        dpr={props.animate ? [1, 2] : [1, 1.5]}
        camera={{ fov: 30, near: 0.1, far: 100 }}
        gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
        onPointerMissed={() => props.onHover(null)}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener("webglcontextlost", onContextLost, { once: true });
          onReady();
        }}
      >
        <SceneContent
          {...props}
          layout={layout}
          frontZ={frontZ}
          labelRefs={labelRefs}
          monthRefs={monthRefs}
        />
      </Canvas>

      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        {timeline.series.map((series, index) => {
          const active = series.id === activeId;
          return (
            <span
              key={series.id}
              ref={(element) => {
                labelRefs.current[index] = element;
              }}
              className={cn(
                "absolute -translate-x-full -translate-y-1/2 rounded-full px-2 py-0.5 font-mono text-xs whitespace-nowrap opacity-0 transition-[opacity,background-color,color] duration-300 max-sm:hidden",
                active ? "bg-accent-decor text-on-accent" : "text-ink",
                activeId !== null && !active && "text-muted",
              )}
            >
              {series.label}
            </span>
          );
        })}
        {timeline.months.map((month, index) => (
          <span
            key={`${month.index}-${month.label}`}
            ref={(element) => {
              monthRefs.current[index] = element;
            }}
            className={cn(
              "absolute -translate-x-1/2 font-mono text-xs whitespace-nowrap text-muted",
              index % 2 === 1 && "max-sm:hidden",
            )}
          >
            {month.label}
          </span>
        ))}
      </div>
    </div>
  );
}
