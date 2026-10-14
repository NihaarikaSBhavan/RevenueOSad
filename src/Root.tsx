import { Composition } from "remotion";
import { Quickstart } from "./Quickstart";
import { TestClip } from "./TestClip";

export const RemotionRoot: React.FC = () => {
  return (
    <>
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
