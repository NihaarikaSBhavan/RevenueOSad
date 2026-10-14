import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  Easing,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import words from "../public/audio/quickstart-words.json";

type Word = { text: string; start: number; end: number; beat: number };

// The whoosh SFX peaks ~0.35s in, so start it that much before each beat change
const WHOOSH_LEAD = 0.35;

const Beat: React.FC<{ beat: number; from: number; label: string; background: string; accent: string }> = ({
  beat,
  from,
  label,
  background,
  accent,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const beatWords = (words as Word[]).filter((w) => w.beat === beat);

  return (
    <AbsoluteFill
      style={{
        background,
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Inter, Helvetica, Arial, sans-serif",
        padding: 140,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 90,
          left: 140,
          color: accent,
          fontSize: 34,
          fontWeight: 700,
          letterSpacing: 6,
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "10px 28px" }}>
        {beatWords.map((w) => {
          // Word times are absolute; this Sequence's local frame 0 is `from` seconds
          const at = Math.round((w.start - from) * fps);
          return (
            <span
              key={`${w.text}-${w.start}`}
              style={{
                fontSize: 104,
                fontWeight: 800,
                color: /revenueos/i.test(w.text) ? accent : "#ffffff",
                opacity: frame >= at ? 1 : 0,
                scale: interpolate(frame, [at, at + 5], [0.6, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                  easing: Easing.bezier(0.16, 1, 0.3, 1),
                }),
              }}
            >
              {w.text}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const Quickstart: React.FC = () => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ background: "#0b1020" }}>
      <Sequence name="Hook" from={0} durationInFrames={3 * fps} premountFor={fps}>
        <Beat beat={0} from={0} label="RevenueOS" background="#0b1020" accent="#f97316" />
      </Sequence>
      <Sequence name="Problem" from={3 * fps} durationInFrames={4 * fps} premountFor={fps}>
        <Beat beat={1} from={3} label="The problem" background="#3b0d16" accent="#fb7185" />
      </Sequence>
      <Sequence name="Solution" from={7 * fps} durationInFrames={5 * fps} premountFor={fps}>
        <Beat beat={2} from={7} label="The fix" background="#0c2a4a" accent="#38bdf8" />
      </Sequence>
      <Sequence name="CTA" from={12 * fps} durationInFrames={3 * fps} premountFor={fps}>
        <Beat beat={3} from={12} label="revenueos.com" background="#14532d" accent="#4ade80" />
      </Sequence>

      <Audio src={staticFile("audio/voice.mp3")} />
      <Audio src={staticFile("audio/quickstart-bed.mp3")} volume={0.12} />
      <Audio name="Whoosh 1" src={staticFile("sfx/whoosh.mp3")} from={Math.round((3 - WHOOSH_LEAD) * fps)} premountFor={fps} volume={0.7} />
      <Audio name="Whoosh 2" src={staticFile("sfx/whoosh.mp3")} from={Math.round((7 - WHOOSH_LEAD) * fps)} premountFor={fps} volume={0.7} />
      <Audio name="Whoosh 3" src={staticFile("sfx/whoosh.mp3")} from={Math.round((12 - WHOOSH_LEAD) * fps)} premountFor={fps} volume={0.7} />
    </AbsoluteFill>
  );
};
