import { useCurrentFrame } from "remotion";
import { clamp01, lerp, ramp, rand, sp } from "../RevenueOS/anim";
import { Office } from "./Office";
import { C, clip, mono, Q, sans, shot } from "./theme";
import { Avatar, Bubble, Card, Check, Feature, FootShade, InShot, Label, Phone, Pop, Waveform } from "./ui";

// ---------- 1. tension ----------

const PUSH = { s0: 1, s1: 1.08, ox: 720, oy: 560 };
const pushAt = (frame: number) => lerp(PUSH.s0, PUSH.s1, ramp(frame, 0, shot("switch").start));

const Stats: React.FC = () => {
  const items: [string, string, number][] = [
    ["Leads this week", "214", 18],
    ["Called", "38", 44],
    ["Sales", "flat", 70],
  ];
  return (
    <div style={{ position: "absolute", left: 96, bottom: 70, display: "flex", gap: 64, fontFamily: sans }}>
      {items.map(([label, value, at]) => (
        <Pop key={label} at={at} dy={14}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ fontFamily: mono, fontSize: 18, letterSpacing: 3, textTransform: "uppercase", color: C.bluePale, opacity: 0.8 }}>{label}</div>
            <div style={{ fontSize: 64, fontWeight: 600, color: value === "flat" ? C.blue : C.text, lineHeight: 1 }}>{value}</div>
          </div>
        </Pop>
      ))}
    </div>
  );
};

export const Tension: React.FC = () => {
  const frame = useCurrentFrame();
  const s = pushAt(frame);
  return (
    <InShot id="tension" fade={0}>
      <div style={{ position: "absolute", inset: 0, transformOrigin: `${PUSH.ox}px ${PUSH.oy}px`, scale: String(s) }}>
        <Office mode="pain" />
      </div>
      <FootShade />
      <Stats />
    </InShot>
  );
};

// ---------- 2. she switches Mozhi OS on ----------

const COLS = 16;
const ROWS = 11; // 176 leads
const TILE = 46;
const STEP = 52;
const GX = 1030;
const GY = 236;
export const PRIYA_TILE = 4 * COLS + 5;

const litAt = (i: number) => Q.dialFrom + Math.floor(rand(i + 3) * 34);

export const tileRect = (i: number) => ({ x: GX + (i % COLS) * STEP, y: GY + Math.floor(i / COLS) * STEP, w: TILE, h: TILE });

const Toggle: React.FC = () => {
  const frame = useCurrentFrame();
  const on = sp(frame, Q.toggle, 16, 200);
  const vis = Math.min(sp(frame, shot("switch").start, 18), 1 - ramp(frame, Q.toggle + 6, Q.toggle + 14));
  if (vis <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 560, top: 300, opacity: vis, scale: String(lerp(0.9, 1, vis)), fontFamily: sans }}>
      <div style={{ display: "flex", alignItems: "center", gap: 22, padding: "18px 26px", borderRadius: 999, background: "rgba(5,18,52,0.92)", border: `1px solid rgba(254,119,44,${0.2 + 0.6 * on})`, boxShadow: `0 0 ${60 * on}px rgba(254,119,44,0.35)` }}>
        <div style={{ fontSize: 30, fontWeight: 600, color: C.text }}>Mozhi OS</div>
        <div style={{ width: 92, height: 50, borderRadius: 99, background: on > 0.5 ? C.orange : "#2B3A63", position: "relative" }}>
          <div style={{ position: "absolute", top: 5, left: lerp(5, 47, on), width: 40, height: 40, borderRadius: 99, background: "#fff" }} />
        </div>
      </div>
    </div>
  );
};

const Grid: React.FC = () => {
  const frame = useCurrentFrame();
  const appear = sp(frame, Q.toggle + 6, 18);
  const lit = Array.from({ length: COLS * ROWS }, (_, i) => frame >= litAt(i));
  const count = lit.filter(Boolean).length;
  return (
    <div style={{ position: "absolute", inset: 0, opacity: appear, translate: `${40 * (1 - appear)}px 0px` }}>
      <div style={{ position: "absolute", left: GX, top: 116, fontFamily: sans }}>
        <Label color={C.orange}>Live calls</Label>
        <div style={{ fontFamily: mono, fontSize: 64, fontWeight: 600, color: C.text, lineHeight: 1.1 }}>{count}</div>
      </div>
      {lit.map((isLit, i) => {
        const r = tileRect(i);
        const t = isLit ? sp(frame, litAt(i), 16, 200) : 0;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: r.x,
              top: r.y,
              width: TILE,
              height: TILE,
              borderRadius: 10,
              background: isLit ? `rgba(254,119,44,${0.12 + 0.1 * t})` : "rgba(1,119,255,0.08)",
              border: `1.5px solid ${isLit ? `rgba(254,119,44,${0.4 + 0.5 * t})` : "rgba(1,119,255,0.35)"}`,
              scale: String(1 + 0.15 * (1 - t) * (isLit ? 1 : 0)),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 3,
            }}
          >
            {isLit &&
              [0, 1, 2].map((b) => (
                <div key={b} style={{ width: 4, borderRadius: 2, background: C.orange, height: 6 + 14 * Math.abs(Math.sin(frame / 3 + i * 0.7 + b * 1.3)) }} />
              ))}
          </div>
        );
      })}
    </div>
  );
};

