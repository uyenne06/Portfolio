"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { BufferGeometry, Color, Float32BufferAttribute, type Group } from "three";

import { useThemeColors, type SceneColors } from "./useThemeColors";

const SPACING_WEEK = 0.22;
const SPACING_DAY = 0.55;
const PEAK_HEIGHT = 1.8;
/** Slight yaw so the most recent weeks recede instead of crowding the camera. */
const BASE_YAW = 0.2;
/** Seconds for the terrain to rise from flat on first render. */
const RISE_DURATION = 1.6;

type TerrainProps = { heights: number[][]; animate: boolean };

function buildGeometry(heights: number[][], colors: SceneColors) {
  const weeks = heights.length;
  const ink = new Color(colors.ink);
  const accent = new Color(colors.accent);
  const mixed = new Color();
  const heightAt = (w: number, d: number) => heights[w]?.[d] ?? 0;
  const vertex = (w: number, d: number): [number, number, number] => [
    (w - (weeks - 1) / 2) * SPACING_WEEK,
    heightAt(w, d) * PEAK_HEIGHT,
    (d - 3) * SPACING_DAY,
  ];
  // Ink on the flats, blending to pink on the busiest days: the accent follows the data.
  const tint = (w: number, d: number): [number, number, number] => {
    mixed.copy(ink).lerp(accent, Math.min(1, heightAt(w, d) * 2.4));
    return [mixed.r, mixed.g, mixed.b];
  };

  const lines: number[] = [];
  const lineColors: number[] = [];
  const points: number[] = [];
  const segment = (a: [number, number], b: [number, number]) => {
    lines.push(...vertex(...a), ...vertex(...b));
    lineColors.push(...tint(...a), ...tint(...b));
  };
  for (let w = 0; w < weeks; w += 1) {
    for (let d = 0; d < 7; d += 1) {
      // Ridge segment along the year, and a cross segment between weekdays.
      if (w + 1 < weeks) segment([w, d], [w + 1, d]);
      if (d + 1 < 7) segment([w, d], [w, d + 1]);
      if (heightAt(w, d) > 0) points.push(...vertex(w, d));
    }
  }

  const lineGeometry = new BufferGeometry();
  lineGeometry.setAttribute("position", new Float32BufferAttribute(lines, 3));
  lineGeometry.setAttribute("color", new Float32BufferAttribute(lineColors, 3));
  const pointGeometry = new BufferGeometry();
  pointGeometry.setAttribute("position", new Float32BufferAttribute(points, 3));
  return { lineGeometry, pointGeometry };
}

function Terrain({ heights, animate }: TerrainProps) {
  const group = useRef<Group>(null);
  const progress = useRef(animate ? 0 : 1);
  const colors = useThemeColors();
  const { lineGeometry, pointGeometry } = useMemo(
    () => buildGeometry(heights, colors),
    [heights, colors],
  );

  useEffect(
    () => () => {
      lineGeometry.dispose();
      pointGeometry.dispose();
    },
    [lineGeometry, pointGeometry],
  );

  useFrame((state, delta) => {
    const node = group.current;
    if (!node) return;
    if (progress.current < 1)
      progress.current = Math.min(1, progress.current + delta / RISE_DURATION);
    const eased = 1 - (1 - progress.current) ** 3;
    node.scale.y = Math.max(eased, 0.001);

    if (!animate) return;
    // Gentle sway toward the pointer; damped so it never feels twitchy.
    const damping = Math.min(1, delta * 2.5);
    node.rotation.y += (BASE_YAW + state.pointer.x * 0.25 - node.rotation.y) * damping;
    node.rotation.x += (state.pointer.y * -0.08 - node.rotation.x) * damping;
  });

  return (
    <group ref={group} rotation={[0, BASE_YAW, 0]}>
      <lineSegments geometry={lineGeometry}>
        <lineBasicMaterial vertexColors transparent opacity={0.6} />
      </lineSegments>
      <points geometry={pointGeometry}>
        <pointsMaterial color={colors.accent} size={0.06} sizeAttenuation />
      </points>
    </group>
  );
}

/** Pulls the camera back on narrow viewports so the whole year stays in frame. */
function CameraRig() {
  const camera = useThree((state) => state.camera);
  const size = useThree((state) => state.size);
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    // Distance that fits the ~12-unit-wide strip horizontally for the current aspect ratio.
    const aspect = size.width / Math.max(1, size.height);
    const distance = Math.min(22, Math.max(9, 22 / aspect));
    camera.position.set(0, distance * 0.42, distance * 0.9);
    camera.lookAt(0, PEAK_HEIGHT * 0.3, 0);
    invalidate();
  }, [camera, size, invalidate]);

  return null;
}

export type TerrainSceneProps = {
  heights: number[][];
  /** Continuous animation (rise + pointer sway). False renders a still frame. */
  animate: boolean;
  /** Pause rendering entirely while off-screen. */
  paused: boolean;
  onReady: () => void;
  onContextLost: () => void;
};

export default function TerrainScene({
  heights,
  animate,
  paused,
  onReady,
  onContextLost,
}: TerrainSceneProps) {
  return (
    <Canvas
      frameloop={paused ? "never" : animate ? "always" : "demand"}
      dpr={animate ? [1, 2] : [1, 1.25]}
      camera={{ fov: 32, near: 0.1, far: 100 }}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      aria-hidden="true"
      onCreated={({ gl }) => {
        gl.domElement.addEventListener("webglcontextlost", onContextLost, { once: true });
        onReady();
      }}
    >
      <CameraRig />
      <Terrain heights={heights} animate={animate} />
    </Canvas>
  );
}
