import { Composition } from "remotion";
import { TestClip } from "./TestClip";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="TestClip"
      component={TestClip}
      durationInFrames={90}
      fps={30}
      width={1080}
      height={1920}
    />
  );
};
