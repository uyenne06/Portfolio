"use client";

import { ContactShadows, Line } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type ReactNode, type RefObject } from "react";
import {
  AdditiveBlending,
  type Group,
  type InstancedMesh,
  Object3D,
  BufferAttribute,
  BufferGeometry,
  Color,
  NormalBlending,
  ShaderMaterial,
  Vector2,
  Vector3,
} from "three";

import { cn } from "@/shared/utils";

import { buildCommitDots, FIELD, weekX } from "./commit-dots";
import type { RidgeSeries, RidgeTimeline } from "./types";
import { useThemeColors } from "./useThemeColors";

/** Centre of the opening cloud (matches the offsets in commit-dots.ts). */
const CLOUD_CENTER = { x: 2, y: 1.4, z: -4 } as const;

/** Scroll progress at which the chart is fully formed and becomes interactive. */
const SETTLED = 0.82;

const smoothstep = (edge0: number, edge1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
};

const vertexShader = /* glsl */ `
  attribute vec3 aStart;
  attribute vec3 aEnd;
  attribute float aSeed;
  attribute float aSeries;
  uniform float uProgress;
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uActive;
  uniform float uSize;
  uniform float uPixelRatio;
  varying float vAlpha;
  varying float vData;
  varying float vHighlight;
  varying float vSettled;

  void main() {
    float isData = step(-0.5, aSeries);
    // Staggered flight: each commit leaves the cloud at a slightly different moment.
    float local = clamp((uProgress - 0.12 - aSeed * 0.28) / 0.45, 0.0, 1.0);
    float p = local * local * (3.0 - 2.0 * local);

    vec3 drift = vec3(
      sin(uTime * 0.55 + aSeed * 40.0),
      cos(uTime * 0.45 + aSeed * 23.0),
      sin(uTime * 0.35 + aSeed * 11.0)
    ) * 0.22 * (1.0 - p);
    vec3 position = mix(aStart, aEnd, p) + drift;

    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vec4 clip = projectionMatrix * mvPosition;

    // Repel from the cursor while the cloud is loose.
    vec2 ndc = clip.xy / clip.w;
    vec2 away = ndc - uMouse;
    float push = (1.0 - p) * smoothstep(0.38, 0.0, length(away)) * 0.22;
    clip.xy += normalize(away + 1e-5) * push * clip.w;
    gl_Position = clip;

    float highlight = isData * step(-0.5, uActive) * (1.0 - step(0.5, abs(aSeries - uActive)));
    vHighlight = highlight;
    vData = isData;
    vSettled = p;
    vAlpha = mix(0.45 * (1.0 - smoothstep(0.1, 0.5, uProgress)), 1.0, isData);

    float size = uSize * mix(0.5, 1.0, isData) * (1.0 + highlight * 0.7);
    gl_PointSize = size * uPixelRatio * (9.0 / -mvPosition.z);
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uInk;
  uniform vec3 uAccent;
  uniform float uActive;
  varying float vAlpha;
  varying float vData;
  varying float vHighlight;
  varying float vSettled;

  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float r = length(c);
    if (r > 0.5) discard;
    float soft = smoothstep(0.5, 0.18, r);

    // Pink while floating; commits settle into ink, the highlighted project stays pink.
    float toInk = vData * smoothstep(0.55, 1.0, vSettled) * (1.0 - vHighlight);
    vec3 color = mix(uAccent, uInk, toInk);
    float dim = 1.0 - 0.75 * vData * step(-0.5, uActive) * (1.0 - vHighlight) * vSettled;

    gl_FragColor = vec4(color, soft * vAlpha * dim);
    #include <colorspace_fragment>
  }
`;

type FieldProps = {
  timeline: RidgeTimeline;
  progress: RefObject<number>;
  activeIndex: number;
  dust: number;
  dark: boolean;
};

