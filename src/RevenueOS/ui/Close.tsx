import { useCurrentFrame } from "remotion";
import { lerp, ramp, sp } from "../anim";
import { COPY } from "../copy";
import { sansStack } from "../fonts";
import { C } from "../theme";
import { T } from "../timeline";

export const Close: React.FC = () => {
  const frame = useCurrentFrame();
  const title = Math.min(sp(frame, T.title, 18), 1 - ramp(frame, T.endCard1 - 8, T.endCard1));
  const sub = Math.min(sp(frame, T.subline, 18), 1 - ramp(frame, T.endCard1 - 8, T.endCard1));
  const ec1 = 1 - ramp(frame, T.endCard2 - 6, T.endCard2);
  return (
    <div style={{ position: "absolute", inset: 0, fontFamily: sansStack, color: C.text }}>
      {title > 0 && (
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontSize: 150, fontWeight: 600, letterSpacing: 14, opacity: title, scale: String(lerp(0.94, 1, title)) }}>{COPY.title}</div>
          <div style={{ fontSize: 26, letterSpacing: 4, color: C.textDim, marginTop: 6, opacity: title }}>{COPY.endorsed}</div>
          <div style={{ fontSize: 46, fontWeight: 500, marginTop: 44, opacity: sub, translate: `0px ${16 * (1 - sub)}px` }}>{COPY.subline}</div>
        </div>
      )}

      {/* End card 1: three lines on three drumbeats, in silence */}
      {frame >= T.endCard1 && frame < T.endCard2 && (
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 26, opacity: ec1 }}>
          {COPY.endLines.map((line, i) => {
            const t = sp(frame, T.drums[i], 14, 220);
            return (
              <div key={line} style={{ fontSize: 76, fontWeight: 600, letterSpacing: 8, opacity: Math.min(1, t * 2), scale: String(lerp(1.12, 1, t)) }}>
                {line}
              </div>
            );
          })}
        </div>
      )}

      {/* End card 2: logo, endorsement line, CTA */}
      {frame >= T.endCard2 && (
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <Wordmark t={sp(frame, T.logo, 18)} />
          <div style={{ fontSize: 30, color: C.textDim, marginTop: 30, opacity: sp(frame, T.partOf, 18) }}>{COPY.partOf}</div>
          <div
            style={{
              marginTop: 54,
              padding: "18px 40px",
              borderRadius: 999,
              background: C.orange,
              fontSize: 34,
              fontWeight: 600,
              color: "#fff",
              opacity: sp(frame, T.cta, 16),
              scale: String(lerp(0.9, 1, sp(frame, T.cta, 14))),
            }}
          >
            {COPY.cta}
          </div>
        </div>
      )}
    </div>
  );
};

// No logo file in /public/images, so the brief's fallback: a clean wordmark in IBM Plex Sans
const Wordmark: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 22, opacity: t, scale: String(lerp(0.92, 1, t)) }}>
    <svg width="74" height="74" viewBox="0 0 74 74">
      <rect x="1" y="1" width="72" height="72" rx="18" fill={C.blue} />
      <path d="M22 22 L37 54 L52 22" stroke="#fff" strokeWidth="7" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
    <div style={{ fontSize: 76, fontWeight: 600, letterSpacing: 1 }}>
      TheVertical<span style={{ color: C.blue }}>.ai</span>
    </div>
  </div>
);
