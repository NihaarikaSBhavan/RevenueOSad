import type { ReactNode } from "react";
import { CanvasImage, staticFile, useCurrentFrame } from "remotion";
import { clamp01, lerp, mixColor, ramp, rand, sp } from "../RevenueOS/anim";
import { monoStack, sansStack } from "../RevenueOS/fonts";
import { C, Q, scene, TL } from "./theme";
import { Label, Line } from "./Type";

/** A scene's window, with a short fade at each end. Layers that run across scenes sit outside it. */
const Shot: React.FC<{ id: string; children: ReactNode; fadeIn?: number; fadeOut?: number }> = ({ id, children, fadeIn = 8, fadeOut = 8 }) => {
  const frame = useCurrentFrame();
  const s = scene(id);
  if (frame < s.start || frame >= s.end) return null;
  const v = Math.min(ramp(frame, s.start, s.start + fadeIn), 1 - ramp(frame, s.end - fadeOut, s.end));
  return <div style={{ position: "absolute", inset: 0, opacity: v }}>{children}</div>;
};

const hms = (secs: number) => {
  const s = Math.floor(secs);
  return [Math.floor(s / 3600), Math.floor((s % 3600) / 60), s % 60].map((n) => String(n).padStart(2, "0")).join(":");
};

const Timer: React.FC<{ secs: number; color: string; top: number; scale?: number }> = ({ secs, color, top, scale = 1 }) => (
  <div
    style={{
      position: "absolute",
      left: 0,
      right: 0,
      top,
      textAlign: "center",
      fontFamily: monoStack,
      fontSize: 210,
      fontWeight: 500,
      letterSpacing: -4,
      color,
      fontVariantNumeric: "tabular-nums",
      scale: String(scale),
    }}
  >
    {hms(secs)}
  </div>
);

/** The enquiry: a dot that pings, with its time stamp above. */
const Enquiry: React.FC<{ y: number; color: string; at: number; opacity?: number }> = ({ y, color, at, opacity = 1 }) => {
  const frame = useCurrentFrame();
  const pop = sp(frame, at, 14, 180);
  const rings = [at, at + 26, at + 52].map((r) => (frame >= r ? (frame - r) / 40 : -1)).filter((t) => t >= 0 && t < 1);
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080, opacity }}>
      {rings.map((t, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: 960 - 14 - 90 * t,
            top: y - 14 - 90 * t,
            width: 28 + 180 * t,
            height: 28 + 180 * t,
            borderRadius: 999,
            border: `2px solid ${color}`,
            opacity: 0.7 * (1 - t),
          }}
        />
      ))}
      <div
        style={{
          position: "absolute",
          left: 946,
          top: y - 14,
          width: 28,
          height: 28,
          borderRadius: 99,
          background: color,
          scale: String(pop),
          boxShadow: `0 0 40px 8px ${color}88`,
        }}
      />
      <Label style={{ top: y - 78, opacity: sp(frame, at + 6, 18) }}>NEW ENQUIRY · 02:47 AM</Label>
    </div>
  );
};

// ---------- 1-2: a customer is ready to buy; your business makes them wait ----------

export const Arrive: React.FC = () => {
  const frame = useCurrentFrame();
  const a = scene("arrive");
  const w = scene("wait");
  if (frame < a.start || frame >= w.end) return null;
  const y = lerp(450, 230, sp(frame, w.start - 4, 18, 90));
  const out = 1 - ramp(frame, w.end - 8, w.end);
  return <Enquiry y={y} color={C.blue} at={Q.ping} opacity={out} />;
};

