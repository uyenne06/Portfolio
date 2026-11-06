"use client";

import { useQuery } from "@tanstack/react-query";

import type { RecentEvent } from "@/shared/lib/github";

async function fetchRecentActivity(): Promise<RecentEvent[]> {
  // Same-origin route handler; the GitHub token never reaches the browser.
  const response = await fetch("/api/github/recent");
  if (!response.ok) throw new Error(`Recent activity request failed: ${response.status}`);
  return (await response.json()) as RecentEvent[];
}

/** The one piece of data fetched client-side: it changes faster than the hourly page cache. */
export function useRecentActivity() {
  return useQuery({
    queryKey: ["github", "recent-activity"],
    queryFn: fetchRecentActivity,
  });
}
