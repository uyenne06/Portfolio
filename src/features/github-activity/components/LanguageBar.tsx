import { useTranslations } from "next-intl";

import { OTHER_LANGUAGE } from "../constants";
import type { LanguageSlice } from "../types";

/**
 * Stacked 100% bar. Monochrome on purpose: the leading language takes the pink accent,
 * the rest step down in ink opacity, so the figure stays inside the black/white/pink palette.
 */
const INK_STEPS = ["opacity-80", "opacity-55", "opacity-35", "opacity-20", "opacity-10"];

function swatchClass(index: number): string {
  return index === 0 ? "bg-accent-decor" : `bg-ink ${INK_STEPS[(index - 1) % INK_STEPS.length]}`;
}

export function LanguageBar({ languages }: { languages: LanguageSlice[] }) {
  const t = useTranslations("activity");
  const label = (name: string) => (name === OTHER_LANGUAGE ? t("otherLanguages") : name);

  return (
    <div>
      <div className="flex h-4 w-full overflow-hidden rounded-full" aria-hidden="true">
        {languages.map((language, index) => (
          <span
            key={language.name}
            className={swatchClass(index)}
            style={{ width: `${language.percent}%` }}
          />
        ))}
      </div>
      <ul className="mt-5 grid grid-cols-1 gap-x-6 gap-y-2 text-sm min-[22rem]:grid-cols-2 sm:grid-cols-3">
        {languages.map((language, index) => (
          <li key={language.name} className="flex items-center gap-2">
            <span
              className={`size-2.5 shrink-0 rounded-full ${swatchClass(index)}`}
              aria-hidden="true"
            />
            <span>{label(language.name)}</span>
            <span className="ml-auto font-mono text-xs text-muted tabular-nums">
              {language.percent}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
