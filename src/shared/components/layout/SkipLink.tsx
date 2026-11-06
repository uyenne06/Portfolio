import { useTranslations } from "next-intl";

export function SkipLink() {
  const t = useTranslations("nav");
  return (
    <a
      href="#main"
      className="sr-only z-50 rounded-full bg-accent-decor px-4 py-2 text-on-accent focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
    >
      {t("skip")}
    </a>
  );
}
