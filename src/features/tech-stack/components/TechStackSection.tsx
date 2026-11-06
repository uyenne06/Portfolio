import { useTranslations } from "next-intl";

import { Cite, Figure, Section } from "@/shared/components/ui";

import type { TechMatrix } from "../types";
import { TechMatrixTable } from "./TechMatrixTable";

type TechStackSectionProps = {
  matrix: TechMatrix;
  number: string;
  citations: string[];
};

export function TechStackSection({ matrix, number, citations }: TechStackSectionProps) {
  const t = useTranslations("techStack");
  const tSections = useTranslations("sections");
  const tProjects = useTranslations("projects.items");
  const total = matrix.columns.length;
  const singleUse = matrix.groups
    .flatMap((group) => group.rows)
    .filter((row) => row.count < 2).length;

  return (
    <Section
      id="methods"
      number={number}
      title={tSections("methods")}
      note={
        <p>
          {t("intro", { total })}
          <Cite ids={citations} />
        </p>
      }
    >
      <Figure label={t("tableLabel")} caption={t("tableCaption")}>
        <TechMatrixTable
          columns={matrix.columns.map((slug) => ({
            id: slug,
            label: tProjects(`${slug}.title`),
            href: `#project-${slug}`,
          }))}
          groups={matrix.groups.map(({ group, rows }) => ({
            id: group,
            label: t(`groups.${group}`),
            rows,
          }))}
          labels={{
            tool: t("colTool"),
            total: t("colTotal"),
            used: t("used"),
            unused: t("unused"),
            showAll: t("showAll", { count: singleUse }),
            showFewer: t("showFewer"),
          }}
        />
      </Figure>
    </Section>
  );
}
