import { ArrowUpRight } from "lucide-react";
import { useTranslations } from "next-intl";

import { BrandIcon } from "@/shared/components/ui";

type ProjectLinksProps = { repoUrl: string; demoUrl: string | null; title: string };

/** Repository and demo links, shared by the list entry and the case study. */
export function ProjectLinks({ repoUrl, demoUrl, title }: ProjectLinksProps) {
  const t = useTranslations("projects");
  return (
    <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
      <li>
        <a
          href={repoUrl}
          target="_blank"
          rel="noreferrer"
          className="link-inline inline-flex items-center gap-1.5"
          aria-label={`${t("repository")}: ${title}`}
        >
          <BrandIcon name="github" className="size-4" />
          {t("repository")}
        </a>
      </li>
      {demoUrl ? (
        <li>
          <a
            href={demoUrl}
            target="_blank"
            rel="noreferrer"
            className="link-inline inline-flex items-center gap-1"
            aria-label={`${t("demo")}: ${title}`}
          >
            {t("demo")}
            <ArrowUpRight className="size-4" aria-hidden="true" strokeWidth={1.5} />
          </a>
        </li>
      ) : null}
    </ul>
  );
}
