import { useFormatter, useTranslations } from "next-intl";

import type { ContributionDay } from "@/shared/lib/github";

const CELL = 10;
const GAP = 3;
const LEVEL_OPACITY = [0, 0.3, 0.55, 0.8, 1] as const;

/** Quartile-style levels relative to the busiest day, like GitHub's own calendar. */
function levelOf(count: number, max: number): number {
  if (count === 0 || max === 0) return 0;
  return Math.min(4, Math.ceil((count / max) * 4));
}

/** Fig. 3 — GitHub-style calendar drawn as an SVG grid (scales with its container). */
export function ContributionHeatmap({ weeks }: { weeks: ContributionDay[][] }) {
  const t = useTranslations("activity");
  const format = useFormatter();
  const max = Math.max(0, ...weeks.flat().map((day) => day.count));
  const width = weeks.length * (CELL + GAP) - GAP;
  const height = 7 * (CELL + GAP) - GAP;

  return (
    <div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full"
        role="img"
        aria-label={t("calendarCaption")}
      >
        {weeks.map((week, w) =>
          week.map((day, index) => {
            // The first week may start mid-week; align by weekday.
            const weekday = new Date(`${day.date}T00:00:00Z`).getUTCDay();
            const level = levelOf(day.count, max);
            return (
              <rect
                key={day.date}
                x={w * (CELL + GAP)}
                y={(Number.isNaN(weekday) ? index : weekday) * (CELL + GAP)}
                width={CELL}
                height={CELL}
                rx={2}
                fill={level === 0 ? "var(--rule)" : "var(--accent-decor)"}
                fillOpacity={level === 0 ? 1 : LEVEL_OPACITY[level]}
              >
                <title>
                  {t("calendarCell", {
                    date: format.dateTime(new Date(`${day.date}T00:00:00Z`), {
                      dateStyle: "medium",
                      timeZone: "UTC",
                    }),
                    count: day.count,
                  })}
                </title>
              </rect>
            );
          }),
        )}
      </svg>
      <div
        className="mt-3 flex items-center justify-end gap-1.5 text-xs text-muted"
        aria-hidden="true"
      >
        <span className="mr-1">{t("less")}</span>
        {LEVEL_OPACITY.map((opacity, level) => (
          <span
            key={level}
            className={
              level === 0 ? "size-2.5 rounded-sm bg-rule" : "size-2.5 rounded-sm bg-accent-decor"
            }
            style={level === 0 ? undefined : { opacity }}
          />
        ))}
        <span className="ml-1">{t("more")}</span>
      </div>
    </div>
  );
}
