"use client";

import { Billboard, OrbitControls } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import {
  BufferGeometry,
  Color,
  DoubleSide,
  Float32BufferAttribute,
  type Group,
  Vector3,
} from "three";

import { useThemeColors } from "@/shared/components/three";
import { useMediaQuery } from "@/shared/hooks";
import { cn } from "@/shared/utils";

import type { MethodsSceneProps } from "./ExplodedStackScene";
import { layoutConstellation, type Node, type Star } from "./layout";

type ConstellationSceneProps = MethodsSceneProps & {
  projects: { id: string; label: string }[];
};

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** The constellation unfolds from a point as the figure scrolls in. */
const unfoldOf = (progress: number) => smoothstep(0.08, 0.42, progress);

type Pair = { tool: number; star: number };

/** Threads between each tool and the projects using it; colours encode the highlight. */
function Threads({
  nodes,
  stars,
  pairs,
  isLit,
  dimmed,
}: {
  nodes: Node[];
  stars: Star[];
  pairs: Pair[];
  isLit: (pair: Pair) => boolean;
  dimmed: boolean;
}) {
  const colors = useThemeColors();
  const geometry = useMemo(() => {
    const positions: number[] = [];
    for (const pair of pairs) {
      positions.push(...(nodes[pair.tool]?.position ?? [0, 0, 0]));
      positions.push(...(stars[pair.star]?.position ?? [0, 0, 0]));
    }
    const g = new BufferGeometry();
    g.setAttribute("position", new Float32BufferAttribute(positions, 3));
    return g;
  }, [nodes, stars, pairs]);

  // Colours change with every hover, positions never do.
  useEffect(() => {
    const ink = new Color(colors.ink);
    const accent = new Color(colors.accent);
    const faint = new Color(colors.paper).lerp(ink, dimmed ? 0.12 : 0.28);
    const values: number[] = [];
    for (const pair of pairs) {
      const color = isLit(pair) ? accent : faint;
      values.push(color.r, color.g, color.b, color.r, color.g, color.b);
    }
    geometry.setAttribute("color", new Float32BufferAttribute(values, 3));
  }, [geometry, pairs, isLit, dimmed, colors]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial vertexColors transparent opacity={0.9} />
    </lineSegments>
  );
}

type AnimatorProps = {
  worldRef: RefObject<Group | null>;
  progress: RefObject<number>;
  /** Automatic spin (touch devices, which get no drag controls). */
  spin: boolean;
  labelsRef: RefObject<Map<string, HTMLSpanElement>>;
  stars: Star[];
  nodes: Node[];
};

/** Keeps the whole ring in frame: camera distance follows the canvas aspect ratio. */
function CameraFit() {
  const get = useThree((state) => state.get);
  const size = useThree((state) => state.size);
  useEffect(() => {
    const { camera } = get();
    const aspect = size.width / Math.max(1, size.height);
    // Ring diameter ~11 units plus labels; visible width at distance d ≈ 0.57·d·aspect (fov 32°).
    const distance = Math.max(17, 13 / (0.57 * aspect));
    camera.position.setLength(distance);
    camera.lookAt(0, 0, 0);
  }, [get, size]);
  return null;
}

/** Pins a DOM label to a projected point (percent coordinates of the canvas box). */
function place(element: HTMLSpanElement, projected: Vector3, visible: boolean) {
  element.style.left = `${((projected.x + 1) / 2) * 100}%`;
  element.style.top = `${((1 - projected.y) / 2) * 100}%`;
  element.dataset.visible = visible ? "true" : "false";
}

/** Unfolds the constellation with scroll, spins it on touch devices and pins the labels. */
function Animator({ worldRef, progress, spin, labelsRef, stars, nodes }: AnimatorProps) {
  const point = useRef(new Vector3());
  useFrame((state, delta) => {
    const group = worldRef.current;
    if (!group) return;
    const unfold = unfoldOf(progress.current);
    group.scale.setScalar(0.001 + unfold);
    if (spin) group.rotation.y += delta * 0.12;
    group.updateMatrixWorld();
    for (const [key, element] of labelsRef.current) {
      const source = key.startsWith("star:")
        ? stars.find((star) => `star:${star.id}` === key)?.position
        : nodes.find((node) => `node:${node.label}` === key)?.position;
      if (!source) continue;
      const projected = point.current
        .set(...source)
        .applyMatrix4(group.matrixWorld)
        .project(state.camera);
      place(element, projected, unfold > 0.85 && projected.z < 1);
    }
  });
  return null;
}

