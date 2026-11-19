// Scene 3 — TCP: numbering and acknowledgments (~15.5 s). See SCRIPT.md.
// Narration beats (s03.wav, frames @30fps, from silencedetect):
//   0–55     "TCP is the careful one."
//   70–106   "It numbers every packet,"                → packets 1 2 3 pop in, numbered
//   118–167  "and for each packet that arrives,"       → packet 1 crosses
//   177–305  "the receiver sends back ... an acknowledgment, or ACK."  → ACK 1 returns
//   325–408  "The sender keeps track of which packets have been acknowledged,"  → 2 and 3, faster
//   416–467  "so it always knows what got through."   → tracker all ✓
import { Audio, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Ack, Caption, Endpoints, Packet, SceneLabel, Stage, WaitRing, Wire } from "../components";
import { COLORS, LAYOUT, WIRE_END, WIRE_START, alongWire, fadeIn, progress } from "../theme";

const QUEUE_Y = 360; // packets wait above the Sender, arrive above the Receiver
const ACK_Y = LAYOUT.wireY + 70;

// Each packet: when it appears (numbered), departs, arrives; when its ACK leaves and lands.
const PACKETS = [
  { n: 1, popAt: 75, depart: 120, travel: 45, ackLeave: 185, ackTravel: 50 },
  { n: 2, popAt: 85, depart: 300, travel: 35, ackLeave: 340, ackTravel: 35 },
  { n: 3, popAt: 95, depart: 330, travel: 35, ackLeave: 372, ackTravel: 35 },
];

const queueX = (i: number) => LAYOUT.senderX - 100 + i * 100;
const arrivedX = (i: number) => LAYOUT.receiverX - 100 + i * 100;

export const S03TcpAck: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sceneIn = fadeIn(frame, 0, 20);
  const trackerIn = fadeIn(frame, 120, 15);

  return (
    <Stage>
      <Audio src={staticFile("narration/s03.wav")} />
      <SceneLabel text="TCP" color={COLORS.tcp} opacity={sceneIn} />
      <Endpoints color={COLORS.tcp} opacity={sceneIn} />
      <Wire opacity={sceneIn} />
      {/* return lane for ACKs */}
      <Wire y={ACK_Y} color={COLORS.ack} opacity={sceneIn * 0.35} />

      {PACKETS.map((p, i) => {
        const pop = spring({ frame: frame - p.popAt, fps, config: { damping: 12 } });
        const go = progress(frame, p.depart, p.travel, false);
        const arrived = frame >= p.depart + p.travel;
        let x: number;
        let y: number;
        if (frame < p.depart) {
          x = queueX(i);
          y = QUEUE_Y;
        } else if (!arrived) {
          x = interpolate(go, [0, 0.2, 1], [queueX(i), WIRE_START, WIRE_END]);
          y = interpolate(go, [0, 0.2], [QUEUE_Y, LAYOUT.wireY], { extrapolateRight: "clamp" });
        } else {
          const settle = progress(frame, p.depart + p.travel, 12);
          x = interpolate(settle, [0, 1], [WIRE_END, arrivedX(i)]);
          y = interpolate(settle, [0, 1], [LAYOUT.wireY, QUEUE_Y]);
        }

        // ACK travelling back
        const ackP = progress(frame, p.ackLeave, p.ackTravel, false);
        const ackVisible = frame >= p.ackLeave && frame < p.ackLeave + p.ackTravel + 6;
        const acked = frame >= p.ackLeave + p.ackTravel;

        // tracker row under the Sender
        const rowY = 720 + i * 66;
        const waitFill = progress(frame, p.depart, p.ackLeave + p.ackTravel - p.depart, false);
        const sent = frame >= p.depart;

        return (
          <div key={p.n}>
            <Packet n={p.n} x={x} y={y} color={COLORS.tcp} scale={pop} />
            {ackVisible && <Ack n={p.n} x={alongWire(ackP, true)} y={ACK_Y} opacity={1 - progress(frame, p.ackLeave + p.ackTravel, 6)} />}

            <div style={{ position: "absolute", left: 120, top: rowY - 24, height: 48, display: "flex", alignItems: "center",
              gap: 18, fontSize: 32, fontWeight: 700, opacity: trackerIn * (sent ? 1 : 0.35) }}>
              <div style={{ width: 56, height: 44, borderRadius: 10, background: COLORS.tcp, color: COLORS.bg,
                display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}>{p.n}</div>
              <div style={{ width: 48 }} />
              <div style={{ color: acked ? COLORS.ack : COLORS.muted }}>
                {acked ? "acknowledged" : sent ? "waiting for ACK…" : "not sent yet"}
              </div>
            </div>
            {sent && <WaitRing x={120 + 56 + 18 + 24} y={rowY} fill={waitFill} done={acked} />}
          </div>
        );
      })}

      <div style={{ position: "absolute", left: 120, top: 650, fontSize: 30, fontWeight: 700, color: COLORS.muted,
        opacity: trackerIn, letterSpacing: 1 }}>SENDER'S CHECKLIST</div>

      {/* captions, one at a time */}
      <Caption text="ACK = “got it!”" y={830} color={COLORS.ack} size={48}
        opacity={fadeIn(frame, 240, 12) * (1 - fadeIn(frame, 320, 12))} />
      <Caption text="the sender always knows what got through" y={830} color={COLORS.text} size={44}
        opacity={fadeIn(frame, 416, 15)} />
    </Stage>
  );
};
