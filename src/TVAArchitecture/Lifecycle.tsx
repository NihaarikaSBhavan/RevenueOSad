import { interpolate, useCurrentFrame } from "remotion";
import { C, CYCLE, cycleOf, ease, ENTER, pop } from "./theme";
import { Box, Chip, Section } from "./ui";

// Node geometry, relative to the section box (660 × 350)
const NW = 100;
const NH = 52;
const ROW1 = 124;
const ROW2 = 238;
const LOOP_Y = 86;
const LOOP_X = 648;

type NodeKey = "signal" | "maestro" | "guardian" | "plugin" | "lens" | "blocked" | "human" | "forge";

const NODES: Record<NodeKey, { cx: number; cy: number; title: string; sub: string }> = {
  signal: { cx: 66, cy: ROW1 + NH / 2, title: "Signal", sub: "Cortex event" },
  maestro: { cx: 192, cy: ROW1 + NH / 2, title: "Maestro™", sub: "proposes action" },
  guardian: { cx: 324, cy: ROW1 + NH / 2, title: "Guardian™", sub: "verdict" },
  plugin: { cx: 456, cy: ROW1 + NH / 2, title: "Plug-in runs", sub: "e.g. Conversa" },
  lens: { cx: 582, cy: ROW1 + NH / 2, title: "Lens records", sub: "trace + outcome" },
  blocked: { cx: 192, cy: ROW2 + NH / 2, title: "Blocked", sub: "reason logged" },
  human: { cx: 324, cy: ROW2 + NH / 2, title: "Human approves", sub: "via AssistAI™" },
  forge: { cx: 582, cy: ROW2 + NH / 2, title: "Forge", sub: "labels, trains" },
};

type Way = { t: number; x: number; y: number; node?: NodeKey };
const at = (t: number, node: NodeKey): Way => ({ t, x: NODES[node].cx, y: NODES[node].cy, node });

const LOOP_BACK = (t0: number): Way[] => [
  { t: t0, x: LOOP_X, y: NODES.forge.cy },
  { t: t0 + 6, x: LOOP_X, y: LOOP_Y },
  { t: t0 + 14, x: NODES.maestro.cx, y: LOOP_Y },
  { t: t0 + 18, x: NODES.maestro.cx, y: ROW1 },
];

export const VARIANTS = ["allow", "needs approval", "deny"] as const;

const ROUTES: Way[][] = [
  [at(0, "signal"), at(12, "maestro"), at(24, "guardian"), at(36, "guardian"), at(48, "plugin"), at(60, "lens"), at(72, "forge"), ...LOOP_BACK(78)],
  [
    at(0, "signal"),
    at(12, "maestro"),
    at(24, "guardian"),
    at(36, "guardian"),
    at(46, "human"),
    at(52, "human"),
    { t: 60, x: NODES.plugin.cx, y: NODES.human.cy },
    at(66, "plugin"),
    at(74, "lens"),
    at(80, "forge"),
    { t: 84, x: LOOP_X, y: NODES.forge.cy },
    { t: 88, x: LOOP_X, y: LOOP_Y },
    { t: 95, x: NODES.maestro.cx, y: LOOP_Y },
    { t: 98, x: NODES.maestro.cx, y: ROW1 },
  ],
  [at(0, "signal"), at(12, "maestro"), at(24, "guardian"), at(36, "guardian"), at(50, "blocked"), at(CYCLE, "blocked")],
];

