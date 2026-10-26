import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { sansStack } from "../RevenueOS/fonts";
import { Contract, Kernel, Plugins, Principles, Roadmap, Routing, Rules, Targets, Topologies } from "./Cards";
import { Lifecycle } from "./Lifecycle";
import { C, ease, pop } from "./theme";
import type { Box } from "./ui";

// 1080 × 1350 (LinkedIn 4:5), 40px gutters, 20px gaps, four rows of cards
const COL = (x: number, w: number, y: number, h: number): Box => ({ x, y, w, h });
const A = { y: 166, h: 232 };
const B = { y: 418, h: 350 };
const Cr = { y: 788, h: 252 };
const D = { y: 1060, h: 194 };

const Title: React.FC = () => {
  const frame = useCurrentFrame();
  const words = ["Inside", "TheVertical.ai’s"];
  const accent = ["Enterprise", "OS"];
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 34, textAlign: "center" }}>
      <div style={{ fontSize: 54, fontWeight: 600, letterSpacing: -1.8, color: C.ink, lineHeight: 1.1 }}>
        {[...words, ...accent].map((w, i) => {
          const p = pop(frame, i * 3, 14);
          return (
            <span
              key={w}
              style={{
                display: "inline-block",
                marginRight: 14,
                color: i >= words.length ? C.orange : C.ink,
                opacity: Math.min(1, p * 1.5),
                transform: `translateY(${(1 - p) * 24}px)`,
              }}
            >
              {w}
            </span>
          );
        })}
      </div>
      <div style={{ fontSize: 19, color: "#3C3833", marginTop: 12, opacity: ease(frame, 10, 22) }}>
        One governed kernel decides, executes and learns. Every capability plugs in through one contract.
      </div>
    </div>
  );
};

const Footer: React.FC = () => {
  const frame = useCurrentFrame();
  const p = pop(frame, 110, 18);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 86, background: C.ink, transform: `translateY(${(1 - p) * 86}px)` }}>
      <div style={{ position: "absolute", left: 40, top: 22, height: 42, display: "flex", alignItems: "center", gap: 18 }}>
        <Img src={staticFile("images/logo-white.png")} style={{ height: 34 }} />
        <div style={{ background: "white", borderRadius: 21, padding: "9px 18px", display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 16, fontWeight: 600, color: C.ink }}>Enterprise OS</span>
          <span style={{ fontSize: 13, color: C.sub, background: "#EFE8DE", padding: "3px 10px", borderRadius: 11 }}>Engineering Architecture</span>
        </div>
      </div>
      <div style={{ position: "absolute", right: 40, top: 32, fontSize: 15, color: "rgba(255,255,255,0.7)" }}>
        The unit of work is a governed decision.
      </div>
    </div>
  );
};

export const TVAArchitecture: React.FC = () => (
  <AbsoluteFill style={{ background: C.bg, fontFamily: sansStack }}>
    <Title />
    <Plugins box={COL(40, 320, A.y, A.h)} />
    <Contract box={COL(380, 320, A.y, A.h)} />
    <Kernel box={COL(720, 320, A.y, A.h)} />
    <Lifecycle box={COL(40, 660, B.y, B.h)} />
    <Principles box={COL(720, 320, B.y, B.h)} />
    <Routing box={COL(40, 320, Cr.y, Cr.h)} />
    <Topologies box={COL(380, 320, Cr.y, Cr.h)} />
    <Rules box={COL(720, 320, Cr.y, Cr.h)} />
    <Roadmap box={COL(40, 660, D.y, D.h)} />
    <Targets box={COL(720, 320, D.y, D.h)} />
    <Footer />
  </AbsoluteFill>
);
