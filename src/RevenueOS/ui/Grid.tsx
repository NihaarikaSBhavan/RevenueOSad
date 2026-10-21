import { useCurrentFrame } from "remotion";
import { rand, ramp } from "../anim";
import { C } from "../theme";
import { T } from "../timeline";
import { W } from "../world";

// Hundreds of customer cards, each with its own work in motion
const COLS = 30;
const ROWS = 23;
const TILE_W = 190;
const TILE_H = 150;
const GAP = 26;
const ORIGIN = { x: -500, y: -700 };
// Priya's tile sits where her Contact 360 card was
const PRIYA = { col: Math.round((W.c360.x - ORIGIN.x) / (TILE_W + GAP)) + 1, row: Math.round((W.c360.y - ORIGIN.y) / (TILE_H + GAP)) + 2 };

export const CustomerGrid: React.FC = () => {
  const frame = useCurrentFrame();
  const appear = ramp(frame, T.pullBack + 4, T.pullBack + 26);
  const dissolve = 1 - ramp(frame, T.dissolve, T.dissolve + 22);
  if (appear <= 0 || dissolve <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 0, top: 0, opacity: appear * dissolve }}>
      {Array.from({ length: COLS * ROWS }, (_, i) => {
        const col = i % COLS;
        const row = Math.floor(i / COLS);
        const isPriya = col === PRIYA.col && row === PRIYA.row;
        const r = rand(i);
        // Cards ripple in from Priya's position outwards
        const dist = Math.hypot(col - PRIYA.col, row - PRIYA.row);
        const born = ramp(frame, T.pullBack + dist * 0.9, T.pullBack + dist * 0.9 + 8);
        const pulse = 0.5 + 0.5 * Math.sin(frame / 5 + r * 20);
        const state = r < 0.8 ? C.orange : C.green;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: ORIGIN.x + col * (TILE_W + GAP),
              top: ORIGIN.y + row * (TILE_H + GAP),
              width: TILE_W,
              height: TILE_H,
              borderRadius: 22,
              background: isPriya ? "rgba(254,119,44,0.35)" : "rgba(255,255,255,0.07)",
              border: `2px solid ${isPriya ? C.orange : "rgba(255,255,255,0.12)"}`,
              opacity: born,
              scale: String(0.7 + 0.3 * born),
              padding: 18,
            }}
          >
            <div style={{ width: 44, height: 44, borderRadius: 44, background: isPriya ? C.orange : "rgba(255,255,255,0.18)" }} />
            <div style={{ position: "absolute", left: 18, right: 18, bottom: 22, height: 14, borderRadius: 7, background: "rgba(255,255,255,0.08)" }}>
              <div style={{ width: `${(0.3 + 0.7 * (isPriya ? 1 : pulse * r + 0.2)) * 80}%`, height: "100%", borderRadius: 7, background: isPriya ? C.orange : state }} />
            </div>
            <div style={{ position: "absolute", left: 76, top: 26, width: 80, height: 12, borderRadius: 6, background: "rgba(255,255,255,0.16)" }} />
          </div>
        );
      })}
    </div>
  );
};
