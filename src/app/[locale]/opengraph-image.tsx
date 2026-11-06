import { ImageResponse } from "next/og";

import { routing } from "@/i18n/routing";

// Open Graph images are bitmaps, so this file is the one place pixel sizes are required.
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Nguyen Huynh Hoang Uyen — Frontend Developer";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#ffffff",
        color: "#000000",
        padding: 80,
      }}
    >
      <div style={{ display: "flex", fontSize: 28, color: "#a04d6e" }}>Portfolio · Preprint</div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: 88, lineHeight: 1, letterSpacing: -2 }}>
          Nguyen Huynh Hoang Uyen
        </div>
        <div style={{ marginTop: 28, fontSize: 40, color: "#555555" }}>Frontend Developer</div>
      </div>
      <div style={{ display: "flex", height: 16, background: "#e8a0bf", borderRadius: 8 }} />
    </div>,
    size,
  );
}
