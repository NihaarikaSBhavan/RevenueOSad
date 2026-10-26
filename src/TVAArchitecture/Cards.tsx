import { interpolate, useCurrentFrame } from "remotion";
import { monoStack } from "../RevenueOS/fonts";
import { lifecycleAt } from "./Lifecycle";
import { C, cycleOf, DURATION, ease, ENTER, LOOP_START, pop } from "./theme";
import { Box, Check, Chip, Glyph, Paper, Section } from "./ui";

const loopIndex = (frame: number, count: number, span = DURATION - LOOP_START) =>
  frame < LOOP_START ? -1 : Math.floor(((frame - LOOP_START) / span) * count) % count;

const smallCaps = { fontSize: 10.5, fontWeight: 700, letterSpacing: 0.6, color: C.ink } as const;

/* 1 ─ Plug-ins */
const PLUGINS = [
  { name: "Conversa", sub: "voice, omni", g: "C", c: C.blue },
  { name: "Lendkraft.ai", sub: "lending app", g: "L", c: C.green },
  { name: "AssistAI™", sub: "co-pilot", g: "A", c: C.violet },
  { name: "FieldSync™", sub: "field ops", g: "F", c: C.teal },
  { name: "Partner", sub: "components", g: "P", c: C.stone },
  { name: "Customer", sub: "agents", g: "{}", c: C.ink },
];

export const Plugins: React.FC<{ box: Box }> = ({ box }) => {
  const frame = useCurrentFrame();
  const s = ENTER(1);
  const active = Math.max(0, loopIndex(frame, 6));
  const tw = (box.w - 24 - 16) / 3;
  const th = (box.h - 52 - 12 - 8) / 2;
  return (
    <Section n={1} title="Plug-ins" box={box}>
      {PLUGINS.map((p, i) => {
        const e = pop(frame, s + 6 + i * 2);
        const on = i === active ? 1 : 0;
        return (
          <Paper
            key={p.name}
            style={{
              left: 12 + (i % 3) * (tw + 8),
              top: 52 + Math.floor(i / 3) * (th + 8),
              width: tw,
              height: th,
              border: on ? `2px solid ${C.orange}` : `1px solid ${C.paperLine}`,
              boxShadow: on ? "0 0 0 3px rgba(254,119,44,0.15)" : undefined,
              transform: `scale(${e * (1 + on * 0.03)})`,
              padding: 9,
              boxSizing: "border-box",
            }}
          >
            <Glyph text={p.g} color={p.c} />
            <div style={{ position: "absolute", left: 9, bottom: 9 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: C.ink }}>{p.name}</div>
              <div style={{ fontSize: 10.5, color: C.sub }}>{p.sub}</div>
            </div>
          </Paper>
        );
      })}
    </Section>
  );
};

/* 2 ─ Plug-in contract */
const CONTRACT = [
  { part: "Manifest", k: "registered" },
  { part: "Decision API", k: "verdict first" },
  { part: "Policy hooks", k: "central policy" },
  { part: "Tool gateway", k: "secrets hidden" },
  { part: "Telemetry", k: "lands in Lens" },
];

export const Contract: React.FC<{ box: Box }> = ({ box }) => {
  const frame = useCurrentFrame();
  const s = ENTER(2);
  const { t } = cycleOf(frame);
  const row = t < 0 ? -1 : Math.min(4, Math.floor(t / 18));
  return (
    <Section n={2} title="Plug-in Contract" box={box}>
      <Paper style={{ left: 12, top: 52, width: box.w - 24, height: box.h - 64, padding: "10px 12px", boxSizing: "border-box" }}>
        <div style={{ display: "flex", justifyContent: "space-between", ...smallCaps }}>
          <span>PLUG-IN PROVIDES</span>
          <span>KERNEL GUARANTEES</span>
        </div>
        {CONTRACT.map((r, i) => {
          const e = ease(frame, s + 8 + i * 3, s + 16 + i * 3);
          const on = i === row;
          const done = row >= 0 && i < row;
          return (
            <div
              key={r.part}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                height: 27,
                borderTop: i ? `1px solid ${C.paperLine}` : undefined,
                marginTop: i ? 0 : 6,
                opacity: e,
                transform: `translateX(${(1 - e) * -10}px)`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <div style={{ width: 6, height: 6, borderRadius: 3, background: on ? C.blue : C.faint }} />
                <span style={{ fontSize: 12.5, fontWeight: 600, color: C.ink }}>{r.part}</span>
              </div>
              <Chip
                text={on ? `✓ ${r.k}` : r.k}
                color={on ? "white" : done ? C.blue : C.sub}
                bg={on ? C.blue : done ? C.blueSoft : "white"}
              />
            </div>
          );
        })}
      </Paper>
    </Section>
  );
};

