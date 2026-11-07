"use client";

import { lazy, Suspense, useRef, useState } from "react";

import { useInView } from "@/shared/hooks";

// The feed brings the query library and the message formatter; it loads near the viewport.
const RecentActivityFeed = lazy(() => import("./RecentActivityFeed"));

type RecentActivityProps = { title: string; loading: string };

/**
 * Client island for the live "latest activity" list. The fetch (and the code behind it) only
 * starts once the block is about a screen away; until then it shows the loading line.
 */
export function RecentActivity({ title, loading }: RecentActivityProps) {
  const block = useRef<HTMLElement>(null);
  const near = useInView(block, "100% 0px");
  const [started, setStarted] = useState(false);
  if (near && !started) setStarted(true);
  const placeholder = <p className="text-sm text-muted">{loading}</p>;

  return (
    <section ref={block} aria-labelledby="recent-activity-heading">
      <h3 id="recent-activity-heading" className="font-display text-subtitle font-medium">
        {title}
      </h3>
      <div className="mt-4" aria-live="polite">
        {started ? (
          <Suspense fallback={placeholder}>
            <RecentActivityFeed />
          </Suspense>
        ) : (
          placeholder
        )}
      </div>
    </section>
  );
}
