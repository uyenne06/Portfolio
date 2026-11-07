"use client";

import { Edges } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef, type RefObject } from "react";
import { type Group, type Mesh, Vector3 } from "three";

import { useThemeColors } from "@/shared/components/three";
import { cn } from "@/shared/utils";

import { layoutTowers, SLAB, slabY, type StackGroup, type Tower } from "./layout";

export type MethodsSceneProps = {
  groups: StackGroup[];
  /** Scroll progress of the figure through the viewport (0 → 1), read every frame. */
  progress: RefObject<number>;
  activeProject: number | null;
  hoveredTool: string | null;
  onHoverTool: (label: string | null) => void;
  lowPower: boolean;
  paused: boolean;
  onReady: () => void;
};

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** Explode amount from scroll: collapsed as the figure enters, fully apart by mid-viewport. */
const explodeOf = (progress: number) => smoothstep(0.12, 0.48, progress);

type TowerMeshProps = {
  tower: Tower;
  layers: number;
  progress: RefObject<number>;
  highlighted: boolean;
  dimmed: boolean;
  onHoverTool: (label: string | null) => void;
};

function TowerMesh({ tower, layers, progress, highlighted, dimmed, onHoverTool }: TowerMeshProps) {
  const colors = useThemeColors();
  const mesh = useRef<Mesh>(null);
  const lift = useRef(0);

  useFrame((_, delta) => {
    const node = mesh.current;
    if (!node) return;
    const explode = explodeOf(progress.current);
    // Towers grow out of their slab as the stack opens, staggered by layer.
    const rise = smoothstep(0.15 + tower.group * 0.05, 1, explode);
    lift.current += ((highlighted ? 0.35 : 0) - lift.current) * Math.min(1, delta * 6);
    const height = Math.max(0.001, tower.height * rise);
    node.scale.y = height;
    node.position.y =
      slabY(tower.group, layers, explode) + SLAB.thickness / 2 + height / 2 + lift.current * rise;
  });

  // Axonometric drawing: flat fills, ink outlines. Usage sets the fill.
  const fill = highlighted
    ? colors.accent
    : tower.row.count >= 5
      ? colors.accent
      : tower.row.count >= 4
        ? colors.accentSoft
        : colors.paper;

  return (
    <mesh
      ref={mesh}
      position={[tower.x, 0, tower.z]}
      onPointerOver={(event) => {
        event.stopPropagation();
        onHoverTool(tower.label);
      }}
      onPointerOut={() => onHoverTool(null)}
    >
      <boxGeometry args={[tower.footprint, 1, tower.footprint]} />
      <meshBasicMaterial color={fill} transparent opacity={dimmed ? 0.12 : 1} />
      <Edges color={highlighted ? colors.accent : colors.ink} threshold={15}>
        <lineBasicMaterial
          color={highlighted ? colors.accent : colors.ink}
          transparent
          opacity={dimmed ? 0.15 : 0.85}
        />
      </Edges>
    </mesh>
  );
}