export const Wait: React.FC = () => {
  const frame = useCurrentFrame();
  const s = scene("wait");
  // Time since the enquiry, accelerating: seconds, then minutes, then hours
  const u = clamp01((frame - s.start - 4) / (s.end - s.start - 8));
  const secs = 6 * 3600 * u ** 3 + 9 * u;
  return (
    <>
      <Shot id="arrive">
        <Line words={scene("arrive").words} size={92} top={600} />
      </Shot>
      <Shot id="wait">
        <Label style={{ top: 360 }}>TIME TO FIRST RESPONSE</Label>
        <Timer secs={secs} color={C.blueText} top={400} />
        <Line words={s.words} size={84} accent={C.blueText} emphasis={["wait"]} />
      </Shot>
    </>
  );
};

// ---------- 3: revenue you paid for, going to whoever answers first ----------

const COLS = 36;
const ROWS = 12;
const STEP = 42;
const X0 = 960 - ((COLS - 1) * STEP) / 2;
const Y0 = 150;

/** Every lead across every branch: blue and draining away, or orange and coming back. */
const Field: React.FC<{ mode: "leak" | "back" }> = ({ mode }) => {
  const frame = useCurrentFrame();
  const dots = [];
  for (let i = 0; i < COLS * ROWS; i++) {
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    const r = rand(i + 1);
    const hx = X0 + col * STEP;
    const hy = Y0 + row * STEP;
    let x = hx;
    let o = 0.45 + 0.55 * r;
    let color = C.blue;
    if (mode === "leak") {
      const dist = Math.hypot(col - (COLS - 1) / 2, (row - (ROWS - 1) / 2) * 1.6);
      o *= ramp(frame, Q.fieldIn + dist * 0.6, Q.fieldIn + dist * 0.6 + 10);
      // Out to the right edge, the far side first: to whoever answers first
      const t = frame - (Q.leakGo + (COLS - 1 - col) * 0.6 + r * 8);
      if (t > 0) x += 1.6 * t * t;
      o *= 1 - clamp01((x - 1640) / 220);
    } else {
      color = C.orange;
      const t = sp(frame, Q.fieldBack + (COLS - 1 - col) * 0.35 + r * 10, 18, 70);
      x = lerp(2100 + r * 300, hx, t);
      o = (0.55 + 0.45 * Math.sin(frame / 9 + r * 30)) * Math.min(1, t * 1.5);
    }
    if (o <= 0.01) continue;
    dots.push(<div key={i} style={{ position: "absolute", left: x - 5, top: hy - 5, width: 10, height: 10, borderRadius: 9, background: color, opacity: o }} />);
  }
  return <>{dots}</>;
};

export const Leak: React.FC = () => {
  const s = scene("leak");
  return (
    <Shot id="leak">
      <Label style={{ top: 82 }}>EVERY BRANCH · EVERY CHANNEL</Label>
      <Field mode="leak" />
      <Line words={s.words} size={70} top={720} accent={C.blueText} emphasis={["revenue", "you", "paid", "for"]} />
    </Shot>
  );
};

// ---------- 4-5: the gap compounds; Revenue OS closes it ----------

const CH = { x0: 380, x1: 1540, y0: 560, up: 290, down: 610, axis: 650 };
const upper = (u: number) => CH.y0 - (CH.y0 - CH.up) * u ** 1.9;
const lower = (u: number) => CH.y0 + (CH.down - CH.y0) * u;

