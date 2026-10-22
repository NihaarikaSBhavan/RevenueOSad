import { Composition } from "remotion";
import { ClockFilm } from "./Clock/Film";
import { Quickstart } from "./Quickstart";
import { RevenueOSFilm } from "./RevenueOS/Film";
import { TestClip } from "./TestClip";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="TheClock30"
        component={ClockFilm}
        durationInFrames={900}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="RevenueOS30"
        component={RevenueOSFilm}
        durationInFrames={900}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="Quickstart"
        component={Quickstart}
        durationInFrames={450}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="TestClip"
        component={TestClip}
        durationInFrames={90}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
