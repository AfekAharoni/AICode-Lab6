import { Composition, Series } from "remotion";
import { TestClip } from "./TestClip";
import { FPS, HEIGHT, WIDTH } from "./theme";
import { S01Intro } from "./scenes/S01Intro";
import { S02Packets } from "./scenes/S02Packets";
import { S06Udp } from "./scenes/S06Udp";

// Scene order + length in frames (from public/narration/durations.md).
// Add each scene here once it's built.
const SCENES: { id: string; component: React.FC; frames: number }[] = [
  { id: "S01Intro", component: S01Intro, frames: 329 },
  { id: "S02Packets", component: S02Packets, frames: 422 },
  { id: "S06Udp", component: S06Udp, frames: 494 },
];

const Main: React.FC = () => (
  <Series>
    {SCENES.map((s) => (
      <Series.Sequence key={s.id} durationInFrames={s.frames} name={s.id}>
        <s.component />
      </Series.Sequence>
    ))}
  </Series>
);

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Main" component={Main} durationInFrames={SCENES.reduce((a, s) => a + s.frames, 0)}
      fps={FPS} width={WIDTH} height={HEIGHT} />
    {SCENES.map((s) => (
      <Composition key={s.id} id={s.id} component={s.component} durationInFrames={s.frames}
        fps={FPS} width={WIDTH} height={HEIGHT} />
    ))}
    <Composition id="TestClip" component={TestClip} durationInFrames={150} fps={FPS} width={WIDTH} height={HEIGHT} />
  </>
);