/** Two lines from one start: whoever answers first pulls away from you, quarter on quarter. */
export const GapChart: React.FC = () => {
  const frame = useCurrentFrame();
  const g = scene("gap");
  const turn = scene("turn");
  if (frame < g.start || frame >= turn.end) return null;
  const p = ramp(frame, Q.chart, Q.chart + 66);
  // The orange point zips the gap shut, left to right, landing on "closes"
  const ZIP = 260;
  const zipX = lerp(CH.x0 - ZIP, CH.x1 + ZIP, ramp(frame, Q.sweep, Q.sweep + 40));
  // Smoothstep behind the zip point, so the lower line eases up rather than kinking
  const closed = (x: number) => {
    const k = clamp01((zipX - x) / ZIP);
    return k * k * (3 - 2 * k);
  };
  const N = 80;
  const pts = Array.from({ length: N + 1 }, (_, k) => {
    const u = (k / N) * p;
    const x = lerp(CH.x0, CH.x1, u);
    const yu = upper(u);
    return { x, yu, yl: lerp(lower(u), yu, closed(x)) };
  });
  const up = pts.map((q) => `${q.x},${q.yu}`).join(" ");
  const lo = pts.map((q) => `${q.x},${q.yl}`).join(" ");
  const fill = `${up} ${[...pts].reverse().map((q) => `${q.x},${q.yl}`).join(" ")}`;
  const zipping = frame >= Q.sweep;
  const labels = (sp(frame, Q.chart + 60, 18) * (1 - ramp(frame, Q.sweep - 6, Q.sweep + 6)));
  const out = 1 - ramp(frame, turn.end - 8, turn.end);
  const zipPt = { x: Math.min(CH.x1, Math.max(CH.x0, zipX)), y: upper(clamp01((zipX - CH.x0) / (CH.x1 - CH.x0))) };
  return (
    <div style={{ position: "absolute", inset: 0, opacity: out }}>
      <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>
        <defs>
          {/* Orange behind the zip point; each line keeps its own colour ahead of it */}
          {[["zipUp", C.dim], ["zipLo", C.blue]].map(([id, ahead]) => (
            <linearGradient key={id} id={id} x1={CH.x0} x2={CH.x1} y1="0" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset={clamp01((zipX - 40 - CH.x0) / (CH.x1 - CH.x0))} stopColor={C.orange} />
              <stop offset={clamp01((zipX - CH.x0) / (CH.x1 - CH.x0))} stopColor={ahead} />
            </linearGradient>
          ))}
          <filter id="glow">
            <feGaussianBlur stdDeviation="6" />
          </filter>
        </defs>
        <line x1={CH.x0} x2={CH.x1} y1={CH.axis} y2={CH.axis} stroke={C.faint} strokeWidth="2" opacity={p * labels} />
        <polygon points={fill} fill={C.blue} opacity={0.2} />
        <polyline points={up} fill="none" stroke={zipping ? "url(#zipUp)" : C.dim} strokeWidth="5" strokeLinecap="round" />
        <polyline points={lo} fill="none" stroke={zipping ? "url(#zipLo)" : C.blue} strokeWidth="5" strokeLinecap="round" />
        {zipping && zipX < CH.x1 + 40 && (
          <>
            <circle cx={zipPt.x} cy={zipPt.y} r="22" fill={C.orange} filter="url(#glow)" />
            <circle cx={zipPt.x} cy={zipPt.y} r="9" fill="#fff" />
          </>
        )}
      </svg>
      {["Q1", "Q2", "Q3", "Q4"].map((q, i) => (
        <div
          key={q}
          style={{
            position: "absolute",
            left: lerp(CH.x0, CH.x1, (i + 1) / 4) - 40,
            width: 80,
            top: CH.axis + 16,
            textAlign: "center",
            fontFamily: monoStack,
            fontSize: 22,
            color: C.dim,
            opacity: ramp(frame, Q.chart + 16 * (i + 1) - 6, Q.chart + 16 * (i + 1) + 4) * labels,
          }}
        >
          {q}
        </div>
      ))}
      <div style={{ position: "absolute", right: 1920 - CH.x1, top: CH.up - 52, fontFamily: sansStack, fontSize: 26, fontWeight: 500, color: C.dim, opacity: labels }}>
        Whoever answers first
      </div>
      <div style={{ position: "absolute", right: 1920 - CH.x1, top: CH.down + 4, fontFamily: sansStack, fontSize: 26, fontWeight: 600, color: C.blueText, opacity: labels }}>
        You
      </div>
    </div>
  );
};

