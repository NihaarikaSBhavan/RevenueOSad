import { useCurrentFrame } from "remotion";
import { lerp, ramp, sp } from "../anim";
import { COPY } from "../copy";
import { monoStack, sansStack } from "../fonts";
import { C, glass } from "../theme";
import { T } from "../timeline";
import words from "../../../public/audio/words.json";

type Word = { vo: number; text: string; display: string; start_ms: number; end_ms: number; frame: number };

/** A window of visibility with spring in and quick fade out. */
const windowed = (frame: number, from: number, to: number) => Math.min(sp(frame, from, 16), 1 - ramp(frame, to, to + 10));

export const ClickCounter: React.FC = () => {
  const frame = useCurrentFrame();
  const clicks = [T.click1, T.click2, T.click3];
  const n = clicks.filter((c) => frame >= c).length;
  if (n === 0) return null;
  const bump = 1 - sp(frame, clicks[n - 1], 14, 200);
  const vis = 1 - ramp(frame, T.days30 + 4, T.days30 + 16);
  const locked = frame >= T.lock;
  const lockT = sp(frame, T.lock, 16);
  return (
    <div
      style={{
        position: "absolute",
        right: 60,
        top: 44,
        textAlign: "right",
        opacity: vis,
        fontFamily: sansStack,
        padding: "20px 28px",
        borderRadius: 24,
        background: `rgba(5,18,52,${0.75 * lockT})`,
        border: `1px solid rgba(254,119,44,${0.5 * lockT})`,
      }}
    >
      <div style={{ fontFamily: monoStack, fontSize: 30, fontWeight: 600, color: C.orange, letterSpacing: 4 }}>{COPY.click}</div>
      <div style={{ fontFamily: monoStack, fontSize: 150, lineHeight: 1, fontWeight: 600, color: C.orange, scale: String(1 + bump * 0.18), transformOrigin: "right center" }}>
        {n}
      </div>
      {locked && (
        <div style={{ marginTop: 12, fontSize: 40, fontWeight: 600, color: C.text, opacity: lockT, translate: `0px ${12 * (1 - lockT)}px` }}>{COPY.lock}</div>
      )}
    </div>
  );
};

/** The money shot: the world steps back so "3 clicks" owns the frame, held past comfortable. */
export const MoneyShotDim: React.FC = () => {
  const frame = useCurrentFrame();
  const v = Math.min(sp(frame, T.lock, 18), 1 - ramp(frame, T.days30 - 2, T.days30 + 8));
  if (v <= 0) return null;
  return <div style={{ position: "absolute", inset: 0, background: `rgba(5,18,52,${0.55 * v})` }} />;
};

/** Big time stamps: "Saturday" (fast-forward) and "+30 days". */
export const Stamp: React.FC<{ at: number; until: number; text: string }> = ({ at, until, text }) => {
  const frame = useCurrentFrame();
  const v = windowed(frame, at, until);
  if (v <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 70, display: "flex", justifyContent: "center", opacity: v }}>
      <div style={{ ...glass, padding: "14px 34px", fontFamily: monoStack, fontSize: 44, fontWeight: 600, color: C.text, scale: String(lerp(1.3, 1, sp(frame, at, 14))), letterSpacing: 2 }}>
        ▶▶ {text}
      </div>
    </div>
  );
};

/** On-screen beat lines, top left. */
export const Beat: React.FC<{ at: number; until: number; text: string }> = ({ at, until, text }) => {
  const frame = useCurrentFrame();
  const v = windowed(frame, at, until);
  if (v <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 80, top: 56, fontFamily: sansStack, fontSize: 42, fontWeight: 600, color: C.text, opacity: v, translate: `${-20 * (1 - v)}px 0px` }}>
      <span style={{ display: "inline-block", width: 6, height: 40, background: C.blue, marginRight: 20, verticalAlign: "-6px", borderRadius: 3 }} />
      {text}
    </div>
  );
};

/** Captions in short phrases (split at punctuation, max 7 words), centred; each word appears on its sound. */
const PHRASES = (() => {
  const all = words as Word[];
  const out: Word[][] = [];
  for (const vo of [1, 2, 3]) {
    let cur: Word[] = [];
    for (const w of all.filter((x) => x.vo === vo)) {
      cur.push(w);
      if (/[.,!?]$/.test(w.display) || cur.length >= 7) {
        out.push(cur);
        cur = [];
      }
    }
    if (cur.length) out.push(cur);
  }
  return out;
})();

