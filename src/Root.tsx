import { Composition } from "remotion";
import { Quickstart } from "./Quickstart";
import { RevenueOSFilm } from "./RevenueOS/Film";
import { TestClip } from "./TestClip";
import { TVAArchitecture } from "./TVAArchitecture/Infographic";
import { CYCLE } from "./TVAArchitecture/theme";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="RevenueOS30"
        component={RevenueOSFilm}
        durationInFrames={900}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="TVAArchitecture"
        component={TVAArchitecture}
        durationInFrames={3 * CYCLE}
        fps={30}
        width={1080}
        height={1350}
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
