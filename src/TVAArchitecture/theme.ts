import { interpolate, spring } from "remotion";

export const FPS = 30;

export const C = {
  bg: "#F2EADF",
  card: "#E9DFD2",
  cardLine: "#DACDBC",
  paper: "#FCFAF6",
  paperLine: "#E7DED2",
  ink: "#141414",
  sub: "#6E665C",
  faint: "#A39888",
  orange: "#FE772C",
  blue: "#0177FF",
  blueSoft: "#E3EEFF",
  green: "#16A34A",
  red: "#E5484D",
  navy: "#051234",
  violet: "#7C3AED",
  teal: "#0D9488",
  amber: "#D97706",
  stone: "#57534E",
};

/** Card entrance order: title first, then sections 1–10. */
export const ENTER = (n: number) => 16 + (n - 1) * 9;

/** The loop runs three 100-frame decision cycles after every card has landed. */
export const LOOP_START = 150;
export const CYCLE = 100;
export const DURATION = LOOP_START + 3 * CYCLE;

export const cycleOf = (frame: number) =>
  frame < LOOP_START ? { n: -1, t: -1 } : { n: Math.floor((frame - LOOP_START) / CYCLE), t: (frame - LOOP_START) % CYCLE };

export const pop = (frame: number, at: number, damping = 15) =>
  spring({ frame: frame - at, fps: FPS, config: { damping, stiffness: 140, mass: 0.8 } });

export const ease = (frame: number, from: number, to: number) =>
  interpolate(frame, [from, to], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