function CommitPoints({ timeline, progress, activeIndex, dust, dark }: FieldProps) {
  const colors = useThemeColors();
  const pixelRatio = useThree((state) => state.viewport.dpr);
  // Dust only: the commits themselves are drawn as 3D sheets by CommitSheets.
  const dots = useMemo(
    () => buildCommitDots(timeline, dust, { includeData: false }),
    [timeline, dust],
  );

  const geometry = useMemo(() => {
    const g = new BufferGeometry();
    // `position` is required by three.js for bounds; the shader uses aStart/aEnd.
    g.setAttribute("position", new BufferAttribute(dots.end, 3));
    g.setAttribute("aStart", new BufferAttribute(dots.start, 3));
    g.setAttribute("aEnd", new BufferAttribute(dots.end, 3));
    g.setAttribute("aSeed", new BufferAttribute(dots.seed, 1));
    g.setAttribute("aSeries", new BufferAttribute(dots.series, 1));
    return g;
  }, [dots]);

  // Initial uniform values; the live material is reached through `materialRef` and updated
  // every frame (three.js objects are mutable by design, so they go through a ref).
  const uniforms = useMemo(
    () => ({
      uProgress: { value: 0 },
      uTime: { value: 0 },
      uMouse: { value: new Vector2(10, 10) },
      uActive: { value: -1 },
      uSize: { value: 11 },
      uPixelRatio: { value: 1 },
      uInk: { value: new Color("#000000") },
      uAccent: { value: new Color("#e8a0bf") },
    }),
    [],
  );
  const materialRef = useRef<ShaderMaterial>(null);

  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame((state) => {
    const material = materialRef.current;
    if (!material) return;
    const u = material.uniforms;
    if (u.uProgress) u.uProgress.value = progress.current;
    if (u.uTime) u.uTime.value = state.clock.elapsedTime;
    (u.uMouse?.value as Vector2 | undefined)?.set(state.pointer.x, state.pointer.y);
    if (u.uActive) u.uActive.value = activeIndex;
    if (u.uPixelRatio) u.uPixelRatio.value = pixelRatio;
    (u.uInk?.value as Color | undefined)?.set(colors.ink);
    (u.uAccent?.value as Color | undefined)?.set(colors.accent);
    // Additive glow reads well on black; on white it would wash out, so blend normally.
    material.blending = dark ? AdditiveBlending : NormalBlending;
  });

  return (
    <points geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </points>
  );
}

type SheetsProps = {
  timeline: RidgeTimeline;
  progress: RefObject<number>;
  activeIndex: number;
  /** 1 while the visitor holds the mouse button on the hero, else 0. */
  gather: RefObject<number>;
};

/**
 * One thin "sheet of paper" per commit (instanced). Pink sheets tumble in a loose cloud, then
 * fly into place and stack by week on their project's row; settled sheets turn ink, the
 * highlighted project stays pink and the others fade back.
 */
