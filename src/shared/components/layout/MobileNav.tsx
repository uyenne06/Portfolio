"use client";

import { Menu, X } from "lucide-react";
import { useEffect, useId, useState } from "react";

export type NavItem = { href: string; label: string; number?: string };

type MobileNavProps = { items: NavItem[]; openLabel: string; closeLabel: string };

/** Table-of-contents disclosure for small screens. */
export function MobileNav({ items, openLabel, closeLabel }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? closeLabel : openLabel}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex size-11 items-center justify-center rounded-full text-ink hover:text-accent"
      >
        {open ? (
          <X className="size-5" aria-hidden="true" strokeWidth={1.5} />
        ) : (
          <Menu className="size-5" aria-hidden="true" strokeWidth={1.5} />
        )}
      </button>
      <nav
        id={panelId}
        aria-label={openLabel}
        hidden={!open}
        className="absolute inset-x-0 top-full border-b border-rule bg-paper"
      >
        <ol className="mx-auto max-w-page px-4 py-4 sm:px-6">
          {items.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex items-baseline gap-4 py-3 text-lg hover:text-accent"
              >
                <span className="w-8 font-mono text-sm text-accent">{item.number}</span>
                {item.label}
              </a>
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );
}