export const Gap: React.FC = () => (
  <>
    {/* The line leaves before the silence, so only the gap holds the frame */}
    <Shot id="gap" fadeOut={Math.max(8, scene("gap").end - Q.collapse)}>
      <Line words={scene("gap").words} size={76} top={760} accent={C.blueText} emphasis={["gap", "compounds."]} />
    </Shot>
    <Shot id="turn">
      <Line words={scene("turn").words} size={110} top={740} emphasis={["closes", "it."]} />
    </Shot>
  </>
);

// ---------- 6: answered within minutes ----------

const ANSWER_SECS = 106; // 00:01:46

export const Answered: React.FC = () => {
  const frame = useCurrentFrame();
  const s = scene("answered");
  const t0 = s.start + 8;
  const secs = ANSWER_SECS * clamp01((frame - t0) / (Q.timerStop - t0));
  const stopped = frame >= Q.timerStop;
  const pop = stopped ? 1 + 0.05 * (1 - sp(frame, Q.timerStop, 14, 200)) : 1;
  return (
    <Shot id="answered">
      <Enquiry y={230} color={C.orange} at={s.start + 2} />
      <Label style={{ top: 360, color: stopped ? C.orange : C.dim }}>{stopped ? "ANSWERED" : "TIME TO FIRST RESPONSE"}</Label>
      <Timer secs={secs} color={C.text} top={400} scale={pop} />
      <Line words={s.words} size={74} top={760} emphasis={["within", "minutes."]} />
    </Shot>
  );
};

// ---------- 7: three clicks ----------

const CLICKS = ["APPROVE BOOKING", "APPROVE MESSAGE", "MARK COMPLETE"];

export const Clicks: React.FC = () => {
  const frame = useCurrentFrame();
  const s = scene("clicks");
  return (
    <Shot id="clicks">
      {CLICKS.map((label, i) => {
        const cx = 960 + (i - 1) * 380;
        const born = sp(frame, s.start + 4 + i * 5, 18);
        const press = sp(frame, Q.clicks[i], 14, 200);
        const ripple = frame >= Q.clicks[i] ? clamp01((frame - Q.clicks[i]) / 22) : 0;
        const check = ramp(frame, Q.clicks[i] + 2, Q.clicks[i] + 12);
        return (
          <div key={label} style={{ opacity: born }}>
            {ripple > 0 && ripple < 1 && (
              <div
                style={{
                  position: "absolute",
                  left: cx - 70 - 60 * ripple,
                  top: 420 - 70 - 60 * ripple,
                  width: 140 + 120 * ripple,
                  height: 140 + 120 * ripple,
                  borderRadius: 999,
                  border: `3px solid ${C.orange}`,
                  opacity: 1 - ripple,
                }}
              />
            )}
            <div
              style={{
                position: "absolute",
                left: cx - 70,
                top: 350,
                width: 140,
                height: 140,
                borderRadius: 999,
                border: `3px solid ${mixColor("#5a5f6e", C.orange, press)}`,
                background: `rgba(254,119,44,${press})`,
                scale: String(lerp(0.9, 1, born) * (1 - 0.08 * Math.sin(Math.PI * clamp01((frame - Q.clicks[i]) / 6)))),
                boxShadow: `0 0 ${60 * press}px rgba(254,119,44,${0.5 * press})`,
              }}
            >
              <svg width="140" height="140" viewBox="0 0 140 140">
                <path d="M46 72 L62 88 L96 54" fill="none" stroke="#fff" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="80" strokeDashoffset={80 * (1 - check)} />
              </svg>
            </div>
            <div style={{ position: "absolute", left: cx - 200, width: 400, top: 524, textAlign: "center", fontFamily: monoStack, fontSize: 22, letterSpacing: 3, color: press > 0.5 ? C.text : C.dim }}>
              {label}
            </div>
          </div>
        );
      })}
      <Line words={s.words} size={76} top={760} emphasis={["three", "clicks."]} />
    </Shot>
  );
};

