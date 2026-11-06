import { useTranslations } from "next-intl";

import { Cite, Figure, Section } from "@/shared/components/ui";

import type { TechStack } from "../types";
import { UsageDots } from "./UsageDots";

type TechStackSectionProps = {
  stack: TechStack;
  number: string;
  citations: string[];
};

export function TechStackSection({ stack, number, citations }: TechStackSectionProps) {
  const t = useTranslations("techStack");
  const tSections = useTranslations("sections");
  const total = stack.totalProjects;

  return (
    <Section id="methods" number={number} title={tSections("methods")}>
      <p className="max-w-measure text-lede text-pretty">
        {t("intro", { total })}
        <Cite ids={citations} />
      </p>

      <Figure className="mt-10" label={t("tableLabel")} caption={t("tableCaption")}>
        <div className="grid grid-cols-1 items-start gap-x-10 gap-y-8 md:grid-cols-2">
          {stack.groups.map(({ group, items }) => (
            <table key={group} className="w-full border-collapse text-left text-sm">
              <caption className="border-b border-ink pb-2 text-left font-display text-subtitle font-medium">
                {t(`groups.${group}`)}
              </caption>
              <thead className="sr-only">
                <tr>
                  <th scope="col">{t("colTool")}</th>
                  <th scope="col">{t("colProjects")}</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.label} className="border-b border-rule">
                    <th scope="row" className="py-2.5 pr-4 font-normal">
                      {item.label}
                    </th>
                    <td className="py-2.5 text-right whitespace-nowrap">
                      <span className="inline-flex items-center gap-3">
                        <UsageDots count={item.count} total={total} />
                        <span className="w-12 font-mono text-xs text-muted tabular-nums">
                          {t("usage", { count: item.count, total })}
                        </span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ))}
        </div>
      </Figure>
    </Section>
  );
}
