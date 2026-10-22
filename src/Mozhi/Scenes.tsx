import React from "react";
import type { CSSProperties, ReactNode } from "react";
import { CanvasImage, staticFile, useCurrentFrame } from "remotion";
import { clamp01, lerp, ramp, rand, sp } from "../RevenueOS/anim";
import { Office } from "./Office";
import { C, clip, mono, Q, sans, shot, speaking } from "./theme";
import { InShot, Pop } from "./ui";

// Before Mozhi: a dark, gloomy blue office. From Mozhi on: bright orange, white paper, dark ink.

/** The one message of each shot: big, centred, at the foot of the frame. */
const Headline: React.FC<{ at: number; children: ReactNode; color?: string }> = ({ at, children, color = C.dark }) => {
  const frame = useCurrentFrame();
  const t = sp(frame, at, 18, 140);
  if (frame < at - 1) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: 80,
        right: 80,
        top: 880,
        textAlign: "center",
        fontFamily: sans,
        fontSize: 62,
        fontWeight: 700,
        letterSpacing: -0.8,
        color,
        opacity: Math.min(1, t * 1.5),
        translate: `0px ${16 * (1 - t)}px`,
      }}
    >
      {children}
    </div>
  );
};

/** The key words of a headline, knocked out of a dark band. */
const Mark: React.FC<{ children: ReactNode }> = ({ children }) => (
  <span style={{ background: C.dark, color: "#fff", padding: "2px 18px 6px", borderRadius: 14, marginLeft: 6 }}>{children}</span>
);

const Paper: React.FC<{ style?: CSSProperties; children?: ReactNode }> = ({ style, children }) => (
  <div
    style={{
      position: "absolute",
      background: C.paper,
      borderRadius: 30,
      boxShadow: "0 30px 80px rgba(120,40,0,0.28), 0 4px 14px rgba(120,40,0,0.12)",
      fontFamily: sans,
      color: C.dark,
      ...style,
    }}
  >
    {children}
  </div>
);

/** Words of a voiced line revealed in step with the voice. */
const Spoken: React.FC<{ id: string }> = ({ id }) => {
  const frame = useCurrentFrame();
  const c = clip(id);
  const words = c.text.split(" ");
  const n = Math.ceil(words.length * clamp01((frame - c.start + 2) / (c.end - c.start)));
  return (
    <>
      {words.map((w, i) => (
        <span key={i} style={{ opacity: i < n ? 1 : 0.2 }}>
          {w}
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </>
  );
};

/** Live call waveform in orange on paper: tall while someone on the call is talking. */
const Wave: React.FC<{ width: number; height: number; bars?: number; who?: string; live?: boolean }> = ({ width, height, bars = 60, who, live }) => {
  const frame = useCurrentFrame();
  const on = live ?? (speaking(frame, who) || speaking(frame - 3, who));
  const level = on ? 1 : 0.15;
  const w = width / bars;
  return (
    <div style={{ width, height, display: "flex", alignItems: "center", gap: w * 0.35 }}>
      {Array.from({ length: bars }, (_, i) => {
        const n = 0.5 + 0.5 * Math.sin(frame * 0.9 + i * 1.7) * Math.cos(frame * 0.37 + i * 0.6);
        const env = Math.sin((Math.PI * (i + 0.5)) / bars) ** 0.6;
        return <div key={i} style={{ width: w * 0.65, height: Math.max(4, height * env * (0.12 + level * n)), borderRadius: 4, background: C.sun }} />;
      })}
    </div>
  );
};

// ---------- 1. your team can't call every lead (gloomy blue) ----------

export const Pain: React.FC = () => {
  const frame = useCurrentFrame();
  const s = shot("pain");
  return (
    <InShot id="pain" fade={0}>
      <div style={{ position: "absolute", inset: 0, transformOrigin: "720px 520px", scale: String(lerp(1, 1.07, ramp(frame, 0, s.end))), filter: "saturate(0.65) brightness(0.62)" }}>
        <Office mode="pain" />
      </div>
      {/* gloom: a cold vignette pressing in */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(75% 70% at 45% 45%, transparent 35%, rgba(1,6,20,0.85) 100%)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 320, background: "linear-gradient(transparent, rgba(1,6,20,0.92))" }} />
      <Headline at={16} color={C.text}>
        214 leads this week. <span style={{ color: C.blueSoft }}>Only 38 called.</span>
      </Headline>
    </InShot>
  );
};

// ---------- 2. meet Mozhi: the frame floods orange ----------

const ORB = { x: 960, y: 330 };

/** Mozhi: a white voice orb whose bars move with whoever is speaking. */
const Orb: React.FC<{ at: number; size?: number }> = ({ at, size = 160 }) => {
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
            border: "2px solid rgba(255,255,255,0.8)",
            opacity: 0.6 * (1 - r),
          }}
        />
      ))}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 999,
          background: "#fff",
          boxShadow: "0 20px 60px rgba(120,40,0,0.3)",
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
              background: C.sun,
              height: size * (0.12 + 0.3 * live * Math.abs(Math.sin(frame / 3.2 + b * 1.4)) * (b === 2 ? 1.2 : b % 2 ? 0.9 : 0.6)),
            }}
          />
        ))}
      </div>
    </div>
  );
};

