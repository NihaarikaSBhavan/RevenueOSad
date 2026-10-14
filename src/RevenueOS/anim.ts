import { interpolate, spring } from "remotion";
import { FPS } from "./theme";

/** Spring progress 0→1 starting at `at` (damping kept in the brief's 14–20 range). */
export const sp = (frame: number, at: number, damping = 16, stiffness = 120) =>
  spring({ frame: frame - at, fps: FPS, config: { damping, stiffness, mass: 0.9 } });

/** Spring that dips slightly backwards first: anticipation before a big move. */
export const spAnticipate = (frame: number, at: number, damping = 16) => {
  const windUp = interpolate(frame, [at - 6, at], [0, -0.06], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return frame < at ? windUp : -0.06 * (1 - sp(frame, at, 20, 200)) + sp(frame, at, damping);
};

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

/** Linear ramp 0→1 between two frames, clamped. */
export const ramp = (frame: number, from: number, to: number) =>
  interpolate(frame, [from, to], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));

/** Mix two #rrggbb colours. */
export const mixColor = (a: string, b: string, t: number) => {
  const [r1, g1, b1] = hex(a);
  const [r2, g2, b2] = hex(b);
  const k = clamp01(t);
  return `rgb(${Math.round(lerp(r1, r2, k))}, ${Math.round(lerp(g1, g2, k))}, ${Math.round(lerp(b1, b2, k))})`;
};

/** Deterministic pseudo-random in [0, 1) for layout jitter. */
export const rand = (seed: number) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
