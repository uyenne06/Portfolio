/**
 * Static 2D rendition of the contribution terrain: one ridge line per weekday,
 * drawn back to front so nearer ridges occlude farther ones.
 * Server-safe (no hooks); used as the reduced-motion view, the loading state and
 * the WebGL fallback.
 */

const VIEW_WIDTH = 540;
const VIEW_HEIGHT = 200;
const RIDGE_GAP = 18;
const PEAK = 90;

type ContributionRidgesProps = { heights: number[][]; className?: string };

export function ContributionRidges({ heights, className }: ContributionRidgesProps) {
  const weeks = heights.length;
  const step = VIEW_WIDTH / Math.max(1, weeks - 1);

  const ridges = Array.from({ length: 7 }, (_, day) => {
    const baseline = VIEW_HEIGHT - (6 - day) * RIDGE_GAP - 8;
    const points = heights.map((week, w) => {
      const x = w * step;
      const y = baseline - (week[day] ?? 0) * PEAK;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });
    const area = `0,${baseline} ${points.join(" ")} ${VIEW_WIDTH},${baseline}`;
    return { day, line: points.join(" "), area };
  });

  return (
    <svg
      viewBox={`0 -10 ${VIEW_WIDTH} ${VIEW_HEIGHT + 10}`}
      preserveAspectRatio="xMidYMid meet"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {/* Farthest ridge (Sunday) first. */}
      {ridges.map(({ day, line, area }) => (
        <g key={day}>
          <polygon points={area} fill="var(--paper)" />
          <polyline
            points={line}
            fill="none"
            stroke={day === 3 ? "var(--accent-decor)" : "var(--ink)"}
            strokeOpacity={day === 3 ? 1 : 0.55}
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
            strokeLinejoin="round"
          />
        </g>
      ))}
    </svg>
  );
}
