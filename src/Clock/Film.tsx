import { Audio } from "@remotion/media";
import { AbsoluteFill, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { lerp, mixColor, ramp } from "../RevenueOS/anim";
import { sansStack } from "../RevenueOS/fonts";
import { Grain } from "../RevenueOS/ui/Background";
import { Answered, Arrive, Clicks, EndCard, Gap, GapChart, Grown, Leak, Wait, Weeks } from "./Scenes";
import { C, Q } from "./theme";

/** Navy with a blue glow through the cost; the base warms and the glow turns orange as the gap is zipped shut. */
const Backdrop: React.FC = () => {
  const frame = useCurrentFrame();
  const k = ramp(frame, Q.sweep, Q.sweep + 36);
  const base = mixColor(C.navy, C.warm, k);
  const rgb = [lerp(1, 254, k), lerp(119, 119, k), lerp(255, 44, k)].map(Math.round).join(",");
  const a = lerp(0.24, 0.16, k) + 0.1 * ramp(frame, Q.endCard - 20, Q.endCard + 40);
  const breathe = 1 + 0.03 * Math.sin(frame / 40);
  return (
    <AbsoluteFill style={{ background: base }}>
      <div
        style={{
          position: "absolute",
          left: 960 - 1100 * breathe,
          top: 470 - 800 * breathe,
          width: 2200 * breathe,
          height: 1600 * breathe,
          background: `radial-gradient(closest-side, rgba(${rgb},${a}), rgba(${rgb},${a / 4}) 55%, transparent)`,
        }}
      />
    </AbsoluteFill>
  );
};

export const ClockFilm: React.FC = () => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ fontFamily: sansStack }}>
      <Backdrop />
      <Arrive />
      <Wait />
      <Leak />
      <GapChart />
      <Gap />
      <Answered />
      <Clicks />
      <Grown />
      <Weeks />
      <EndCard />
      <Grain />
      {/* Voice + music + SFX, mixed to -14 LUFS by scripts/clock_sound.py */}
      <Audio src={staticFile("audio/clock-mix.wav")} premountFor={fps} />
    </AbsoluteFill>
  );
};