function Slab({
  index,
  layers,
  progress,
}: {
  index: number;
  layers: number;
  progress: RefObject<number>;
}) {
  const colors = useThemeColors();
  const group = useRef<Group>(null);
  useFrame(() => {
    if (group.current) group.current.position.y = slabY(index, layers, explodeOf(progress.current));
  });
  return (
    <group ref={group}>
      <mesh>
        <boxGeometry args={[SLAB.width, SLAB.thickness, SLAB.depth]} />
        <meshBasicMaterial color={colors.accentSoft} transparent opacity={0.6} depthWrite={false} />
        <Edges color={colors.ink} threshold={15}>
          <lineBasicMaterial color={colors.ink} transparent opacity={0.6} />
        </Edges>
      </mesh>
      {/* Corner ticks, like registration marks on a technical drawing. */}
      {[-1, 1].flatMap((sx) =>
        [-1, 1].map((sz) => (
          <mesh key={`${sx}${sz}`} position={[(sx * SLAB.width) / 2, 0, (sz * SLAB.depth) / 2]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshBasicMaterial color={colors.accent} />
          </mesh>
        )),
      )}
    </group>
  );
}

/** Orbits from a low three-quarter view to a higher one as the stack explodes; parallax. */
function CameraRig({ progress, layers }: { progress: RefObject<number>; layers: number }) {
  const size = useThree((state) => state.size);
  const target = useRef(new Vector3());
  const desired = useRef(new Vector3());

  useFrame((state, delta) => {
    const explode = explodeOf(progress.current);
    const aspect = size.width / Math.max(1, size.height);
    const height =
      SLAB.collapsedGap * layers + (SLAB.explodedGap - SLAB.collapsedGap) * layers * explode;
    // Fit both the slab width and the stack height for this aspect ratio (fov 30°).
    const fitWidth = (SLAB.width * 1.45) / (0.536 * aspect);
    const fitHeight = (height + 3) / 0.536;
    const distance = Math.max(12, fitWidth, fitHeight);
    const angle = -0.75 + explode * 0.95 + Math.sin(state.clock.elapsedTime * 0.15) * 0.05;
    const elevation = 0.55 - explode * 0.2;

    desired.current.set(
      Math.sin(angle) * distance + state.pointer.x * 0.8,
      distance * elevation + state.pointer.y * 0.5,
      Math.cos(angle) * distance,
    );
    state.camera.position.lerp(desired.current, Math.min(1, delta * 3));
    state.camera.lookAt(target.current);
  });
  return null;
}

type LabelsProps = {
  groups: StackGroup[];
  towers: Tower[];
  progress: RefObject<number>;
  layerRefs: RefObject<(HTMLSpanElement | null)[]>;
  towerRefs: RefObject<Map<string, HTMLSpanElement>>;
};

/** Pins DOM labels to the slabs (left edge) and tower tops, in percent coordinates. */
function LabelProjector({ groups, towers, progress, layerRefs, towerRefs }: LabelsProps) {
  const point = useRef(new Vector3());
  useFrame((state) => {
    const explode = explodeOf(progress.current);
    const place = (
      element: HTMLSpanElement | null | undefined,
      x: number,
      y: number,
      z: number,
    ) => {
      if (!element) return;
      const projected = point.current.set(x, y, z).project(state.camera);
      element.style.left = `${((projected.x + 1) / 2) * 100}%`;
      element.style.top = `${((1 - projected.y) / 2) * 100}%`;
    };
    groups.forEach((_, index) => {
      const element = layerRefs.current[index];
      place(element, -SLAB.width / 2, slabY(index, groups.length, explode), SLAB.depth / 2);
      if (element) element.style.opacity = explode > 0.4 ? "1" : "0";
    });
    for (const tower of towers) {
      const rise = smoothstep(0.15 + tower.group * 0.05, 1, explode);
      place(
        towerRefs.current.get(tower.label),
        tower.x,
        slabY(tower.group, groups.length, explode) + tower.height * rise + 0.2,
        tower.z,
      );
    }
  });
  return null;
}

export default function ExplodedStackScene({
  groups,
  progress,
  activeProject,
  hoveredTool,
  onHoverTool,
  lowPower,
  paused,
  onReady,
}: MethodsSceneProps) {
  const towers = useMemo(() => layoutTowers(groups), [groups]);
  const layerRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const towerRefs = useRef(new Map<string, HTMLSpanElement>());

  return (
    <div className="relative size-full">
      <Canvas
        flat
        frameloop={paused ? "never" : "always"}
        dpr={lowPower ? [1, 1.5] : [1, 2]}
        camera={{ fov: 30, near: 0.1, far: 200, position: [-10, 10, 16] }}
        gl={{ antialias: true, alpha: true }}
        onPointerMissed={() => onHoverTool(null)}
        onCreated={onReady}
      >
        <ambientLight intensity={1.1} />
        <directionalLight position={[6, 12, 8]} intensity={1.6} />
        <directionalLight position={[-8, 4, -6]} intensity={0.6} color="#e8a0bf" />
        <CameraRig progress={progress} layers={groups.length} />
        {groups.map((group, index) => (
          <Slab key={group.id} index={index} layers={groups.length} progress={progress} />
        ))}
        {towers.map((tower) => {
          const inProject = activeProject === null || tower.row.uses[activeProject] === true;
          return (
            <TowerMesh
              key={tower.label}
              tower={tower}
              layers={groups.length}
              progress={progress}
              highlighted={hoveredTool === tower.label || (activeProject !== null && inProject)}
              dimmed={!inProject}
              onHoverTool={onHoverTool}
            />
          );
        })}
        <LabelProjector
          groups={groups}
          towers={towers}
          progress={progress}
          layerRefs={layerRefs}
          towerRefs={towerRefs}
        />
      </Canvas>

      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        {groups.map((group, index) => (
          <span
            key={group.id}
            ref={(element) => {
              layerRefs.current[index] = element;
            }}
            className="absolute -translate-x-full -translate-y-1/2 pr-3 text-right opacity-0 transition-opacity duration-500 max-sm:translate-x-2 max-sm:-translate-y-full max-sm:pr-0 max-sm:text-left"
          >
            <span className="block font-mono text-xs text-accent">
              {String.fromCharCode(65 + index)}
            </span>
            <span className="block font-display text-lg whitespace-nowrap max-sm:text-sm">
              {group.label}
            </span>
          </span>
        ))}
        {towers.map((tower) => {
          const inProject = activeProject === null || tower.row.uses[activeProject] === true;
          // One label at a time keeps the drawing legible; the panel carries the details.
          const show = hoveredTool === tower.label;
          return (
            <span
              key={tower.label}
              ref={(element) => {
                if (element) towerRefs.current.set(tower.label, element);
                else towerRefs.current.delete(tower.label);
              }}
              className={cn(
                "absolute -translate-x-1/2 -translate-y-full rounded-full px-2 py-0.5 font-mono text-xs whitespace-nowrap transition-opacity duration-300 max-sm:hidden",
                show ? "opacity-100" : "opacity-0",
                hoveredTool === tower.label || (activeProject !== null && inProject)
                  ? "bg-accent-decor text-on-accent"
                  : "bg-paper/85 text-ink",
              )}
            >
              {tower.label}
            </span>
          );
        })}
      </div>
    </div>
  );
}
