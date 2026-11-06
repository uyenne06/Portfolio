import type { ReactNode } from "react";

import { PageTransition } from "@/shared/components/layout";

/** Re-mounts on every navigation, giving each page a short fade-in. */
export default function Template({ children }: { children: ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}
