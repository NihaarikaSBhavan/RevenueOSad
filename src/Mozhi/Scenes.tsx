import React from "react";
import type { ReactNode } from "react";
import { CanvasImage, staticFile, useCurrentFrame } from "remotion";
import { clamp01, lerp, ramp, rand, sp } from "../RevenueOS/anim";
import { Office } from "./Office";
import { C, clip, mono, Q, sans, shot, speaking } from "./theme";
import { Avatar, Bubble, Card, FootShade, InShot, Pop, Waveform } from "./ui";

/** The one message of each shot: big, centred, at the foot of the frame. */
const Headline: React.FC<{ at: number; children: ReactNode }> = ({ at, children }) => {
  const frame = useCurrentFrame();
  const t = sp(frame, at, 18, 140);
  if (frame < at - 1) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: 80,
        right: 80,
        top: 892,
        textAlign: "center",
        fontFamily: sans,
        fontSize: 58,
        fontWeight: 600,
        letterSpacing: -0.5,
        color: C.text,
        opacity: Math.min(1, t * 1.5),
        translate: `0px ${16 * (1 - t)}px`,
      }}
    >
      {children}
    </div>
  );
};

const O: React.FC<{ children: ReactNode }> = ({ children }) => <span style={{ color: C.orange }}>{children}</span>;

