import type { TechGroup } from "@/shared/lib/tech-catalog";

export type TechUsage = { label: string; count: number };

export type TechStack = {
  totalProjects: number;
  groups: { group: TechGroup; items: TechUsage[] }[];
};
