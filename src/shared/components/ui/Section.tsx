import type { CSSProperties, ReactNode } from "react";

import { cn } from "@/shared/utils";

import { Container } from "./Container";
import { RevealOnView } from "./RevealOnView";

type SectionProps = {
  id: string;
  title: string;
  /** Paper-style section number ("01"); omitted for unnumbered sections such as References. */
  number?: string;
  /** Marginal note shown in the left rail on large screens (above the content on small ones). */
  note?: ReactNode;
  /** Full-width body for large figures: the note becomes an intro row above the content. */
  wide?: boolean;
  children: ReactNode;
  className?: string;
};

/**
 * Editorial section: a full-width heading under a heavy rule, then a 12-column body with an
 * optional sticky marginal note (Tufte-style) and the content in the remaining nine columns.
 */
export function Section({ id, title, number, note, wide, children, className }: SectionProps) {
  const headingId = `${id}-heading`;
  return (
    <section id={id} aria-labelledby={headingId} className={cn("py-20 lg:py-32", className)}>
      <Container>
        <header className="grid grid-cols-1 gap-x-10 gap-y-3 border-t-2 border-ink pt-5 lg:grid-cols-12">
          <p className="font-mono text-sm text-accent lg:col-span-3 lg:pt-3" aria-hidden="true">
            {number ? `§ ${number}` : "§"}
          </p>
          <RevealOnView
            as="h2"
            id={headingId}
            className="font-display text-section font-medium text-balance lg:col-span-9"
          >
            {title.split(" ").map((word, index, words) => (
              <span key={`${word}-${index}`}>
                <span className="reveal-word">
                  <span style={{ "--rise-index": index } as CSSProperties}>{word}</span>
                </span>
                {index < words.length - 1 ? " " : null}
              </span>
            ))}
          </RevealOnView>
        </header>

        <div className="mt-10 grid grid-cols-1 gap-x-10 gap-y-8 lg:mt-16 lg:grid-cols-12">
          {note ? (
            <aside className={wide ? "lg:col-span-6 lg:col-start-4" : "lg:col-span-3"}>
              <div
                className={cn("text-sm leading-relaxed text-muted", !wide && "lg:sticky lg:top-28")}
              >
                {note}
              </div>
            </aside>
          ) : null}
          <div className={cn("min-w-0", wide ? "lg:col-span-12" : "lg:col-span-9 lg:col-start-4")}>
            {children}
          </div>
        </div>
      </Container>
    </section>
  );
}
