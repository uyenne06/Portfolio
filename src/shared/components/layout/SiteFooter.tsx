import { useTranslations } from "next-intl";

import { Container } from "@/shared/components/ui";

/** Colophon. `year` comes from the data timestamp so rendering stays deterministic. */
export function SiteFooter({ year }: { year: number }) {
  const t = useTranslations("footer");
  return (
    <footer className="border-t border-rule py-10">
      <Container className="flex flex-col gap-3 text-sm text-muted sm:flex-row sm:items-baseline sm:justify-between">
        <p>{t("copyright", { year })}</p>
        <p className="max-w-measure sm:text-right">{t("colophon")}</p>
      </Container>
    </footer>
  );
}