/** Where the decision token is and which nodes it has just lit, for the frame. */
export const lifecycleAt = (frame: number) => {
  const { n, t } = cycleOf(frame);
  if (n < 0) return { n, t, variant: -1, x: 0, y: 0, glow: (_k: NodeKey) => 0 };
  const variant = n % 3;
  const route = ROUTES[variant];
  let x = route[route.length - 1].x;
  let y = route[route.length - 1].y;
  for (let i = 0; i < route.length - 1; i++) {
    const a = route[i];
    const b = route[i + 1];
    if (t >= a.t && t <= b.t) {
      const k = b.t === a.t ? 1 : interpolate(t, [a.t, b.t], [0, 1], { easing: (v) => v * v * (3 - 2 * v) });
      x = a.x + (b.x - a.x) * k;
      y = a.y + (b.y - a.y) * k;
      break;
    }
  }
  const glow = (key: NodeKey) => {
    const hits = route.filter((w) => w.node === key && w.t <= t);
    if (!hits.length) return 0;
    const first = hits[0].t;
    const hold = variant === 2 && key === "blocked" ? CYCLE : 28;
    return interpolate(t - first, [0, 4, hold - 8, hold], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  };
  return { n, t, variant, x, y, glow };
};

const Node: React.FC<{ k: NodeKey; glow: number; tint: string; enter: number }> = ({ k, glow, tint, enter }) => {
  const nd = NODES[k];
  return (
    <div
      style={{
        position: "absolute",
        left: nd.cx - NW / 2,
        top: nd.cy - NH / 2,
        width: NW,
        height: NH,
        background: glow > 0 ? `color-mix(in srgb, ${tint} ${Math.round(glow * 12)}%, ${C.paper})` : C.paper,
        border: `1.5px solid color-mix(in srgb, ${tint} ${Math.round(glow * 100)}%, ${C.paperLine})`,
        borderRadius: 10,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        transform: `scale(${enter * (1 + glow * 0.05)})`,
        boxShadow: glow > 0 ? `0 0 ${14 * glow}px color-mix(in srgb, ${tint} 35%, transparent)` : "none",
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 600, color: C.ink, whiteSpace: "nowrap" }}>{nd.title}</div>
      <div style={{ fontSize: 10.5, color: C.sub, marginTop: 1, whiteSpace: "nowrap" }}>{nd.sub}</div>
    </div>
  );
};

const Edge: React.FC<{ d: string; draw: number; label?: string; lx?: number; ly?: number; hot?: number; color?: string }> = ({
  d,
  draw,
  label,
  lx = 0,
  ly = 0,
  hot = 0,
  color = C.blue,
}) => (
  <>
    <path
      d={d}
      pathLength={1}
      strokeDasharray="1 1"
      strokeDashoffset={1 - draw}
      stroke={hot > 0 ? `color-mix(in srgb, ${color} ${Math.round(hot * 100)}%, #C4B8A8)` : "#C4B8A8"}
      strokeWidth={1.6 + hot}
      fill="none"
      markerEnd={draw > 0.95 ? "url(#arrow)" : undefined}
    />
    {label ? (
      <text x={lx} y={ly} fontSize={11} fill={hot > 0 ? color : C.sub} fontWeight={hot > 0 ? 600 : 400} opacity={draw}>
        {label}
      </text>
    ) : null}
  </>
);

export const Lifecycle: React.FC<{ box: Box }> = ({ box }) => {
  const frame = useCurrentFrame();
  const s = ENTER(4);
  const L = lifecycleAt(frame);
  const enter = (i: number) => pop(frame, s + 6 + i * 3);
  const draw = (i: number) => ease(frame, s + 14 + i * 3, s + 30 + i * 3);
  const v = L.variant;
  const verdictT = L.t >= 30 ? 1 : 0;
  const hot = (variant: number, from: number, to: number) => (v === variant && L.t >= from && L.t <= to ? 1 : 0);
  const verdictColor = v === 0 ? C.green : v === 1 ? C.amber : C.red;
  const nodeW = NW / 2;
  const id = 20481 + Math.max(0, L.n);

  return (
    <Section n={4} title="Decision Lifecycle" box={box}>
      <div style={{ position: "absolute", right: 14, top: 14, display: "flex", gap: 6, alignItems: "center" }}>
        <Chip text={`decision #D-${id}`} color={C.ink} style={{ fontFamily: "IBM Plex Mono", fontSize: 11 }} />
      </div>
      <svg width={box.w} height={box.h} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        <defs>
          <marker id="arrow" viewBox="0 0 8 8" refX={7} refY={4} markerWidth={7} markerHeight={7} orient="auto-start-reverse">
            <path d="M0 0 L8 4 L0 8 z" fill="#B3A795" />
          </marker>
        </defs>
        <Edge d={`M${NODES.signal.cx + nodeW} ${NODES.signal.cy} H${NODES.maestro.cx - nodeW - 2}`} draw={draw(0)} hot={v >= 0 && L.t <= 14 ? 1 : 0} />
        <Edge d={`M${NODES.maestro.cx + nodeW} ${NODES.maestro.cy} H${NODES.guardian.cx - 58}`} draw={draw(1)} hot={v >= 0 && L.t >= 12 && L.t <= 26 ? 1 : 0} />
        <Edge
          d={`M${NODES.guardian.cx + 58} ${NODES.guardian.cy} H${NODES.plugin.cx - nodeW - 2}`}
          draw={draw(2)}
          label="allow"
          lx={NODES.guardian.cx + 46}
          ly={NODES.guardian.cy - 14}
          hot={hot(0, 34, 50)}
          color={C.green}
        />
        <Edge
          d={`M${NODES.guardian.cx - 30} ${NODES.guardian.cy + 22} L${NODES.blocked.cx + 22} ${NODES.blocked.cy - NH / 2 - 2}`}
          draw={draw(3)}
          label="deny"
          lx={NODES.guardian.cx - 72}
          ly={NODES.guardian.cy + 52}
          hot={hot(2, 34, 100)}
          color={C.red}
        />
        <Edge
          d={`M${NODES.guardian.cx} ${NODES.guardian.cy + 36} V${NODES.human.cy - NH / 2 - 2}`}
          draw={draw(4)}
          label="needs approval"
          lx={NODES.guardian.cx + 8}
          ly={NODES.guardian.cy + 58}
          hot={hot(1, 34, 48)}
          color={C.amber}
        />
        <Edge
          d={`M${NODES.human.cx + nodeW} ${NODES.human.cy} H${NODES.plugin.cx} V${NODES.plugin.cy + NH / 2 + 2}`}
          draw={draw(5)}
          hot={hot(1, 50, 68)}
          color={C.amber}
        />
        <Edge d={`M${NODES.plugin.cx + nodeW} ${NODES.plugin.cy} H${NODES.lens.cx - nodeW - 2}`} draw={draw(6)} hot={v !== 2 && v >= 0 && L.t >= 46 && L.t <= 76 ? 1 : 0} />
        <Edge d={`M${NODES.lens.cx} ${NODES.lens.cy + NH / 2} V${NODES.forge.cy - NH / 2 - 2}`} draw={draw(7)} hot={v !== 2 && v >= 0 && L.t >= 58 && L.t <= 82 ? 1 : 0} />
        <Edge
          d={`M${NODES.forge.cx + nodeW} ${NODES.forge.cy} H${LOOP_X} V${LOOP_Y} H${NODES.maestro.cx} V${ROW1 - 2}`}
          draw={draw(8)}
          label="better models, prompts and policies"
          lx={300}
          ly={LOOP_Y - 8}
          hot={v !== 2 && v >= 0 && L.t >= 76 ? 1 : 0}
          color={C.orange}
        />
      </svg>

      <Node k="signal" glow={L.glow("signal")} tint={C.teal} enter={enter(0)} />
      <Node k="maestro" glow={L.glow("maestro")} tint={C.navy} enter={enter(1)} />
      <Node k="plugin" glow={L.glow("plugin")} tint={C.blue} enter={enter(3)} />
      <Node k="lens" glow={L.glow("lens")} tint={C.amber} enter={enter(4)} />
      <Node k="blocked" glow={L.glow("blocked")} tint={C.red} enter={enter(5)} />
      <Node k="human" glow={L.glow("human")} tint={C.amber} enter={enter(6)} />
      <Node k="forge" glow={L.glow("forge")} tint={C.orange} enter={enter(7)} />

      {/* Guardian diamond */}
      <div
        style={{
          position: "absolute",
          left: NODES.guardian.cx - 58,
          top: NODES.guardian.cy - 37,
          width: 116,
          height: 74,
          transform: `scale(${enter(2) * (1 + L.glow("guardian") * 0.06)})`,
        }}
      >
        <svg width={116} height={74} style={{ position: "absolute" }}>
          <path d="M58 2 L114 37 L58 72 L2 37 Z" fill={C.blueSoft} stroke={C.blue} strokeWidth={2} strokeLinejoin="round" />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>Guardian™</div>
          <div
            style={{
              fontSize: 10,
              fontWeight: 600,
              marginTop: 2,
              color: verdictT && v >= 0 ? "white" : C.sub,
              background: verdictT && v >= 0 ? verdictColor : "transparent",
              borderRadius: 6,
              padding: "1px 6px",
            }}
          >
            {verdictT && v >= 0 ? VARIANTS[v] : "verdict"}
          </div>
        </div>
      </div>

      {/* The decision token */}
      {v >= 0 ? (
        <div
          style={{
            position: "absolute",
            left: L.x - 7,
            top: L.y - 7,
            width: 14,
            height: 14,
            borderRadius: 7,
            background: v === 2 && L.t > 44 ? C.red : C.orange,
            boxShadow: `0 0 0 4px ${v === 2 && L.t > 44 ? "rgba(229,72,77,0.25)" : "rgba(254,119,44,0.25)"}, 0 0 16px rgba(254,119,44,0.6)`,
            opacity: interpolate(L.t, [0, 4, 94, 100], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          }}
        />
      ) : null}

      <div
        style={{
          position: "absolute",
          left: 16,
          right: 16,
          bottom: 14,
          fontSize: 13,
          color: C.sub,
          textAlign: "center",
          opacity: ease(frame, s + 30, s + 42),
        }}
      >
        No action runs until Guardian™ rules. One ID answers who decided, which policy, which model, what result.
      </div>
    </Section>
  );
};
