import { useTranslations } from "next-intl";

import { Section } from "@/shared/components/ui";

import type { Project } from "../types";
import { ProjectEntry } from "./ProjectEntry";

type ProjectsSectionProps = { projects: Project[]; number: string };

export function ProjectsSection({ projects, number }: ProjectsSectionProps) {
  const t = useTranslations("projects");
  const tSections = useTranslations("sections");

  return (
    <Section id="work" number={number} title={tSections("work")}>
      <p className="max-w-measure text-lede text-pretty">{t("intro")}</p>
      <div className="mt-10 border-t border-ink pt-8">
        {projects.map((project, index) => (
          <ProjectEntry
            key={project.slug}
            project={project}
            index={`${Number(number)}.${index + 1}`}
          />
        ))}
      </div>
    </Section>
  );
}
