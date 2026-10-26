import type { CSSProperties, ReactNode } from "react";
import { useCurrentFrame } from "remotion";
import { C, ENTER, pop } from "./theme";

export type Box = { x: number; y: number; w: number; h: number };

/** Numbered section: black badge + pill title over a soft card, springing in at its turn. */
export const Section: React.FC<{ n: number; title: string; box: Box; children: ReactNode }> = ({ n, title, box, children }) => {
  const frame = useCurrentFrame();
  const at = ENTER(n);
  const p = pop(frame, at);
  const badge = pop(frame, at + 3, 12);
  return (
    <div
      style={{
        position: "absolute",
        left: box.x,
        top: box.y,
        width: box.w,
        height: box.h,
        opacity: Math.min(1, p * 1.4),
        transform: `translateY(${(1 - p) * 34}px) scale(${0.96 + 0.04 * p})`,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: C.card,
          border: `1.5px solid ${C.cardLine}`,
          borderRadius: 22,
        }}
      />
      <div style={{ position: "absolute", left: 12, top: 11, display: "flex", alignItems: "center", gap: 8, transform: `scale(${badge})`, transformOrigin: "left center" }}>
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: 15,
            background: C.ink,
            color: "white",
            fontSize: 15,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {n}
        </div>
        <div style={{ background: C.ink, color: "white", fontSize: 15, fontWeight: 600, padding: "6px 15px", borderRadius: 16 }}>{title}</div>
      </div>
      <div style={{ position: "absolute", left: 0, top: 0, width: box.w, height: box.h }}>{children}</div>
    </div>
  );
};

/** White inner panel. */
export const Paper: React.FC<{ style?: CSSProperties; children?: ReactNode }> = ({ style, children }) => (
  <div
    style={{
      position: "absolute",
      background: C.paper,
      border: `1px solid ${C.paperLine}`,
      borderRadius: 12,
      boxShadow: "0 1px 2px rgba(60,40,20,0.06)",
      ...style,
    }}
  >
    {children}
  </div>
);

/** Rounded-square monogram standing in for a product mark. */
export const Glyph: React.FC<{ text: string; color: string; size?: number }> = ({ text, color, size = 22 }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size * 0.28,
      background: color,
      color: "white",
      fontSize: size * (text.length > 1 ? 0.42 : 0.56),
      fontWeight: 700,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    }}
  >
    {text}
  </div>
);

export const Check: React.FC<{ on: number; color?: string; size?: number }> = ({ on, color = C.orange, size = 16 }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      background: color,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transform: `scale(${on})`,
      flexShrink: 0,
    }}
  >
    <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 10 10">
      <path d="M1.8 5.2 L4.1 7.4 L8.3 2.8" stroke="white" strokeWidth={1.7} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </div>
);

export const Chip: React.FC<{ text: string; color?: string; bg?: string; style?: CSSProperties }> = ({ text, color = C.sub, bg = "white", style }) => (
  <div
    style={{
      fontSize: 11,
      fontWeight: 500,
      color,
      background: bg,
      border: `1px solid ${C.paperLine}`,
      borderRadius: 7,
      padding: "3px 8px",
      whiteSpace: "nowrap",
      ...style,
    }}
  >
    {text}
  </div>
);
