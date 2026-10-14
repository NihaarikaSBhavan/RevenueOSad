import type { ReactNode } from "react";
import { useCurrentFrame } from "remotion";
import { sp } from "../anim";
import { COPY } from "../copy";
import { monoStack } from "../fonts";
import { C } from "../theme";
import { T } from "../timeline";
import { W } from "../world";
import { Appear, Chip } from "./primitives";

// Generic messaging green (no official palette or logos)
export const CHAT_GREEN = "#1E7F5C";
const OUT_BUBBLE = "#164D3D";

export const Bubble: React.FC<{ at: number; out?: boolean; time?: string; children: ReactNode; note?: ReactNode }> = ({
  at,
  out,
  time = COPY.clock,
  children,
  note,
}) => (
  <Appear at={at} dx={out ? 30 : -30} dy={8} style={{ alignSelf: out ? "flex-end" : "flex-start", maxWidth: "84%" }}>
    <div
      style={{
        background: out ? OUT_BUBBLE : "rgba(255,255,255,0.12)",
        border: out ? `1px solid ${CHAT_GREEN}` : "1px solid rgba(255,255,255,0.1)",
        borderRadius: out ? "20px 20px 6px 20px" : "20px 20px 20px 6px",
        padding: "12px 16px 8px",
        fontSize: 21,
        lineHeight: 1.38,
      }}
    >
      {children}
      <div style={{ fontFamily: monoStack, fontSize: 13, color: C.textDim, textAlign: "right", marginTop: 4 }}>{time}</div>
    </div>
    {note}
  </Appear>
);

const RepliedBy: React.FC = () => (
  <div style={{ fontSize: 14, color: C.blue, fontWeight: 600, textAlign: "right", marginTop: 5, letterSpacing: 0.3 }}>
    {COPY.repliedBy}
  </div>
);

const Typing: React.FC<{ from: number; to: number }> = ({ from, to }) => {
  const frame = useCurrentFrame();
  if (frame < from || frame >= to) return null;
  return (
    <div style={{ alignSelf: "flex-end", display: "flex", gap: 6, padding: "14px 18px", borderRadius: 20, background: OUT_BUBBLE }}>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{ width: 9, height: 9, borderRadius: 9, background: C.textDim, opacity: 0.4 + 0.6 * Math.abs(Math.sin((frame + i * 4) / 4)) }} />
      ))}
    </div>
  );
};

export const PhoneFrame: React.FC<{ x: number; y: number; w: number; h: number; title: string; sub: string; children: ReactNode; glow?: number }> = ({
  x,
  y,
  w,
  h,
  title,
  sub,
  children,
  glow = 0,
}) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: w,
      height: h,
      borderRadius: 52,
      background: "#0A1430",
      border: "1px solid rgba(255,255,255,0.14)",
      boxShadow: `0 40px 90px rgba(0,0,0,0.5), 0 0 ${80 * glow}px rgba(1,119,255,${0.35 * glow})`,
      overflow: "hidden",
      color: C.text,
    }}
  >
    <div style={{ background: CHAT_GREEN, padding: "34px 26px 18px", display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{ width: 46, height: 46, borderRadius: 46, background: "rgba(255,255,255,0.25)", display: "grid", placeItems: "center", fontWeight: 600 }}>
        PS
      </div>
      <div>
        <div style={{ fontSize: 22, fontWeight: 600 }}>{title}</div>
        <div style={{ fontSize: 15, opacity: 0.8, fontFamily: monoStack }}>{sub}</div>
      </div>
    </div>
    <div style={{ padding: "22px 20px", display: "flex", flexDirection: "column", gap: 14 }}>{children}</div>
  </div>
);

export const ChatPhone: React.FC = () => {
  const frame = useCurrentFrame();
  const glow = sp(frame, T.glideChat + 10, 18);
  const lit = 0.3 + 0.7 * sp(frame, T.glideChat + 6, 16);
  return (
    <div style={{ opacity: lit }}>
      <PhoneFrame x={W.phone.x} y={W.phone.y} w={W.phone.w} h={W.phone.h} title={COPY.chatHeader} sub={COPY.chatSub} glow={glow}>
        <Bubble at={T.msg1}>{COPY.msg1}</Bubble>
        <Typing from={T.typing} to={T.reply1} />
        <Bubble
          at={T.reply1}
          out
          note={
            <>
              <Appear at={T.rateChip} dy={10} dx={20} style={{ marginTop: 10, display: "flex", justifyContent: "flex-end" }}>
                <Chip color={C.blue} style={{ fontSize: 17 }}>
                  {COPY.rateChip}
                </Chip>
              </Appear>
              <RepliedBy />
            </>
          }
        >
          {COPY.reply1}
        </Bubble>
        <Bubble at={T.msgHindi}>{COPY.msgHindi}</Bubble>
        <Typing from={T.msgHindi + 8} to={T.replyHindi} />
        <Bubble at={T.replyHindi} out note={<RepliedBy />}>
          {COPY.replyHindi}
        </Bubble>
      </PhoneFrame>
      {/* 24/7: the reply landed at 2:47 AM */}
      <Appear at={T.chip247} from={0.5} dy={0} style={{ position: "absolute", left: W.phone.x + W.phone.w - 70, top: W.phone.y - 26 }}>
        <Chip color={C.blue} fill mono style={{ fontSize: 24, padding: "8px 18px" }}>
          {COPY.chip247}
        </Chip>
      </Appear>
    </div>
  );
};