/** Bright orange that blooms out of the orb and stays for the rest of the film. */
export const Sun: React.FC = () => {
  const frame = useCurrentFrame();
  const r = lerp(0, 2300, sp(frame, Q.reveal + 2, 20, 70));
  if (frame < Q.reveal) return null;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        clipPath: `circle(${r}px at ${ORB.x}px ${ORB.y + 80}px)`,
        background: `radial-gradient(90% 90% at 50% 30%, ${C.sunLight}, ${C.sun} 55%, ${C.sunDeep})`,
      }}
    />
  );
};

export const Meet: React.FC = () => {
  const frame = useCurrentFrame();
  const vo = clip("vo2");
  const name = sp(frame, vo.start, 18, 140);
  const sub = sp(frame, vo.start + 26, 18, 140);
  return (
    <InShot id="meet">
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 250, fontFamily: sans }}>
        <Orb at={Q.reveal} />
        <div style={{ marginTop: 70, fontSize: 160, fontWeight: 700, letterSpacing: 2, lineHeight: 1, color: "#fff", opacity: name, translate: `0px ${20 * (1 - name)}px` }}>Mozhi</div>
        <div style={{ marginTop: 50, fontSize: 56, fontWeight: 700, color: C.dark, opacity: sub, translate: `0px ${16 * (1 - sub)}px` }}>
          An AI voice agent that <Mark>makes your calls for you.</Mark>
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
const GY = 120;
const litAt = (i: number) => Q.dialFrom + Math.floor(rand(i + 3) * 30);

export const Scale: React.FC = () => {
  const frame = useCurrentFrame();
  const s = shot("scale");
  const count = Array.from({ length: COLS * ROWS }, (_, i) => frame >= litAt(i)).filter(Boolean).length;
  return (
    <InShot id="scale">
      <div style={{ position: "absolute", left: 0, right: 0, top: 44, textAlign: "center", fontFamily: mono, fontSize: 32, fontWeight: 600, letterSpacing: 4, color: C.dark }}>
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
              background: lit ? "#fff" : "rgba(30,13,5,0.12)",
              boxShadow: lit ? "0 6px 16px rgba(120,40,0,0.2)" : undefined,
              scale: String(1 + 0.18 * (1 - t) * (lit ? 1 : 0)),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 3,
            }}
          >
            {lit && [0, 1, 2].map((b) => <div key={b} style={{ width: 4, borderRadius: 2, background: C.sun, height: 8 + 16 * Math.abs(Math.sin(frame / 3 + i * 0.7 + b * 1.3)) }} />)}
          </div>
        );
      })}
      <Headline at={s.start + 8}>
        Every lead. <Mark>Called in minutes.</Mark>
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
        border: `2px solid ${on ? C.sun : C.darkDim}`,
        color: on ? "#fff" : C.dark,
        background: on ? C.sun : "transparent",
        scale: String(1 + 0.3 * pop),
        boxShadow: on ? `0 0 ${40 * pop + 10}px rgba(255,122,46,0.5)` : undefined,
      }}
    >
      {on ? "ENGLISH → HINDI" : "ENGLISH"}
    </div>
  );
};

const Bubble: React.FC<{ side: "left" | "right"; who: string; children: ReactNode }> = ({ side, who, children }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: side === "left" ? "flex-start" : "flex-end" }}>
    <div
      style={{
        maxWidth: "86%",
        padding: "16px 24px",
        borderRadius: 22,
        borderBottomLeftRadius: side === "left" ? 6 : 22,
        borderBottomRightRadius: side === "right" ? 6 : 22,
        background: side === "right" ? "#FFE3D1" : "#F1EBE6",
        border: `1px solid ${side === "right" ? "rgba(255,122,46,0.5)" : "rgba(30,13,5,0.08)"}`,
        fontSize: 36,
        lineHeight: 1.35,
      }}
    >
      {children}
    </div>
    <div style={{ marginTop: 6, fontFamily: mono, fontSize: 16, letterSpacing: 2, color: side === "right" ? C.sunDeep : C.darkDim }}>{who}</div>
  </div>
);