function CommitSheets({ timeline, progress, activeIndex, gather }: SheetsProps) {
  const colors = useThemeColors();
  const dots = useMemo(() => buildCommitDots(timeline, 0), [timeline]);
  const meshRef = useRef<InstancedMesh>(null);
  const work = useRef({
    object: new Object3D(),
    color: new Color(),
    ink: new Color(),
    accent: new Color(),
    paper: new Color(),
    projected: new Vector3(),
    attractor: new Vector3(),
    ray: new Vector3(),
    gathered: 0,
  });

  useFrame((state) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const scratch = work.current;
    const { object, color, ink, accent, paper, projected, attractor, ray } = scratch;
    ink.set(colors.ink);
    accent.set(colors.accent);
    paper.set(colors.paper);
    const p = progress.current;
    const time = state.clock.elapsedTime;
    const { start, end, seed, series } = dots;

    // Hold-to-gather: ease towards the button state, and find the cursor's point on the
    // cloud's depth plane so loose sheets can orbit it.
    scratch.gathered += ((gather.current ?? 0) - scratch.gathered) * 0.08;
    const pull = scratch.gathered;
    if (pull > 0.001) {
      ray
        .set(state.pointer.x, state.pointer.y, 0.5)
        .unproject(state.camera)
        .sub(state.camera.position)
        .normalize();
      const distanceToPlane = (CLOUD_CENTER.z - state.camera.position.z) / (ray.z || -1);
      attractor.copy(state.camera.position).addScaledVector(ray, distanceToPlane);
    }

    // A slow "time cursor" sweeps the finished chart from the first week to the last.
    const left = weekX(0, timeline.weekCount);
    const right = weekX(timeline.weekCount - 1, timeline.weekCount);
    const sweepX = left - 1 + ((time * 0.16) % 1.3) * (right - left + 2);

    for (let i = 0; i < dots.dataCount; i += 1) {
      const s = seed[i] ?? 0;
      const local = Math.min(1, Math.max(0, (p - 0.12 - s * 0.28) / 0.45));
      const e = local * local * (3 - 2 * local);
      const loose = 1 - e;

      // Cloud position: bursts out of the cloud's centre on load, then swirls slowly.
      const angle = time * 0.06 + s * 0.4;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const ox = (start[i * 3] ?? 0) - CLOUD_CENTER.x;
      const oz = (start[i * 3 + 2] ?? 0) - CLOUD_CENTER.z;
      const burst = 1 - Math.pow(1 - Math.min(1, time / (1.4 + s * 0.6)), 4);
      const cloudX = CLOUD_CENTER.x + (ox * cos - oz * sin) * burst;
      const cloudY = CLOUD_CENTER.y + ((start[i * 3 + 1] ?? 0) - CLOUD_CENTER.y) * burst;
      const cloudZ = CLOUD_CENTER.z + (ox * sin + oz * cos) * burst;

      let x = cloudX * loose + (end[i * 3] ?? 0) * e;
      let y = cloudY * loose + (end[i * 3 + 1] ?? 0) * e;
      const z = cloudZ * loose + (end[i * 3 + 2] ?? 0) * e;
      x += Math.sin(time * 0.5 + s * 40) * 0.25 * loose;
      y += Math.cos(time * 0.4 + s * 23) * 0.25 * loose;

      // Gathered sheets spiral around the cursor.
      if (pull > 0.001 && loose > 0.01) {
        const orbit = time * (1.6 + s) + s * 12;
        const radius = 0.2 + s * 1.05;
        const gx = attractor.x + Math.cos(orbit) * radius;
        const gy = attractor.y + Math.sin(orbit) * radius * 0.8;
        const k = pull * loose * 0.96;
        x += (gx - x) * k;
        y += (gy - y) * k;
      }

      // Otherwise, push loose sheets away from the cursor (screen space).
      if (loose > 0.01 && pull < 0.5) {
        projected.set(x, y, z).project(state.camera);
        const dx = projected.x - state.pointer.x;
        const dy = projected.y - state.pointer.y;
        const distance = Math.hypot(dx, dy);
        if (distance < 0.35) {
          const force = (1 - distance / 0.35) * 1.6 * loose;
          x += (dx / (distance || 1)) * force;
          y += (dy / (distance || 1)) * force;
        }
      }

      object.position.set(x, y, z);
      // Sheets spin fast while bursting out, then settle into a lazy tumble.
      const spin = time * (0.6 + (1 - burst) * 3);
      object.rotation.set(
        (s * 6 + spin) * loose,
        (s * 9 + spin * 0.7) * loose,
        (s * 3 + spin * 0.8) * loose,
      );
      const scale = 1 + loose * 0.3;
      object.scale.set(scale, scale, scale);
      object.updateMatrix();
      mesh.setMatrixAt(i, object.matrix);

      const row = series[i] ?? -1;
      const highlighted = activeIndex >= 0 && row === activeIndex;
      const settled = Math.min(1, Math.max(0, (e - 0.55) / 0.45));
      color.copy(accent).lerp(ink, highlighted ? 0 : settled);
      if (activeIndex >= 0 && !highlighted) color.lerp(paper, 0.7 * settled);
      if (activeIndex < 0 && settled > 0) {
        const glow = Math.max(0, 1 - Math.abs((end[i * 3] ?? 0) - sweepX) / 0.9);
        color.lerp(accent, glow * glow * 0.9 * settled);
      }
      mesh.setColorAt(i, color);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, Math.max(1, dots.dataCount)]}
      frustumCulled={false}
    >
      <boxGeometry args={[FIELD.sheetWidth, dots.step * 0.72, FIELD.sheetDepth]} />
      <meshStandardMaterial roughness={0.6} metalness={0.05} />
    </instancedMesh>
  );
}