export const Switch: React.FC = () => {
  const frame = useCurrentFrame();
  // The office steps left to make room for the calls
  const k = sp(frame, Q.toggle + 10, 18, 90);
  const s0 = PUSH.s1;
  const tx0 = PUSH.ox * (1 - s0);
  const ty0 = PUSH.oy * (1 - s0);
  const s = lerp(s0, 0.5, k);
  const tx = lerp(tx0, 20, k);
  const ty = lerp(ty0, 250, k);
  return (
    <InShot id="switch" fade={0}>
      <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080, transformOrigin: "0 0", transform: `translate(${tx}px, ${ty}px) scale(${s})` }}>
        <Office mode="on" />
      </div>
      <Toggle />
      <Grid />
      <FootShade />
      <Feature at={Q.toggle + 8} text="100+ concurrent calls" then="Every lead. Called in minutes." thenAt={Q.toggle + 18} />
    </InShot>
  );
};

// ---------- 3. day 1, first call ----------

const CARD = { x: 160, y: 120, w: 1600, h: 640 };

/** Priya's tile grows into her call. */
const ZoomFromTile: React.FC = () => {
  const frame = useCurrentFrame();
  const s = shot("firstCall");
  const t = sp(frame, s.start, 20, 110);
  if (t > 0.995) return null;
  const r = tileRect(PRIYA_TILE);
  return (
    <div
      style={{
        position: "absolute",
        left: lerp(r.x, CARD.x, t),
        top: lerp(r.y, CARD.y, t),
        width: lerp(r.w, CARD.w, t),
        height: lerp(r.h, CARD.h, t),
        borderRadius: lerp(10, 28, t),
        background: `rgba(254,119,44,${0.3 * (1 - t)})`,
        border: `2px solid ${C.orange}`,
        opacity: 1 - ramp(frame, s.start + 10, s.start + 16),
      }}
    />
  );
};

const CallHeader: React.FC<{ initials: string; name: string; sub: string; right?: React.ReactNode }> = ({ initials, name, sub, right }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
    <Avatar initials={initials} size={84} />
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 38, fontWeight: 600 }}>{name}</div>
      <div style={{ fontSize: 22, color: C.dim, marginTop: 2 }}>{sub}</div>
    </div>
    {right}
  </div>
);

const LiveTimer: React.FC<{ from: number; base?: number }> = ({ from, base = 0 }) => {
  const frame = useCurrentFrame();
  const secs = base + Math.max(0, Math.floor((frame - from) / 30));
  return (
    <div style={{ fontFamily: mono, fontSize: 22, color: C.orange, letterSpacing: 2 }}>
      ● LIVE {String(Math.floor(secs / 60)).padStart(2, "0")}:{String(secs % 60).padStart(2, "0")}
    </div>
  );
};

