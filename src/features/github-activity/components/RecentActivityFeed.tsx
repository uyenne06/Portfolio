"use client";

import { useTranslations } from "next-intl";

import { QueryProvider } from "@/providers/QueryProvider";

import { useRecentActivity } from "../hooks/useRecentActivity";
import { RecentActivityList } from "./RecentActivityList";

function Feed() {
  const t = useTranslations("activity");
  const { data, isPending, isError } = useRecentActivity();

  if (isPending) return <p className="text-sm text-muted">{t("recentLoading")}</p>;
  if (isError) return <p className="text-sm text-muted">{t("recentError")}</p>;
  if (data.length === 0) return <p className="text-sm text-muted">{t("recentEmpty")}</p>;
  return <RecentActivityList events={data} />;
}

/**
 * The client-fetched part of the activity section, with its own query provider. Loaded by
 * RecentActivity when the section nears the viewport, so TanStack Query is not on first load.
 */
export default function RecentActivityFeed() {
  return (
    <QueryProvider>
      <Feed />
    </QueryProvider>
  );
}
