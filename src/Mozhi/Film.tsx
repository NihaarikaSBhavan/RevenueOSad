import { Audio } from "@remotion/media";
import { AbsoluteFill, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ramp } from "../RevenueOS/anim";
import { Grain } from "../RevenueOS/ui/Background";
import { Call, End, Meet, Outcome, Pain, Scale, Uses } from "./Scenes";
import { C, Q, sans } from "./theme";

/** Navy, with an orange glow that grows once Mozhi arrives and again under the sign-off. */
const Backdrop: React.FC = () => {
  const frame = useCurrentFrame();
  const a = 0.14 * ramp(frame, Q.reveal, Q.reveal + 30) + 0.08 * ramp(frame, Q.logo - 10, Q.logo + 30);
  return (
    <AbsoluteFill style={{ background: C.navy }}>
      <AbsoluteFill style={{ background: `radial-gradient(60% 60% at 50% 42%, rgba(254,119,44,${a}), transparent 70%)` }} />
    </AbsoluteFill>
  );
};

export const MozhiFilm: React.FC = () => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ fontFamily: sans }}>
      <Backdrop />
      <Pain />
      <Meet />
      <Scale />
      <Call />
      <Uses />
      <Outcome />
      <End />
      <Grain />
      {/* Voices, ambience, SFX and music, mixed to -14 LUFS by scripts/mozhi_audio.py */}
      <Audio src={staticFile("audio/mozhi-mix.wav")} premountFor={fps} />
    </AbsoluteFill>
  );
};