const Translation: React.FC<{ at: number; children: ReactNode }> = ({ at, children }) => {
  const frame = useCurrentFrame();
  return <div style={{ marginTop: 8, fontSize: "0.7em", fontStyle: "italic", color: C.darkDim, opacity: ramp(frame, at, at + 10) }}>{children}</div>;
};

export const Call: React.FC = () => {
  const frame = useCurrentFrame();
  const s = shot("call");
  const hi = clip("priyaHi");
  const reply = clip("mozhiHi");
  const content = ramp(frame, s.start + 2, s.start + 10);
  return (
    <InShot id="call">
      <Paper style={{ left: 260, top: 50, width: 1400, height: 780, padding: 48, opacity: content }}>
        <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
          <div style={{ width: 92, height: 92, borderRadius: 999, background: C.dark, color: "#fff", display: "grid", placeItems: "center", fontSize: 32, fontWeight: 700 }}>PS</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 42, fontWeight: 700 }}>Priya Sharma</div>
            <div style={{ fontSize: 24, color: C.darkDim, marginTop: 2 }}>Enquired yesterday · Mozhi calling</div>
          </div>
          <LangChip />
        </div>
        <div style={{ marginTop: 28 }}>
          <Wave width={1304} height={76} bars={80} />
        </div>
        <div style={{ marginTop: 30, display: "flex", flexDirection: "column", gap: 22 }}>
          <Pop at={clip("mozhiOpen").start - 2}>
            <Bubble side="right" who="MOZHI">
              <Spoken id="mozhiOpen" />
            </Bubble>
          </Pop>
          {frame >= clip("priyaEn").start - 3 && (
            <Pop at={clip("priyaEn").start - 2}>
              <Bubble side="left" who="PRIYA">
                <Spoken id="priyaEn" />{" "}
                {frame >= hi.start - 2 && (
                  <span style={{ color: C.sunDeep, fontWeight: 700 }}>
                    <Spoken id="priyaHi" />
                  </span>
                )}
                {frame >= hi.start && <Translation at={hi.start}>“Sure, but first send me the details.”</Translation>}
              </Bubble>
            </Pop>
          )}
          {frame >= reply.start - 3 && (
            <Pop at={reply.start - 2}>
              <Bubble side="right" who="MOZHI · CONTINUES IN HINDI">
                <span style={{ fontWeight: 700 }}>
                  <Spoken id="mozhiHi" />
                </span>
                <Translation at={reply.start + 6}>“Of course. Sending it on WhatsApp now.”</Translation>
              </Bubble>
            </Pop>
          )}
        </div>
      </Paper>
      <Headline at={Q.langSwitch + 4}>
        She switches language. <Mark>So does Mozhi.</Mark>
      </Headline>
    </InShot>
  );
};

// ---------- 5. one agent, every call ----------

