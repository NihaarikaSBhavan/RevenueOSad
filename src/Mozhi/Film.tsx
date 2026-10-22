import { Audio } from "@remotion/media";
import { AbsoluteFill, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ramp } from "../RevenueOS/anim";
import { Grain } from "../RevenueOS/ui/Background";
import { FirstCall, FollowUp, Orchestrate, Switch, Tension } from "./Calls";
import { Book, EndCard, Growth, Recover, Support, Title } from "./Shots";
import { C, Q, sans } from "./theme";

/** Navy behind the product shots, with an orange glow that grows once Mozhi is on. */
const Backdrop: React.FC = () => {
  const frame = useCurrentFrame();
  const a = 0.14 * ramp(frame, Q.toggle, Q.toggle + 30) + 0.08 * ramp(frame, Q.drums[0], Q.logo);
  return (
    <AbsoluteFill style={{ background: C.navy }}>
      <AbsoluteFill style={{ background: `radial-gradient(60% 60% at 50% 45%, rgba(254,119,44,${a}), transparent 70%)` }} />
    </AbsoluteFill>
  );
};

export const MozhiFilm: React.FC = () => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ fontFamily: sans }}>
      <Backdrop />
      <Tension />
      <Switch />
      <FirstCall />
      <Orchestrate />
      <FollowUp />
      <Book />
      <Support />
      <Recover />
      <Growth />
      <Title />
      <EndCard />
      <Grain />
      {/* Voices, ambience, SFX and music, mixed to -14 LUFS by scripts/mozhi_audio.py */}
      <Audio src={staticFile("audio/mozhi-mix.wav")} premountFor={fps} />
    </AbsoluteFill>
  );
};
