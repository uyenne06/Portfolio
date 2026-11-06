import { cn } from "@/shared/utils";

/** Filled dot per project using the tool, hollow for the rest — a tiny inline bar chart. */
export function UsageDots({ count, total }: { count: number; total: number }) {
  return (
    <span className="inline-flex gap-1" aria-hidden="true">
      {Array.from({ length: total }, (_, index) => (
        <span
          key={index}
          className={cn(
            "size-2 rounded-full",
            index < count ? "bg-accent-decor" : "border border-rule",
          )}
        />
      ))}
    </span>
  );
}