/** Words of a voiced line revealed in step with the voice. */
const Spoken: React.FC<{ id: string; lead?: number }> = ({ id, lead = 2 }) => {
  const frame = useCurrentFrame();
  const c = clip(id);
  const words = c.text.split(" ");
  const n = Math.ceil(words.length * clamp01((frame - c.start + lead) / (c.end - c.start)));
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

const QUALIFY: [string, string][] = [
  ["Need", "Confirmed"],
  ["Budget", "₹2–3 lakh"],
  ["Timeline", "This month"],
];

export const FirstCall: React.FC = () => {
  const frame = useCurrentFrame();
  const s = shot("firstCall");
  const content = ramp(frame, s.start + 8, s.start + 16);
  const switched = frame >= Q.langSwitch;
  const en = clip("priyaEn");
  return (
    <InShot id="firstCall">
      <ZoomFromTile />
      <Card style={{ left: CARD.x, top: CARD.y, width: CARD.w, height: CARD.h, padding: 44, opacity: content }} glow={0.4}>
        <CallHeader
          initials="PS"
          name="Priya Sharma"
          sub="Enquiry form · yesterday, 6:40 PM"
          right={
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 12 }}>
              <LiveTimer from={s.start} base={9} />
              <div style={{ fontFamily: mono, fontSize: 20, letterSpacing: 2, padding: "6px 14px", borderRadius: 99, border: `1px solid ${C.orange}`, color: C.orange }}>
                HINDI{switched ? " → ENGLISH" : ""}
              </div>
            </div>
          }
        />
        <div style={{ marginTop: 26 }}>
          <Waveform width={1512} height={80} bars={90} />
        </div>
        <div style={{ display: "flex", gap: 44, marginTop: 26 }}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 22, fontSize: 32 }}>
            <Bubble side="right" meta="MOZHI · HINDI · replied in 420 ms" style={{ fontSize: 32 }}>नमस्ते प्रिया जी, कल आपने enquiry भेजी थी।</Bubble>
            <Pop at={clip("priyaHi").start - 2}>
              <Bubble side="left" meta={switched ? "PRIYA · SWITCHED TO ENGLISH MID-SENTENCE" : "PRIYA · HINDI"} style={{ fontSize: 32 }}>
                हाँ जी, बोलिए…{" "}
                {frame >= en.start - 2 && (
                  <span style={{ color: C.text }}>
                    <Spoken id="priyaEn" />
                  </span>
                )}
              </Bubble>
            </Pop>
          </div>
          <div style={{ width: 420, padding: 28, borderRadius: 22, background: "rgba(244,247,252,0.04)", border: `1px solid ${C.faint}` }}>
            <Label>Qualifying</Label>
            {QUALIFY.map(([k, v], i) => {
              const on = ramp(frame, Q.qualify[i], Q.qualify[i] + 8);
              return (
                <div key={k} style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 22 }}>
                  <Check on={on} />
                  <div style={{ fontSize: 24, color: C.dim, width: 120 }}>{k}</div>
                  <div style={{ fontSize: 24, fontWeight: 600, opacity: on }}>{v}</div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>
      <FootShade />
      <Feature at={s.start + 8} text="36+ languages · switches mid-sentence · replies in <500ms" />
    </InShot>
  );
};

// ---------- 4. orchestration: call, WhatsApp, CRM ----------

const CRM_FIELDS: [string, string][] = [
  ["Status", "Interested"],
  ["Budget", "Confirmed"],
  ["Decision", "Deciding with family"],
  ["Next step", "Call back Thursday"],
];

/** An orange pulse carrying the work from one panel to the next. */
const Pulse: React.FC<{ at: number; x1: number; x2: number; y: number }> = ({ at, x1, x2, y }) => {
  const frame = useCurrentFrame();
  const t = ramp(frame, at, at + 12);
  if (frame < at || frame > at + 20) return null;
  const x = lerp(x1, x2, t);
  return (
    <>
      <div style={{ position: "absolute", left: x1, top: y - 1, width: x - x1, height: 2, background: `linear-gradient(90deg, transparent, ${C.orange})`, opacity: 1 - ramp(frame, at + 12, at + 20) }} />
      <div style={{ position: "absolute", left: x - 9, top: y - 9, width: 18, height: 18, borderRadius: 99, background: C.orange, boxShadow: `0 0 24px 6px rgba(254,119,44,0.6)`, opacity: 1 - ramp(frame, at + 12, at + 20) }} />
    </>
  );
};

const DocIcon: React.FC = () => (
  <svg width="44" height="54" viewBox="0 0 44 54">
    <path d="M4 2 H30 L42 14 V52 H4 Z" fill="#fff" opacity="0.9" />
    <path d="M30 2 V14 H42" fill="#ddd" />
    <rect x="10" y="30" width="24" height="10" rx="2" fill={C.orange} />
  </svg>
);

