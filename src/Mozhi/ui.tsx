import type { CSSProperties, ReactNode } from "react";
import { useCurrentFrame } from "remotion";
import { clamp01, lerp, ramp, sp } from "../RevenueOS/anim";
import { C, mono, sans, shot, speaking } from "./theme";

/** A shot's window. Cuts are near-hard: a 4-frame dissolve each side. */
export const InShot: React.FC<{ id: string; children: ReactNode; fade?: number }> = ({ id, children, fade = 4 }) => {
  const frame = useCurrentFrame();
  const s = shot(id);
  if (frame < s.start - fade || frame >= s.end + fade) return null;
  const v = Math.min(ramp(frame, s.start - fade, s.start + fade), 1 - ramp(frame, s.end - fade, s.end + fade));
  return <div style={{ position: "absolute", inset: 0, opacity: v }}>{children}</div>;
};

/** Springs a child in at `at`: rises and fades. */
export const Pop: React.FC<{ at: number; dy?: number; dx?: number; from?: number; style?: CSSProperties; children: ReactNode }> = ({
  at,
  dy = 16,
  dx = 0,
  from = 0.96,
  style,
  children,
}) => {
  const frame = useCurrentFrame();
  const t = sp(frame, at, 16, 150);
  if (frame < at - 1) return null;
  return (
    <div style={{ opacity: Math.min(1, t * 1.5), translate: `${dx * (1 - t)}px ${dy * (1 - t)}px`, scale: String(lerp(from, 1, t)), ...style }}>
      {children}
    </div>
  );
};

/**
 * The storyboard's on-screen feature line, bottom left: an orange rule, the line, and an
 * optional second beat (after the arrow in the storyboard) that lands later in orange.
 */
export const Feature: React.FC<{ at: number; text: string; then?: string; thenAt?: number }> = ({ at, text, then, thenAt }) => {
  const frame = useCurrentFrame();
  const t = sp(frame, at, 18, 140);
  const t2 = thenAt ? sp(frame, thenAt, 18, 140) : 0;
  if (frame < at - 1) return null;
  return (
    <div style={{ position: "absolute", left: 96, right: 96, bottom: 64, fontFamily: sans, opacity: Math.min(1, t * 1.5), translate: `${-24 * (1 - t)}px 0px` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
        <div style={{ width: 6, height: 46, borderRadius: 3, background: C.orange }} />
        <div style={{ fontSize: 40, fontWeight: 600, color: C.text, letterSpacing: -0.3 }}>{text}</div>
      </div>
      {then && (
        <div style={{ marginTop: 10, marginLeft: 28, fontSize: 32, fontWeight: 600, color: C.orange, opacity: t2, translate: `0px ${10 * (1 - t2)}px` }}>{then}</div>
      )}
    </div>
  );
};

/** Darkens the bottom of the frame so the feature line always reads. */
export const FootShade: React.FC = () => (
  <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 300, background: "linear-gradient(transparent, rgba(5,18,52,0.85))" }} />
);

export const Card: React.FC<{ style?: CSSProperties; children?: ReactNode; glow?: number }> = ({ style, children, glow = 0 }) => (
  <div
    style={{
      position: "absolute",
      background: C.card,
      border: `1px solid ${glow > 0 ? `rgba(254,119,44,${0.25 + 0.5 * glow})` : "rgba(244,247,252,0.12)"}`,
      borderRadius: 28,
      boxShadow: `0 30px 80px rgba(0,0,0,0.45)${glow > 0 ? `, 0 0 ${70 * glow}px rgba(254,119,44,${0.25 * glow})` : ""}`,
      fontFamily: sans,
      color: C.text,
      ...style,
    }}
  >
    {children}
  </div>
);

export const Label: React.FC<{ children: ReactNode; color?: string; style?: CSSProperties }> = ({ children, color = C.dim, style }) => (
  <div style={{ fontFamily: mono, fontSize: 17, fontWeight: 500, letterSpacing: 3, textTransform: "uppercase", color, ...style }}>{children}</div>
);

export const Avatar: React.FC<{ initials: string; size?: number; ring?: string }> = ({ initials, size = 72, ring = C.orange }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: 999,
      border: `3px solid ${ring}`,
      background: "#1B2E63",
      display: "grid",
      placeItems: "center",
      fontFamily: sans,
      fontWeight: 600,
      fontSize: size * 0.34,
      color: C.text,
      flex: "none",
    }}
  >
    {initials}
  </div>
);

