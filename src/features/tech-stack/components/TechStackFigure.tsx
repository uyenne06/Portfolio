"use client";

import { useTranslations } from "next-intl";

import type { TechMatrix } from "../types";
import { TechSpecimen } from "./TechSpecimen";

type TechStackFigureProps = {
  matrix: TechMatrix;
  /** Display titles keyed by project slug. */
  projectLabels: Record<string, string>;
};

/** Client wrapper that supplies formatted (ICU) labels to the interactive specimen. */
export function TechStackFigure({ matrix, projectLabels }: TechStackFigureProps) {
  const t = useTranslations("techStack");
  const total = matrix.columns.length;
  const name = (slug: string) => projectLabels[slug] ?? slug;

  return (
    <TechSpecimen
      projects={matrix.columns.map((slug) => ({ id: slug, label: name(slug) }))}
      groups={matrix.groups.map(({ group, rows }) => ({
        id: group,
        label: t(`groups.${group}`),
        rows,
      }))}
      labels={{
        filter: t("filterLabel"),
        all: t("allProjects"),
        toolCount: (count) => t("toolCount", { count }),
        usage: (row) =>
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
