import { Audio } from "@remotion/media";
import { AbsoluteFill, staticFile, useVideoConfig } from "remotion";
import { Grain } from "../RevenueOS/ui/Background";
import { Call, End, Meet, Outcome, Pain, Scale, Sun, Uses } from "./Scenes";
import { sans } from "./theme";

export const MozhiFilm: React.FC = () => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ fontFamily: sans, background: "#020817" }}>
      <Pain />
      {/* Mozhi arrives and the frame floods orange; it stays orange to the end */}
      <Sun />
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