const ICON = { stroke: "#fff", strokeWidth: 3.5, fill: "none", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
const USES: { title: string; line: string; icon: ReactNode }[] = [
  { title: "Follow-ups", line: "“Did you see the brochure I sent?”", icon: <path {...ICON} d="M12 30 a18 18 0 1 0 6 -13 M12 10 v8 h8" /> },
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
  { title: "Payment reminders", line: "“₹18,500 received. Thank you!”", icon: <path {...ICON} d="M16 10 H42 M16 20 H42 M16 10 c18 0 18 20 0 20 H16 L36 48" /> },
];

export const Uses: React.FC = () => {
  const frame = useCurrentFrame();
  const W = 400;
  const x0 = 960 - (4 * W + 3 * 28) / 2;
  return (
    <InShot id="uses">
      {USES.map((u, i) => {
        const on = sp(frame, Q.uses[i], 16, 160);
        const current = frame >= Q.uses[i] && (i === 3 ? frame < Q.oneAgent : frame < Q.uses[i + 1]);
        return (
          <div key={u.title} style={{ position: "absolute", left: x0 + i * (W + 28), top: 190, width: W, opacity: 0.3 + 0.7 * on, scale: String(current ? 1.05 : 1) }}>
            <Paper style={{ position: "relative", height: 480, padding: 36, display: "flex", flexDirection: "column" }}>
              <div style={{ width: 96, height: 96, borderRadius: 999, background: on > 0.5 ? C.sun : "rgba(30,13,5,0.25)", display: "grid", placeItems: "center" }}>
                <svg width="56" height="56" viewBox="0 0 56 56">
                  {u.icon}
                </svg>
              </div>
              <div style={{ fontSize: 42, fontWeight: 700, marginTop: 30, lineHeight: 1.15 }}>{u.title}</div>
              <div style={{ fontSize: 27, lineHeight: 1.4, color: C.darkDim, fontStyle: "italic", marginTop: 18 }}>{u.line}</div>
              <div style={{ marginTop: "auto", opacity: current ? 1 : 0.3 }}>
                <Wave width={328} height={50} bars={30} live={current} />
              </div>
            </Paper>
          </div>
        );
      })}
      <Headline at={Q.oneAgent}>
        One agent. <Mark>Every call.</Mark>
      </Headline>
    </InShot>
  );
};

// ---------- 6. the results ----------

const RESULTS: [string, string, string][] = [
  ["Sales", "↑", "30%"],
  ["Cost per call", "↓", "40%"],
  ["New hires", "", "0"],
];

export const Outcome: React.FC = () => {
  const frame = useCurrentFrame();
  const s = shot("outcome");
  return (
    <InShot id="outcome">
      <div style={{ position: "absolute", left: 0, right: 0, top: 110, textAlign: "center", fontFamily: mono, fontSize: 30, fontWeight: 600, letterSpacing: 8, color: C.dark, opacity: sp(frame, s.start + 2, 16) }}>
        ONE MONTH WITH MOZHI
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 250, display: "flex", justifyContent: "center", gap: 40 }}>
        {RESULTS.map(([label, arrow, value], i) => {
          const t = sp(frame, Q.metrics[i], 15, 170);
          // Percentages count up as they land
          const n = value === "0" ? "0" : `${Math.round(parseInt(value, 10) * clamp01(t * 1.1))}%`;
          return (
            <div key={label} style={{ opacity: Math.min(1, t * 1.5), translate: `0px ${40 * (1 - t)}px`, scale: String(lerp(0.9, 1, t)) }}>
              <Paper style={{ position: "relative", width: 480, height: 440, padding: "48px 44px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div style={{ fontFamily: mono, fontSize: 24, fontWeight: 600, letterSpacing: 4, color: C.darkDim, textTransform: "uppercase" }}>{label}</div>
                <div style={{ fontSize: 140, fontWeight: 700, lineHeight: 0.9, color: C.sunDeep, letterSpacing: -4, whiteSpace: "nowrap" }}>
                  {arrow && <span style={{ fontSize: 96, marginRight: 10 }}>{arrow}</span>}
                  {n}
                </div>
              </Paper>
            </div>
          );
        })}
      </div>
      <Headline at={Q.metrics[0]}>
        Sell more. Spend less. <Mark>Grow without growing the team.</Mark>
      </Headline>
      <div style={{ position: "absolute", right: 60, top: 40, fontFamily: sans, fontSize: 18, color: C.darkDim, opacity: ramp(frame, Q.metrics[2], Q.metrics[2] + 8) }}>Illustrative results.</div>
    </InShot>
  );
};

// ---------- 7. Mozhi, by The Vertical AI ----------

const LOGO_W = 640;
const LOGO_H = Math.round((LOGO_W * 590) / 1955);

export const End: React.FC = () => {
  const frame = useCurrentFrame();
  const s = shot("end");
  const mozhi = sp(frame, s.start + 2, 18);
  const logo = sp(frame, Q.logo, 18);
  return (
    <InShot id="end">
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 70, fontFamily: sans }}>
        <div style={{ display: "flex", alignItems: "center", gap: 34, opacity: mozhi, scale: String(lerp(0.94, 1, mozhi)) }}>
          <Orb at={s.start} size={120} />
          <div>
            <div style={{ fontSize: 120, fontWeight: 700, lineHeight: 1, color: "#fff" }}>Mozhi</div>
            <div style={{ fontFamily: mono, fontSize: 26, fontWeight: 600, letterSpacing: 6, color: C.dark, marginTop: 10 }}>AI VOICE AGENT</div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18, opacity: logo, translate: `0px ${16 * (1 - logo)}px` }}>
          <div style={{ fontFamily: mono, fontSize: 22, fontWeight: 600, letterSpacing: 6, color: C.dark }}>BY</div>
          <CanvasImage src={staticFile("images/logo-white.png")} width={LOGO_W} height={LOGO_H} style={{ width: LOGO_W, height: LOGO_H }} />
        </div>
      </div>
    </InShot>
  );
};
