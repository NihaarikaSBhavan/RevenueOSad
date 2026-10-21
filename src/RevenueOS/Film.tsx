import { Audio } from "@remotion/media";
import { AbsoluteFill, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ramp } from "./anim";
import { COPY } from "./copy";
import { sansStack } from "./fonts";
import { T } from "./timeline";
import { Background, Grain } from "./ui/Background";
import { BookingCursor, button, Calendar, MiniPhone, slotY, TodayFeed } from "./ui/Booking";
import { ActionRail } from "./ui/ActionRail";
import { ChatPhone } from "./ui/ChatPhone";
import { Close } from "./ui/Close";
import { Contact360, FlyingPhrases } from "./ui/Contact360";
import { CustomerGrid } from "./ui/Grid";
import { Dashboard } from "./ui/Dashboard";
import { Growth } from "./ui/Growth";
import { AuditLog, AutonomyDial, Beat, Captions, ClickCounter, MoneyShotDim, Stamp } from "./ui/Hud";
import { Streak } from "./ui/primitives";
import { camera, W } from "./world";

/** Each action visibly gives birth to the next element. */
const Births: React.FC = () => {
  const priyaCard = { x: 820, y: 190 + 3 * 118 + 49 };
  const slot11 = { x: W.cal.x + 400, y: slotY(4) + 35 };
  const miniThread = { x: W.mini.x + 120, y: W.mini.y + 200 };
  return (
    <>
      <Streak at={T.glideChat - 2} from={priyaCard} to={{ x: W.phone.x + 40, y: W.phone.y + 70 }} />
      <Streak at={T.click1 + 1} from={button(0)} to={slot11} />
      <Streak at={T.click2 + 1} from={button(1)} to={miniThread} />
      <Streak at={T.visitDone + 1} from={slot11} to={{ x: W.mini.x + 120, y: W.mini.y + 470 }} />
      <Streak at={T.glideGrowth + 2} from={{ x: W.mini.x + W.mini.w, y: W.mini.y + 470 }} to={{ x: W.growth.x + 40, y: W.growth.y + 90 }} />
      <Streak at={T.nba + 12} from={{ x: W.growth.x + 120, y: W.growth.y + 200 }} to={{ x: W.growth.x + 160, y: W.growth.y + 380 }} />
    </>
  );
};

/** Everything the camera travels through. */
const World: React.FC = () => {
  const frame = useCurrentFrame();
  const cam = camera(frame);
  // Stations step back while the grid takes over, then everything dissolves
  const stations = 1 - 0.8 * ramp(frame, T.pullBack + 6, T.pullBack + 30);
  const dissolve = 1 - ramp(frame, T.dissolve, T.dissolve + 22);
  // Slight perspective that leans with the camera's travel
  const lean = Math.sin(frame / 160) * 1.5;
  return (
    <AbsoluteFill style={{ perspective: 2600, opacity: dissolve }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          transformOrigin: "0 0",
          transform: `translate(960px, 540px) rotateX(${2 + lean * 0.4}deg) rotateY(${-2 + lean}deg) scale(${cam.s}) translate(${-cam.x}px, ${-cam.y}px)`,
        }}
      >
        <CustomerGrid />
        <div style={{ opacity: stations }}>
          <Dashboard />
          <ActionRail />
          <ChatPhone />
          <Contact360 />
          <TodayFeed />
          <Calendar />
          <MiniPhone />
          <Growth />
          <FlyingPhrases />
          <Births />
          <BookingCursor />
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const RevenueOSFilm: React.FC = () => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ fontFamily: sansStack }}>
      <Background />
      <World />
      <Beat at={T.beatWorked} until={T.glideContact + 20} text={COPY.beatWorked} />
      <Beat at={T.beatRecords} until={T.zoomGauge} text={COPY.beatRecords} />
      <Beat at={T.beatGrown} until={T.pullBack + 4} text={COPY.beatGrown} />
      <Beat at={T.beat100} until={T.dissolve + 6} text={COPY.beat100} />
      <Stamp at={T.saturday} until={T.click3 - 2} text={COPY.saturday} />
      <Stamp at={T.days30} until={T.churnFlag} text={COPY.days30} />
      <MoneyShotDim />
      <ClickCounter />
      <AutonomyDial />
      <AuditLog />
      <Close />
      <Captions />
      <Grain />
      {/* Voice + music + SFX, mixed to -14 LUFS by scripts/revenue_os_sound.py */}
      <Audio src={staticFile("audio/revenue-os-mix.wav")} premountFor={fps} />
    </AbsoluteFill>
  );
};
