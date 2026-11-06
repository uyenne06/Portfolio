import type { ReactNode } from "react";

import { cn } from "@/shared/utils";

import { Container } from "./Container";

type SectionProps = {
  id: string;
  title: string;
  /** Paper-style section number ("01"); omitted for unnumbered sections such as References. */
  number?: string;
  children: ReactNode;
  className?: string;
};

/**
 * A numbered paper section: number and title in the left rail (sticky on large screens),
 * content in the remaining nine columns.
 */
export function Section({ id, title, number, children, className }: SectionProps) {
  const headingId = `${id}-heading`;
  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={cn("border-t border-rule py-16 lg:py-24", className)}
    >
      <Container className="grid grid-cols-1 gap-y-8 lg:grid-cols-12 lg:gap-x-10">
        <header className="lg:col-span-3">
          <div className="lg:sticky lg:top-24">
            {number ? (
              <p className="font-mono text-sm text-accent" aria-hidden="true">
                {number} —
              </p>
            ) : null}
            <h2
              id={headingId}
              className="mt-2 font-display text-section font-medium text-balance hyphens-auto"
            >
              {title}
            </h2>
          </div>
        </header>
        <div className="min-w-0 lg:col-span-9">{children}</div>
      </Container>
    </section>
  );
}
