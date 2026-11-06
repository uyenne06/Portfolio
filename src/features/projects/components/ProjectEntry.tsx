import { ArrowUpRight } from "lucide-react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { Cite } from "@/shared/components/ui";

import type { Project } from "../types";
import { ProjectPlate } from "./ProjectPlate";

type ProjectEntryProps = { project: Project; index: string };

/**
 * One plate of "Selected work". The whole row links to the case study; on wide screens the
 * screenshot appears beside the cursor (HoverPreview), on small screens it sits above the text.
 */
export function ProjectEntry({ project, index }: ProjectEntryProps) {
  const t = useTranslations("projects");
  const key = project.slug;
  const title = t(`items.${key}.title`);

  return (
    <li
      id={`project-${project.slug}`}
      data-preview={project.slug}
      className="group anchor-target relative border-b border-rule py-8 lg:py-10"
    >
      {/* Hidden on wide screens, where HoverPreview shows it; lazy images stay unloaded there. */}
      <ProjectPlate project={project} title={title} sizes="100vw" className="mb-6 lg:hidden" />

      <div className="grid grid-cols-1 gap-x-8 gap-y-4 lg:grid-cols-12">
        <p className="font-mono text-sm text-accent lg:col-span-1 lg:pt-3" aria-hidden="true">
          {index}
        </p>

        <div className="lg:col-span-7">
          <h3 className="font-display text-plate font-medium transition-colors duration-300 group-hover:text-accent">
            <Link
              href={`/projects/${project.slug}`}
              className="after:absolute after:inset-0 after:content-['']"
              aria-label={t("readCaseFor", { title })}
            >
              {title}
            </Link>
          </h3>
          <p className="mt-3 text-lg text-muted">{t(`items.${key}.tagline`)}</p>
          <p className="mt-4 max-w-measure text-pretty">
            {t(`items.${key}.summary`)}
            <Cite ids={project.references} />
          </p>
        </div>

        <dl className="grid grid-cols-2 content-start gap-x-6 gap-y-3 text-sm lg:col-span-3 lg:grid-cols-1 lg:pt-3">
          <div>
            <dt className="font-mono text-xs text-muted">{t(`context.${project.context}`)}</dt>
            <dd>{t(`items.${key}.role`)}</dd>
          </div>
          <div>
            <dt className="sr-only">{t("evidence")}</dt>
            <dd className="font-mono text-xs text-muted">
              {t("commits", { count: project.commits })}
              {project.pullRequestsOpened > 0 ? (
                <>
                  <br />
                  {t("pullRequests", {
                    merged: project.pullRequestsMerged,
                    opened: project.pullRequestsOpened,
                  })}
                </>
              ) : null}
            </dd>
          </div>
        </dl>

        <div className="hidden justify-end lg:col-span-1 lg:flex lg:pt-3" aria-hidden="true">
          <span className="inline-flex size-12 items-center justify-center rounded-full border border-rule transition-all duration-300 group-hover:rotate-45 group-hover:border-accent-decor group-hover:bg-accent-decor group-hover:text-on-accent">
            <ArrowUpRight className="size-5" strokeWidth={1.5} />
          </span>
        </div>
      </div>
    </li>
  );
}
