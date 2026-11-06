import { useTranslations } from "next-intl";

import { ContributionFigure } from "@/shared/components/three";
import { BrandIcon, ButtonLink, Cite, Container, Figure } from "@/shared/components/ui";

type HeroSectionProps = {
  location: string | null;
  githubUrl: string;
  totalContributions: number;
  /** weeks × 7 normalised heights for Fig. 1. */
  heights: number[][];
};

/** Title page: author, role, affiliations, calls to action and Fig. 1. */
export function HeroSection({
  location,
  githubUrl,
  totalContributions,
  heights,
}: HeroSectionProps) {
  const t = useTranslations("hero");
  const tPerson = useTranslations("person");

  return (
    <section aria-labelledby="hero-heading" className="pt-10 pb-16 lg:pt-16 lg:pb-24">
      <Container>
        {location ? (
          <p className="font-mono text-xs text-muted">{t("meta", { location })}</p>
        ) : null}

        <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-end lg:gap-x-10">
          <div className="lg:col-span-8">
            <h1 id="hero-heading" className="font-display text-display font-medium text-balance">
              {tPerson("name")}
            </h1>
            <p className="mt-6 max-w-measure font-display text-subtitle text-pretty">
              {t("statement")}
              <Cite ids={["profile-readme"]} />
            </p>
          </div>

          <div className="lg:col-span-4">
            <p className="font-medium">
              {t("role")}
              <Cite ids={["profile-readme"]} />
            </p>
            <ol className="mt-3 space-y-1.5 text-sm text-muted">
              <li>
                <sup className="mr-1 font-mono text-accent">1</sup>
                {t("affiliationStudy")}
              </li>
              <li>
                <sup className="mr-1 font-mono text-accent">2</sup>
                {t("affiliationWork")}
                <Cite ids={["owner-confirmation"]} />
              </li>
            </ol>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <ButtonLink href="#work" variant="primary">
            {t("ctaWork")}
          </ButtonLink>
          <ButtonLink
            href={githubUrl}
            target="_blank"
            rel="noreferrer"
            icon={<BrandIcon name="github" className="size-4" />}
          >
            {t("ctaGithub")}
          </ButtonLink>
          <ButtonLink href="#correspondence">{t("ctaContact")}</ButtonLink>
        </div>

        <Figure
          className="mt-14 lg:mt-20"
          label={t("figureLabel")}
          caption={
            <>
              {t("figureCaption", { total: totalContributions })}
              <Cite ids={["contributions"]} />
            </>
          }
        >
          <div className="border-y border-rule">
            <ContributionFigure
              heights={heights}
              label={t("figureAlt", { total: totalContributions })}
            />
          </div>
        </Figure>
      </Container>
    </section>
  );
}
