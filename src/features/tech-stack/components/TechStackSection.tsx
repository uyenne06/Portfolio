import { useTranslations } from "next-intl";

import { Cite, Figure, Section } from "@/shared/components/ui";

import type { TechMatrix } from "../types";
import { TechStackFigure } from "./TechStackFigure";

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
  const projectLabels = Object.fromEntries(
    matrix.columns.map((slug) => [slug, tProjects(`${slug}.title`)]),
  );

  return (
    <Section
      id="methods"
      number={number}
      wide
      title={tSections("methods")}
      note={
        <p>
          {t("intro", { total })}
          <Cite ids={citations} />
        </p>
      }
    >
      <Figure label={t("tableLabel")} caption={t("tableCaption")}>
        <TechStackFigure matrix={matrix} projectLabels={projectLabels} />
      </Figure>
    </Section>
  );
}