/** Words of a voiced line revealed in step with the voice. */
const Spoken: React.FC<{ id: string }> = ({ id }) => {
  const frame = useCurrentFrame();
  const c = clip(id);
  const words = c.text.split(" ");
  const n = Math.ceil(words.length * clamp01((frame - c.start + 2) / (c.end - c.start)));
  return (
    <>
      {words.map((w, i) => (
        <span key={i} style={{ opacity: i < n ? 1 : 0.18 }}>
          {w}
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </>
  );
};

// ---------- 1. your team can't call every lead ----------

export const Pain: React.FC = () => {
  const frame = useCurrentFrame();
  const s = shot("pain");
  return (
    <InShot id="pain" fade={0}>
      <div style={{ position: "absolute", inset: 0, transformOrigin: "720px 520px", scale: String(lerp(1, 1.07, ramp(frame, 0, s.end))) }}>
        <Office mode="pain" />
      </div>
      <FootShade />
      <Headline at={16}>
        214 leads this week. <span style={{ color: C.blueSoft }}>Only 38 called.</span>
      </Headline>
    </InShot>
  );
};

// ---------- 2. meet Mozhi ----------

/** Mozhi: an orange voice orb whose bars move with the narrator introducing it. */
const Orb: React.FC<{ at: number; size?: number }> = ({ at, size = 150 }) => {
  const frame = useCurrentFrame();
  const t = sp(frame, at, 15, 160);
  const live = speaking(frame, "narrator") ? 1 : 0.25;
  const rings = [0, 20, 40].map((d) => ((frame - at - d) % 60) / 60).filter((x) => frame >= at && x >= 0);
  return (
    <div style={{ position: "relative", width: size, height: size, scale: String(t) }}>
      {rings.map((r, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: size / 2 - (size / 2) * (1 + r * 1.4),
            top: size / 2 - (size / 2) * (1 + r * 1.4),
            width: size * (1 + r * 1.4),
            height: size * (1 + r * 1.4),
            borderRadius: 999,
            border: `2px solid ${C.orange}`,
            opacity: 0.5 * (1 - r),
          }}
        />
      ))}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 999,
          background: `radial-gradient(circle at 35% 30%, #FF9A5E, ${C.orange} 55%, #C9541A)`,
          boxShadow: `0 0 90px 10px rgba(254,119,44,0.45)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: size * 0.04,
        }}
      >
        {[0, 1, 2, 3, 4].map((b) => (
          <div
            key={b}
            style={{
              width: size * 0.06,
              borderRadius: 99,
              background: "#fff",
              height: size * (0.12 + 0.3 * live * Math.abs(Math.sin(frame / 3.2 + b * 1.4)) * (b === 2 ? 1.2 : b % 2 ? 0.9 : 0.6)),
            }}
          />
        ))}
      </div>
    </div>
  );
};

export const Meet: React.FC = () => {
  const frame = useCurrentFrame();
  const vo = clip("vo2");
  const name = sp(frame, vo.start, 18, 140);
  const sub = sp(frame, vo.start + 22, 18, 140);
  return (
    <InShot id="meet">
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 220, fontFamily: sans, color: C.text }}>
        <Orb at={Q.reveal} />
        <div style={{ marginTop: 70, fontSize: 150, fontWeight: 600, letterSpacing: 4, lineHeight: 1, opacity: name, translate: `0px ${20 * (1 - name)}px` }}>Mozhi</div>
        <div style={{ marginTop: 18, fontFamily: mono, fontSize: 26, letterSpacing: 6, color: C.dim, opacity: name }}>/ MO·LEE /</div>
        <div style={{ marginTop: 56, fontSize: 52, fontWeight: 600, opacity: sub, translate: `0px ${16 * (1 - sub)}px` }}>
          An AI voice agent that <O>makes your calls for you.</O>
        </div>
      </div>
    </InShot>
  );
};

// ---------- 3. every lead, called in minutes ----------

const COLS = 16;
const ROWS = 11; // 176 leads
const STEP = 62;
const TILE = 52;
const GX = 960 - (COLS * STEP - (STEP - TILE)) / 2;
const GY = 130;
const litAt = (i: number) => Q.dialFrom + Math.floor(rand(i + 3) * 30);

export const Scale: React.FC = () => {
  const frame = useCurrentFrame();
  const s = shot("scale");
  const count = Array.from({ length: COLS * ROWS }, (_, i) => frame >= litAt(i)).filter(Boolean).length;
  return (
    <InShot id="scale">
      <div style={{ position: "absolute", left: 0, right: 0, top: 48, textAlign: "center", fontFamily: mono, fontSize: 30, letterSpacing: 4, color: C.orange }}>
        {count} CALLS LIVE
      </div>
      {Array.from({ length: COLS * ROWS }, (_, i) => {
        const lit = frame >= litAt(i);
        const t = lit ? sp(frame, litAt(i), 16, 200) : 0;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: GX + (i % COLS) * STEP,
              top: GY + Math.floor(i / COLS) * STEP,
              width: TILE,
              height: TILE,
              borderRadius: 12,
              background: lit ? `rgba(254,119,44,${0.12 + 0.1 * t})` : "rgba(1,119,255,0.08)",
              border: `1.5px solid ${lit ? `rgba(254,119,44,${0.4 + 0.5 * t})` : "rgba(1,119,255,0.35)"}`,
              scale: String(1 + 0.15 * (1 - t) * (lit ? 1 : 0)),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 3,
            }}
          >
            {lit &&
              [0, 1, 2].map((b) => <div key={b} style={{ width: 4, borderRadius: 2, background: C.orange, height: 8 + 16 * Math.abs(Math.sin(frame / 3 + i * 0.7 + b * 1.3)) }} />)}
          </div>
        );
      })}
      <FootShade />
      <Headline at={s.start + 8}>
        Every lead. <O>Called in minutes.</O>
      </Headline>
    </InShot>
  );
};

// ---------- 4. in your customer's language ----------

const LangChip: React.FC = () => {
  const frame = useCurrentFrame();
  const on = frame >= Q.langSwitch;
  const pop = on ? 1 - sp(frame, Q.langSwitch, 14, 220) : 0;
  return (
    <div
      style={{
        fontFamily: mono,
        fontSize: 26,
        fontWeight: 600,
        letterSpacing: 3,
        padding: "10px 22px",
        borderRadius: 99,
        border: `2px solid ${C.orange}`,
        color: on ? "#fff" : C.orange,
        background: on ? C.orange : "transparent",
        scale: String(1 + 0.3 * pop),
        boxShadow: on ? `0 0 ${50 * pop + 24}px rgba(254,119,44,0.45)` : undefined,
      }}
    >
      {on ? "ENGLISH → HINDI" : "ENGLISH"}
    </div>
  );
};

const Translation: React.FC<{ at: number; children: ReactNode }> = ({ at, children }) => {
  const frame = useCurrentFrame();
  return <div style={{ marginTop: 8, fontSize: "0.7em", fontStyle: "italic", color: C.dim, opacity: ramp(frame, at, at + 10) }}>{children}</div>;
};

export const Call: React.FC = () => {
  const frame = useCurrentFrame();
  const s = shot("call");
  const hi = clip("priyaHi");
  const reply = clip("mozhiHi");
  const content = ramp(frame, s.start + 2, s.start + 10);
  return (
    <InShot id="call">
      <Card style={{ left: 260, top: 60, width: 1400, height: 760, padding: 48, opacity: content }} glow={0.4}>
        <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
          <Avatar initials="PS" size={92} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 42, fontWeight: 600 }}>Priya Sharma</div>
            <div style={{ fontSize: 24, color: C.dim, marginTop: 2 }}>Enquired yesterday · Mozhi calling</div>
          </div>
          <LangChip />
        </div>
        <div style={{ marginTop: 28 }}>
          <Waveform width={1304} height={76} bars={80} />
        </div>
        <div style={{ marginTop: 30, display: "flex", flexDirection: "column", gap: 22, fontSize: 36 }}>
          <Pop at={clip("mozhiOpen").start - 2}>
            <Bubble side="right" meta="MOZHI" style={{ fontSize: 36 }}>
              <Spoken id="mozhiOpen" />
            </Bubble>
          </Pop>
          {frame >= clip("priyaEn").start - 3 && (
            <Pop at={clip("priyaEn").start - 2}>
              <Bubble side="left" meta="PRIYA" style={{ fontSize: 36 }}>
                <Spoken id="priyaEn" />{" "}
                {frame >= hi.start - 2 && (
                  <span style={{ color: C.orange, fontWeight: 600 }}>
                    <Spoken id="priyaHi" />
                  </span>
                )}
                {frame >= hi.start && <Translation at={hi.start}>“Sure, but first send me the details.”</Translation>}
              </Bubble>
            </Pop>
          )}
          {frame >= reply.start - 3 && (
            <Pop at={reply.start - 2}>
              <Bubble side="right" meta="MOZHI · CONTINUES IN HINDI" style={{ fontSize: 36 }}>
                <span style={{ fontWeight: 600 }}>
                  <Spoken id="mozhiHi" />
                </span>
                <Translation at={reply.start + 6}>“Of course. Sending it on WhatsApp now.”</Translation>
              </Bubble>
            </Pop>
          )}
        </div>
      </Card>
      <FootShade />
      <Headline at={Q.langSwitch + 4}>
        She switches language. <O>So does Mozhi.</O>
      </Headline>
    </InShot>
  );
};

// ---------- 5. one agent, every call ----------

const ICON = { stroke: "#fff", strokeWidth: 3.5, fill: "none", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
const USES: { title: string; line: string; icon: ReactNode }[] = [
  {
    title: "Follow-ups",
    line: "“Did you see the brochure I sent?”",
    icon: <path {...ICON} d="M12 30 a18 18 0 1 0 6 -13 M12 10 v8 h8" />,
  },
  {
    title: "Bookings",
    line: "“You're booked for Saturday, 11:30.”",
    icon: (
      <g {...ICON}>
        <rect x="8" y="12" width="40" height="34" rx="5" />
        <path d="M8 22 H48 M18 6 v10 M38 6 v10 M20 33 l6 6 l11 -12" />
      </g>
    ),
  },
  {
    title: "Support",
    line: "“Done. Your renewal is moved.”",
    icon: (
      <g {...ICON}>
        <path d="M10 32 v-6 a18 18 0 0 1 36 0 v6" />
        <rect x="8" y="30" width="9" height="14" rx="3" />
        <rect x="39" y="30" width="9" height="14" rx="3" />
      </g>
    ),
  },
  {
    title: "Payment reminders",
    line: "“₹18,500 received. Thank you!”",
    icon: <path {...ICON} d="M16 10 H42 M16 20 H42 M16 10 c18 0 18 20 0 20 H16 L36 48" />,
  },
];

export const Uses: React.FC = () => {
  const frame = useCurrentFrame();
  const W = 400;
  const x0 = 960 - (4 * W + 3 * 28) / 2;
  const all = sp(frame, Q.oneAgent, 18);
  return (
    <InShot id="uses">
      {USES.map((u, i) => {
        const on = sp(frame, Q.uses[i], 16, 160);
        const current = frame >= Q.uses[i] && (i === 3 ? frame < Q.oneAgent : frame < Q.uses[i + 1]);
        return (
          <div key={u.title} style={{ position: "absolute", left: x0 + i * (W + 28), top: 210, width: W, opacity: 0.25 + 0.75 * on }}>
            <Card
              style={{ position: "relative", height: 470, padding: 36, display: "flex", flexDirection: "column", scale: String(current ? 1.04 : 1) }}
              glow={Math.max(current ? 1 : 0, all) * on}
            >
              <div style={{ width: 92, height: 92, borderRadius: 999, background: on > 0.5 ? C.orange : "#1B2E63", display: "grid", placeItems: "center" }}>
                <svg width="56" height="56" viewBox="0 0 56 56">
                  {u.icon}
                </svg>
              </div>
              <div style={{ fontSize: 40, fontWeight: 600, marginTop: 30, lineHeight: 1.15 }}>{u.title}</div>
              <div style={{ fontSize: 26, lineHeight: 1.4, color: C.dim, fontStyle: "italic", marginTop: 18 }}>{u.line}</div>
              <div style={{ marginTop: "auto", opacity: current ? 1 : 0.35 }}>
                <Waveform width={328} height={50} bars={30} who="narrator" />
              </div>
            </Card>
          </div>
        );
      })}
      <FootShade />
      <Headline at={Q.oneAgent}>
        One agent. <O>Every call.</O>
      </Headline>
    </InShot>
  );
};

// ---------- 6. the outcome ----------

const METRICS: [string, string][] = [
  ["Sales", "↑ 30%"],
  ["Cost per call", "↓ 40%"],
  ["New hires", "0"],
];

export const Outcome: React.FC = () => {
  const frame = useCurrentFrame();
  const s = shot("outcome");
  return (
    <InShot id="outcome">
      <div style={{ position: "absolute", inset: 0, transformOrigin: "760px 480px", scale: String(lerp(1.02, 1.06, ramp(frame, s.start, s.end))) }}>
        <Office mode="growth" />
      </div>
      <div style={{ position: "absolute", left: 96, top: 60, fontFamily: mono, fontSize: 28, letterSpacing: 6, color: C.orange, opacity: sp(frame, s.start + 2, 16) }}>ONE MONTH LATER</div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 360, background: "linear-gradient(transparent, rgba(16,12,18,0.94))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 90, display: "flex", justifyContent: "center", gap: 28 }}>
        {METRICS.map(([label, value], i) => (
          <Pop key={label} at={Q.metrics[i]} dy={22}>
            <div style={{ width: 360, padding: "22px 30px", borderRadius: 22, background: "rgba(16,12,18,0.88)", border: "1px solid rgba(254,119,44,0.5)", fontFamily: sans }}>
              <div style={{ fontFamily: mono, fontSize: 20, letterSpacing: 3, color: C.dim, textTransform: "uppercase" }}>{label}</div>
              <div style={{ fontSize: 72, fontWeight: 600, color: C.orange, lineHeight: 1.1, marginTop: 4 }}>{value}</div>
            </div>
          </Pop>
        ))}
      </div>
      <div style={{ position: "absolute", right: 64, bottom: 34, fontFamily: sans, fontSize: 18, color: C.dim, opacity: ramp(frame, Q.metrics[2], Q.metrics[2] + 8) }}>Illustrative results.</div>
    </InShot>
  );
};

// ---------- 7. The Vertical AI ----------

const LOGO_W = 620;
const LOGO_H = Math.round((LOGO_W * 590) / 1955);

export const End: React.FC = () => {
  const frame = useCurrentFrame();
  const s = shot("end");
  const mozhi = sp(frame, s.start + 2, 18);
  const logo = sp(frame, Q.logo, 18);
  const tag = sp(frame, Q.tagline - 2, 18);
  return (
    <InShot id="end">
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 150, fontFamily: sans, color: C.text }}>
        <div style={{ display: "flex", alignItems: "center", gap: 26, opacity: mozhi }}>
          <Orb at={s.start} size={76} />
          <div>
            <div style={{ fontSize: 72, fontWeight: 600, lineHeight: 1 }}>Mozhi</div>
            <div style={{ fontFamily: mono, fontSize: 20, letterSpacing: 4, color: C.dim, marginTop: 8 }}>AI VOICE AGENT</div>
          </div>
        </div>
        <div style={{ width: 120, height: 2, background: C.faint, margin: "64px 0 60px", opacity: logo }} />
        <div style={{ opacity: logo, scale: String(lerp(0.94, 1, logo)) }}>
          <CanvasImage src={staticFile("images/logo-white.png")} width={LOGO_W} height={LOGO_H} style={{ width: LOGO_W, height: LOGO_H }} />
        </div>
        <div style={{ marginTop: 40, fontSize: 52, fontWeight: 600, opacity: tag, translate: `0px ${14 * (1 - tag)}px` }}>
          AI Enterprise OS for <O>success.</O>
        </div>
      </div>
    </InShot>
  );
};

