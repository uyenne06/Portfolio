import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/shared/utils";

export function Container({ className, ...props }: ComponentPropsWithoutRef<"div">) {
  return (
    <div className={cn("mx-auto w-full max-w-page px-4 sm:px-6 lg:px-10", className)} {...props} />
  );
}
