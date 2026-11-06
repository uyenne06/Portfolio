import { useFormatter, useTranslations } from "next-intl";

import type { RecentEvent } from "@/shared/lib/github";

function EventText({ event }: { event: RecentEvent }) {
  const t = useTranslations("activity.event");
  const repo = event.repo;
  switch (event.type) {
    case "PushEvent":
      return event.commitCount != null
        ? t("PushEvent", { count: event.commitCount, repo })
        : t("PushEventNoCount", { repo });
    case "PullRequestEvent":
      return t("PullRequestEvent", { detail: event.detail ?? "", repo });
    case "CreateEvent":
      return t("CreateEvent", { detail: event.detail ?? "", repo });
  }
}

/** Pure list of recent events (state handling lives in RecentActivity). */
export function RecentActivityList({ events }: { events: RecentEvent[] }) {
  const format = useFormatter();
  return (
    <ol className="text-sm">
      {events.map((event) => (
        <li
          key={event.id}
          className="flex flex-col gap-1 border-b border-rule py-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
        >
          <span className="min-w-0 break-words">
            <EventText event={event} />
          </span>
          <time dateTime={event.createdAt} className="shrink-0 font-mono text-xs text-muted">
            {format.dateTime(new Date(event.createdAt), { dateStyle: "medium" })}
          </time>
        </li>
      ))}
    </ol>
  );
}
