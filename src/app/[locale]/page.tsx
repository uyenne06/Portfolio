import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Suspense } from "react";

import { siteConfig } from "@/config/site.config";
import { AboutSection } from "@/features/about";
import { ContactSection, getContactChannels } from "@/features/contact";
import { ActivitySection, getActivitySummary } from "@/features/github-activity";
import { buildWorkTimeline, HeroSection } from "@/features/hero";
import { getFeaturedRepos, getProjects, ProjectsSection } from "@/features/projects";
import { ReferencesSection } from "@/features/references";
import { deriveTechMatrix, StackMarquee, TechStackSection, topTools } from "@/features/tech-stack";
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
  const matrix = deriveTechMatrix(projects);
  const stackCitations = [...new Set(projects.flatMap((project) => project.references))].filter(
    (id) => id.startsWith("repo-"),
  );

  // Each section is its own Suspense boundary. Nothing here suspends (the page is prerendered),
  // but separate boundaries let React hydrate them one at a time and yield to the browser in
  // between, instead of one long main-thread task for the whole page.
  return (
    <>
      <HeroSection
        location={data.profile.location}
        githubUrl={data.profile.url}
        timeline={buildWorkTimeline(data)}
      />
      <Suspense>
        <AboutSection number={numberOf("abstract")} />
      </Suspense>
      <Suspense>
        <StackMarquee items={topTools(matrix)} />
      </Suspense>
      <Suspense>
        <TechStackSection matrix={matrix} number={numberOf("methods")} citations={stackCitations} />
      </Suspense>
      <Suspense>
        <ProjectsSection projects={projects} number={numberOf("work")} />
      </Suspense>
      <Suspense>
        <ActivitySection
          summary={getActivitySummary(data, featuredRepos, source)}
          number={numberOf("results")}
        />
      </Suspense>
      <Suspense>
        <ContactSection
          channels={getContactChannels(data.profile, siteConfig.linkedinUrl)}
          location={data.profile.location}
          number={numberOf("correspondence")}
        />
      </Suspense>
      <Suspense>
        <ReferencesSection />
      </Suspense>
    </>
  );
}