export default function ConstellationScene({
  groups,
  projects,
  progress,
  activeProject,
  hoveredTool,
  onHoverTool,
  lowPower,
  paused,
  onReady,
}: ConstellationSceneProps) {
  const colors = useThemeColors();
  const finePointer = useMediaQuery("(hover: hover) and (pointer: fine)");
  const { stars, nodes } = useMemo(() => layoutConstellation(projects, groups), [projects, groups]);
  const pairs = useMemo<Pair[]>(
    () =>
      nodes.flatMap((node, tool) =>
        node.row.uses.flatMap((used, star) => (used ? [{ tool, star }] : [])),
      ),
    [nodes],
  );
  const hoveredIndex = nodes.findIndex((node) => node.label === hoveredTool);
  const isLit = (pair: Pair) =>
    pair.tool === hoveredIndex || (hoveredIndex < 0 && pair.star === activeProject);
  const nodeLit = (node: Node, index: number) =>
    index === hoveredIndex || (activeProject !== null && node.row.uses[activeProject] === true);
  const starLit = (index: number) =>
    index === activeProject || (hoveredIndex >= 0 && nodes[hoveredIndex]?.row.uses[index] === true);
  const anyFocus = hoveredIndex >= 0 || activeProject !== null;

  const world = useRef<Group>(null);
  const labelRefs = useRef(new Map<string, HTMLSpanElement>());
  return (
    <div className="relative size-full">
      <Canvas
        flat
        frameloop={paused ? "never" : "always"}
        dpr={lowPower ? [1, 1.5] : [1, 2]}
        camera={{ fov: 32, near: 0.1, far: 200, position: [0, 8, 15] }}
        gl={{ antialias: true, alpha: true }}
        onPointerMissed={() => onHoverTool(null)}
        onCreated={onReady}
      >
        <CameraFit />
        <ambientLight intensity={1} />
        <directionalLight position={[5, 8, 6]} intensity={1.4} />
        {finePointer ? (
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate={hoveredIndex < 0}
            autoRotateSpeed={0.5}
            rotateSpeed={0.55}
            minPolarAngle={0.6}
            maxPolarAngle={2.2}
          />
        ) : null}
        <Animator
          worldRef={world}
          progress={progress}
          spin={!finePointer}
          labelsRef={labelRefs}
          stars={stars}
          nodes={nodes}
        />
        <group ref={world}>
          <Threads nodes={nodes} stars={stars} pairs={pairs} isLit={isLit} dimmed={anyFocus} />

          {stars.map((star, index) => (
            <group key={star.id} position={star.position}>
              <mesh>
                <sphereGeometry args={[0.26, 32, 32]} />
                <meshStandardMaterial
                  color={colors.accent}
                  emissive={colors.accent}
                  emissiveIntensity={starLit(index) ? 0.9 : 0.35}
                />
              </mesh>
              <Billboard>
                <mesh>
                  <ringGeometry args={[0.38, starLit(index) ? 0.62 : 0.46, 48]} />
                  <meshBasicMaterial
                    color={colors.accent}
                    transparent
                    opacity={starLit(index) ? 0.55 : 0.22}
                    side={DoubleSide}
                  />
                </mesh>
              </Billboard>
            </group>
          ))}

          {nodes.map((node, index) => {
            const lit = nodeLit(node, index);
            const radius = 0.05 + node.row.count * 0.026;
            return (
              <mesh
                key={node.label}
                position={node.position}
                onPointerOver={(event) => {
                  event.stopPropagation();
                  onHoverTool(node.label);
                }}
                onPointerOut={() => onHoverTool(null)}
              >
                <sphereGeometry args={[radius, 20, 20]} />
                <meshStandardMaterial
                  color={lit ? colors.accent : colors.ink}
                  roughness={0.4}
                  transparent
                  opacity={anyFocus && !lit ? 0.25 : 1}
                />
              </mesh>
            );
          })}
        </group>
      </Canvas>

      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        {stars.map((star, index) => (
          <span
            key={star.id}
            ref={(element) => {
              if (element) labelRefs.current.set(`star:${star.id}`, element);
              else labelRefs.current.delete(`star:${star.id}`);
            }}
            className={cn(
              "absolute -translate-x-1/2 translate-y-4 rounded-full px-2.5 py-1 font-display text-base font-medium whitespace-nowrap opacity-0 transition-[opacity,background-color,color] duration-500 data-[visible=true]:opacity-100 max-sm:text-xs",
              starLit(index) ? "bg-accent-decor text-on-accent" : "text-ink",
            )}
          >
            {star.label}
          </span>
        ))}
        {nodes.map((node, index) => {
          const lit = nodeLit(node, index);
          const show = lit;
          return (
            <span
              key={node.label}
              ref={(element) => {
                if (element) labelRefs.current.set(`node:${node.label}`, element);
                else labelRefs.current.delete(`node:${node.label}`);
              }}
              className={cn(
                "absolute -translate-x-1/2 -translate-y-[160%] font-mono text-xs whitespace-nowrap transition-opacity duration-300 max-sm:hidden",
                show ? "data-[visible=true]:opacity-100" : "",
                "opacity-0",
                lit ? "text-accent" : "text-muted",
              )}
            >
              {node.label}
            </span>
          );
        })}
      </div>
    </div>
  );
}
