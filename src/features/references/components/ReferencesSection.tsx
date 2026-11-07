import { useLocale, useTranslations } from "next-intl";

import { REFERENCES, type ReferenceKind } from "@/config/references.config";
import { Section } from "@/shared/components/ui";

import { ReferenceIndex, type ReferenceEntry, type ReferenceLabels } from "./ReferenceIndex";

const KINDS: readonly ReferenceKind[] = ["api", "readme", "repository", "author"];
/** A count that selects the "other" plural form; replaced by `{n}` for the client. */
const SAMPLE_COUNT = 1_000_003;

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
  const sample = new Intl.NumberFormat(locale).format(SAMPLE_COUNT);
  const labels: ReferenceLabels = {
    sources: t("sources"),
    citations: t("citations"),
    citedIn: t("citedIn"),
    top: t("top"),
    end: t("end"),
    backToTop: t("backToTop"),
    kinds: Object.fromEntries(KINDS.map((kind) => [kind, t(`kinds.${kind}`)])) as Record<
      ReferenceKind,
      string
    >,
    cited: {
      zero: t("cited", { count: 0 }),
      one: t("cited", { count: 1 }),
      other: t("cited", { count: SAMPLE_COUNT }).replace(sample, "{n}"),
    },
  };

  return (
    <Section id="references" title={tSections("references")} note={<p>{t("intro")}</p>}>
      <ReferenceIndex entries={entries} locale={locale} labels={labels} />
    </Section>
  );
}