// ---------- 8: every lead worked, every customer grown ----------

export const Grown: React.FC = () => (
  <Shot id="grown">
    <Label style={{ top: 82 }}>EVERY BRANCH · EVERY CHANNEL</Label>
    <Field mode="back" />
    <Line words={scene("grown").words} size={84} top={730} emphasis={["worked.", "grown."]} />
  </Shot>
);

// ---------- 9: live in weeks, on your existing systems ----------

const LAYERS = ["CALENDARS & ERP", "WHATSAPP", "CONTACT CENTRE", "YOUR CRM"];

export const Weeks: React.FC = () => {
  const frame = useCurrentFrame();
  const s = scene("weeks");
  const drop = sp(frame, Q.stackDrop, 15, 120, 1.2);
  const landed = frame >= Q.stackDrop + 8;
  const thud = landed ? 1 - sp(frame, Q.stackDrop + 8, 14, 220) : 0;
  const bar = (y: number, label: string, i: number) => (
    <div
      key={label}
      style={{
        position: "absolute",
        left: 480,
        top: y + thud * 6 * (1 - i * 0.2),
        width: 960,
        height: 64,
        borderRadius: 14,
        border: `2px solid ${C.faint}`,
        background: "rgba(244,247,252,0.04)",
        fontFamily: monoStack,
        fontSize: 24,
        letterSpacing: 4,
        color: "rgba(244,247,252,0.7)",
        display: "flex",
        alignItems: "center",
        paddingLeft: 30,
        opacity: sp(frame, s.start + 2 + i * 3, 18),
      }}
    >
      {label}
    </div>
  );
  return (
    <Shot id="weeks">
      {LAYERS.map((l, i) => bar(600 - i * 80, l, i))}
      <div
        style={{
          position: "absolute",
          left: 480,
          top: lerp(-120, 600 - 4 * 80 - 4, drop),
          width: 960,
          height: 72,
          borderRadius: 16,
          background: C.orange,
          boxShadow: `0 20px 80px rgba(254,119,44,${0.25 + 0.35 * thud})`,
          fontFamily: sansStack,
          fontSize: 30,
          fontWeight: 600,
          letterSpacing: 6,
          color: "#fff",
          display: "flex",
          alignItems: "center",
          paddingLeft: 30,
        }}
      >
        REVENUE OS
      </div>
      <Line words={s.words} size={76} top={760} emphasis={["live", "in", "weeks,"]} />
    </Shot>
  );
};

// ---------- end card ----------

const LOGO_W = 640;
const LOGO_H = Math.round((LOGO_W * 590) / 1955);

export const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < Q.endCard) return null;
  const logo = sp(frame, Q.logo, 18);
  const cta = sp(frame, Q.cta, 16);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: ramp(frame, Q.endCard, Q.endCard + 8), scale: String(1 + 0.0008 * (frame - Q.endCard)) }}>
      <div style={{ position: "absolute", left: 960 - LOGO_W / 2, top: 230, opacity: logo, scale: String(lerp(0.94, 1, logo)) }}>
        <CanvasImage src={staticFile("images/logo-white.png")} width={LOGO_W} height={LOGO_H} style={{ width: LOGO_W, height: LOGO_H }} />
      </div>
      <Line words={TL.signoff} size={80} top={520} emphasis={["quarter."]} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 670, display: "flex", justifyContent: "center", opacity: cta, scale: String(lerp(0.92, 1, cta)) }}>
        <div style={{ padding: "18px 44px", borderRadius: 999, background: C.orange, fontFamily: sansStack, fontSize: 34, fontWeight: 600, color: "#fff" }}>
          thevertical.ai · Book a demo
        </div>
      </div>
      <Label style={{ top: 840, fontSize: 22, opacity: sp(frame, Q.proof, 18) }}>REAL TIME · UNDER POLICY · ON YOUR INFRASTRUCTURE</Label>
    </div>
  );
};
