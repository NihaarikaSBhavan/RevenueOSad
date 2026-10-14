import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C } from "../theme";
import { camera, toScreen } from "../world";

/** Deep navy, a parallax dot field, a blue glow that trails the camera, and 2% grain. */
export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const cam = camera(frame);
  // The glow lags the camera by 8 frames, so it follows the action rather than sitting on it
  const lag = camera(Math.max(0, frame - 8));
  const glow = toScreen(cam, lag.x, lag.y);
  // Far layer moves at 35% of camera travel for depth
  const px = -(cam.x * 0.35 * cam.s) % 64;
  const py = -(cam.y * 0.35 * cam.s) % 64;
  return (
    <AbsoluteFill style={{ background: C.navy, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.07) 1.5px, transparent 1.5px)",
          backgroundSize: "64px 64px",
          backgroundPosition: `${px}px ${py}px`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: glow.x - 900,
          top: glow.y - 700,
          width: 1800,
          height: 1400,
          background: "radial-gradient(closest-side, rgba(1,119,255,0.30), rgba(1,119,255,0.08) 55%, transparent)",
        }}
      />
    </AbsoluteFill>
  );
};

export const Grain: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity: 0.05, mixBlendMode: "overlay", pointerEvents: "none" }}>
      <svg width="1920" height="1080">
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={frame % 24} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="1920" height="1080" filter="url(#grain)" />
      </svg>
    </AbsoluteFill>
  );
};
