import { useTranslations } from "next-intl";

import { REFERENCES } from "@/config/references.config";
import { Section } from "@/shared/components/ui";

type ReferencesSectionProps = {
  /** Limit the list to these ids (case-study pages); numbering stays global. */
  only?: readonly string[];
};

export function ReferencesSection({ only }: ReferencesSectionProps) {
  const t = useTranslations("references");
  const tSections = useTranslations("sections");
  const entries = REFERENCES.map((reference, index) => ({
    ...reference,
    number: index + 1,
  })).filter((reference) => !only || only.includes(reference.id));

  return (
    <Section id="references" title={tSections("references")}>
      <p className="max-w-measure text-sm text-muted">{t("intro")}</p>
      <ol className="mt-8 space-y-3 text-sm">
        {entries.map((reference) => (
          <li
            key={reference.id}
            id={`ref-${reference.number}`}
            className="anchor-target grid grid-cols-[2.5rem_1fr] gap-2 target:text-accent"
          >
            <span className="font-mono text-accent">[{reference.number}]</span>
            {reference.url ? (
              <a
                href={reference.url}
                target="_blank"
                rel="noreferrer"
                className="link-inline break-words"
              >
                {reference.label}
              </a>
            ) : (
              <span>{reference.label}</span>
            )}
          </li>
        ))}
      </ol>
    </Section>
  );
}
