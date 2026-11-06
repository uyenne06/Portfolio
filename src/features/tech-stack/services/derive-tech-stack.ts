import { TECH_GROUP_ORDER, type TechGroup } from "@/shared/lib/tech-catalog";

import type { StackSource, TechMatrix } from "../types";

/**
 * Technology × project matrix: which featured project declares which tool.
 * Rows are grouped by layer and ordered by usage (desc) then name, so the figure reads as
 * evidence rather than a wish list.
 */
export function deriveTechMatrix(projects: readonly StackSource[]): TechMatrix {
  const groups = new Map<string, TechGroup>();
  for (const project of projects) {
    for (const tech of project.stack) groups.set(tech.label, tech.group);
  }

  const rowsFor = (group: TechGroup) =>
    [...groups.entries()]
      .filter(([, value]) => value === group)
      .map(([label]) => {
        const uses = projects.map((project) => project.stack.some((tech) => tech.label === label));
        return { label, uses, count: uses.filter(Boolean).length };
      })
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));

  return {
    columns: projects.map((project) => project.slug),
    groups: TECH_GROUP_ORDER.map((group) => ({ group, rows: rowsFor(group) })).filter(
      (entry) => entry.rows.length > 0,
    ),
  };
}
