import type { ProjectSlug } from "@/config/featured-projects.config";
import type { TechEntry, TechGroup } from "@/shared/lib/tech-catalog";

/** Minimal project shape this feature needs (structurally satisfied by the projects feature). */
export type StackSource = {
  slug: ProjectSlug;
  stack: readonly TechEntry[];
};

export type TechMatrixRow = { label: string; symbol: string; uses: boolean[]; count: number };

export type TechMatrix = {
  /** Column order = project order. */
  columns: ProjectSlug[];
  groups: { group: TechGroup; rows: TechMatrixRow[] }[];
};
