import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { Container } from "@/shared/components/ui";

export default function NotFound() {
  const t = useTranslations("notFound");
  return (
    <Container className="py-24 lg:py-32">
      <p className="font-mono text-sm text-accent">404</p>
      <h1 className="mt-3 font-display text-title font-medium">{t("title")}</h1>
      <p className="mt-4 max-w-measure text-muted">{t("body")}</p>
      <Link href="/" className="link-inline mt-8 inline-block">
        {t("back")}
      </Link>
    </Container>
  );
}
