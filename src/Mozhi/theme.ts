import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";
import { DEVA, MONO, SANS } from "../RevenueOS/fonts";
import timeline from "./timeline.json";

// Tamil for the payment reminder (Noto Sans Tamil, OFL, public/fonts)
const TAMIL = "Noto Sans Tamil";
export const tamilReady = Promise.all(
  [
    ["Regular", "400"],
    ["SemiBold", "600"],
  ].map(([file, weight]) => loadFont({ family: TAMIL, url: staticFile(`fonts/NotoSansTamil-${file}.ttf`), weight })),
);

export const sans = `"${SANS}", "${DEVA}", "${TAMIL}", sans-serif`;
export const mono = `"${MONO}", monospace`;

// Blue is the problem (the office before Mozhi), orange is Mozhi. Nothing else carries colour.
export const C = {
  navy: "#051234",
  wall: "#0B1E4A",
  floor: "#081739",
  ink: "#0A1638",
  blue: "#0177FF",
  blueMid: "#2C55A8",
  blueSoft: "#6F93D6",
  bluePale: "#C9D7F1",
  skin: "#9DB6E3",
  orange: "#FE772C",
  orangeDeep: "#3A2016",
  text: "#F4F7FC",
  dim: "rgba(244,247,252,0.6)",
  faint: "rgba(244,247,252,0.14)",
  card: "rgba(14,28,66,0.92)",
  // After Mozhi arrives: bright orange, white paper, dark ink
  sun: "#FF7A2E",
  sunLight: "#FFA35F",
  sunDeep: "#D9520F",
  paper: "#FFF8F2",
  dark: "#1E0D05",
  darkDim: "rgba(30,13,5,0.58)",
};

export type Shot = { id: string; start: number; end: number };
export type Clip = { id: string; who: string; text: string; start: number; end: number };

export const TL = timeline as {
  fps: number;
  duration: number;
  shots: Shot[];
  clips: Clip[];
  cues: {
    ringUntil: number;
    reveal: number;
    dialFrom: number;
    langSwitch: number;
    whatsapp: number;
    uses: number[];
    oneAgent: number;
    metrics: number[];
    logo: number;
  };
};

export const Q = TL.cues;

export const shot = (id: string): Shot => {
  const s = TL.shots.find((x) => x.id === id);
  if (!s) throw new Error(`no shot ${id}`);
  return s;
};

export const clip = (id: string): Clip => {
  const c = TL.clips.find((x) => x.id === id);
  if (!c) throw new Error(`no clip ${id}`);
  return c;
};

/** Is anyone on the call (or, with who, that speaker) speaking at this frame? Drives the waveforms. */
export const speaking = (frame: number, who?: string) =>
  TL.clips.some((c) => (who ? c.who === who : c.who !== "narrator") && frame >= c.start && frame < c.end);