export const Check: React.FC<{ on: number; size?: number }> = ({ on, size = 26 }) => (
  <svg width={size} height={size} viewBox="0 0 26 26" style={{ flex: "none" }}>
    <circle cx="13" cy="13" r="12" fill={on > 0 ? C.orange : "none"} stroke={on > 0 ? C.orange : C.faint} strokeWidth="2" opacity={on > 0 ? Math.min(1, on * 1.5) : 1} />
    <path d="M7.5 13.5l3.6 3.6L18.5 9.5" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="20" strokeDashoffset={20 * (1 - clamp01(on))} />
  </svg>
);

/** Live call waveform: tall while someone on the call is talking, a low idle shimmer otherwise. */
export const Waveform: React.FC<{ width: number; height: number; bars?: number; color?: string; who?: string }> = ({
  width,
  height,
  bars = 56,
  color = C.orange,
  who,
}) => {
  const frame = useCurrentFrame();
  const live = speaking(frame, who) ? 1 : 0;
  const prev = speaking(frame - 3, who) ? 1 : 0;
  const level = 0.15 + 0.85 * (live * 0.7 + prev * 0.3);
  const w = width / bars;
  return (
    <div style={{ width, height, display: "flex", alignItems: "center", gap: w * 0.35 }}>
      {Array.from({ length: bars }, (_, i) => {
        const n = 0.5 + 0.5 * Math.sin(frame * 0.9 + i * 1.7) * Math.cos(frame * 0.37 + i * 0.6);
        const env = Math.sin((Math.PI * (i + 0.5)) / bars) ** 0.6;
        const h = Math.max(4, height * env * (0.12 + level * n));
        return <div key={i} style={{ width: w * 0.65, height: h, borderRadius: 4, background: color, opacity: 0.55 + 0.45 * level }} />;
      })}
    </div>
  );
};

/** A chat or transcript bubble. */
export const Bubble: React.FC<{ side: "left" | "right"; children: ReactNode; tone?: "them" | "mozhi"; style?: CSSProperties; meta?: ReactNode }> = ({
  side,
  children,
  tone = side === "left" ? "them" : "mozhi",
  style,
  meta,
}) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: side === "left" ? "flex-start" : "flex-end", fontSize: 26, ...style }}>
    <div
      style={{
        maxWidth: "86%",
        padding: "14px 20px",
        borderRadius: 20,
        borderBottomLeftRadius: side === "left" ? 6 : 20,
        borderBottomRightRadius: side === "right" ? 6 : 20,
        background: tone === "mozhi" ? "rgba(254,119,44,0.16)" : "rgba(244,247,252,0.08)",
        border: `1px solid ${tone === "mozhi" ? "rgba(254,119,44,0.45)" : "rgba(244,247,252,0.1)"}`,
        fontFamily: sans,
        fontSize: "inherit",
        lineHeight: 1.35,
        color: C.text,
      }}
    >
      {children}
    </div>
    {meta && <div style={{ marginTop: 6, fontFamily: mono, fontSize: 15, color: tone === "mozhi" ? C.orange : C.dim, letterSpacing: 1 }}>{meta}</div>}
  </div>
);

/** A phone, front on, with a chat header. */
export const Phone: React.FC<{ x: number; y: number; scale?: number; title: string; sub?: string; buzz?: number; children?: ReactNode }> = ({
  x,
  y,
  scale = 1,
  title,
  sub,
  buzz = 0,
  children,
}) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: 400,
      height: 800,
      scale: String(scale),
      transformOrigin: "0 0",
      translate: `${Math.sin(buzz * 60) * 6 * buzz}px 0px`,
      borderRadius: 56,
      background: "#060C1E",
      border: "10px solid #1A2647",
      boxShadow: "0 40px 100px rgba(0,0,0,0.55)",
      overflow: "hidden",
      fontFamily: sans,
      color: C.text,
    }}
  >
    <div style={{ height: 120, background: "#101B3B", padding: "44px 24px 0", display: "flex", gap: 14, alignItems: "center" }}>
      <div style={{ width: 46, height: 46, borderRadius: 99, background: C.orange, display: "grid", placeItems: "center", fontWeight: 700, fontSize: 20 }}>M</div>
      <div>
        <div style={{ fontSize: 22, fontWeight: 600 }}>{title}</div>
        {sub && <div style={{ fontSize: 15, color: C.dim }}>{sub}</div>}
      </div>
    </div>
    <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>{children}</div>
  </div>
);
