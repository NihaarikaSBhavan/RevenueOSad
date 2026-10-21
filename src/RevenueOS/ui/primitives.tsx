import type { CSSProperties, ReactNode } from "react";
import { useCurrentFrame } from "remotion";
import { lerp, sp } from "../anim";
import { monoStack, sansStack } from "../fonts";
import { C, glass } from "../theme";

export const Glass: React.FC<{ style?: CSSProperties; children?: ReactNode }> = ({ style, children }) => (
  <div style={{ ...glass, position: "absolute", fontFamily: sansStack, color: C.text, ...style }}>{children}</div>
);

/** Springs a child in at `at`: rises, scales from `from`, fades. Overshoot comes from the spring. */
export const Appear: React.FC<{
  at: number;
  from?: number;
  dy?: number;
  dx?: number;
  damping?: number;
  style?: CSSProperties;
  children?: ReactNode;
}> = ({ at, from = 0.92, dy = 14, dx = 0, damping = 15, style, children }) => {
  const frame = useCurrentFrame();
  const t = sp(frame, at, damping);
  return (
    <div
      style={{
        opacity: Math.min(1, t * 1.6),
        translate: `${dx * (1 - t)}px ${dy * (1 - t)}px`,
        scale: String(from + (1 - from) * t),
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export const Chip: React.FC<{ color: string; fill?: boolean; mono?: boolean; style?: CSSProperties; children: ReactNode }> = ({
  color,
  fill,
  mono,
  style,
  children,
}) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      padding: "6px 14px",
      borderRadius: 999,
      fontSize: 20,
      fontWeight: 600,
      fontFamily: mono ? monoStack : sansStack,
      color: fill ? "#fff" : color,
      background: fill ? color : `${color}22`,
      border: `1px solid ${color}88`,
      whiteSpace: "nowrap",
      ...style,
    }}
  >
    {children}
  </span>
);

export const Label: React.FC<{ children: ReactNode; style?: CSSProperties }> = ({ children, style }) => (
  <div
    style={{
      fontSize: 16,
      letterSpacing: 2.4,
      textTransform: "uppercase",
      color: C.textDim,
      fontWeight: 600,
      ...style,
    }}
  >
    {children}
  </div>
);

export const Check: React.FC<{ size?: number; color?: string }> = ({ size = 22, color = C.green }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ flex: "none" }}>
    <circle cx="12" cy="12" r="11" fill={color} />
    <path d="M7 12.5l3.2 3.2L17 9" stroke="#fff" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const Cursor: React.FC<{ x: number; y: number; pressed: number; opacity: number }> = ({ x, y, pressed, opacity }) => (
  <div style={{ position: "absolute", left: x, top: y, opacity, pointerEvents: "none" }}>
    {/* Orange ripple on each press: the clicks are the human moments */}
    <div
      style={{
        position: "absolute",
        left: -40,
        top: -40,
        width: 80,
        height: 80,
        borderRadius: 999,
        border: `3px solid ${C.orange}`,
        opacity: pressed > 0 ? 1 - pressed : 0,
        scale: String(0.3 + pressed * 1.2),
      }}
    />
    <svg width="40" height="48" viewBox="0 0 20 24" style={{ scale: String(1 - Math.sin(Math.PI * pressed) * 0.18), transformOrigin: "0 0" }}>
      <path d="M1 1l17 10.5-7.6 1.6L7 21z" fill="#fff" stroke="#0b1530" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  </div>
);

/** A pulse of the OS carrying an action from one element to the one it gives birth to. */
export const Streak: React.FC<{ at: number; from: { x: number; y: number }; to: { x: number; y: number }; color?: string }> = ({
  at,
  from,
  to,
  color = C.orange,
}) => {
  const frame = useCurrentFrame();
  if (frame < at || frame > at + 26) return null;
  const head = sp(frame, at, 18, 140);
  const arc = Math.hypot(to.x - from.x, to.y - from.y) * 0.18;
  const point = (t: number) => ({
    x: lerp(from.x, to.x, t),
    y: lerp(from.y, to.y, t) - Math.sin(Math.PI * t) * arc,
  });
  const fade = head > 0.97 ? Math.max(0, 1 - (frame - at - 14) / 8) : 1;
  return (
    <>
      {[0, 0.05, 0.1, 0.16, 0.23].map((lag, i) => {
        const p = point(Math.max(0, head - lag));
        const r = 11 - i * 2;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: p.x - r,
              top: p.y - r,
              width: r * 2,
              height: r * 2,
              borderRadius: 99,
              background: color,
              opacity: (1 - i * 0.18) * fade,
              boxShadow: i === 0 ? `0 0 28px 8px ${color}99` : undefined,
            }}
          />
        );
      })}
    </>
  );
};
