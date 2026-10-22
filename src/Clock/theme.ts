import timeline from "./timeline.json";

// The colour arc: blue is the cost of waiting, orange is Revenue OS. Nothing else carries colour.
export const C = {
  navy: "#051234",
  warm: "#100C12", // the base the navy warms to once Revenue OS arrives
  blue: "#0177FF",
  blueText: "#4DA0FF", // the blue lifted for large type on navy
  orange: "#FE772C",
  text: "#F4F7FC",
  dim: "rgba(244,247,252,0.5)",
  faint: "rgba(244,247,252,0.16)",
};

export type Word = { text: string; frame: number; end: number };
export type Scene = { id: string; start: number; end: number; words: Word[] };

export const TL = timeline as { fps: number; duration: number; scenes: Scene[]; signoff: Word[]; cues: Cues };

type Cues = {
  ping: number;
  ticks: number[];
  fieldIn: number;
  leakGo: number;
  chart: number;
  collapse: number;
  sweep: number;
  timerStop: number;
  clicks: number[];
  fieldBack: number;
  stackDrop: number;
  endCard: number;
  logo: number;
  cta: number;
  proof: number;
};

export const Q = TL.cues;

export const scene = (id: string): Scene => {
  const s = TL.scenes.find((x) => x.id === id);
  if (!s) throw new Error(`no scene ${id}`);
  return s;
};