/* 3 ─ Kernel services, lit in step with the decision token */
const KERNEL = [
  { name: "Maestro™", verb: "decides", g: "M", c: C.navy, node: "maestro" },
  { name: "Guardian™", verb: "gates", g: "G", c: C.blue, node: "guardian" },
  { name: "Cortex", verb: "remembers", g: "Cx", c: C.teal, node: "signal" },
  { name: "VeloxCore™", verb: "serves models", g: "V", c: C.violet, node: "plugin" },
  { name: "Lens", verb: "observes", g: "L", c: C.amber, node: "lens" },
  { name: "Forge", verb: "improves", g: "F", c: C.orange, node: "forge" },
] as const;

export const Kernel: React.FC<{ box: Box }> = ({ box }) => {
  const frame = useCurrentFrame();
  const s = ENTER(3);
  const L = lifecycleAt(frame);
  const cw = (box.w - 24 - 8) / 2;
  return (
    <Section n={3} title="Kernel Services" box={box}>
      {KERNEL.map((k, i) => {
        const e = pop(frame, s + 6 + i * 2);
        const g = L.glow(k.node);
        return (
          <Paper
            key={k.name}
            style={{
              left: 12 + (i % 2) * (cw + 8),
              top: 52 + Math.floor(i / 2) * 46,
              width: cw,
              height: 40,
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "0 9px",
              boxSizing: "border-box",
              transform: `scale(${e * (1 + g * 0.04)})`,
              border: `1.5px solid color-mix(in srgb, ${k.c} ${Math.round(g * 100)}%, ${C.paperLine})`,
              boxShadow: g > 0 ? `0 0 ${12 * g}px color-mix(in srgb, ${k.c} 30%, transparent)` : undefined,
            }}
          >
            <Glyph text={k.g} color={k.c} />
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: C.ink, lineHeight: 1.1 }}>{k.name}</div>
              <div style={{ fontSize: 10.5, color: C.sub }}>{k.verb}</div>
            </div>
          </Paper>
        );
      })}
      <div style={{ position: "absolute", left: 0, right: 0, top: 197, textAlign: "center", fontSize: 12.5, color: C.sub, opacity: ease(frame, s + 20, s + 30) }}>
        Kernel owns decisions. Plug-ins own execution.
      </div>
    </Section>
  );
};

/* 5 ─ Engineering principles */
const PRINCIPLES = [
  "Kernel owns decisions",
  "Policy before execution",
  "Deterministic first",
  "Multi-model, runtime-routed",
  "One codebase, every topology",
  "Every trace labelled by outcome",
  "Interfaces over vendors",
];

export const Principles: React.FC<{ box: Box }> = ({ box }) => {
  const frame = useCurrentFrame();
  const s = ENTER(5);
  const active = loopIndex(frame, 7);
  return (
    <Section n={5} title="Engineering Principles" box={box}>
      {PRINCIPLES.map((p, i) => {
        const e = ease(frame, s + 6 + i * 3, s + 14 + i * 3);
        const on = i === active;
        return (
          <Paper
            key={p}
            style={{
              left: 12,
              top: 54 + i * 40,
              width: box.w - 24,
              height: 33,
              display: "flex",
              alignItems: "center",
              gap: 9,
              padding: "0 10px",
              boxSizing: "border-box",
              opacity: e,
              transform: `translateY(${(1 - e) * 8}px)`,
              border: on ? `2px solid ${C.orange}` : `1px solid ${C.paperLine}`,
              boxShadow: on ? "0 0 0 3px rgba(254,119,44,0.15)" : undefined,
            }}
          >
            <div
              style={{
                width: 19,
                height: 19,
                borderRadius: 10,
                border: `1.3px solid ${C.ink}`,
                fontSize: 10.5,
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: C.ink,
                flexShrink: 0,
              }}
            >
              {i + 1}
            </div>
            <div style={{ flex: 1, fontSize: 12.5, fontWeight: 500, color: C.ink }}>{p}</div>
            <Check on={pop(frame, s + 22 + i * 4, 12)} color={on ? C.orange : C.ink} />
          </Paper>
        );
      })}
    </Section>
  );
};

