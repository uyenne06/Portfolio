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
    <Section
      id="abstract"
      number={number}
      title={tSections("abstract")}
      note={
        <>
          <p className="font-mono text-xs text-accent">{t("keywordsLabel")}</p>
          <ul className="mt-3 space-y-1.5">
            {keywords.map((keyword) => (
              <li key={keyword}>{keyword}</li>
            ))}
          </ul>
        </>
      }
    >
      <blockquote className="font-display text-title text-pretty italic">
        <p>
          “{t("epigraph")}”
          <Cite ids={["profile-readme"]} />
        </p>
      </blockquote>

      <div className="mt-12 max-w-measure space-y-6 text-lede text-pretty">
        {paragraphs.map((paragraph, index) => (
          <p
            key={paragraph}
            className={
              index === 0
                ? "first-letter:float-left first-letter:mt-1 first-letter:mr-3 first-letter:font-display first-letter:text-[3.6em] first-letter:leading-[0.8] first-letter:text-accent"
                : undefined
            }
          >
            {paragraph}
            <Cite ids={PARAGRAPH_CITATIONS[index] ?? []} />
          </p>
        ))}
      </div>
    </Section>
  );
}
