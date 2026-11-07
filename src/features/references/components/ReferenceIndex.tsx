"use client";

import { ArrowUp, ArrowUpRight, CornerLeftUp } from "lucide-react";
import { useEffect, useState } from "react";

import type { ReferenceKind } from "@/config/references.config";
import { CountUp } from "@/shared/components/ui";
import { cn } from "@/shared/utils";

export type ReferenceEntry = {
  id: string;
  number: number;
  label: string;
  kind: ReferenceKind;
  url?: string;
};

/** Every string of the index, formatted on the server (no message formatter on the client). */
export type ReferenceLabels = {
  sources: string;
  citations: string;
  citedIn: string;
  top: string;
  end: string;
  backToTop: string;
  kinds: Record<ReferenceKind, string>;
  /** "Cited N times" for 0, 1 and any other count (`{n}` is replaced by the formatted count). */
  cited: { zero: string; one: string; other: string };
};

type Backlink = { sectionId: string; title: string; anchor: HTMLAnchorElement };
type Usage = { count: number; backlinks: Backlink[] };

/** Scans the page for `[n]` citation links and groups them by the section they appear in. */
function collectUsage(entries: ReferenceEntry[]): Record<number, Usage> {
  const usage: Record<number, Usage> = {};
  for (const entry of entries) {
    const anchors = [
      ...document.querySelectorAll<HTMLAnchorElement>(`a[href="#ref-${entry.number}"]`),
    ];
    const backlinks: Backlink[] = [];
    for (const anchor of anchors) {
      const section = anchor.closest<HTMLElement>("section[id], article");
      const sectionId = section?.id || "top";
      if (backlinks.some((link) => link.sectionId === sectionId)) continue;
      const heading = section?.querySelector("h1, h2");
      backlinks.push({ sectionId, title: heading?.textContent?.trim() ?? "", anchor });
    }
    usage[entry.number] = { count: anchors.length, backlinks };
  }
  return usage;
}

/** Scrolls to a citation and makes it pulse so the reader sees where the source is used. */
function revisit(anchor: HTMLAnchorElement) {
  anchor.scrollIntoView({ behavior: "smooth", block: "center" });
  anchor.classList.remove("cite-flash");
  // Restart the animation even if the same citation is revisited.
  void anchor.offsetWidth;
  anchor.classList.add("cite-flash");
  window.setTimeout(() => anchor.classList.remove("cite-flash"), 2400);
}

function hostOf(url: string): string {
  try {
    return new URL(url).host + new URL(url).pathname.replace(/\/$/, "");
  } catch {
    return url;
  }
}

/**
 * The bibliography as a living citation index: each source shows how often and where it is
 * cited on this page (counted from the DOM), with back-links that jump to the citation.
 */
export function ReferenceIndex({
  entries,
  locale,
  labels,
}: {
  entries: ReferenceEntry[];
  locale: string;
  labels: ReferenceLabels;
}) {
  const [usage, setUsage] = useState<Record<number, Usage>>({});

  useEffect(() => {
    // Citations are server-rendered, so the DOM is complete once this client island mounts.
    // Counting waits for an idle moment so it stays out of hydration.
    const idle = window.requestIdleCallback ?? ((run: () => void) => window.setTimeout(run, 200));
    const cancel = window.cancelIdleCallback ?? window.clearTimeout;
    const handle = idle(() => setUsage(collectUsage(entries)));
    return () => cancel(handle);
  }, [entries]);

  const citedLabel = (count: number) =>
    count === 0
      ? labels.cited.zero
      : count === 1
        ? labels.cited.one
        : labels.cited.other.replace("{n}", new Intl.NumberFormat(locale).format(count));

  const totalCitations = Object.values(usage).reduce((sum, entry) => sum + entry.count, 0);
  const maxCount = Math.max(1, ...Object.values(usage).map((entry) => entry.count));

  return (
    <div>
      <p className="font-display text-title font-medium">
        <CountUp value={entries.length} locale={locale} /> {labels.sources}
        <span className="mx-3 text-accent-decor">·</span>
        {totalCitations > 0 ? <CountUp value={totalCitations} locale={locale} /> : "—"}{" "}
        {labels.citations}
      </p>

      <ol className="mt-10 border-t-2 border-ink">
        {entries.map((entry) => {
          const used = usage[entry.number];
          const percent = used ? (used.count / maxCount) * 100 : 0;
          return (
            <li
              key={entry.id}
              id={`ref-${entry.number}`}
              className="group anchor-target grid grid-cols-1 gap-x-8 gap-y-4 border-b border-rule py-7 transition-colors duration-300 target:bg-accent-soft hover:bg-accent-soft/50 sm:grid-cols-12 lg:py-9"
            >
              <p
                aria-hidden="true"
                className="font-display text-plate leading-none font-medium text-outline tabular-nums transition-colors duration-300 group-hover:text-accent-decor sm:col-span-2"
              >
                {String(entry.number).padStart(2, "0")}
              </p>

              <div className="min-w-0 sm:col-span-6">
                <p className="font-mono text-xs text-accent">
                  <span className="sr-only">[{entry.number}] </span>
                  {labels.kinds[entry.kind]}
                </p>
                {entry.url ? (
                  <a
                    href={entry.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex items-start gap-2 text-lg font-medium break-words hover:text-accent"
                  >
                    {entry.label}
                    <ArrowUpRight
                      className="mt-1 size-4 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      aria-hidden="true"
                      strokeWidth={1.5}
                    />
                  </a>
                ) : (
                  <p className="mt-2 text-lg font-medium">{entry.label}</p>
                )}
                {entry.url ? (
                  <p className="mt-1 truncate font-mono text-xs text-muted">{hostOf(entry.url)}</p>
                ) : null}
              </div>

              <div className="sm:col-span-4">
                <p className="font-mono text-xs text-muted">
                  {used ? citedLabel(used.count) : " "}
                </p>
                <div
                  className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-rule"
                  aria-hidden="true"
                >
                  <div
                    className="h-full origin-left rounded-full bg-accent-decor transition-transform duration-1000 ease-paper"
                    style={{ transform: `scaleX(${percent / 100})` }}
                  />
                </div>
                {used && used.backlinks.length > 0 ? (
                  <ul className="mt-3 flex flex-wrap gap-2" aria-label={labels.citedIn}>
                    {used.backlinks.map((link) => (
                      <li key={link.sectionId}>
                        <button
                          type="button"
                          onClick={() => revisit(link.anchor)}
                          className={cn(
                            "inline-flex min-h-9 items-center gap-1.5 rounded-full border border-rule bg-paper px-3 py-1 text-xs transition-colors",
                            "hover:border-accent-decor hover:bg-accent-decor hover:text-on-accent",
                          )}
                        >
                          <CornerLeftUp className="size-3.5" aria-hidden="true" strokeWidth={1.5} />
                          {link.title || labels.top}
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>

      <div className="mt-16 flex flex-wrap items-end justify-between gap-6">
        <p className="flex items-baseline gap-4 font-display text-title">
          <span aria-hidden="true" className="text-accent-decor">
            ∎
          </span>
          <span className="italic">{labels.end}</span>
        </p>
        <a
          href="#main"
          className="group inline-flex min-h-11 items-center gap-2 rounded-full border border-ink/80 px-5 py-2.5 text-sm font-medium hover:border-accent hover:text-accent"
        >
          <ArrowUp
            className="size-4 transition-transform duration-300 group-hover:-translate-y-1"
            aria-hidden="true"
            strokeWidth={1.5}
          />
          {labels.backToTop}
        </a>
      </div>
    </div>
  );
}
