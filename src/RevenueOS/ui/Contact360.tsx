import { useCurrentFrame } from "remotion";
import { clamp01, lerp, mixColor, sp } from "../anim";
import { COPY } from "../copy";
import { monoStack } from "../fonts";
import { C } from "../theme";
import { T } from "../timeline";
import { W } from "../world";
import { Appear, Chip, Glass, Label } from "./primitives";

const ROW_TOP = 330; // first profile row, relative to the card
const ROW_STEP = 96;
const GAUGE_TOP = 640;

/** World positions where each extracted phrase starts (in the chat) and lands (in its field). */
export const PHRASES = COPY.fields.map((f, i) => ({
  text: f.quote,
  from: [
    { x: W.phone.x + 70, y: W.phone.y + 515 }, // budget, from the Hindi message
    { x: W.phone.x + 70, y: W.phone.y + 200 }, // branch, from the first message
    { x: W.phone.x + 200, y: W.phone.y + 545 }, // time, from the Hindi message
  ][i],
  to: { x: W.c360.x + 250, y: W.c360.y + ROW_TOP + i * ROW_STEP + 42 },
}));

/** World position of a captured-profile field's value. */
export const fieldPos = (i: number) => ({ x: W.c360.x + 250, y: W.c360.y + ROW_TOP + i * ROW_STEP + 22 });

export const score = (frame: number) => {
  // Low damping: the needle overshoots 86 and settles
  const t = sp(frame, T.gauge, 14, 90, 2.4);
  return lerp(54, 86, t);
};

