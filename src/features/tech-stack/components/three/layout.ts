/**
 * Pure layout maths for the two Methods scenes. Positions are derived from the real
 * tool × project matrix, so the pictures are charts, not decoration.
 */

export type StackRow = { label: string; symbol: string; uses: boolean[]; count: number };
export type StackGroup = { id: string; label: string; rows: StackRow[] };

/** Deterministic 0…1 hash of a string (stable jitter between renders and visits). */
export function hash01(text: string, salt = 0): number {
  let h = 2166136261 ^ salt;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 10000) / 10000;
}

// ---------------------------------------------------------------------------------------------
// Exploded stack: one glass slab per layer, a tower per tool (height = projects using it).

export const SLAB = { width: 9, depth: 5, thickness: 0.1, collapsedGap: 0.3, explodedGap: 2.5 };
const TOWER_UNIT = 0.32;

export type Tower = {
  label: string;
  group: number;
  row: StackRow;
  x: number;
  z: number;
  height: number;
  footprint: number;
};

export function towerHeight(count: number): number {
  return 0.2 + count * TOWER_UNIT;
}

export function layoutTowers(groups: StackGroup[]): Tower[] {
  return groups.flatMap((group, groupIndex) => {
    const n = group.rows.length;
    const cols = n > 3 ? Math.ceil(n / 2) : n;
    const rows = Math.ceil(n / cols);
    const stepX = (SLAB.width * 0.82) / cols;
    const stepZ = rows > 1 ? (SLAB.depth * 0.5) / (rows - 1) : 0;
    const footprint = Math.min(0.62, stepX * 0.6);
    return group.rows.map((row, index) => {
      const col = index % cols;
      const r = Math.floor(index / cols);
      return {
        label: row.label,
        group: groupIndex,
        row,
        x: (col - (cols - 1) / 2) * stepX,
        z: (r - (rows - 1) / 2) * stepZ,
        height: towerHeight(row.count),
        footprint,
      };
    });
  });
}

/** Y of slab `index` (0 = top layer) for an explode amount 0…1. */
export function slabY(index: number, layers: number, explode: number): number {
  const gap = SLAB.collapsedGap + (SLAB.explodedGap - SLAB.collapsedGap) * explode;
  return ((layers - 1) / 2 - index) * gap;
}

// ---------------------------------------------------------------------------------------------
// Constellation: projects are stars on a ring, tools hang between the projects that use them.

export type Star = { id: string; label: string; position: [number, number, number] };
export type Node = {
  label: string;
  group: number;
  row: StackRow;
  position: [number, number, number];
};

const RING = 4.8;

/** Evenly spread points on a sphere (golden-angle spiral). */
function fibonacciSphere(index: number, count: number, radius: number): [number, number, number] {
  const y = count > 1 ? 1 - (index / (count - 1)) * 2 : 0;
  const r = Math.sqrt(1 - y * y);
  const theta = index * Math.PI * (3 - Math.sqrt(5));
  return [Math.cos(theta) * r * radius, y * radius * 0.8, Math.sin(theta) * r * radius];
}

export function layoutConstellation(
  projects: { id: string; label: string }[],
  groups: StackGroup[],
): { stars: Star[]; nodes: Node[] } {
  const stars: Star[] = projects.map((project, index) => {
    const angle = (index / projects.length) * Math.PI * 2 + 0.3;
    return {
      ...project,
      position: [Math.cos(angle) * RING, index % 2 === 0 ? 0.45 : -0.45, Math.sin(angle) * RING],
    };
  });

  const rows = groups.flatMap((group, groupIndex) =>
    group.rows.map((row) => ({ row, groupIndex })),
  );
  // Tools shared by three or more projects form the core; the rest sit near their projects.
  const core = rows.filter(({ row }) => row.count >= 3);

  const nodes: Node[] = rows.map(({ row, groupIndex }) => {
    const users = stars.filter((_, index) => row.uses[index]);
    const jitter = (salt: number) => (hash01(row.label, salt) - 0.5) * 0.5;
    let position: [number, number, number];

    if (row.count >= 3) {
      position = fibonacciSphere(
        core.findIndex((entry) => entry.row === row),
        core.length,
        1.9,
      );
    } else if (users.length === 2) {
      // Between its two projects, pulled slightly inwards.
      const [a, b] = users as [Star, Star];
      position = [
        ((a.position[0] + b.position[0]) / 2) * 0.72 + jitter(1),
        ((a.position[1] + b.position[1]) / 2) * 0.5 + jitter(2),
        ((a.position[2] + b.position[2]) / 2) * 0.72 + jitter(3),
      ];
    } else {
      // A satellite of its only project, on the outside of the ring.
      const star = users[0] ?? stars[0];
      const [sx, sy, sz] = star?.position ?? [0, 0, 0];
      const length = Math.hypot(sx, sz) || 1;
      const theta = hash01(row.label) * Math.PI * 2;
      position = [
        sx + (sx / length) * 0.9 + Math.cos(theta) * 0.75,
        sy + Math.sin(theta) * 0.7,
        sz + (sz / length) * 0.9 + Math.sin(theta) * 0.45,
      ];
    }

    return { label: row.label, group: groupIndex, row, position };
  });

  return { stars, nodes };
}
