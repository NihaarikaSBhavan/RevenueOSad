import {
  AbsoluteFill,
  Audio,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import words from "../public/audio/test-voice.words.json";

type Word = { text: string; start: number; end: number };

const VOICE_START_FRAME = 15;

export const TestClip: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const enter = spring({ frame: frame - 6, fps, config: { damping: 14 } });
  const x = interpolate(enter, [0, 1], [-1200, 0]);

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(160deg, #0f172a 0%, #312e81 100%)",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Inter, Helvetica, Arial, sans-serif",
      }}
    >
      <div
        style={{
          transform: `translateX(${x}px)`,
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: 24,
          padding: 80,
        }}
      >
        {(words as Word[]).map((w) => {
          const active = t >= w.start + VOICE_START_FRAME / fps;
          return (
            <span
              key={`${w.text}-${w.start}`}
              style={{
                fontSize: 120,
                fontWeight: 800,
                color: active ? "#ffffff" : "rgba(255,255,255,0.25)",
              }}
            >
              {w.text}
            </span>
          );
        })}
      </div>

      <Audio src={staticFile("audio/music-bed.mp3")} volume={0.12} />
      <Sequence from={4}>
        <Audio src={staticFile("sfx/whoosh.mp3")} volume={0.8} />
      </Sequence>
      <Sequence from={VOICE_START_FRAME}>
        <Audio src={staticFile("audio/test-voice.mp3")} />
      </Sequence>
    </AbsoluteFill>
  );
};
