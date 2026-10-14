import { spring } from "remotion";
import { FPS } from "./theme";

/**
 * Spring progress 0→1 starting at `at`. Damping is held to the brief's 14–20 range;
 * heavier mass gives more overshoot and follow-through at the same damping.
 */
export const sp = (frame: number, at: number, damping = 16, stiffness = 120, mass = 0.9) =>
  spring({ frame: frame - at, fps: FPS, config: { damping: Math.min(20, Math.max(14, damping)), stiffness, mass } });

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

/** 0→1 between two frames, on a critically damped spring stretched to fit (springs only, no linear ramps). */
export const ramp = (frame: number, from: number, to: number) =>
  to <= from
    ? Number(frame >= from)
    : spring({ frame: frame - from, fps: FPS, config: { damping: 20, stiffness: 100, mass: 1 }, durationInFrames: to - from });

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
