import { useLocale, useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { SECTIONS } from "@/shared/constants/sections";
import { THEME_ORDER, type ThemeChoice } from "@/shared/constants/theme";

import { LocaleSwitcher } from "./LocaleSwitcher";
import { MobileNav } from "./MobileNav";
import { ScrollProgress } from "./ScrollProgress";
import { SectionNav } from "./SectionNav";
import { ThemeToggle } from "./ThemeToggle";

/** Sticky masthead: name, section contents, language and theme controls, reading progress. */
export function SiteHeader({ name }: { name: string }) {
  const t = useTranslations("nav");
  const tLocale = useTranslations("locale");
  const tTheme = useTranslations("theme");
  const locale = useLocale();
  const themeLabels = Object.fromEntries(
    THEME_ORDER.map((current, index) => [
      current,
      tTheme("label", {
        current: tTheme(current),
        next: tTheme(THEME_ORDER[(index + 1) % THEME_ORDER.length] ?? "system"),
      }),
    ]),
  ) as Record<ThemeChoice, string>;

  // Absolute anchors so the contents also work from the case-study pages.
  const items = SECTIONS.map((section) => ({
    id: section.id,
    href: `/${locale}#${section.id}`,
    label: t(section.id),
    number: section.number,
  }));

  return (
    <header className="sticky top-0 z-40 border-b border-rule bg-paper/90 backdrop-blur-md">
      <div className="relative mx-auto flex h-16 max-w-page items-center justify-between gap-4 px-4 sm:px-6 lg:px-10">
        <Link
          href="/"
          className="min-w-0 truncate font-display text-base font-medium tracking-tight hover:text-accent sm:text-lg"
          aria-label={`${name} — ${t("home")}`}
        >
          {name}
        </Link>

        <SectionNav items={items} label={t("primary")} />

        <div className="flex shrink-0 items-center">
          <LocaleSwitcher label={tLocale("switchTo")} short={tLocale("short")} />
          <ThemeToggle labels={themeLabels} />
          <MobileNav items={items} openLabel={t("menu")} closeLabel={t("menuClose")} />
        </div>
      </div>
      <ScrollProgress />
    </header>
  );
}
