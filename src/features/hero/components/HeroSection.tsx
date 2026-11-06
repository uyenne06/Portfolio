import { useFormatter, useTranslations } from "next-intl";
import type { CSSProperties } from "react";

import type { RidgeTimeline } from "@/shared/components/three";
import { HeroExperience } from "@/shared/components/three";
import { BrandIcon, ButtonLink, Cite, Container } from "@/shared/components/ui";

import type { WorkTimeline } from "../types";

type HeroSectionProps = {
  location: string | null;
  githubUrl: string;
  timeline: WorkTimeline;
};

const utcDate = (iso: string) => new Date(`${iso}T00:00:00Z`);

/**
 * Title page. Prepares localised copy and the chart data, then hands both to the client
 * HeroExperience (scroll-driven WebGL field where every particle is one commit).
 */
export function HeroSection({ location, githubUrl, timeline }: HeroSectionProps) {
  const t = useTranslations("hero");
  const tPerson = useTranslations("person");
  const tProjects = useTranslations("projects");
  const format = useFormatter();

  const words = tPerson("name").split(" ");
  const { weekStarts } = timeline;
  const start = weekStarts[0];
  const end = weekStarts.at(-1);
  const monthOf = (iso: string) => utcDate(iso).getUTCMonth();
  const range = (from: string, to: string) =>
    format.dateTimeRange(utcDate(from), utcDate(to), {
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    });

  const monthStarts = weekStarts.flatMap((week, index) =>
    index === 0 || monthOf(week) !== monthOf(weekStarts[index - 1] ?? week)
      ? [{ index, label: format.dateTime(utcDate(week), { month: "short", timeZone: "UTC" }) }]
      : [],
  );
  // Drop the first tick when the next month begins within two weeks (labels would collide).
  const months = (monthStarts[1]?.index ?? Infinity) <= 2 ? monthStarts.slice(1) : monthStarts;

  const ridges: RidgeTimeline = {
    weekCount: weekStarts.length,
    months,
    series: timeline.series.map((series) => ({
      id: series.id,
      label: series.id === "other" ? t("otherRepositories") : tProjects(`items.${series.id}.title`),
      detail: t("seriesDetail", { count: series.total }),
      values: series.values,
      href: series.id === "other" ? null : `#project-${series.id}`,
    })),
  };
  const period = start && end ? range(start, end) : "";
  const total = timeline.series.reduce((sum, series) => sum + series.total, 0);

  const intro = (
    <Container>
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 font-mono text-xs text-muted">
        {location ? <p>{t("meta", { location })}</p> : null}
        <p>{t("availability")}</p>
      </div>

      <h1 id="hero-heading" className="mt-6 font-display text-display font-medium text-balance">
        {words.map((word, index) => (
          <span key={`${word}-${index}`}>
            <span className="rise-word">
              <span style={{ "--rise-index": index } as CSSProperties}>{word}</span>
            </span>
            {index < words.length - 1 ? " " : null}
          </span>
        ))}
      </h1>

      <div className="mt-8 grid grid-cols-1 gap-8 border-t border-ink/20 pt-6 lg:grid-cols-12 lg:gap-x-10">
        <p className="font-display text-lede text-pretty lg:col-span-6">
          <span className="font-semibold">{t("role")}.</span> {t("statement")}
          <Cite ids={["profile-readme"]} />
        </p>
        <ol className="space-y-2 text-sm text-muted lg:col-span-3">
          <li>
            <sup className="mr-1 font-mono text-accent">1</sup>
            {t("affiliationStudy")}
          </li>
          <li>
            <sup className="mr-1 font-mono text-accent">2</sup>
            {t("affiliationWork")}
            <Cite ids={["owner-confirmation"]} />
          </li>
        </ol>
        <div className="flex flex-wrap content-start gap-3 lg:col-span-3 lg:justify-end">
          <ButtonLink href="#work" variant="primary">
            {t("ctaWork")}
          </ButtonLink>
          <ButtonLink
            href={githubUrl}
            target="_blank"
            rel="noreferrer"
            icon={<BrandIcon name="github" className="size-4" />}
          >
            {t("ctaGithub")}
          </ButtonLink>
        </div>
      </div>
    </Container>
  );

  const caption = (
    <p>
      <span className="mr-2 font-mono text-xs text-ink">{t("figureLabel")}</span>
      <span className="font-display text-lg font-medium text-ink">{t("figureTitle")}</span>{" "}
      {t("figureCaption", { total, period })}
      <Cite ids={["contributions"]} />
    </p>
  );

  return (
    <HeroExperience
      timeline={ridges}
      intro={intro}
      caption={caption}
      figureAlt={t("figureAlt", { count: ridges.series.length, total, period })}
      legendLabel={t("legendLabel")}
      scrollHint={t("scrollHint")}
    />
  );
}
