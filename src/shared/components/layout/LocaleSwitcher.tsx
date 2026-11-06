"use client";

import { useLocale, useTranslations } from "next-intl";

import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

/** Links to the current page in the other language. */
export function LocaleSwitcher() {
  const t = useTranslations("locale");
  const locale = useLocale();
  const pathname = usePathname();
  const other = routing.locales.find((candidate) => candidate !== locale) ?? routing.defaultLocale;

  return (
    <Link
      href={pathname}
      locale={other}
      hrefLang={other}
      aria-label={t("switchTo")}
      title={t("switchTo")}
      className="inline-flex size-11 items-center justify-center rounded-full font-mono text-sm text-ink transition-colors hover:text-accent"
    >
      {t("short")}
    </Link>
  );
}
