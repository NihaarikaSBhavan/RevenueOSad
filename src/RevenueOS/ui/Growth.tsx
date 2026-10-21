import { useCurrentFrame } from "remotion";
import { mixColor, ramp, sp } from "../anim";
import { COPY } from "../copy";
import { monoStack } from "../fonts";
import { C } from "../theme";
import { T } from "../timeline";
import { W } from "../world";
import { Appear, Check, Chip, Glass, Label } from "./primitives";

const G = W.growth;

export const Growth: React.FC = () => {
  const frame = useCurrentFrame();
  const born = 0.3 + 0.7 * sp(frame, T.glideGrowth + 6, 16);
  const sent = frame >= T.nba + 12;
  const rev = Math.round((1500 + 5000 * sp(frame, T.revenue, 18, 90)) / 100) * 100;
  return (
    <div style={{ opacity: born }}>
      {/* Next best action, executed */}
      <Glass style={{ left: G.x, top: G.y, width: 660, height: 230, padding: 30 }}>
        <Label style={{ fontSize: 14 }}>{COPY.nbaLabel}</Label>
        <div style={{ fontSize: 27, fontWeight: 600, marginTop: 12 }}>{COPY.nba}</div>
        <div style={{ position: "absolute", left: 30, bottom: 28, display: "flex", gap: 12 }}>
          <Chip color={sent ? C.green : C.orange} fill={sent}>
            {sent ? <Check size={18} color="rgba(255,255,255,0.3)" /> : null}
            {sent ? COPY.sent : "Sending on WhatsApp"}
          </Chip>
          <Chip color={C.orange} style={{ fontSize: 16 }}>
            Hindi · 10:00 AM
          </Chip>
        </div>
      </Glass>

      {/* Revenue dashboard: Priya's value grows */}
      <Glass style={{ left: G.x, top: G.y + 260, width: 660, height: 330, padding: 30 }}>
        <Label style={{ fontSize: 14 }}>{COPY.revenueLabel}</Label>
        <div style={{ fontFamily: monoStack, fontSize: 76, fontWeight: 500, marginTop: 10 }}>₹{rev.toLocaleString("en-IN")}</div>
        <div style={{ position: "absolute", left: 30, right: 30, bottom: 30, height: 110, display: "flex", alignItems: "flex-end", gap: 14 }}>
          {[0.22, 0.22, 0.24, 0.26, 0.6, 0.86].map((h, i) => {
            const grow = i >= 4 ? sp(frame, T.revenue + (i - 4) * 6, 16) : 1;
            return (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: `${(i >= 4 ? 0.24 + (h - 0.24) * grow : h) * 100}%`,
                  borderRadius: 8,
                  background: i >= 4 ? C.orange : "rgba(255,255,255,0.14)",
                }}
              />
            );
          })}
        </div>
      </Glass>

      {/* A different customer drifting, caught, recovered */}
      <ChurnCard />

      {/* The three revenue states */}
      <div style={{ position: "absolute", left: G.x, top: G.y + 620, display: "flex", gap: 18 }}>
        {COPY.states.map((s, i) => (
          <Appear key={s} at={T.labels[i]} from={0.8} dy={10}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "14px 22px",
                borderRadius: 999,
                background: "rgba(34,197,94,0.14)",
                border: `1px solid ${C.green}`,
                fontSize: 23,
                fontWeight: 600,
                color: C.text,
                whiteSpace: "nowrap",
              }}
            >
              {s} <Check size={24} />
            </div>
          </Appear>
        ))}
      </div>
    </div>
  );
};

// Engagement over time: drifts down, then recovers after the retention action
const POINTS = [0.78, 0.8, 0.74, 0.7, 0.6, 0.48, 0.36, 0.3, 0.42, 0.6, 0.72, 0.78];
const CHART_W = 600;
const CHART_H = 250;

const ChurnCard: React.FC = () => {
  const frame = useCurrentFrame();
  // Draw the drift first, then the recovery after the retention action fires
  const drift = ramp(frame, T.glideGrowth, T.churnFlag);
  const recover = ramp(frame, T.retention, T.retention + 20);
  const visible = Math.min(8, 1 + drift * 7) + recover * 3;
  const n = Math.floor(visible);
  const pts = POINTS.slice(0, n + 1).map((v, i) => {
    const x = (i / (POINTS.length - 1)) * CHART_W;
    let y = (1 - v) * CHART_H;
    if (i === n && n + 1 < POINTS.length) {
      // Interpolate the leading point for a smooth draw
      const f = visible - n;
      y = (1 - (v + (POINTS[n + 1] - v) * f)) * CHART_H;
      return [(n + f) / (POINTS.length - 1) * CHART_W, y];
    }
    return [x, y];
  });
  const d = pts.map(([x, y], i) => `${i ? "L" : "M"} ${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const flagged = frame >= T.churnFlag;
  const acted = frame >= T.retention;
  const recovered = recover >= 1;
  const lineColor = acted ? mixColor(C.blue, C.orange, sp(frame, T.retention, 16)) : C.blue;
  return (
    <Glass style={{ left: G.x + 700, top: G.y, width: 680, height: 590, padding: 30 }}>
      <Label style={{ fontSize: 14 }}>{COPY.churnName}</Label>
      <svg width={CHART_W} height={CHART_H} style={{ position: "absolute", left: 40, top: 110, overflow: "visible" }}>
        <path d={d} stroke={recovered ? C.green : lineColor} strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {pts.length > 0 && <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="9" fill={recovered ? C.green : lineColor} />}
      </svg>
      {flagged && (
        <Appear at={T.churnFlag} from={0.6} dy={0} style={{ position: "absolute", left: 300, top: 300 }}>
          <Chip color={C.blue} style={{ fontSize: 19, background: "rgba(1,119,255,0.3)" }}>
            {COPY.churnFlag}
          </Chip>
        </Appear>
      )}
      {acted && (
        <Appear at={T.retention} dy={14} style={{ position: "absolute", left: 30, bottom: 34 }}>
          <Chip color={recovered ? C.green : C.orange} fill style={{ fontSize: 19 }}>
            {recovered ? <Check size={18} color="rgba(255,255,255,0.3)" /> : null}
            {COPY.retention}
          </Chip>
        </Appear>
      )}
    </Glass>
  );
};
