import type { CSSProperties } from "react";

export const C = {
  navy: "#051234",
  // The colour arc: blue carries the pain (the cost, the status quo), orange carries us (Revenue OS, the CTA)
  blue: "#0177FF",
  orange: "#FE772C",
  neutral: "#111827",
  grey: "#7C879B",
  greyDim: "rgba(255,255,255,0.38)",
  text: "#F4F7FC",
  textDim: "rgba(244,247,252,0.62)",
  green: "#22C55E", // done, and only done
};

export const glass: CSSProperties = {
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 24,
  boxShadow: "0 24px 64px rgba(0,0,0,0.38), 0 2px 8px rgba(0,0,0,0.25)",
};

export const FPS = 30;
