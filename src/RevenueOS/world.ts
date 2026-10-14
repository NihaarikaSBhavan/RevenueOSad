import { sp } from "./anim";
import { T } from "./timeline";

// World layout: one large 2.5D canvas the camera travels through (px, top-left origins)
export const W = {
  dash: { x: 0, y: 0, w: 1920, h: 1080 },
  phone: { x: 2300, y: 110, w: 470, h: 900 },
  c360: { x: 2900, y: 90, w: 780, h: 940 },
  feed: { x: 2160, y: 1400, w: 580, h: 780 },
  cal: { x: 2800, y: 1400, w: 720, h: 780 },
  mini: { x: 3580, y: 1560, w: 430, h: 620 },
  growth: { x: 4420, y: 1330 },
};

type Cam = { x: number; y: number; s: number };

const START: Cam = { x: 960, y: 540, s: 1 };

// Each move eases from the previous target to its own, on a spring; moves can overlap
const MOVES: { at: number; to: Cam; damping?: number }[] = [
  { at: 0, to: { x: 1000, y: 560, s: 1.07 }, damping: 20 }, // slow push-in (tension)
  { at: T.glideChat, to: { x: 2420, y: 590, s: 0.88 } }, // glide into the chat + its action rail
  { at: T.glideContact, to: { x: 2990, y: 552, s: 0.84 } }, // widen: chat + Contact 360
  { at: T.zoomGauge, to: { x: 3290, y: 790, s: 1.2 } }, // in on the score
  { at: T.glideCalendar, to: { x: 3085, y: 1795, s: 0.9 } }, // down to booking
  { at: T.preview, to: { x: 3120, y: 1795, s: 0.91 }, damping: 20 },
  { at: T.lock - 6, to: { x: 3040, y: 1800, s: 0.95 }, damping: 20 }, // lean into the money shot
  { at: T.glideGrowth, to: { x: 5110, y: 1710, s: 0.9 } }, // +30 days
  { at: T.pullBack, to: { x: 3200, y: 1500, s: 0.3 }, damping: 18 }, // pull back
  { at: T.dissolve, to: { x: 3200, y: 1500, s: 0.24 }, damping: 20 },
];

// The push-in is slow, so its spring is stretched over the whole tension shot
const progress = (frame: number, at: number, damping: number, index: number) =>
  index === 0 ? Math.min(1, sp(frame / 4.5, at, damping, 60)) : sp(frame, at, damping);

export const camera = (frame: number): Cam => {
  let prev = START;
  const cam = { ...START };
  MOVES.forEach((m, i) => {
    const t = progress(frame, m.at, m.damping ?? 17, i);
    // Anticipation: ease a touch the other way for ~6 frames, then release into the move
    const wind = i === 0 ? 0 : sp(frame, m.at - 6, 18, 160) - sp(frame, m.at + 2, 18, 160);
    cam.x += (m.to.x - prev.x) * (t - 0.025 * wind);
    cam.y += (m.to.y - prev.y) * (t - 0.025 * wind);
    cam.s += (m.to.s - prev.s) * (t - 0.06 * wind);
    prev = m.to;
  });
  // Breathing drift: the camera is never perfectly still
  cam.x += Math.sin(frame / 70) * 5;
  cam.y += Math.cos(frame / 90) * 3;
  cam.s *= 1 + Math.sin(frame / 110) * 0.004;
  return cam;
};

/** Screen position of a world point for a given camera. */
export const toScreen = (cam: Cam, x: number, y: number) => ({
  x: (x - cam.x) * cam.s + 960,
  y: (y - cam.y) * cam.s + 540,
});
