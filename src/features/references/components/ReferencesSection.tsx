import { useLocale, useTranslations } from "next-intl";

import { REFERENCES } from "@/config/references.config";
import { Section } from "@/shared/components/ui";

import { ReferenceIndex, type ReferenceEntry } from "./ReferenceIndex";

type ReferencesSectionProps = {
  /** Limit the list to these ids (case-study pages); numbering stays global. */
  only?: readonly string[];
};

export function ReferencesSection({ only }: ReferencesSectionProps) {
  const t = useTranslations("references");
  const tSections = useTranslations("sections");
  const locale = useLocale();
  const entries: ReferenceEntry[] = REFERENCES.map((reference, index) => ({
    ...reference,
    number: index + 1,
  })).filter((reference) => !only || only.includes(reference.id));

  return (
    <Section id="references" title={tSections("references")} note={<p>{t("intro")}</p>}>
      <ReferenceIndex entries={entries} locale={locale} />
    </Section>
  );
}