/* 6 ─ Model routing: cascade with early exit, residency wins */
const TIERS = [
  { t: "T0", name: "Deterministic", where: "always local" },
  { t: "T1", name: "Small domain models", where: "local GPU/CPU" },
  { t: "T2", name: "Large open-weight", where: "client / India GPU" },
  { t: "T3", name: "Frontier APIs", where: "cloud" },
];
const REQUESTS = [
  { label: "disposition · public", stop: 0, lock: false },
  { label: "negotiation · bank-restricted", stop: 2, lock: true },
  { label: "hard reasoning · public", stop: 3, lock: false },
];

export const Routing: React.FC<{ box: Box }> = ({ box }) => {
  const frame = useCurrentFrame();
  const s = ENTER(6);
  const { n, t } = cycleOf(frame);
  const req = REQUESTS[Math.max(0, n) % 3];
  const step = t < 0 ? -1 : Math.floor((t - 10) / 14);
  const reached = t < 0 ? -1 : Math.min(req.stop, step);
  const typed = t < 0 ? req.label.length : Math.round(interpolate(t, [0, 10], [0, req.label.length], { extrapolateRight: "clamp" }));
  return (
    <Section n={6} title="Model Routing" box={box}>
      <Paper
        style={{
          left: 12,
          top: 52,
          width: box.w - 24,
          height: 30,
          display: "flex",
          alignItems: "center",
          gap: 7,
          padding: "0 10px",
          boxSizing: "border-box",
          opacity: ease(frame, s + 6, s + 14),
        }}
      >
        <svg width={12} height={12} viewBox="0 0 12 12">
          <circle cx={5} cy={5} r={3.6} stroke={C.sub} strokeWidth={1.4} fill="none" />
          <path d="M7.8 7.8 L11 11" stroke={C.sub} strokeWidth={1.4} strokeLinecap="round" />
        </svg>
        <span style={{ fontFamily: monoStack, fontSize: 11, color: C.ink }}>
          {req.label.slice(0, typed)}
          <span style={{ opacity: Math.floor(frame / 8) % 2 ? 1 : 0, color: C.orange }}>|</span>
        </span>
      </Paper>
      {TIERS.map((tier, i) => {
        const e = ease(frame, s + 10 + i * 3, s + 18 + i * 3);
        const lit = i <= reached;
        const served = lit && i === req.stop && t >= 10 + req.stop * 14 + 6;
        const locked = req.lock && i === 3 && t >= 0;
        return (
          <Paper
            key={tier.t}
            style={{
              left: 12,
              top: 90 + i * 37,
              width: box.w - 24,
              height: 31,
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "0 9px",
              boxSizing: "border-box",
              opacity: e * (locked ? 0.55 : 1),
              border: `1.5px solid ${served ? C.green : lit ? C.blue : C.paperLine}`,
              background: served ? "#ECFBF1" : C.paper,
            }}
          >
            <div style={{ background: lit ? C.blue : C.ink, color: "white", fontSize: 10, fontWeight: 700, borderRadius: 5, padding: "2px 5px" }}>{tier.t}</div>
            <div style={{ flex: 1, fontSize: 12, fontWeight: 600, color: C.ink, whiteSpace: "nowrap" }}>{tier.name}</div>
            {locked ? (
              <Chip text="residency lock" color="white" bg={C.red} />
            ) : served ? (
              <Chip text="served" color="white" bg={C.green} />
            ) : (
              <span style={{ fontSize: 10, color: C.sub, whiteSpace: "nowrap" }}>{tier.where}</span>
            )}
          </Paper>
        );
      })}
    </Section>
  );
};

/* 7 ─ Deployment topologies */
const TOPOS = [
  { name: "Cloud", tiers: "T0–3", who: "Fintechs" },
  { name: "VPC", tiers: "T0–2", who: "NBFCs" },
  { name: "On-prem", tiers: "T0–2", who: "Pilot" },
  { name: "Air-gap", tiers: "offline", who: "Banks" },
];

