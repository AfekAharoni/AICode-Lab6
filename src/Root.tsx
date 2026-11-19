import { Composition, Series } from "remotion";
import { TestClip } from "./TestClip";
import { FPS, HEIGHT, WIDTH } from "./theme";
import { S01Intro } from "./scenes/S01Intro";
import { S02Packets } from "./scenes/S02Packets";
import { S03TcpAck } from "./scenes/S03TcpAck";
import { S04TcpLoss } from "./scenes/S04TcpLoss";
import { S06Udp } from "./scenes/S06Udp";
import { S07Race } from "./scenes/S07Race";
import { S08UseCases } from "./scenes/S08UseCases";
import { S09Recap } from "./scenes/S09Recap";

// Scene order + length in frames (from public/narration/durations.md).
// Add each scene here once it's built.
const SCENES: { id: string; component: React.FC; frames: number }[] = [
  { id: "S01Intro", component: S01Intro, frames: 329 },
  { id: "S02Packets", component: S02Packets, frames: 422 },
  { id: "S03TcpAck", component: S03TcpAck, frames: 498 },
  { id: "S04TcpLoss", component: S04TcpLoss, frames: 488 },
  { id: "S06Udp", component: S06Udp, frames: 494 },
  { id: "S07Race", component: S07Race, frames: 429 },
  { id: "S08UseCases", component: S08UseCases, frames: 648 },
  { id: "S09Recap", component: S09Recap, frames: 367 },
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
