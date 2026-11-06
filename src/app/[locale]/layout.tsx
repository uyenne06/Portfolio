import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro, JetBrains_Mono, Newsreader } from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { siteConfig } from "@/config/site.config";
import { routing } from "@/i18n/routing";
import { AppProviders } from "@/providers";
import { SiteFooter, SiteHeader, SkipLink } from "@/shared/components/layout";
import { getGitHubData } from "@/shared/lib/github/github.service";
import { cn } from "@/shared/utils";

import "@/styles/globals.css";

const newsreader = Newsreader({
  subsets: ["latin", "vietnamese"],
  axes: ["opsz"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
  display: "swap",
});

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600"],
  variable: "--font-be-vietnam",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin", "vietnamese"],
  variable: "--font-jetbrains",
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export async function generateMetadata({ params }: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "metadata" });

  return {
    metadataBase: new URL(siteConfig.url),
    title: { default: t("title"), template: t("titleTemplate") },
    description: t("description"),
    authors: [
      { name: "Nguyen Huynh Hoang Uyen", url: `https://github.com/${siteConfig.githubUsername}` },
    ],
    alternates: {
      canonical: `/${locale}`,
      languages: { en: "/en", vi: "/vi", "x-default": "/en" },
    },
    openGraph: {
      type: "website",
      locale: locale === "vi" ? "vi_VN" : "en_US",
      alternateLocale: locale === "vi" ? "en_US" : "vi_VN",
      url: `/${locale}`,
      title: t("title"),
      description: t("description"),
    },
    twitter: { card: "summary_large_image", title: t("title"), description: t("description") },
  };
}

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const [{ data }, t] = await Promise.all([
    getGitHubData(),
    getTranslations({ locale, namespace: "person" }),
  ]);

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={cn(newsreader.variable, beVietnamPro.variable, jetbrainsMono.variable)}
    >
      <body className="flex min-h-dvh flex-col">
        <NextIntlClientProvider>
          <AppProviders>
            <SkipLink />
            <SiteHeader name={t("name")} />
            <main id="main" className="flex-1">
              {children}
            </main>
            <SiteFooter year={new Date(data.fetchedAt).getUTCFullYear()} />
          </AppProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
