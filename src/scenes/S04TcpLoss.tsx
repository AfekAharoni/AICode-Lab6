// Scene 4 — TCP: a packet gets lost (~15 s). See SCRIPT.md.
// Narration beats (s04.wav, frames @30fps, from silencedetect):
//   0–66     "So what happens when a packet gets lost?"   → 1 2 3 leave, 2 is lost
//   80–135   "The sender waits for its acknowledgment,"   → ACK 1 and ACK 3 return, 2's ring keeps filling
//   146–190  "and when it doesn't arrive in time,"        → ring full → "timeout!"
//   199–263  "the sender simply sends that packet again." → a copy of 2 is resent
//   282–408  "TCP keeps retransmitting until every single packet has been acknowledged." → ACK 2, all ✓
//   423–458  "Nothing goes missing."
import { Audio, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Ack, Caption, Endpoints, Packet, SceneLabel, Stage, WaitRing, Wire } from "../components";
import { COLORS, LAYOUT, WIRE_END, WIRE_START, alongWire, fadeIn, progress } from "../theme";

const QUEUE_Y = 360;
const ACK_Y = LAYOUT.wireY + 70;
const TRAVEL = 50;
const ACK_TRAVEL = 45;

const LOST_AT = 44; // packet 2 dies halfway across
const TIMEOUT_AT = 185;
const RESEND_AT = 205;

// Original sends. Packet 2 never arrives, so its ACK (below) only follows the resend.
const SENDS = [
  { n: 1, depart: 10 },
  { n: 2, depart: 22, lost: true },
  { n: 3, depart: 34 },
  { n: 2, depart: RESEND_AT, resend: true },
];
const ACKS = [
  { n: 1, leave: 82 },
  { n: 3, leave: 100 },
  { n: 2, leave: RESEND_AT + TRAVEL + 6 },
];
const ackLanded = (n: number, frame: number) => ACKS.some((a) => a.n === n && frame >= a.leave + ACK_TRAVEL);

const queueX = (n: number) => LAYOUT.senderX - 100 + (n - 1) * 100;
const slotX = (n: number) => LAYOUT.receiverX - 100 + (n - 1) * 100; // Receiver keeps packets in number order