export const Orchestrate: React.FC = () => {
  const frame = useCurrentFrame();
  const s = shot("orchestrate");
  const buzz = frame >= Q.whatsapp ? 1 - ramp(frame, Q.whatsapp, Q.whatsapp + 14) : 0;
  return (
    <InShot id="orchestrate">
      <Card style={{ left: 90, top: 120, width: 560, height: 660, padding: 34 }} glow={0.3}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <Avatar initials="PS" size={64} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 28, fontWeight: 600 }}>Priya Sharma</div>
            <LiveTimer from={shot("firstCall").start} base={9} />
          </div>
        </div>
        <div style={{ marginTop: 22 }}>
          <Waveform width={490} height={60} bars={40} />
        </div>
        <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 14 }}>
          <Bubble side="left" style={{ fontSize: 22 }}>Send me the details, I'll discuss and get back.</Bubble>
          <Pop at={s.start + 2}>
            <Bubble side="right" meta="replied in 420 ms">Of course. Sending them to your WhatsApp now.</Bubble>
          </Pop>
        </div>
      </Card>

      <Pulse at={Q.whatsapp - 10} x1={650} x2={770} y={420} />
      <Phone x={780} y={110} scale={0.84} title="Mozhi · Sales" sub="online" buzz={buzz}>
        {frame >= Q.whatsapp - 1 && (
          <Pop at={Q.whatsapp}>
            <Bubble side="left">
              <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                <DocIcon />
                <div>
                  <div style={{ fontSize: 22, fontWeight: 600 }}>Brochure.pdf</div>
                  <div style={{ fontSize: 16, color: C.dim }}>2.4 MB · PDF</div>
                </div>
              </div>
            </Bubble>
          </Pop>
        )}
        {frame >= Q.whatsapp + 7 && (
          <Pop at={Q.whatsapp + 8}>
            <Bubble side="left" style={{ fontSize: 22 }}>
              Pricing: Starter ₹1.9L · Plus ₹2.6L. Happy to answer anything.
            </Bubble>
          </Pop>
        )}
      </Phone>

      <Pulse at={Q.crm[0] - 12} x1={1130} x2={1250} y={420} />
      <Card style={{ left: 1260, top: 120, width: 570, height: 660, padding: 36 }} glow={ramp(frame, Q.crm[0], Q.crm[3] + 8) * 0.5}>
        <Label>CRM · Lead</Label>
        <div style={{ fontSize: 34, fontWeight: 600, marginTop: 12 }}>Priya Sharma</div>
        <div style={{ fontSize: 20, color: C.dim }}>Enquiry form · Hindi / English</div>
        <div style={{ marginTop: 26, display: "flex", flexDirection: "column", gap: 22 }}>
          {CRM_FIELDS.map(([k, v], i) => {
            const on = ramp(frame, Q.crm[i], Q.crm[i] + 8);
            return (
              <div key={k} style={{ display: "flex", alignItems: "center", gap: 16, paddingBottom: 18, borderBottom: `1px solid ${C.faint}` }}>
                <Check on={on} />
                <div style={{ fontSize: 22, color: C.dim, width: 140 }}>{k}</div>
                <div style={{ fontSize: 24, fontWeight: 600, opacity: on, translate: `${10 * (1 - on)}px 0px` }}>{v}</div>
              </div>
            );
          })}
        </div>
      </Card>
      <FootShade />
      <Feature at={s.start + 6} text="Call → WhatsApp → CRM. Automatically." />
    </InShot>
  );
};

// ---------- 5. day 3, the follow-up ----------

const MEMORY = ["Tue · First call, Hindi → English", "Brochure + pricing sent on WhatsApp", "Discussing with family", "Budget confirmed"];

export const FollowUp: React.FC = () => {
  const frame = useCurrentFrame();
  const s = shot("followUp");
  const day = sp(frame, Q.day3, 14, 160);
  const mem = sp(frame, Q.memory, 18, 110);
  const yes = clip("priyaYes");
  return (
    <InShot id="followUp">
      <div style={{ position: "absolute", left: 0, right: 0, top: 54, display: "flex", justifyContent: "center", opacity: Math.min(1, day * 1.5) }}>
        <div style={{ fontFamily: mono, fontSize: 34, fontWeight: 600, letterSpacing: 8, color: C.orange, padding: "10px 30px", border: `2px solid ${C.orange}`, borderRadius: 14, scale: String(lerp(1.4, 1, day)) }}>
          DAY 3
        </div>
      </div>
      <Card style={{ left: 110, top: 170, width: 1040, height: 620, padding: 40 }} glow={0.35}>
        <CallHeader initials="PS" name="Priya Sharma" sub="Follow-up call" right={<LiveTimer from={s.start} />} />
        <div style={{ marginTop: 24 }}>
          <Waveform width={960} height={70} bars={64} />
        </div>
        <div style={{ marginTop: 26, display: "flex", flexDirection: "column", gap: 16 }}>
          <Pop at={clip("mozhiDay3").start - 2}>
            <Bubble side="right" meta="MOZHI">
              <Spoken id="mozhiDay3" />
            </Bubble>
          </Pop>
          {frame >= yes.start - 3 && (
            <Pop at={yes.start - 2}>
              <Bubble side="left" meta="PRIYA">
                Yes, we liked it.
              </Bubble>
            </Pop>
          )}
        </div>
      </Card>
      <div style={{ position: "absolute", left: 1200, top: 210, opacity: mem, translate: `${80 * (1 - mem)}px 0px` }}>
        <Card style={{ position: "relative", width: 620, padding: 36 }} glow={0.6}>
          <Label color={C.orange}>Memory · Priya Sharma</Label>
          <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 18 }}>
            {MEMORY.map((m, i) => (
              <div key={m} style={{ display: "flex", gap: 14, alignItems: "center", fontSize: 25, opacity: ramp(frame, Q.memory + 6 + i * 5, Q.memory + 12 + i * 5) }}>
                <div style={{ width: 10, height: 10, borderRadius: 99, background: C.orange, flex: "none" }} />
                {m}
              </div>
            ))}
          </div>
        </Card>
      </div>
      <FootShade />
      <Feature at={s.start + 10} text="Remembers every conversation. Never misses a follow-up." />
    </InShot>
  );
};
