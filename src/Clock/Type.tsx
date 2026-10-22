import type { CSSProperties } from "react";
import { useCurrentFrame } from "remotion";
import { sp } from "../RevenueOS/anim";
import { sansStack } from "../RevenueOS/fonts";
import { C, type Word } from "./theme";

/**
 * The voiceover, set as type: every word is laid out from the start (so nothing reflows)
 * and rises in on the frame it is spoken. Doubles as the captions with the sound off.
 */
export const Line: React.FC<{
  words: Word[];
  accent?: string;
  /** Words (matched without punctuation, case-insensitive) drawn in the accent colour */
  emphasis?: string[];
  size?: number;
  top?: number;
  style?: CSSProperties;
}> = ({ words, accent = C.orange, emphasis = [], size = 72, top = 790, style }) => {
  const frame = useCurrentFrame();
  const hot = new Set(emphasis.map((w) => w.replace(/[.,]/g, "").toLowerCase()));
  return (
    <div
      style={{
        position: "absolute",
        left: 160,
        right: 160,
        top,
        textAlign: "center",
        fontFamily: sansStack,
        fontSize: size,
        fontWeight: 600,
        lineHeight: 1.18,
        letterSpacing: -0.5,
        color: C.text,
        ...style,
      }}
    >
      {words.map((w, i) => {
        const t = sp(frame, w.frame - 2, 18, 140);
        const key = w.text.replace(/[.,]/g, "").toLowerCase();
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              marginRight: i < words.length - 1 ? "0.26em" : 0,
              opacity: Math.min(1, t * 1.4),
              translate: `0px ${(1 - t) * 18}px`,
              color: hot.has(key) ? accent : undefined,
            }}
          >
            {w.text}
          </span>
        );
      })}
    </div>
  );
};

/** Small uppercase mono label. */
export const Label: React.FC<{ children: React.ReactNode; style?: CSSProperties }> = ({ children, style }) => (
  <div
    style={{
      position: "absolute",
      left: 0,
      right: 0,
      textAlign: "center",
      fontFamily: '"IBM Plex Mono", monospace',
      fontSize: 24,
      fontWeight: 500,
      letterSpacing: 5,
      color: C.dim,
      ...style,
    }}
  >
    {children}
  </div>
);
