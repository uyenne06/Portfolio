import { useFormatter, useLocale, useTranslations } from "next-intl";

import { Cite, CountUp, Figure, Reveal, Section } from "@/shared/components/ui";

import type { ActivityStats, ActivitySummary } from "../types";
import { ContributionHeatmap } from "./ContributionHeatmap";
import { LanguageBar } from "./LanguageBar";
import { RecentActivity } from "./RecentActivity";

const STAT_KEYS = [
  "contributions",
  "commits",
  "pullRequests",
  "issues",
  "reviews",
] as const satisfies readonly (keyof ActivityStats)[];

type ActivitySectionProps = { summary: ActivitySummary; number: string };

export function ActivitySection({ summary, number }: ActivitySectionProps) {
  const t = useTranslations("activity");
  const tSections = useTranslations("sections");
  const format = useFormatter();
  const locale = useLocale();
  const fetched = format.dateTime(new Date(summary.fetchedAt), {
    dateStyle: "long",
    timeZone: "UTC",
  });

  return (
    <Section
      id="results"
      number={number}
      title={tSections("results")}
      note={
        <p>
          {t("intro")}
          <Cite ids={["contributions"]} />
        </p>
      }
    >
      <dl className="grid grid-cols-2 gap-x-6 gap-y-8 border-t border-ink pt-8 sm:grid-cols-3 lg:grid-cols-5">
        {STAT_KEYS.map((key) => (
          <div key={key} className="flex flex-col-reverse gap-1">
            <dt className="text-sm text-muted">{t(`stats.${key}`)}</dt>
            <dd className="font-display text-figure font-medium tabular-nums">
              <CountUp value={summary.stats[key]} locale={locale} />
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-16 grid grid-cols-1 gap-16">
        <Reveal className="min-w-0">
          <Figure
            label={t("calendarLabel")}
            caption={
              <>
                {t("calendarCaption")}
                <Cite ids={["contributions"]} />
              </>
            }
          >
            <div className="relative overflow-x-auto">
              <div className="min-w-xl">
                <ContributionHeatmap weeks={summary.weeks} />
              </div>
            </div>
          </Figure>
        </Reveal>

        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-10">
          <Reveal className="min-w-0">
            <Figure
              label={t("languagesLabel")}
              caption={
                <>
                  {t("languagesCaption")}
                  <Cite ids={["github-profile"]} />
                </>
              }
            >
              <LanguageBar languages={summary.languages} />
            </Figure>
          </Reveal>
          <RecentActivity />
        </div>
      </div>

      <p className="mt-12 font-mono text-xs text-muted">
        {summary.source === "live"
          ? t("sourceLive", { date: fetched })
          : t("sourceSnapshot", { date: fetched })}
      </p>
    </Section>
  );
}
