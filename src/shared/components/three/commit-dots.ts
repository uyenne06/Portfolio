import type { RidgeTimeline } from "./types";

/**
 * Builds the particle buffers for the hero: one particle per real commit, plus faint "dust"
 * that only exists in the opening cloud and fades out as the commits settle.
 *
 * Every commit has two positions:
 *  - start: a random spot in a loose cloud around the title;
 *  - end:   its place in the chart — x = week, z = project row, y = its rank in that week's stack.
 */

export const FIELD = {
  spanX: 12,
  offsetX: 0.9,
  rowGap: 1.25,
  /** Height of the tallest weekly stack. */
  maxStack: 3.4,
  /** Footprint of one commit "sheet". */
  sheetWidth: 0.4,
  sheetDepth: 0.3,
} as const;

export type CommitDots = {
  start: Float32Array;
  end: Float32Array;
  seed: Float32Array;
  /** Project row index, or -1 for dust. */
  series: Float32Array;
  count: number;
  dataCount: number;
  rowZ: number[];
  frontZ: number;
  /** Vertical distance between stacked sheets. */
  step: number;
};

/** Small deterministic PRNG so the cloud looks the same on every visit. */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pointInEllipsoid(random: () => number, rx: number, ry: number, rz: number) {
  // Uniform direction, radius biased outward so the cloud has a soft core and a wide halo.
  const u = random() * 2 - 1;
  const theta = random() * Math.PI * 2;
  const r = Math.cbrt(random());
  const s = Math.sqrt(1 - u * u);
  return [Math.cos(theta) * s * r * rx, u * r * ry, Math.sin(theta) * s * r * rz] as const;
}

export function weekX(index: number, weekCount: number): number {
  return ((weekCount > 1 ? index / (weekCount - 1) : 0) - 0.5) * FIELD.spanX + FIELD.offsetX;
}

export function buildCommitDots(
  timeline: RidgeTimeline,
  dustCount: number,
  options: { includeData?: boolean } = {},
): CommitDots {
  const includeData = options.includeData ?? true;
  const random = mulberry32(20261106);
  const rows = timeline.series.length;
  const frontZ = ((rows - 1) / 2) * FIELD.rowGap;
  const rowZ = timeline.series.map((_, index) => frontZ - index * FIELD.rowGap);
  const maxWeekly = Math.max(1, ...timeline.series.flatMap((series) => series.values));
  const step = Math.min(0.12, FIELD.maxStack / maxWeekly);

  const dataCount = includeData
    ? timeline.series.reduce((sum, series) => sum + series.values.reduce((a, b) => a + b, 0), 0)
    : 0;
  const count = dataCount + dustCount;
  const start = new Float32Array(count * 3);
  const end = new Float32Array(count * 3);
  const seed = new Float32Array(count);
  const series = new Float32Array(count);

  let i = 0;
  (includeData ? timeline.series : []).forEach((entry, row) => {
    entry.values.forEach((commits, week) => {
      for (let k = 0; k < commits; k += 1) {
        const [sx, sy, sz] = pointInEllipsoid(random, 8.5, 4.6, 5);
        // Pushed back from the camera so the cloud frames the title instead of covering it.
        start.set([sx * 1.25 + 2, sy + 1.4, sz - 4], i * 3);
        end.set(
          [
            weekX(week, timeline.weekCount) + (random() - 0.5) * 0.04,
            (k + 0.5) * step,
            (rowZ[row] ?? 0) + (random() - 0.5) * 0.04,
          ],
          i * 3,
        );
        seed[i] = random();
        series[i] = row;
        i += 1;
      }
    });
  });

  for (let d = 0; d < dustCount; d += 1) {
    const [sx, sy, sz] = pointInEllipsoid(random, 15, 8.5, 10);
    start.set([sx, sy, sz], i * 3);
    end.set([sx * 1.7, sy * 1.7, sz * 1.7], i * 3);
    seed[i] = random();
    series[i] = -1;
    i += 1;
  }

  return { start, end, seed, series, count, dataCount, rowZ, frontZ, step };
}
