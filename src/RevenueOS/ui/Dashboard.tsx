import { useCurrentFrame } from "remotion";
import { mixColor, ramp, sp } from "../anim";
import { COPY } from "../copy";
import { monoStack } from "../fonts";
import { C } from "../theme";
import { T } from "../timeline";
import { W } from "../world";
import { Appear, Chip, Glass, Label } from "./primitives";

const LEADS = [
  { name: "Rahul K.", src: "Google ad", ago: "3h ago" },
  { name: "Sneha M.", src: "Website form", ago: "2h ago" },
  { name: "Vikram P.", src: "Facebook ad", ago: "1h ago" },
  { name: "Priya S.", src: "Instagram ad", ago: "4 min ago", focus: true },
  { name: "Ananya R.", src: "Instagram ad", ago: "48 min ago" },
  { name: "Karthik N.", src: "Google ad", ago: "1h ago" },
  { name: "Divya T.", src: "Website form", ago: "2h ago" },
];

const CARD_TOP = 190;
const CARD_STEP = 118;
const SCAN_FRAMES = 26;

/** Frame at which the scan line reaches a given dashboard y. */
const scanAt = (y: number) => T.scan + (y / W.dash.h) * SCAN_FRAMES;

export const Dashboard: React.FC = () => {
  const frame = useCurrentFrame();
  const count = 1247 + T.counter.filter((f) => frame >= f).length - 1;
  const bump = Math.max(...T.counter.map((f) => (frame >= f ? 1 - sp(frame, f, 14) : 0)));
  const scanY = -20 + (W.dash.h + 40) * ramp(frame, T.scan, T.scan + SCAN_FRAMES);
  const scanOn = frame >= T.scan - 2 && frame <= T.scan + SCAN_FRAMES + 6;

  // Once the camera follows Priya out, the dashboard steps back like every other station
  const away = 1 - 0.75 * sp(frame, T.glideChat, 18);
  return (
    <div style={{ position: "absolute", left: W.dash.x, top: W.dash.y, width: W.dash.w, height: W.dash.h, opacity: away }}>
      {/* Top bar */}
      <div style={{ position: "absolute", left: 120, top: 70, right: 120, display: "flex", justifyContent: "space-between", alignItems: "center", opacity: 1 - sp(frame, T.glideChat, 18) }}>
        <div style={{ fontSize: 30, fontWeight: 600, color: C.text }}>{COPY.dashTitle}</div>
        <div style={{ fontFamily: monoStack, fontSize: 34, fontWeight: 500, color: C.textDim }}>{COPY.clock}</div>
      </div>

      {/* Enquiry column */}
      {LEADS.map((lead, i) => {
        const top = CARD_TOP + i * CARD_STEP;
        const lit = sp(frame, scanAt(top + 50), 18);
        const isPriya = Boolean(lead.focus);
        const chipFade = ramp(frame, T.chipFade[0], T.chipFade[1]);
        const priyaLit = isPriya ? sp(frame, T.priyaLit, 15) : 0;
        return (
          <Glass
            key={lead.name}
            style={{
              left: 120,
              top,
              width: 700,
              height: 98,
              padding: "16px 24px",
              display: "flex",
              alignItems: "center",
              gap: 20,
              opacity: isPriya ? 1 : 0.55 + lit * 0.25,
              borderColor: isPriya && priyaLit > 0 ? mixColor("#2a3550", C.blue, priyaLit) : `rgba(1,119,255,${lit * 0.55})`,
              boxShadow: isPriya
                ? `0 0 ${60 * priyaLit}px rgba(1,119,255,${0.55 * priyaLit}), 0 24px 64px rgba(0,0,0,0.38)`
                : undefined,
              scale: isPriya ? String(1 + priyaLit * 0.03) : "1",
            }}
          >
            <div
              style={{
                width: 54,
                height: 54,
                borderRadius: 999,
                background: isPriya ? mixColor("#2b3651", C.blue, priyaLit) : "#2b3651",
                display: "grid",
                placeItems: "center",
                fontWeight: 600,
                fontSize: 20,
                flex: "none",
              }}
            >
              {lead.name.split(" ").map((p) => p[0]).join("")}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 23, fontWeight: 600, whiteSpace: "nowrap" }}>
                {isPriya ? COPY.priyaTitle : `${lead.name} · ${lead.src}`}
              </div>
              <div style={{ fontSize: 18, color: C.textDim, marginTop: 4, display: "flex", gap: 14, whiteSpace: "nowrap" }}>
                {isPriya ? <PriyaPhone /> : <span>{lead.ago}</span>}
                {isPriya && frame >= T.sourceStamp ? (
                  <Appear at={T.sourceStamp} from={1.5} dy={0} damping={14}>
                    <Chip color={C.blue} mono style={{ fontSize: 15, padding: "1px 10px" }}>
                      {COPY.sourceTag}
                    </Chip>
                  </Appear>
                ) : (
                  <span>{COPY.lastContact}</span>
                )}
              </div>
            </div>
            {isPriya ? (
              <PriyaChips chipFade={chipFade} />
            ) : (
              <Chip color={C.grey}>Cold</Chip>
            )}
          </Glass>
        );
      })}

      {/* Unanswered counter */}
      <Glass style={{ left: 900, top: 190, width: 900, height: 360, padding: 40 }}>
        <Label>{COPY.unanswered}</Label>
        <div
          style={{
            fontFamily: monoStack,
            fontSize: 150,
            fontWeight: 500,
            color: C.text,
            marginTop: 18,
            scale: String(1 + bump * 0.04),
            transformOrigin: "left center",
          }}
        >
          {count.toLocaleString("en-IN")}
        </div>
        <svg width="820" height="80" style={{ position: "absolute", left: 40, bottom: 30 }}>
          <path d="M0 70 C 120 66, 220 60, 330 52 S 560 34, 680 22 S 780 10, 820 6" stroke={C.grey} strokeWidth="3" fill="none" />
        </svg>
      </Glass>

      {/* Leads by source, all grey: nobody is working them */}
      <Glass style={{ left: 900, top: 590, width: 900, height: 340, padding: 40 }}>
        <Label>Paid leads by source · this week</Label>
        {[
          ["Instagram ad", 0.86],
          ["Google ad", 0.72],
          ["Facebook ad", 0.54],
          ["Website form", 0.38],
        ].map(([name, v], i) => (
          <div key={name as string} style={{ display: "flex", alignItems: "center", gap: 20, marginTop: i === 0 ? 30 : 22 }}>
            <div style={{ width: 200, fontSize: 20, color: C.textDim }}>{name}</div>
            <div style={{ flex: 1, height: 14, borderRadius: 7, background: "rgba(255,255,255,0.06)" }}>
              <div style={{ width: `${(v as number) * 100}%`, height: "100%", borderRadius: 7, background: C.grey, opacity: 0.6 }} />
            </div>
          </div>
        ))}
      </Glass>

      {/* Clinical line, bottom left */}
      <Appear at={T.clinical} dy={6} style={{ position: "absolute", left: 120, top: 1018 }}>
        <div style={{ fontFamily: monoStack, fontSize: 22, color: C.textDim, letterSpacing: 0.5 }}>{COPY.clinical}</div>
      </Appear>

      {/* Scan line: the OS switches on */}
      {scanOn && (
        <div
          style={{
            position: "absolute",
            left: -40,
            right: -40,
            top: scanY,
            height: 2,
            background: C.blue,
            boxShadow: `0 0 24px 6px rgba(1,119,255,0.7), 0 0 120px 30px rgba(1,119,255,0.25)`,
          }}
        />
      )}
    </div>
  );
};

const PriyaPhone: React.FC = () => {
  const frame = useCurrentFrame();
  const snapped = frame >= T.numberSnap;
  const pop = snapped ? 1 - sp(frame, T.numberSnap, 14) : 0;
  return (
    <span
      style={{
        fontFamily: monoStack,
        color: snapped ? C.text : C.textDim,
        scale: String(1 + pop * 0.15),
        display: "inline-block",
        transformOrigin: "left center",
      }}
    >
      {snapped ? COPY.phoneE164 : COPY.phoneRaw}
    </span>
  );
};

const PriyaChips: React.FC<{ chipFade: number }> = ({ chipFade }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
      {frame < T.warmChip ? (
        <Chip color={mixColor(C.orange, C.grey, chipFade)}>{chipFade > 0.6 ? "Cold" : "New"}</Chip>
      ) : (
        <Appear at={T.warmChip} from={0.6} dy={0}>
          <Chip color={C.blue} mono>
            {COPY.warm}
          </Chip>
        </Appear>
      )}
    </div>
  );
};
