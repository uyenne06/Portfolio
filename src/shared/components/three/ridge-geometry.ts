/** Geometry helpers shared by the WebGL ridgeline and its static SVG version. */

export type RidgeSample = { t: number; h: number };

/** Square-root scale so one heavy week does not flatten every other ridge. */
export function normaliseSeries(values: readonly number[], max: number): number[] {
  const safeMax = Math.max(1, max);
  return values.map((value) => Math.sqrt(value / safeMax));
}

/**
 * Uniform Catmull-Rom interpolation through weekly heights, sampled `perSegment` times per
 * week. `t` runs 0…1 along the time axis; heights are clamped at 0 (no dips below baseline).
 */
export function smoothRidge(heights: readonly number[], perSegment = 6): RidgeSample[] {
  const n = heights.length;
  if (n === 0) return [];
  if (n === 1) return [{ t: 0, h: heights[0] ?? 0 }];

  const at = (index: number) => heights[Math.min(n - 1, Math.max(0, index))] ?? 0;
  const samples: RidgeSample[] = [];
  for (let i = 0; i < n - 1; i += 1) {
    const [p0, p1, p2, p3] = [at(i - 1), at(i), at(i + 1), at(i + 2)];
    for (let s = 0; s < perSegment; s += 1) {
      const u = s / perSegment;
      const h =
        0.5 *
        (2 * p1 +
          (p2 - p0) * u +
          (2 * p0 - 5 * p1 + 4 * p2 - p3) * u ** 2 +
          (3 * p1 - p0 - 3 * p2 + p3) * u ** 3);
      samples.push({ t: (i + u) / (n - 1), h: Math.max(0, h) });
    }
  }
  samples.push({ t: 1, h: at(n - 1) });
  return samples;
}

/**
 * Portion of the time axis (0…1) where a series is active, padded by one week on each
 * side so the curve can rise from and return to its baseline.
 */
export function activeRange(values: readonly number[]): { from: number; to: number } | null {
  const n = values.length;
  const first = values.findIndex((value) => value > 0);
  if (first === -1 || n < 2) return null;
  let last = first;
  values.forEach((value, index) => {
    if (value > 0) last = index;
  });
  return { from: Math.max(0, first - 1) / (n - 1), to: Math.min(n - 1, last + 1) / (n - 1) };
}

/** Smoothed samples restricted to the active range (the drawn "mountain" of a ridge). */
export function activeSamples(
  values: readonly number[],
  max: number,
  perSegment = 6,
): RidgeSample[] {
  const range = activeRange(values);
  if (!range) return [];
  const epsilon = 1e-6;
  return smoothRidge(normaliseSeries(values, max), perSegment).filter(
    ({ t }) => t >= range.from - epsilon && t <= range.to + epsilon,
  );
}

/** Index of the busiest week. */
export function peakIndex(values: readonly number[]): number {
  let best = 0;
  values.forEach((value, index) => {
    if (value > (values[best] ?? 0)) best = index;
  });
  return best;
}

export function seriesMax(series: readonly { values: readonly number[] }[]): number {
  return Math.max(1, ...series.flatMap((entry) => entry.values));
}
