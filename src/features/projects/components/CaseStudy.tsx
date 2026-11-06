import { ArrowLeft } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { Cite, Container, Tag } from "@/shared/components/ui";

import type { Project } from "../types";
import { ProjectLinks } from "./ProjectLinks";

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-rule pt-6">
      <h2 className="font-display text-subtitle font-medium">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Fact({ term, children }: { term: string; children: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-rule py-2.5">
      <dt className="text-muted">{term}</dt>
      <dd className="text-right font-mono tabular-nums">{children}</dd>
    </div>
  );
}

/** `/projects/[slug]` body: problem, approach, highlights, and the evidence column. */
export function CaseStudy({ project }: { project: Project }) {
  const t = useTranslations("projects");
  const tCase = useTranslations("projects.case");
  const locale = useLocale();
  const key = project.slug;
  const title = t(`items.${key}.title`);
  const highlights = t.raw(`items.${key}.highlights`) as string[];

  return (
    <article className="py-12 lg:py-20">
      <Container>
        <a
          href={`/${locale}#work`}
          className="inline-flex items-center gap-2 text-sm text-muted hover:text-accent"
        >
          <ArrowLeft className="size-4" aria-hidden="true" strokeWidth={1.5} />
          {tCase("back")}
        </a>

        <header className="mt-10 max-w-4xl">
          <p className="font-mono text-xs text-muted">{t(`context.${project.context}`)}</p>
          <h1 className="mt-3 font-display text-display font-medium text-balance">{title}</h1>
          <p className="mt-6 max-w-measure font-display text-subtitle text-pretty text-muted">
            {t(`items.${key}.tagline`)}
          </p>
        </header>

        <div className="mt-14 grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-x-10">
          <div className="flex max-w-measure flex-col gap-10 lg:col-span-7">
            <p className="text-lede text-pretty">
              {t(`items.${key}.summary`)}
              <Cite ids={project.references} />
            </p>
            <Block title={tCase("problem")}>
              <p className="leading-relaxed text-pretty">{t(`items.${key}.problem`)}</p>
            </Block>
            <Block title={tCase("approach")}>
              <p className="leading-relaxed text-pretty">{t(`items.${key}.approach`)}</p>
            </Block>
            <Block title={tCase("highlights")}>
              <ul className="list-disc space-y-2 pl-5 marker:text-accent">
                {highlights.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </Block>
          </div>

          <aside className="flex flex-col gap-10 lg:col-span-4 lg:col-start-9">
            <section>
              <h2 className="font-display text-subtitle font-medium">
                {tCase("contribution")}
                <Cite ids={["github-profile"]} />
              </h2>
              <dl className="mt-3 text-sm">
                <Fact term={tCase("role")}>{t(`items.${key}.role`)}</Fact>
                <Fact term={tCase("commits")}>{project.commits}</Fact>
                <Fact term={tCase("prsOpened")}>{project.pullRequestsOpened}</Fact>
                <Fact term={tCase("prsMerged")}>{project.pullRequestsMerged}</Fact>
              </dl>
            </section>

            {project.languages.length > 0 ? (
              <section>
                <h2 className="font-display text-subtitle font-medium">{tCase("languages")}</h2>
                <dl className="mt-3 text-sm">
                  {project.languages.map((language) => (
                    <Fact key={language.name} term={language.name}>
                      {language.percent}%
                    </Fact>
                  ))}
                </dl>
              </section>
            ) : null}

            <section>
              <h2 className="font-display text-subtitle font-medium">{tCase("stack")}</h2>
              <p className="mt-2 text-sm text-muted">{tCase("stackNote")}</p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {project.stack.map((tech) => (
                  <li key={tech}>
                    <Tag>{tech}</Tag>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="font-display text-subtitle font-medium">{tCase("links")}</h2>
              <div className="mt-4 flex flex-col gap-3">
                <ProjectLinks repoUrl={project.repoUrl} demoUrl={project.demoUrl} title={title} />
                {project.relatedRepos.map((repo) => (
                  <p key={repo.name} className="text-sm">
                    <span className="text-muted">{tCase("related")}: </span>
                    <a href={repo.url} target="_blank" rel="noreferrer" className="link-inline">
                      {repo.name}
                    </a>
                  </p>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </Container>
    </article>
  );
}