export const S04TcpLoss: React.FC = () => {
  const frame = useCurrentFrame();
  const sceneIn = fadeIn(frame, 0, 10);

  const timedOut = frame >= TIMEOUT_AT && frame < RESEND_AT + TRAVEL;

  return (
    <Stage>
      <Audio src={staticFile("narration/s04.wav")} />
      <SceneLabel text="TCP" color={COLORS.tcp} opacity={sceneIn} />
      <Endpoints color={COLORS.tcp} opacity={sceneIn} />
      <Wire opacity={sceneIn} />
      <Wire y={ACK_Y} color={COLORS.ack} opacity={sceneIn * 0.35} />

      {/* empty slot where packet 2 is missing at the Receiver */}
      {frame >= 60 && frame < RESEND_AT + TRAVEL && (
        <div style={{ position: "absolute", left: slotX(2) - 45, top: QUEUE_Y - 35, width: 90, height: 70, borderRadius: 14,
          border: `4px dashed ${COLORS.lost}`, boxSizing: "border-box", display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: 36, fontWeight: 800, color: COLORS.lost }}>?</div>
      )}

      {SENDS.map((s, i) => {
        const go = progress(frame, s.depart, TRAVEL, false);
        const arriveAt = s.depart + TRAVEL;
        let x: number;
        let y: number;
        if (frame < s.depart) {
          if (s.resend) return null; // the copy doesn't exist until it's resent
          x = queueX(s.n);
          y = QUEUE_Y;
        } else if (frame < arriveAt || s.lost) {
          x = interpolate(go, [0, 0.2, 1], [s.resend ? LAYOUT.senderX : queueX(s.n), WIRE_START, WIRE_END]);
          y = interpolate(go, [0, 0.2], [s.resend ? LAYOUT.wireY : QUEUE_Y, LAYOUT.wireY], { extrapolateRight: "clamp" });
        } else {
          const settle = progress(frame, arriveAt, 12);
          x = interpolate(settle, [0, 1], [WIRE_END, slotX(s.n)]);
          y = interpolate(settle, [0, 1], [LAYOUT.wireY, QUEUE_Y]);
        }
        const lost = s.lost ? progress(frame, LOST_AT, 30, false) : 0;
        if (s.lost && lost >= 1) return null;
        const label = s.resend && frame < arriveAt ? "resend" : s.lost && frame >= LOST_AT ? "lost" : undefined;
        return <Packet key={i} n={s.n} x={x} y={y} color={COLORS.tcp} lost={lost} label={label}
          scale={s.resend ? interpolate(frame - s.depart, [0, 8], [0.4, 1], { extrapolateRight: "clamp" }) : 1} />;
      })}

      {ACKS.map((a) => {
        if (frame < a.leave || frame > a.leave + ACK_TRAVEL + 6) return null;
        return <Ack key={a.n} n={a.n} x={alongWire(progress(frame, a.leave, ACK_TRAVEL, false), true)} y={ACK_Y}
          opacity={1 - progress(frame, a.leave + ACK_TRAVEL, 6)} />;
      })}

      {/* Sender's checklist */}
      <div style={{ position: "absolute", left: 120, top: 650, fontSize: 30, fontWeight: 700, color: COLORS.muted,
        letterSpacing: 1, opacity: sceneIn }}>SENDER'S CHECKLIST</div>
      {[1, 2, 3].map((n, row) => {
        const rowY = 720 + row * 66;
        const first = SENDS.find((s) => s.n === n)!;
        const sent = frame >= first.depart;
        const acked = ackLanded(n, frame);
        const isTwo = n === 2;
        const failed = isTwo && timedOut;
        // packet 2's ring fills until the timeout, then restarts after the resend
        const ackFor = ACKS.find((a) => a.n === n)!;
        const fill = isTwo
          ? frame < RESEND_AT
            ? progress(frame, first.depart, TIMEOUT_AT - first.depart, false)
            : progress(frame, RESEND_AT, ackFor.leave + ACK_TRAVEL - RESEND_AT, false)
          : progress(frame, first.depart, ackFor.leave + ACK_TRAVEL - first.depart, false);
        const status = acked ? "acknowledged" : failed ? (frame < RESEND_AT ? "timeout!" : "timeout! resending…")
          : sent ? (isTwo && frame >= RESEND_AT ? "resent, waiting…" : "waiting for ACK…") : "not sent yet";
        const color = acked ? COLORS.ack : failed ? COLORS.lost : COLORS.muted;
        const pulse = failed ? 1 + 0.06 * Math.sin((frame - TIMEOUT_AT) / 3) : 1;
        return (
          <div key={n}>
            <div style={{ position: "absolute", left: 120, top: rowY - 24, height: 48, display: "flex", alignItems: "center",
              gap: 18, fontSize: 32, fontWeight: 700, opacity: sceneIn * (sent ? 1 : 0.35) }}>
              <div style={{ width: 56, height: 44, borderRadius: 10, background: COLORS.tcp, color: COLORS.bg,
                display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}>{n}</div>
              <div style={{ width: 48 }} />
              <div style={{ color, transform: `scale(${pulse})`, transformOrigin: "left center" }}>{status}</div>
            </div>
            {sent && <WaitRing x={120 + 56 + 18 + 24} y={rowY} fill={fill} done={acked} failed={failed} />}
          </div>
        );
      })}

      {/* big timeout flash near the Sender */}
      <div style={{ position: "absolute", left: LAYOUT.senderX - 150, width: 300, top: 220, textAlign: "center",
        fontSize: 56, fontWeight: 900, color: COLORS.lost,
        opacity: fadeIn(frame, TIMEOUT_AT, 6) * (1 - fadeIn(frame, RESEND_AT + 20, 10)),
        transform: `scale(${interpolate(frame, [TIMEOUT_AT, TIMEOUT_AT + 8], [1.4, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})` }}>
        timeout!
      </div>

      {/* Receiver complete ✓ */}
      <div style={{ position: "absolute", left: LAYOUT.receiverX - 250, width: 400, top: 250, textAlign: "center", whiteSpace: "nowrap",
        fontSize: 40, fontWeight: 800, color: COLORS.ack, opacity: fadeIn(frame, ACKS[2].leave, 12) }}>all 3 received ✓</div>

      <Caption text="no ACK in time → send it again" y={940} color={COLORS.text} size={44}
        opacity={fadeIn(frame, 199, 12) * (1 - fadeIn(frame, 300, 12))} />
      <Caption text="retransmit until every packet is acknowledged" y={940} color={COLORS.text} size={44}
        opacity={fadeIn(frame, 312, 12) * (1 - fadeIn(frame, 415, 10))} />
      <Caption text="Nothing goes missing." y={940} color={COLORS.ack} size={56}
        opacity={fadeIn(frame, 423, 12)} />
    </Stage>
  );
};
