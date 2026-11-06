import { TECH_GROUP_ORDER, type TechEntry, type TechGroup } from "@/shared/lib/tech-catalog";

import type { StackSource, TechMatrix } from "../types";

/**
 * Technology × project matrix: which featured project declares which tool.
 * Rows are grouped by layer and ordered by usage (desc) then name, so the figure reads as
 * evidence rather than a wish list.
 */
export function deriveTechMatrix(projects: readonly StackSource[]): TechMatrix {
  const catalog = new Map<string, TechEntry>();
  for (const project of projects) {
    for (const tech of project.stack) catalog.set(tech.label, tech);
  }

  const rowsFor = (group: TechGroup) =>
    [...catalog.values()]
      .filter((tech) => tech.group === group)
      .map(({ label, symbol }) => {
        const uses = projects.map((project) => project.stack.some((tech) => tech.label === label));
        return { label, symbol, uses, count: uses.filter(Boolean).length };
      })
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));

  return {
    columns: projects.map((project) => project.slug),
    groups: TECH_GROUP_ORDER.map((group) => ({ group, rows: rowsFor(group) })).filter(
      (entry) => entry.rows.length > 0,
    ),
  };
}

/** Tools used by at least `min` projects, most-used first (for the kinetic stack band). */
export function topTools(matrix: TechMatrix, min = 3): string[] {
  return matrix.groups
    .flatMap((group) => group.rows)
    .filter((row) => row.count >= min)
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
    .map((row) => row.label);
}
