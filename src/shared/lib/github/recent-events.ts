import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { z } from "zod";

import { serverEnv } from "@/config/env";

import { GITHUB_CACHE_TAG } from "./github.service";

/** Public events we surface; everything else (stars, forks, …) is ignored. */
const RELEVANT_TYPES = ["PushEvent", "PullRequestEvent", "CreateEvent"] as const;

const eventSchema = z.object({
  id: z.string(),
  type: z.string(),
  created_at: z.string(),
  repo: z.object({ name: z.string() }),
  payload: z
    .object({
      size: z.number().optional(),
      action: z.string().optional(),
      ref_type: z.string().nullable().optional(),
    })
    .loose(),
});

export const recentEventSchema = z.object({
  id: z.string(),
  type: z.enum(RELEVANT_TYPES),
  repo: z.string(),
  createdAt: z.string(),
  /** Commits in a push, when GitHub reports it. */
  commitCount: z.number().nullable(),
  /** PR action ("opened", "closed", …) or created ref type ("branch", "repository", …). */
  detail: z.string().nullable(),
});

export type RecentEvent = z.infer<typeof recentEventSchema>;

function isRelevant(type: string): type is RecentEvent["type"] {
  return (RELEVANT_TYPES as readonly string[]).includes(type);
}

/**
 * Latest public activity, cached for minutes. Works without a token (60 req/h per IP),
 * uses the token when present for a higher limit. Never throws: the UI shows an
 * empty state instead.
 */
export async function getRecentEvents(limit = 6): Promise<RecentEvent[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag(GITHUB_CACHE_TAG);

  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "portfolio-github-sync",
  };
  if (serverEnv.GITHUB_TOKEN) headers.Authorization = `Bearer ${serverEnv.GITHUB_TOKEN}`;

  try {
    const response = await fetch(
      `https://api.github.com/users/${encodeURIComponent(serverEnv.GITHUB_USERNAME)}/events/public?per_page=50`,
      { headers },
    );
    if (!response.ok) return [];

    const events = z.array(eventSchema).parse(await response.json());
    return events
      .filter((event) => isRelevant(event.type))
      .slice(0, limit)
      .map((event) => ({
        id: event.id,
        type: event.type as RecentEvent["type"],
        repo: event.repo.name,
        createdAt: event.created_at,
        commitCount: event.payload.size ?? null,
        detail: event.payload.action ?? event.payload.ref_type ?? null,
      }));
  } catch (error) {
    console.warn("[github] recent events unavailable:", error);
    return [];
  }
}
