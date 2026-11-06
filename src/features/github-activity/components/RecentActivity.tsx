"use client";

import { useTranslations } from "next-intl";

import { useRecentActivity } from "../hooks/useRecentActivity";
import { RecentActivityList } from "./RecentActivityList";

/** Client island: loading / error / empty states around the recent-activity list. */
export function RecentActivity() {
  const t = useTranslations("activity");
  const { data, isPending, isError } = useRecentActivity();

  return (
    <section aria-labelledby="recent-activity-heading" aria-busy={isPending}>
      <h3 id="recent-activity-heading" className="font-display text-subtitle font-medium">
        {t("recentTitle")}
      </h3>
      <div className="mt-4" aria-live="polite">
        {isPending ? (
          <p className="text-sm text-muted">{t("recentLoading")}</p>
        ) : isError ? (
          <p className="text-sm text-muted">{t("recentError")}</p>
        ) : data.length === 0 ? (
          <p className="text-sm text-muted">{t("recentEmpty")}</p>
        ) : (
          <RecentActivityList events={data} />
        )}
      </div>
    </section>
  );
}
