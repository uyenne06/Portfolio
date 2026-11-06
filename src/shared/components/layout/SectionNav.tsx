"use client";

import { useEffect, useState } from "react";

import { cn } from "@/shared/utils";

import type { NavItem } from "./MobileNav";

type SectionNavProps = { items: (NavItem & { id: string })[]; label: string };

/** Desktop table of contents that marks the section currently being read. */
export function SectionNav({ items, label }: SectionNavProps) {
  const [current, setCurrent] = useState<string | null>(null);

  useEffect(() => {
    const sections = items
      .map((item) => document.getElementById(item.id))
      .filter((node): node is HTMLElement => node !== null);
    if (sections.length === 0) return;

    // A section counts as current while it crosses the upper third of the viewport.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setCurrent(entry.target.id);
        }
      },
      { rootMargin: "-30% 0px -65% 0px" },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [items]);

  return (
    <nav aria-label={label} className="hidden lg:block">
      <ol className="flex items-center gap-7 text-sm">
        {items.map((item) => {
          const active = item.id === current;
          return (
            <li key={item.href}>
              <a
                href={item.href}
                aria-current={active ? "location" : undefined}
                className="group inline-flex items-baseline gap-1.5 py-2"
              >
                <span className="font-mono text-xs text-accent">{item.number}</span>
                <span
                  className={cn(
                    "border-b transition-colors",
                    active
                      ? "border-accent-decor text-ink"
                      : "border-transparent text-muted group-hover:text-ink",
                  )}
                >
                  {item.label}
                </span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