export const Contact360: React.FC = () => {
  const frame = useCurrentFrame();
  const hot = sp(frame, T.hot, 16);
  const born = sp(frame, T.glideContact + 4, 16);
  const s = score(frame);
  const isHot = frame >= T.hot;

  return (
    <Glass
      style={{
        left: W.c360.x,
        top: W.c360.y,
        width: W.c360.w,
        height: W.c360.h,
        padding: 36,
        // Born from the chat: grows out of the phone's right edge
        opacity: Math.min(1, born * 2),
        translate: `${-(W.c360.x - (W.phone.x + W.phone.w)) * (1 - born)}px 0px`,
        scale: String(0.3 + 0.7 * born),
        transformOrigin: "left center",
        borderColor: isHot ? mixColor("#3a4560", C.orange, hot) : "rgba(255,255,255,0.12)",
        boxShadow: isHot ? `0 0 ${70 * hot}px rgba(254,119,44,${0.35 * hot}), 0 24px 64px rgba(0,0,0,0.38)` : undefined,
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <div
          style={{
            width: 70,
            height: 70,
            borderRadius: 70,
            background: isHot ? mixColor(C.blue, C.orange, hot) : C.blue,
            display: "grid",
            placeItems: "center",
            fontSize: 26,
            fontWeight: 600,
          }}
        >
          PS
        </div>
        <div style={{ flex: 1 }}>
          <Label style={{ fontSize: 14 }}>{COPY.c360}</Label>
          <div style={{ fontSize: 32, fontWeight: 600, marginTop: 2 }}>Priya S.</div>
          <div style={{ fontFamily: monoStack, fontSize: 17, color: C.textDim, marginTop: 2 }}>
            {COPY.phoneE164} · {COPY.sourceTag}
          </div>
        </div>
        <Chip color={isHot ? C.orange : C.blue} fill={isHot} mono style={{ fontSize: 22 }}>
          {isHot ? COPY.hot : COPY.warm}
        </Chip>
      </div>

      {/* Summary, maintained by the OS */}
      <div style={{ marginTop: 28 }}>
        <Label style={{ fontSize: 14 }}>{COPY.summaryLabel}</Label>
        <div style={{ fontSize: 20, lineHeight: 1.45, marginTop: 8, color: C.text, opacity: 0.9 }}>{COPY.summary}</div>
      </div>

      {/* Captured profile: value, her words, confidence */}
      <Label style={{ position: "absolute", left: 36, top: ROW_TOP - 34, fontSize: 14 }}>{COPY.profileLabel}</Label>
      {COPY.fields.map((f, i) => {
        const filled = sp(frame, T.land[i], 15);
        const tick = frame >= T.land[i] ? 1 - sp(frame, T.land[i], 14) : 0;
        return (
          <div
            key={f.label}
            style={{
              position: "absolute",
              left: 36,
              right: 36,
              top: ROW_TOP + i * ROW_STEP,
              height: ROW_STEP - 12,
              borderRadius: 16,
              border: `1px solid ${frame >= T.land[i] ? `rgba(1,119,255,${0.25 + 0.5 * tick})` : "rgba(255,255,255,0.1)"}`,
              borderStyle: frame >= T.land[i] ? "solid" : "dashed",
              background: `rgba(1,119,255,${0.1 * tick})`,
              padding: "12px 18px",
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            <div style={{ width: 170, fontSize: 18, color: C.textDim }}>{f.label}</div>
            <div style={{ flex: 1, opacity: filled, translate: `0px ${8 * (1 - filled)}px` }}>
              <div style={{ fontSize: 23, fontWeight: 600 }}>{f.value}</div>
              <div style={{ fontSize: 16, color: C.greyDim, marginTop: 2 }}>{f.quote}</div>
            </div>
            <div style={{ fontFamily: monoStack, fontSize: 22, color: C.blue, opacity: filled }}>{f.conf}</div>
          </div>
        );
      })}

      {/* Live temperature */}
      <Label style={{ position: "absolute", left: 36, top: GAUGE_TOP - 10, fontSize: 14 }}>{COPY.temperature}</Label>
      <Gauge value={s} hot={hot} isHot={isHot} />
      <SignalBars />
    </Glass>
  );
};

const Gauge: React.FC<{ value: number; hot: number; isHot: boolean }> = ({ value, hot, isHot }) => {
  const r = 120;
  const cx = 150;
  const cy = 150;
  const angle = Math.PI * (1 - value / 100);
  const arc = (from: number, to: number) => {
    const a0 = Math.PI * (1 - from / 100);
    const a1 = Math.PI * (1 - to / 100);
    return `M ${cx + r * Math.cos(a0)} ${cy - r * Math.sin(a0)} A ${r} ${r} 0 0 1 ${cx + r * Math.cos(a1)} ${cy - r * Math.sin(a1)}`;
  };
  const color = isHot ? mixColor(C.blue, C.orange, hot) : C.blue;
  return (
    <div style={{ position: "absolute", left: 30, top: GAUGE_TOP + 20, width: 300, height: 190 }}>
      <svg width="300" height="190">
        <path d={arc(0, 100)} stroke="rgba(255,255,255,0.1)" strokeWidth="18" fill="none" strokeLinecap="round" />
        <path d={arc(0, Math.min(100, value))} stroke={color} strokeWidth="18" fill="none" strokeLinecap="round" />
        <line
          x1={cx}
          y1={cy}
          x2={cx + (r - 34) * Math.cos(angle)}
          y2={cy - (r - 34) * Math.sin(angle)}
          stroke="#fff"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <circle cx={cx} cy={cy} r="9" fill="#fff" />
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 150, textAlign: "center", fontFamily: monoStack, fontSize: 34, fontWeight: 600, color }}>
        {Math.round(value)}
      </div>
    </div>
  );
};

const SIGNALS_WARM = [0.55, 0.48, 0.9, 0.62];
const SIGNALS_HOT = [0.93, 0.86, 0.97, 0.76];

const SignalBars: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: 370, right: 36, top: GAUGE_TOP + 34, display: "flex", flexDirection: "column", gap: 22 }}>
      {COPY.signals.map((name, i) => {
        // Overlapping fills: each bar starts 4 frames after the one above
        const t = clamp01(sp(frame, T.bars + i * 4, 15));
        const v = lerp(SIGNALS_WARM[i], SIGNALS_HOT[i], t);
        const isHot = frame >= T.hot;
        return (
          <div key={name}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 17, color: C.textDim }}>
              <span>{name}</span>
              <span style={{ fontFamily: monoStack }}>{v.toFixed(2)}</span>
            </div>
            <div style={{ height: 10, marginTop: 6, borderRadius: 5, background: "rgba(255,255,255,0.08)" }}>
              <div style={{ width: `${v * 100}%`, height: "100%", borderRadius: 5, background: isHot ? C.orange : C.blue }} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

/** The three phrases lifting out of her messages and flying into their fields. */
export const FlyingPhrases: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      {PHRASES.map((p, i) => {
        if (frame < T.lift[i] || frame > T.land[i] + 3) return null;
        const t = sp(frame, T.lift[i] + 4, 17, 140);
        const x = lerp(p.from.x, p.to.x, t);
        // Arc upwards on the way across
        const y = lerp(p.from.y, p.to.y, t) - Math.sin(Math.PI * t) * 120;
        const lift = sp(frame, T.lift[i], 14);
        return (
          <div key={i} style={{ position: "absolute", left: x, top: y, scale: String(0.9 + 0.15 * lift) }}>
            <Chip color={C.blue} style={{ fontSize: 18, background: "rgba(1,119,255,0.3)", boxShadow: "0 10px 30px rgba(1,119,255,0.4)" }}>
              {p.text}
            </Chip>
          </div>
        );
      })}
    </>
  );
};
