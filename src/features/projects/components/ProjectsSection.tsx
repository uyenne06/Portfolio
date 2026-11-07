import { useTranslations } from "next-intl";

import { Section } from "@/shared/components/ui";

import type { Project } from "../types";
import { HoverPreview } from "./HoverPreview";
import { ProjectEntry } from "./ProjectEntry";
import { ProjectPlate } from "./ProjectPlate";

type ProjectsSectionProps = { projects: Project[]; number: string };

export function ProjectsSection({ projects, number }: ProjectsSectionProps) {
  const t = useTranslations("projects");
  const tSections = useTranslations("sections");

  const previews = Object.fromEntries(
    projects.map((project) => [
      project.slug,
      <ProjectPlate
        key={project.slug}
        project={project}
        title={t(`items.${project.slug}.title`)}
        sizes="28rem"
      />,
    ]),
  );

  return (
    <Section id="work" eager number={number} title={tSections("work")} note={<p>{t("intro")}</p>}>
      <HoverPreview previews={previews}>
        <ol className="border-t border-ink">
          {projects.map((project, index) => (
            <ProjectEntry
              key={project.slug}
              project={project}
              index={`${Number(number)}.${index + 1}`}
            />
          ))}
        </ol>
      </HoverPreview>
    </Section>
  );
}
