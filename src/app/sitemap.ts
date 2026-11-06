import type { MetadataRoute } from "next";

import { FEATURED_PROJECTS } from "@/config/featured-projects.config";
import { siteConfig } from "@/config/site.config";
import { routing } from "@/i18n/routing";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["", ...FEATURED_PROJECTS.map((project) => `/projects/${project.slug}`)];

  return paths.flatMap((path) =>
    routing.locales.map((locale) => ({
      url: `${siteConfig.url}/${locale}${path}`,
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.7,
      alternates: {
        languages: Object.fromEntries(
          routing.locales.map((alternate) => [alternate, `${siteConfig.url}/${alternate}${path}`]),
        ),
      },
    })),
  );
}
