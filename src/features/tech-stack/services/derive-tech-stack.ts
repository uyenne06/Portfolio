import type { RepoData } from "@/shared/lib/github";
import { technologiesOf, TECH_GROUP_ORDER } from "@/shared/lib/tech-catalog";

import type { TechStack } from "../types";

/**
 * Counts, per technology, how many featured repositories use it, then groups by layer.
 * Ordered by usage (desc) then name, so the table reads as evidence rather than a wish list.
 */
export function deriveTechStack(repos: readonly RepoData[]): TechStack {
  const usage = new Map<string, { group: TechStack["groups"][number]["group"]; count: number }>();

  for (const repo of repos) {
    for (const tech of technologiesOf(repo)) {
      const current = usage.get(tech.label);
      usage.set(tech.label, { group: tech.group, count: (current?.count ?? 0) + 1 });
    }
  }

  const groups = TECH_GROUP_ORDER.map((group) => ({
    group,
    items: [...usage.entries()]
      .filter(([, value]) => value.group === group)
      .map(([label, value]) => ({ label, count: value.count }))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label)),
  })).filter((entry) => entry.items.length > 0);

  return { totalProjects: repos.length, groups };
}
