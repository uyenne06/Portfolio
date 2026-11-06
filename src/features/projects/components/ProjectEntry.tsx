import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { Cite } from "@/shared/components/ui";

import type { Project } from "../types";
import { ProjectLinks } from "./ProjectLinks";

type ProjectEntryProps = { project: Project; index: string };

/** One row of the "Selected work" list: sub-section number, copy, evidence, links. */
export function ProjectEntry({ project, index }: ProjectEntryProps) {
  const t = useTranslations("projects");
  const key = project.slug;
  const title = t(`items.${key}.title`);

  return (
    <article className="group grid grid-cols-1 gap-x-8 gap-y-3 border-b border-rule py-8 first:pt-0 sm:grid-cols-12">
      <p className="font-mono text-sm text-accent sm:col-span-1" aria-hidden="true">
        {index}
      </p>
      <div className="min-w-0 sm:col-span-11">
        <p className="font-mono text-xs text-muted">
          {t(`context.${project.context}`)} · {t(`items.${key}.role`)}
        </p>
        <h3 className="mt-2 font-display text-subtitle font-medium">
          <Link
            href={`/projects/${project.slug}`}
            className="decoration-accent-decor decoration-2 underline-offset-4 group-hover:underline"
          >
            {title}
          </Link>
        </h3>
        <p className="mt-1 text-muted">{t(`items.${key}.tagline`)}</p>
        <p className="mt-4 max-w-measure text-pretty">
          {t(`items.${key}.summary`)}
          <Cite ids={project.references} />
        </p>

        <p className="mt-4 font-mono text-xs text-muted">
          {t("commits", { count: project.commits })}
          {project.pullRequestsOpened > 0
            ? ` · ${t("pullRequests", { merged: project.pullRequestsMerged, opened: project.pullRequestsOpened })}`
            : null}
          {project.languages.length > 0
            ? ` · ${project.languages
                .slice(0, 3)
                .map((language) => language.name)
                .join(", ")}`
            : null}
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3">
          <Link
            href={`/projects/${project.slug}`}
            className="text-sm font-medium text-accent underline decoration-accent-decor underline-offset-4 hover:decoration-2"
            aria-label={t("readCaseFor", { title })}
          >
            {t("readCase")}
          </Link>
          <ProjectLinks repoUrl={project.repoUrl} demoUrl={project.demoUrl} title={title} />
        </div>
      </div>
    </article>
  );
}