/** Shows its children only once the chart has (nearly) formed. */
function SettledOnly({
  progress,
  from,
  children,
}: {
  progress: RefObject<number>;
  from: number;
  children: ReactNode;
}) {
  const group = useRef<Group>(null);
  useFrame(() => {
    if (group.current) group.current.visible = progress.current >= from;
  });
  return <group ref={group}>{children}</group>;
}

type RowsProps = {
  timeline: RidgeTimeline;
  progress: RefObject<number>;
  activeIndex: number;
  onHover: (id: string | null) => void;
  onSelect: (series: RidgeSeries) => void;
};

/** Faint stratum lines and invisible hit areas, one per project row. */
function Rows({ timeline, progress, activeIndex, onHover, onSelect }: RowsProps) {
  const colors = useThemeColors();
  const dots = useMemo(() => buildCommitDots(timeline, 0), [timeline]);
  const lineRefs = useRef<({ material: { opacity: number } } | null)[]>([]);
  const left = weekX(0, timeline.weekCount);
  const right = weekX(timeline.weekCount - 1, timeline.weekCount);

  useFrame(() => {
    const visible = smoothstep(0.6, 0.9, progress.current);
    lineRefs.current.forEach((line, index) => {
      if (line) line.material.opacity = visible * (index === activeIndex ? 0.8 : 0.22);
    });
  });

  return (
    <>
      {timeline.series.map((series, index) => {
        const z = dots.rowZ[index] ?? 0;
        return (
          <group key={series.id}>
            <Line
              ref={(line) => {
                lineRefs.current[index] = line as unknown as {
                  material: { opacity: number };
                } | null;
              }}
              points={[
                [left, 0, z],
                [right, 0, z],
              ]}
              color={index === activeIndex ? colors.accent : colors.ink}
              lineWidth={1}
              transparent
              opacity={0}
            />
            <mesh
              position={[(left + right) / 2, FIELD.maxStack / 2, z]}
              onPointerOver={(event) => {
                if (progress.current < SETTLED) return;
                event.stopPropagation();
                onHover(series.id);
              }}
              onPointerOut={() => onHover(null)}
              onClick={(event) => {
                if (progress.current < SETTLED) return;
                event.stopPropagation();
                onSelect(series);
              }}
            >
              <planeGeometry args={[right - left, FIELD.maxStack + 0.4]} />
              <meshBasicMaterial transparent opacity={0} depthWrite={false} />
            </mesh>
          </group>
        );
      })}
    </>
  );
}

/** Flies from a frontal view of the cloud to an elevated view of the chart, with parallax. */
function CameraPath({ progress }: { progress: RefObject<number> }) {
  const size = useThree((state) => state.size);
  // Scratch vectors live in a ref: they are mutated every frame.
  const vectors = useRef({
    position: new Vector3(),
    target: new Vector3(),
    from: new Vector3(),
    to: new Vector3(),
  });

  useFrame((state, delta) => {
    const { camera, pointer } = state;
    const aspect = size.width / Math.max(1, size.height);
    // Portrait screens need the camera much further back to fit the time axis.
    const distance = Math.min(64, Math.max(11, 17 / (0.536 * aspect)));
    const t = smoothstep(0.1, 0.8, progress.current);
    const scratch = vectors.current;

    scratch.from.set(0, 0.2, 14);
    // Portrait: look down more steeply so the project rows spread over the taller screen.
    scratch.to.set(0, distance * (aspect < 1 ? 1.1 : 0.62), distance);
    scratch.position.lerpVectors(scratch.from, scratch.to, t);
    scratch.position.x += pointer.x * 0.7;
    scratch.position.y += pointer.y * 0.35;

    const damping = Math.min(1, delta * 3);
    camera.position.lerp(scratch.position, damping);
    scratch.target.set(0.3 * t, 0.3 - 0.4 * t, 0.5 * t);
    camera.lookAt(scratch.target);
  });

  return null;
}

type ProjectorProps = {
  timeline: RidgeTimeline;
  progress: RefObject<number>;
  labelRefs: RefObject<(HTMLSpanElement | null)[]>;
  monthRefs: RefObject<(HTMLSpanElement | null)[]>;
};