export const Topologies: React.FC<{ box: Box }> = ({ box }) => {
  const frame = useCurrentFrame();
  const s = ENTER(7);
  const active = loopIndex(frame, 4) < 0 ? 2 : loopIndex(frame, 4);
  const inner = box.w - 24;
  const cw = (inner - 24 - 3 * 7) / 4;
  return (
    <Section n={7} title="Deployment" box={box}>
      <Paper style={{ left: 12, top: 52, width: inner, height: 140, padding: "10px 12px", boxSizing: "border-box" }}>
        <div style={smallCaps}>ONE BUILD, FOUR TOPOLOGIES</div>
        <div style={{ display: "flex", gap: 7, marginTop: 10 }}>
          {TOPOS.map((tp, i) => {
            const e = pop(frame, s + 8 + i * 3);
            const on = i === active;
            return (
              <div key={tp.name} style={{ width: cw, textAlign: "center", transform: `scale(${e})` }}>
                <div
                  style={{
                    height: 40,
                    borderRadius: 9,
                    border: `1.5px solid ${on ? C.ink : C.paperLine}`,
                    background: on ? C.ink : "white",
                    color: on ? "white" : C.ink,
                    fontSize: 11.5,
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {tp.name}
                </div>
                <div style={{ fontSize: 10.5, fontWeight: 600, color: on ? C.blue : C.sub, marginTop: 6 }}>{tp.tiers}</div>
                <div style={{ fontSize: 10, color: C.faint, marginTop: 2 }}>{tp.who}</div>
              </div>
            );
          })}
        </div>
      </Paper>
      <div style={{ position: "absolute", left: 12, top: 202, width: inner, display: "flex", gap: 8, opacity: ease(frame, s + 20, s + 30) }}>
        <div style={{ flex: 1.2, height: 32, borderRadius: 9, background: C.paper, border: `1px solid ${C.paperLine}`, fontSize: 12, color: C.ink, display: "flex", alignItems: "center", justifyContent: "center" }}>
          Same build, new config
        </div>
        <div style={{ flex: 1, height: 32, borderRadius: 9, background: "#DCCFBF", border: `1px solid #CBBCA8`, fontSize: 12, fontWeight: 600, color: C.ink, display: "flex", alignItems: "center", justifyContent: "center" }}>
          Never a fork
        </div>
      </div>
    </Section>
  );
};

/* 8 ─ Kernel rules */
const RULES = [
  "01 Maestro proposes, Guardian disposes",
  "02 VeloxCore never sees business rules",
  "03 Forge writes only to the registry",
  "04 Plug-ins never call each other",
  "05 Build decisions, plug in bytes",
];

export const Rules: React.FC<{ box: Box }> = ({ box }) => {
  const frame = useCurrentFrame();
  const s = ENTER(8);
  const active = Math.max(0, loopIndex(frame, 5));
  return (
    <Section n={8} title="Boundaries" box={box}>
      <Paper style={{ left: 12, top: 52, width: box.w - 24, height: box.h - 64, padding: "11px 12px", boxSizing: "border-box" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          {[C.red, "#F5B100", C.green].map((c) => (
            <div key={c} style={{ width: 8, height: 8, borderRadius: 4, background: c }} />
          ))}
          <span style={{ fontFamily: monoStack, fontSize: 13, fontWeight: 600, color: C.ink, marginLeft: 6 }}>kernel.rules</span>
        </div>
        <div style={{ marginTop: 8 }}>
          {RULES.map((r, i) => {
            const chars = Math.round(interpolate(frame, [s + 8 + i * 5, s + 22 + i * 5], [0, r.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
            const on = i === active;
            return (
              <div
                key={r}
                style={{
                  fontFamily: monoStack,
                  fontSize: 10.8,
                  color: C.ink,
                  height: 23,
                  lineHeight: "23px",
                  padding: "0 5px",
                  borderRadius: 4,
                  background: on && frame >= s + 40 ? "#F6E7D5" : "transparent",
                  whiteSpace: "nowrap",
                }}
              >
                {r.slice(0, chars)}
              </div>
            );
          })}
          <div style={{ fontSize: 10, color: C.sub, marginTop: 4, paddingLeft: 5, opacity: ease(frame, s + 40, s + 50) }}>
            · every vendor has a tested alternative
          </div>
        </div>
      </Paper>
    </Section>
  );
};

/* 9 ─ Roadmap */
const PHASES = [
  { title: "Kernel + on-prem", when: "Oct – Dec 2026", items: ["Plug-in contract, Conversa refactor", "Guardian engine, router v1"], gate: "Gate: fintech pilot live" },
  { title: "Platform GA", when: "Jan – Jun 2027", items: ["Plug-in SDK, decision authority", "Cortex memory, SOC 2 + ISO"], gate: "Gate: 2 more plug-ins live" },
  { title: "Learning OS", when: "Jul – Dec 2027", items: ["Forge adapters, reward models", "MCP server and marketplace"], gate: "Gate: Forge gains measured" },
];

export const Roadmap: React.FC<{ box: Box }> = ({ box }) => {
  const frame = useCurrentFrame();
  const s = ENTER(9);
  const colW = (box.w - 24 - 2 * 10) / 3;
  const trackY = 150;
  const x0 = 12 + colW / 2;
  const x2 = 12 + 2 * (colW + 10) + colW / 2;
  const prog = interpolate(frame, [LOOP_START, DURATION - 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const fillX = x0 + (x2 - x0) * prog;
  return (
    <Section n={9} title="Engineering Roadmap" box={box}>
      <div style={{ position: "absolute", right: 14, top: 16, fontSize: 11, color: C.sub, opacity: ease(frame, s + 10, s + 20) }}>
        Oct 2026 → Dec 2027 · one gate per phase
      </div>
      {PHASES.map((p, i) => {
        const e = pop(frame, s + 6 + i * 3);
        const cx = 12 + i * (colW + 10) + colW / 2;
        const reached = frame >= LOOP_START && fillX >= cx - 1;
        return (
          <div key={p.title}>
            <Paper
              style={{
                left: 12 + i * (colW + 10),
                top: 48,
                width: colW,
                height: 84,
                padding: "8px 11px",
                boxSizing: "border-box",
                transform: `scale(${e})`,
                border: i === 0 ? `2px solid ${C.blue}` : `1px solid ${C.paperLine}`,
                background: i === 0 ? "#F0F6FF" : C.paper,
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 600, color: C.ink, whiteSpace: "nowrap" }}>
                {i + 1}. {p.title}
              </div>
              <div style={{ fontSize: 10, color: i === 0 ? C.blue : C.sub, fontWeight: i === 0 ? 600 : 400, marginBottom: 2 }}>
                {p.when}
                {i === 0 ? "  ·  NOW" : ""}
              </div>
              {p.items.map((it) => (
                <div key={it} style={{ fontSize: 10.8, color: C.ink, marginTop: 3, whiteSpace: "nowrap" }}>
                  {it}
                </div>
              ))}
            </Paper>
            <div
              style={{
                position: "absolute",
                left: cx - 8,
                top: trackY - 8,
                width: 16,
                height: 16,
                transform: `rotate(45deg) scale(${e * (reached ? 1.15 : 1)})`,
                background: reached ? C.blue : C.paper,
                border: `1.8px solid ${reached ? C.blue : "#B3A795"}`,
                borderRadius: 2,
                zIndex: 2,
              }}
            />
            <div style={{ position: "absolute", left: cx - colW / 2, width: colW, top: trackY + 13, textAlign: "center", fontSize: 11, fontWeight: reached ? 600 : 400, color: reached ? C.ink : C.sub, opacity: e }}>
              {p.gate}
            </div>
          </div>
        );
      })}
      <div style={{ position: "absolute", left: x0, top: trackY - 1, width: (x2 - x0) * ease(frame, s + 10, s + 24), height: 2, background: "#C4B8A8" }} />
      <div style={{ position: "absolute", left: x0, top: trackY - 1.5, width: fillX - x0, height: 3, background: C.blue, borderRadius: 2 }} />
      {frame >= LOOP_START ? (
        <div style={{ position: "absolute", left: fillX - 5, top: trackY - 5, width: 10, height: 10, borderRadius: 5, background: C.orange, boxShadow: "0 0 0 4px rgba(254,119,44,0.25)", zIndex: 3 }} />
      ) : null}
    </Section>
  );
};

/* 10 ─ Non-functional targets */
const NFR = ["99.9% cloud availability", "Never lost, never sent twice", "Any decision explainable by ID", "DPDP erasure, incl. training data"];

export const Targets: React.FC<{ box: Box }> = ({ box }) => {
  const frame = useCurrentFrame();
  const s = ENTER(10);
  const active = loopIndex(frame, 4);
  return (
    <Section n={10} title="Targets" box={box}>
      <Paper style={{ left: 12, top: 52, width: box.w - 24, height: box.h - 64, padding: "9px 12px", boxSizing: "border-box" }}>
        <div style={smallCaps}>NON-FUNCTIONAL TARGETS</div>
        {NFR.map((r, i) => (
          <div
            key={r}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              height: 24,
              borderTop: i ? `1px solid ${C.paperLine}` : undefined,
              marginTop: i ? 0 : 5,
            }}
          >
            <Check on={pop(frame, s + 10 + i * 5, 12)} color={i === active ? C.blue : C.red} size={15} />
            <span style={{ fontSize: 12, color: C.ink, fontWeight: i === active ? 600 : 400 }}>{r}</span>
          </div>
        ))}
      </Paper>
    </Section>
  );
};
