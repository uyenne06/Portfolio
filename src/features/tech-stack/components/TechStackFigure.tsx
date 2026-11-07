import { useTranslations } from "next-intl";

import type { TechMatrix } from "../types";
import { StackViews } from "./StackViews";

type TechStackFigureProps = {
  matrix: TechMatrix;
  /** Display titles keyed by project slug. */
  projectLabels: Record<string, string>;
};

/**
 * Formats every label of the Methods figure on the server (ICU plurals included), so the
 * client figure receives plain strings and ships no message formatter.
 */
export function TechStackFigure({ matrix, projectLabels }: TechStackFigureProps) {
  const t = useTranslations("techStack");
  const total = matrix.columns.length;
  const name = (slug: string) => projectLabels[slug] ?? slug;

  return (
    <StackViews
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
        usedIn: Object.fromEntries(
          matrix.groups.flatMap(({ rows }) =>
            rows.map((row) => [
              row.label,
              t("usage", {
                tool: row.label,
                count: row.count,
                total,
                projects: matrix.columns
                  .filter((_, index) => row.uses[index])
                  .map(name)
                  .join(", "),
              }),
            ]),
          ),
        ),
      }}
      viewLabels={{
        group: t("viewGroup"),
        stack: t("viewStack"),
        constellation: t("viewConstellation"),
      }}
      hint={{ stack: t("hintStack"), constellation: t("hintConstellation") }}
      usedInCount={Object.fromEntries(
        Array.from({ length: total }, (_, index) => [
          index + 1,
          t("usedInCount", { count: index + 1, total }),
        ]),
      )}
      sceneLabel={t("sceneLabel", { total })}
    />
  );
}
