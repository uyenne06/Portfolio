import { useTranslations } from "next-intl";

import { referenceNumber } from "@/config/references.config";

/** Bracketed citation linking to the References list, e.g. [3] or [2,10]. */
export function Cite({ ids }: { ids: readonly string[] }) {
  const t = useTranslations("sections");
  if (ids.length === 0) return null;
  const numbers = [...new Set(ids.map(referenceNumber))].sort((a, b) => a - b);

  return (
    <sup className="ml-0.5 font-mono text-[0.7em] leading-none font-normal tracking-normal">
      [
      {numbers.map((n, index) => (
        <span key={n}>
          {index > 0 ? "," : null}
          <a
            href={`#ref-${n}`}
            className="text-accent underline-offset-2 hover:underline"
            aria-label={`${t("references")} ${n}`}
          >
            {n}
          </a>
        </span>
      ))}
      ]
    </sup>
  );
}
