import { useLocale, useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { SECTIONS } from "@/shared/constants/sections";

import { LocaleSwitcher } from "./LocaleSwitcher";
import { MobileNav, type NavItem } from "./MobileNav";
import { ThemeToggle } from "./ThemeToggle";

/** Sticky masthead: name, section contents, language and theme controls. */
export function SiteHeader({ name }: { name: string }) {
  const t = useTranslations("nav");
  const locale = useLocale();

  // Absolute anchors so the contents also work from the case-study pages.
  const items: NavItem[] = SECTIONS.map((section) => ({
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

        <nav aria-label={t("primary")} className="hidden lg:block">
          <ol className="flex items-center gap-7 text-sm">
            {items.map((item) => (
              <li key={item.href}>
                <a href={item.href} className="group inline-flex items-baseline gap-1.5 py-2">
                  <span className="font-mono text-xs text-accent">{item.number}</span>
                  <span className="text-muted transition-colors group-hover:text-ink">
                    {item.label}
                  </span>
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="flex shrink-0 items-center">
          <LocaleSwitcher />
          <ThemeToggle />
          <MobileNav items={items} openLabel={t("menu")} closeLabel={t("menuClose")} />
        </div>
      </div>
    </header>
  );
}
