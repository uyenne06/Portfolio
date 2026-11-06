import Image from "next/image";
import { useTranslations } from "next-intl";

import { cn } from "@/shared/utils";

import type { Project } from "../types";

type ProjectPlateProps = {
  project: Project;
  title: string;
  className?: string;
  sizes: string;
  priority?: boolean;
};

/**
 * The project's picture: a screenshot of the live demo (or one published in the repository),
 * or — when there is no presentable screenshot — a typographic plate with the title.
 */
export function ProjectPlate({ project, title, className, sizes, priority }: ProjectPlateProps) {
  const t = useTranslations("projects");

  return (
    <div
      className={cn(
        "relative aspect-[16/10] overflow-hidden rounded-lg border border-rule bg-accent-soft",
        className,
      )}
    >
      {project.image ? (
        <Image
          src={project.image.src}
          alt={t("previewAlt", { title })}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover object-top"
        />
      ) : (
        <div className="graph-paper absolute inset-0 flex items-end p-6" aria-hidden="true">
          <span className="font-display text-plate font-medium text-accent">{title}</span>
        </div>
      )}
    </div>
  );
}
