import { useTranslations } from "next-intl";

import { Cite, Section } from "@/shared/components/ui";

/** Sources per paragraph of `about.paragraphs` (same order). */
const PARAGRAPH_CITATIONS: readonly (readonly string[])[] = [
  ["profile-readme", "owner-confirmation"],
  ["profile-readme", "owner-confirmation"],
  ["profile-readme"],
];

export function AboutSection({ number }: { number: string }) {
  const t = useTranslations("about");
  const tSections = useTranslations("sections");
  const paragraphs = t.raw("paragraphs") as string[];
  const keywords = t.raw("keywords") as string[];

  return (
    <Section id="abstract" number={number} title={tSections("abstract")}>
      <blockquote className="max-w-measure border-l-2 border-accent-decor pl-5 font-display text-subtitle text-pretty italic">
        <p>
          “{t("epigraph")}”
          <Cite ids={["profile-readme"]} />
        </p>
      </blockquote>

      <div className="mt-10 max-w-measure space-y-5 text-lede text-pretty">
        {paragraphs.map((paragraph, index) => (
          <p key={paragraph}>
            {paragraph}
            <Cite ids={PARAGRAPH_CITATIONS[index] ?? []} />
          </p>
        ))}
      </div>

      <p className="mt-10 max-w-measure text-sm">
        <span className="mr-2 font-mono text-xs text-accent">{t("keywordsLabel")} —</span>
        <span className="text-muted">{keywords.join("; ")}.</span>
      </p>
    </Section>
  );
}
