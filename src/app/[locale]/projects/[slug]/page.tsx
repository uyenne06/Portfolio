import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";

import { FEATURED_PROJECTS, findFeaturedProject } from "@/config/featured-projects.config";
import { CaseStudy, getProject } from "@/features/projects";
import { ReferencesSection } from "@/features/references";
import { routing } from "@/i18n/routing";
import { getGitHubData } from "@/shared/lib/github/github.service";

export function generateStaticParams() {
  return FEATURED_PROJECTS.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/projects/[slug]">): Promise<Metadata> {
  const { locale, slug } = await params;
  const config = findFeaturedProject(slug);
  if (!hasLocale(routing.locales, locale) || !config) return {};

  const t = await getTranslations({ locale, namespace: "projects.items" });
  const path = `/projects/${config.slug}`;

  return {
    title: t(`${config.slug}.title`),
    description: t(`${config.slug}.summary`),
    alternates: {
      canonical: `/${locale}${path}`,
      languages: { en: `/en${path}`, vi: `/vi${path}`, "x-default": `/en${path}` },
    },
    openGraph: { url: `/${locale}${path}`, title: t(`${config.slug}.title`) },
  };
}

/**
 * `params` is awaited inside <Suspense> so the shared App Shell can be served instantly
 * on navigation (Partial Prefetching); every slug is still prerendered at build time.
 */
export default function ProjectPage({ params }: PageProps<"/[locale]/projects/[slug]">) {
  return (
    <Suspense fallback={<div className="min-h-dvh" aria-busy="true" />}>
      <ProjectContent params={params} />
    </Suspense>
  );
}

async function ProjectContent({ params }: Pick<PageProps<"/[locale]/projects/[slug]">, "params">) {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const { data } = await getGitHubData();
  const project = getProject(data, slug);
  if (!project) notFound();

  return (
    <>
      <CaseStudy project={project} />
      <ReferencesSection only={["github-profile", ...project.references]} />
    </>
  );
}
