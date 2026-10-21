import { useCurrentFrame } from "remotion";
import { sp } from "../anim";
import { COPY } from "../copy";
import { monoStack } from "../fonts";
import { C } from "../theme";
import { T } from "../timeline";
import { W } from "../world";
import { Appear, Glass, Label } from "./primitives";

// What the OS just did, and the rule it did it under, line by line as it happens
const RAIL = { x: 1950, y: 130, w: 330, h: 920 };

export const ActionRail: React.FC = () => {
  const frame = useCurrentFrame();
  const lit = 0.3 + 0.7 * sp(frame, T.priyaLit, 16);
  const at = [T.priyaLit, T.numberSnap, T.warmChip, T.reply1 - 3, T.reply1, T.msgHindi + 6, T.replyHindi, T.land[2], T.hot];
  return (
    <Glass style={{ left: RAIL.x, top: RAIL.y, width: RAIL.w, height: RAIL.h, padding: "24px 22px", opacity: lit }}>
      <Label style={{ fontSize: 13 }}>{COPY.railLabel}</Label>
      <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
        {COPY.rail.map((item, i) => {
          const policy = item.startsWith("Policy");
          const active = frame >= at[i] && (i === COPY.rail.length - 1 || frame < at[i + 1]);
          return (
            <Appear key={item} at={at[i]} dx={-18} dy={0}>
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  alignItems: "flex-start",
                  padding: "10px 12px",
                  borderRadius: 12,
                  background: active ? "rgba(254,119,44,0.18)" : "rgba(255,255,255,0.04)",
                  border: `1px solid ${policy ? "rgba(34,197,94,0.45)" : active ? "rgba(254,119,44,0.6)" : "rgba(255,255,255,0.06)"}`,
                }}
              >
                <div style={{ width: 8, height: 8, borderRadius: 8, marginTop: 7, flex: "none", background: policy ? C.green : C.orange }} />
                <div>
                  <div style={{ fontFamily: monoStack, fontSize: 13, color: C.textDim }}>{COPY.railTimes[i]}</div>
                  <div style={{ fontSize: 18, lineHeight: 1.3, color: C.text }}>{item}</div>
                </div>
              </div>
            </Appear>
          );
        })}
      </div>
    </Glass>
  );
};

export { RAIL };
// Keep the rail clear of the phone
if (RAIL.x + RAIL.w > W.phone.x - 20) throw new Error("rail overlaps phone");
