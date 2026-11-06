import { activeSamples, seriesMax } from "./ridge-geometry";
import type { RidgeTimeline } from "./types";

/**
 * Static ridgeline (oblique projection): one stratum per project, labelled at its left end,
 * with the curve drawn only where the project was active. Back strata are drawn first and
 * occluded by the ones in front. Shares data and highlight state with the WebGL scene.
 */

const WIDTH = 1000;
const HEIGHT = 440;
const LABEL_SPACE = 150;
const SKEW = 22;
const GAP = 36;
const PEAK = 150;
const RIGHT = 12;

type WorkRidgesStillProps = {
  timeline: RidgeTimeline;
  activeId: string | null;
  className?: string;
};

export function WorkRidgesStill({ timeline, activeId, className }: WorkRidgesStillProps) {
  const { series, months, weekCount } = timeline;
  const max = seriesMax(series);
  const count = series.length;
  const span = WIDTH - LABEL_SPACE - RIGHT - (count - 1) * SKEW;
  const frontBaseline = HEIGHT - 40;
  const xOf = (index: number, t: number) => LABEL_SPACE + index * SKEW + t * span;

  const strata = series.map((entry, index) => {
    const baseline = frontBaseline - index * GAP;
    const samples = activeSamples(entry.values, max);
    const points = samples.map(
      ({ t, h }) => `${xOf(index, t).toFixed(1)},${(baseline - h * PEAK).toFixed(1)}`,
    );
    const first = samples[0];
    const last = samples.at(-1);
    const area =
      first && last
        ? `${xOf(index, first.t)},${baseline} ${points.join(" ")} ${xOf(index, last.t)},${baseline}`
        : "";
    return { entry, index, baseline, line: points.join(" "), area };
  });

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      preserveAspectRatio="xMidYMid meet"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {[...strata].reverse().map(({ entry, index, baseline, line, area }) => {
        const active = entry.id === activeId;
        const dimmed = activeId !== null && !active;
        return (
          <g key={entry.id} opacity={dimmed ? 0.3 : 1} className="transition-opacity duration-300">
            <line
              x1={xOf(index, 0)}
              x2={xOf(index, 1)}
              y1={baseline}
              y2={baseline}
              stroke={active ? "var(--accent)" : "var(--ink)"}
              strokeOpacity={active ? 0.6 : 0.18}
              vectorEffect="non-scaling-stroke"
            />
            {area ? (
              <polygon points={area} fill={active ? "var(--accent-soft)" : "var(--paper)"} />
            ) : null}
            {line ? (
              <polyline
                points={line}
                fill="none"
                stroke={active ? "var(--accent)" : "var(--ink)"}
                strokeWidth={active ? 2.5 : 1.25}
                vectorEffect="non-scaling-stroke"
                strokeLinejoin="round"
              />
            ) : null}
            <text
              x={xOf(index, 0) - 10}
              y={baseline + 4}
              textAnchor="end"
              className="font-mono max-sm:hidden"
              fontSize={13}
              fill={active ? "var(--accent)" : "var(--ink)"}
            >
              {entry.label}
            </text>
          </g>
        );
      })}

      {months.map((month) => (
        <text
          key={`${month.index}-${month.label}`}
          x={xOf(0, weekCount > 1 ? month.index / (weekCount - 1) : 0)}
          y={HEIGHT - 12}
          className="font-mono"
          fontSize={13}
          fill="var(--muted)"
        >
          {month.label}
        </text>
      ))}
    </svg>
  );
}
