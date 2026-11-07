"use client";

import dynamic from "next/dynamic";
import { useRef, useState, type ReactNode } from "react";

import { useMediaQuery } from "@/shared/hooks";

// The floating preview (and the animation library behind it) loads on the first hover.
const PreviewLayer = dynamic(() => import("./PreviewLayer"), { ssr: false });

type HoverPreviewProps = {
  /** Server-rendered plates per slug, shown next to the cursor. */
  previews: Record<string, ReactNode>;
  children: ReactNode;
};

/**
 * Wraps the project list (server-rendered children) and floats the hovered project's
 * screenshot beside the cursor. Only on wide screens with a fine pointer; the list stays
 * fully usable without it.
 */
export function HoverPreview({ previews, children }: HoverPreviewProps) {
  const enabled = useMediaQuery("(hover: hover) and (pointer: fine) and (min-width: 64rem)");
  const container = useRef<HTMLDivElement>(null);
  const [armed, setArmed] = useState(false);

  return (
    <div ref={container} className="relative" onPointerEnter={() => setArmed(true)}>
      {children}
      {enabled && armed ? <PreviewLayer containerRef={container} previews={previews} /> : null}
    </div>
  );
}