export const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  // The end card lands in silence: no captions from the first drumbeat on
  if (frame >= T.endCard1) return null;
  const idx = PHRASES.findIndex((p, i) => {
    const next = PHRASES[i + 1];
    const sameLine = next && next[0].vo === p[0].vo;
    const until = sameLine ? next[0].frame : Math.ceil((p[p.length - 1].end_ms / 1000) * 30) + 18;
    return frame >= p[0].frame && frame < until;
  });
  if (idx < 0) return null;
  // Only words already spoken are laid out, so the caption stays centred as it grows
  const phrase = PHRASES[idx].filter((w) => frame >= w.frame);
  return (
    <div style={{ position: "absolute", left: 220, right: 220, bottom: 40, display: "flex", justifyContent: "center" }}>
      <div style={{ padding: "12px 28px", borderRadius: 16, background: "rgba(5,18,52,0.78)", fontFamily: sansStack, fontSize: 40, fontWeight: 500, lineHeight: 1.3, textAlign: "center", color: C.text }}>
        {phrase.map((w, i) => (
          <span key={i}>
            {w.display}
            {i < phrase.length - 1 ? " " : ""}
          </span>
        ))}
      </div>
    </div>
  );
};

export const AutonomyDial: React.FC = () => {
  const frame = useCurrentFrame();
  const v = windowed(frame, T.pullBack + 6, T.dissolve);
  if (v <= 0) return null;
  const t = sp(frame, T.dial, 16);
  const angle = lerp(-60, 60, t);
  return (
    <div style={{ ...glass, background: "rgba(5,18,52,0.88)", position: "absolute", left: 80, top: 330, width: 330, padding: 28, opacity: v, fontFamily: sansStack, color: C.text, translate: `${-30 * (1 - v)}px 0px` }}>
      <div style={{ fontSize: 15, letterSpacing: 2.4, textTransform: "uppercase", color: C.textDim, fontWeight: 600 }}>{COPY.dialLabel}</div>
      <svg width="274" height="150" style={{ marginTop: 14 }}>
        <path d="M 27 140 A 110 110 0 0 1 247 140" stroke="rgba(255,255,255,0.12)" strokeWidth="14" fill="none" strokeLinecap="round" />
        <path d="M 27 140 A 110 110 0 0 1 247 140" stroke={C.blue} strokeWidth="14" fill="none" strokeLinecap="round" strokeDasharray={`${345 * (0.25 + 0.75 * t)} 999`} />
        <g transform={`translate(137 140) rotate(${angle})`}>
          <line x1="0" y1="0" x2="0" y2="-88" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
          <circle r="10" fill="#fff" />
        </g>
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 18, marginTop: 4 }}>
        <span style={{ color: t < 0.5 ? C.text : C.textDim, fontWeight: t < 0.5 ? 600 : 400 }}>{COPY.supervised}</span>
        <span style={{ color: t >= 0.5 ? C.blue : C.textDim, fontWeight: t >= 0.5 ? 600 : 400 }}>{COPY.autonomous}</span>
      </div>
    </div>
  );
};

export const AuditLog: React.FC = () => {
  const frame = useCurrentFrame();
  const v = windowed(frame, T.pullBack + 2, T.dissolve);
  if (v <= 0) return null;
  // Scrolls continuously: a new entry every 3 frames
  const scroll = ramp(frame, T.pullBack, T.dissolve) * (COPY.audit.length - 6);
  return (
    <div style={{ ...glass, background: "rgba(5,18,52,0.88)", position: "absolute", right: 80, top: 300, width: 600, height: 470, padding: 28, opacity: v, overflow: "hidden", color: C.text, translate: `${30 * (1 - v)}px 0px` }}>
      <div style={{ fontFamily: sansStack, fontSize: 15, letterSpacing: 2.4, textTransform: "uppercase", color: C.textDim, fontWeight: 600 }}>{COPY.auditLabel}</div>
      <div style={{ position: "absolute", left: 28, right: 28, top: 70, bottom: 20, overflow: "hidden" }}>
       <div style={{ translate: `0px ${-scroll * 52}px` }}>
        {COPY.audit.map((line, i) => (
          <div key={i} style={{ height: 52, fontFamily: monoStack, fontSize: 17, color: i < scroll + 6 ? C.text : C.textDim, whiteSpace: "nowrap", display: "flex", alignItems: "center" }}>
            {line}
          </div>
        ))}
       </div>
      </div>
    </div>
  );
};