/** Places the DOM labels over the canvas (percent coordinates) and fades them in on settle. */
function LabelProjector({ timeline, progress, labelRefs, monthRefs }: ProjectorProps) {
  const dots = useMemo(() => buildCommitDots(timeline, 0), [timeline]);
  const vector = useRef(new Vector3());

  useFrame((state) => {
    const visible = smoothstep(0.72, 0.92, progress.current).toFixed(3);
    const place = (
      element: HTMLSpanElement | null | undefined,
      x: number,
      y: number,
      z: number,
    ) => {
      if (!element) return;
      const projected = vector.current.set(x, y, z).project(state.camera);
      element.style.left = `${((projected.x + 1) / 2) * 100}%`;
      element.style.top = `${((1 - projected.y) / 2) * 100}%`;
      element.style.opacity = visible;
    };
    const left = weekX(0, timeline.weekCount);
    dots.rowZ.forEach((z, index) => place(labelRefs.current[index], left - 0.15, 0, z));
    timeline.months.forEach((month, index) =>
      place(monthRefs.current[index], weekX(month.index, timeline.weekCount), 0, dots.frontZ + 0.7),
    );
  });

  return null;
}

export type CommitFieldSceneProps = {
  /** 1 while the mouse button is held on the hero (gathers the cloud around the cursor). */
  gather: RefObject<number>;
  timeline: RidgeTimeline;
  /** Scroll progress through the hero, 0 (cloud) → 1 (chart). Read every frame. */
  progress: RefObject<number>;
  activeId: string | null;
  dark: boolean;
  lowPower: boolean;
  paused: boolean;
  onHover: (id: string | null) => void;
  onSelect: (series: RidgeSeries) => void;
  onReady: () => void;
  onContextLost: () => void;
};

export default function CommitFieldScene({
  timeline,
  progress,
  gather,
  activeId,
  dark,
  lowPower,
  paused,
  onHover,
  onSelect,
  onReady,
  onContextLost,
}: CommitFieldSceneProps) {
  const labelRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const monthRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const activeIndex = timeline.series.findIndex((series) => series.id === activeId);

  return (
    <div className="relative size-full">
      <Canvas
        flat
        frameloop={paused ? "never" : "always"}
        dpr={lowPower ? [1, 1.5] : [1, 2]}
        camera={{ fov: 30, near: 0.1, far: 120, position: [0, 0.2, 14] }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        onPointerMissed={() => onHover(null)}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener("webglcontextlost", onContextLost, { once: true });
          onReady();
        }}
      >
        <CameraPath progress={progress} />
        <ambientLight intensity={dark ? 0.7 : 1.1} />
        <directionalLight position={[4, 9, 7]} intensity={dark ? 1.4 : 1.8} />
        <directionalLight position={[-6, 3, -4]} intensity={0.5} color="#e8a0bf" />
        <CommitSheets
          timeline={timeline}
          progress={progress}
          activeIndex={activeIndex}
          gather={gather}
        />
        {lowPower ? null : (
          <SettledOnly progress={progress} from={0.6}>
            <ContactShadows
              position={[FIELD.offsetX, -0.02, 0]}
              scale={[FIELD.spanX + 4, 12]}
              opacity={dark ? 0.6 : 0.35}
              blur={2.4}
              far={4}
              resolution={512}
              color={dark ? "#000000" : "#4a2338"}
            />
          </SettledOnly>
        )}
        <CommitPoints
          timeline={timeline}
          progress={progress}
          activeIndex={activeIndex}
          dust={lowPower ? 600 : 1800}
          dark={dark}
        />
        <Rows
          timeline={timeline}
          progress={progress}
          activeIndex={activeIndex}
          onHover={onHover}
          onSelect={onSelect}
        />
        <LabelProjector
          timeline={timeline}
          progress={progress}
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
                "absolute -translate-x-full -translate-y-1/2 rounded-full px-2 py-0.5 font-mono text-xs whitespace-nowrap opacity-0 transition-[background-color,color] duration-300 max-sm:hidden",
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
              "absolute -translate-x-1/2 font-mono text-xs whitespace-nowrap text-muted opacity-0",
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
