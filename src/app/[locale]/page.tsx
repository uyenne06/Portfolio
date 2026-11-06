import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";

import { siteConfig } from "@/config/site.config";
import { AboutSection } from "@/features/about";
import { ContactSection, getContactChannels } from "@/features/contact";
import { ActivitySection, getActivitySummary } from "@/features/github-activity";
import { buildWorkTimeline, HeroSection } from "@/features/hero";
import { getFeaturedRepos, getProjects, ProjectsSection } from "@/features/projects";
import { ReferencesSection } from "@/features/references";
import { deriveTechMatrix, TechStackSection } from "@/features/tech-stack";
import { routing } from "@/i18n/routing";
import { sectionNumber, type SectionId } from "@/shared/constants/sections";
import { getGitHubData } from "@/shared/lib/github/github.service";

const numberOf = (id: SectionId) => sectionNumber(id) ?? "";

/** Home: composes the feature sections in paper order. No business logic here. */
export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const { data, source } = await getGitHubData();
  const featuredRepos = getFeaturedRepos(data);
  const projects = getProjects(data);
  const stackCitations = [...new Set(projects.flatMap((project) => project.references))].filter(
    (id) => id.startsWith("repo-"),
  );

  return (
    <>
      <HeroSection
        location={data.profile.location}
        githubUrl={data.profile.url}
        timeline={buildWorkTimeline(data)}
      />
      <AboutSection number={numberOf("abstract")} />
      <TechStackSection
        matrix={deriveTechMatrix(projects)}
        number={numberOf("methods")}
        citations={stackCitations}
      />
      <ProjectsSection projects={projects} number={numberOf("work")} />
      <ActivitySection
        summary={getActivitySummary(data, featuredRepos, source)}
        number={numberOf("results")}
      />
      <ContactSection
        channels={getContactChannels(data.profile, siteConfig.linkedinUrl)}
        location={data.profile.location}
        number={numberOf("correspondence")}
      />
      <ReferencesSection />
    </>
  );
}
