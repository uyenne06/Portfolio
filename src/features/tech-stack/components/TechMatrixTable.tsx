"use client";

import { useState } from "react";

import { cn } from "@/shared/utils";

export type TechMatrixTableProps = {
  columns: { id: string; label: string; href: string }[];
  groups: {
    id: string;
    label: string;
    rows: { label: string; uses: boolean[]; count: number }[];
  }[];
  labels: {
    tool: string;
    total: string;
    used: string;
    unused: string;
    showAll: string;
    showFewer: string;
  };
};

/**
 * Dot matrix of tools (rows) by projects (columns). Hovering or focusing a column header
 * highlights that project's column; rows highlight on hover via CSS.
 */
export function TechMatrixTable({ columns, groups, labels }: TechMatrixTableProps) {
  const [activeColumn, setActiveColumn] = useState<number | null>(null);
  // Tools used by a single project are folded away by default to keep the figure scannable.
  const [showAll, setShowAll] = useState(false);
  const hiddenCount = groups.reduce(
    (sum, group) => sum + group.rows.filter((row) => row.count < 2).length,
    0,
  );
  const visibleGroups = groups
    .map((group) => ({
      ...group,
      rows: showAll ? group.rows : group.rows.filter((row) => row.count >= 2),
    }))
    .filter((group) => group.rows.length > 0);
  const total = columns.length;
  const columnClass = (index: number) =>
    cn("transition-colors duration-200", activeColumn === index && "bg-accent-soft");

  return (
    <div className="relative overflow-x-auto">
      <table className="w-full min-w-xs border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-ink align-bottom">
            <th scope="col" className="pr-4 pb-3 font-mono text-xs font-normal text-muted">
              {labels.tool}
            </th>
            {columns.map((column, index) => (
              <th key={column.id} scope="col" className={cn("px-1 pb-3", columnClass(index))}>
                <a
                  href={column.href}
                  onMouseEnter={() => setActiveColumn(index)}
                  onMouseLeave={() => setActiveColumn(null)}
                  onFocus={() => setActiveColumn(index)}
                  onBlur={() => setActiveColumn(null)}
                  className="mx-auto block rotate-180 font-display text-base font-medium whitespace-nowrap [writing-mode:vertical-rl] hover:text-accent"
                >
                  {column.label}
                </a>
              </th>
            ))}
            <th
              scope="col"
              className="pb-3 pl-3 text-right font-mono text-xs font-normal text-muted"
            >
              {labels.total}
            </th>
          </tr>
        </thead>
        {visibleGroups.map((group) => (
          <tbody key={group.id}>
            <tr>
              <th
                scope="rowgroup"
                colSpan={total + 2}
                className="pt-6 pb-2 font-mono text-xs font-normal tracking-wide text-accent"
              >
                {group.label}
              </th>
            </tr>
            {group.rows.map((row) => (
              <tr key={row.label} className="border-b border-rule hover:bg-accent-soft/60">
                <th scope="row" className="py-2 pr-4 font-normal whitespace-nowrap">
                  {row.label}
                </th>
                {row.uses.map((used, index) => (
                  <td
                    key={columns[index]?.id ?? index}
                    className={cn("px-1 py-2", columnClass(index))}
                  >
                    <span className="flex justify-center">
                      <span
                        aria-hidden="true"
                        className={cn(
                          "rounded-full",
                          used ? "size-3 bg-accent-decor" : "size-1.5 bg-rule",
                        )}
                      />
                      <span className="sr-only">{used ? labels.used : labels.unused}</span>
                    </span>
                  </td>
                ))}
                <td className="py-2 pl-3 text-right font-mono text-xs text-muted tabular-nums">
                  {row.count}/{total}
                </td>
              </tr>
            ))}
          </tbody>
        ))}
      </table>
      {hiddenCount > 0 ? (
        <button
          type="button"
          aria-expanded={showAll}
          onClick={() => setShowAll((value) => !value)}
          className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full border border-ink/80 px-4 py-2 text-sm font-medium hover:border-accent hover:text-accent"
        >
          {showAll ? labels.showFewer : labels.showAll}
        </button>
      ) : null}
    </div>
  );
}
