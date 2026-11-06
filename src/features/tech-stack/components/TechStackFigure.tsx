"use client";

import { useTranslations } from "next-intl";

import type { TechMatrix } from "../types";
import { PeriodicStack } from "./PeriodicStack";

type TechStackFigureProps = {
  matrix: TechMatrix;
  /** Display titles keyed by project slug. */
  projectLabels: Record<string, string>;
};

/** Client wrapper that supplies formatted (ICU) labels to the periodic table. */
export function TechStackFigure({ matrix, projectLabels }: TechStackFigureProps) {
  const t = useTranslations("techStack");
  const total = matrix.columns.length;
  const name = (slug: string) => projectLabels[slug] ?? slug;

  return (
    <PeriodicStack
      projects={matrix.columns.map((slug) => ({ id: slug, label: name(slug) }))}
      groups={matrix.groups.map(({ group, rows }) => ({
        id: group,
        label: t(`groups.${group}`),
        rows,
      }))}
      labels={{
        filter: t("filterLabel"),
        all: t("allProjects"),
        flip: t("flipHint"),
        legend: t("legend"),
        legendSteps: [t("legend5"), t("legend4"), t("legend3"), t("legend2"), t("legend1")],
        usedIn: (row) =>
          t("usage", {
            tool: row.label,
            count: row.count,
            total,
            projects: matrix.columns
              .filter((_, index) => row.uses[index])
              .map(name)
              .join(", "),
          }),
      }}
    />
  );
}
