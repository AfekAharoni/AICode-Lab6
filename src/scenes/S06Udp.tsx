// Scene 6 — UDP: fire and forget (~16 s). See SCRIPT.md.
// Narration beats (s06.wav, frames @30fps):
//   0–84    "UDP takes the opposite approach."
//   84–229  "It just sends packets, one after another, without waiting for any replies."
//   229–321 "There are no acknowledgments and no retransmissions."
//   321–464 "If a packet gets lost, it's simply gone, and the sender never even finds out."
import { Audio, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Caption, Endpoints, Packet, SceneLabel, Stage, Wire } from "../components";
import { COLORS, LAYOUT, alongWire, fadeIn, progress } from "../theme";

const PACKETS = [1, 2, 3, 4, 5, 6];
const FIRST_LAUNCH = 90; // first packet leaves as "It just sends packets" starts
const LAUNCH_GAP = 24; // frames between launches — a steady stream, no pauses
const TRAVEL = 220; // frames to cross the wire (slow drift so the whole convoy is visible)
const LOST_N = 4;
const LOSS_START = 315; // packet 4 dies right before "If a packet gets lost"
const LOSS_DURATION = 40;

const RETURN_Y = LAYOUT.wireY + 70; // where ACKs would travel (Ack's default y)
const SLOT = 56; // receiver tally slot size
const SLOTS_Y = LAYOUT.wireY + LAYOUT.boxH / 2 + 50; // row of received packets under the Receiver

const launchOf = (n: number) => FIRST_LAUNCH + (n - 1) * LAUNCH_GAP;
const arrivalOf = (n: number) => launchOf(n) + TRAVEL;

export const S06Udp: React.FC = () => {
  const frame = useCurrentFrame();

  const labelIn = fadeIn(frame, 0, 20);
  const boxesIn = fadeIn(frame, 10, 20);
  const wireIn = progress(frame, 25, 35);
  const noRepliesIn = fadeIn(frame, 235, 20);
  const lost = progress(frame, LOSS_START, LOSS_DURATION, false);
  const gapAlert = frame >= arrivalOf(LOST_N) ? 0.5 + 0.5 * Math.sin((frame - arrivalOf(LOST_N)) / 5) : 0;
  const sentIn = fadeIn(frame, 400, 15);
  const finalCaptionIn = fadeIn(frame, 405, 20);

  return (
    <Stage>
      <Audio src={staticFile("narration/s06.wav")} />
      <SceneLabel text="UDP" color={COLORS.udp} opacity={labelIn} />
      <Endpoints color={COLORS.udp} opacity={boxesIn} />
      <Wire color={COLORS.udp} reveal={wireIn} opacity={0.6} />

      {/* Empty return lane: nothing ever comes back */}
      <Wire y={RETURN_Y} color={COLORS.muted} opacity={0.25 * noRepliesIn} />
      <Caption text="no replies · no ACKs" y={RETURN_Y + 20} size={30} opacity={0.8 * noRepliesIn} />

      {/* Packets in flight */}
      {PACKETS.map((n) => {
        const start = launchOf(n);
        if (frame < start || frame >= arrivalOf(n)) return null;
        // packet 4 keeps drifting with the convoy while it dies, so 5 never overlaps it
        const p = progress(frame, start, TRAVEL, false);
        const isLost = n === LOST_N;
        if (isLost && lost >= 1) return null;
        return (
          <Packet
            key={n}
            n={n}
            x={alongWire(p)}
            color={COLORS.udp}
            lost={isLost ? lost : 0}
            opacity={fadeIn(frame, start, 6)}
          />
        );
      })}

      {/* What the Receiver ends up with: 1 2 3 _ 5 6 */}
      <div style={{
        position: "absolute", left: LAYOUT.receiverX - (PACKETS.length * (SLOT + 8)) / 2, top: SLOTS_Y,
        display: "flex", gap: 8, opacity: boxesIn,
      }}>
        {PACKETS.map((n) => {
          const arrived = frame >= arrivalOf(n);
          const pop = interpolate(frame, [arrivalOf(n), arrivalOf(n) + 8], [0.6, 1], {
            extrapolateLeft: "clamp", extrapolateRight: "clamp",
          });
          const isGap = n === LOST_N;
          return (
            <div key={n} style={{
              width: SLOT, height: SLOT, borderRadius: 10, boxSizing: "border-box",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 30, fontWeight: 800,
              ...(isGap
                ? {
                  border: `3px dashed ${arrived ? COLORS.lost : COLORS.boxBorder}`,
                  color: COLORS.lost,
                  opacity: arrived ? 0.4 + 0.6 * gapAlert : 1,
                }
                : arrived
                  ? { background: COLORS.udp, color: COLORS.bg, transform: `scale(${pop})` }
                  : { border: `3px dashed ${COLORS.boxBorder}` }),
            }}>
              {isGap ? (arrived ? "?" : "") : arrived ? n : ""}
            </div>
          );
        })}
      </div>

      {/* The Sender is blissfully unaware */}
      <div style={{
        position: "absolute", left: LAYOUT.senderX - 200, width: 400, top: SLOTS_Y + 6, textAlign: "center",
        fontSize: 34, fontWeight: 700, color: COLORS.udp, opacity: sentIn,
      }}>all 6 sent ✓</div>

      <Caption text="packet 4 is gone — and the sender never finds out" y={860} opacity={finalCaptionIn} />
    </Stage>
  );
};
