// Scene 7 — The race: why UDP is faster (~14 s). See SCRIPT.md.
// Narration beats (s07.wav, frames @30fps):
//   0–76    "Put them side by side and you see the trade-off."
//   90–148  "All that waiting and checking takes time."
//   162–307 "UDP skips it, so it's faster and has less delay, but it gives no guarantees."
//   324–399 "TCP is slower, but it's reliable."
// The race itself runs from RACE_START; UDP finishes ~155, TCP ~290.
// Timer values are illustrative (scaled so UDP reads 0.6 s, TCP 1.4 s), and the scene says so.
import { interpolate, staticFile, useCurrentFrame, Audio } from "remotion";
import { Ack, Endpoint, Packet, Stage, Wire } from "../components";
import { COLORS, LAYOUT, alongWire, fadeIn, progress } from "../theme";

const RACE_START = 50;
const TRAVEL = 45; // one-way trip, same network speed for both lanes
const LOSS_DURATION = 30;
const FRAMES_PER_SIM_SECOND = 175; // illustrative timer scale

const TCP_Y = 330;
const UDP_Y = 770;

type Send = { n: number; launch: number; lost?: boolean; label?: string };

// TCP: sends a few, waits for ACKs before sending more, resends 2 after a timeout.
const TCP_SENDS: Send[] = [
  { n: 1, launch: 50 },
  { n: 2, launch: 62, lost: true },
  { n: 3, launch: 74 },
  { n: 4, launch: 140 }, // after ACK 1 is back
  { n: 5, launch: 164 }, // after ACK 3 is back
  { n: 2, launch: 190, label: "resend" }, // timeout for 2
  { n: 6, launch: 200 },
];
const TCP_TIMEOUT_AT = 186;

// UDP: everything straight through, no waiting. Packet 3 is lost and nobody cares.
const UDP_SENDS: Send[] = [1, 2, 3, 4, 5, 6].map((n) => ({ n, launch: RACE_START + (n - 1) * 12, lost: n === 3 }));

const arrival = (s: Send) => s.launch + TRAVEL;
const delivered = (sends: Send[]) => sends.filter((s) => !s.lost);
const tcpAcks = delivered(TCP_SENDS).map((s) => ({ n: s.n, launch: arrival(s) }));

const TCP_DONE = Math.max(...tcpAcks.map((a) => a.launch + TRAVEL)); // sender has every ACK
const UDP_DONE = Math.max(...delivered(UDP_SENDS).map(arrival)); // last packet landed

const simTime = (frame: number, done: number) =>
  (Math.min(Math.max(frame, RACE_START), done) - RACE_START) / FRAMES_PER_SIM_SECOND;

const lossOf = (s: Send, frame: number) => (s.lost ? progress(frame, s.launch + TRAVEL / 2, LOSS_DURATION, false) : 0);

// Small stopwatch drawn in SVG (emoji fonts aren't available when rendering).
const Stopwatch: React.FC<{ color: string; t: number }> = ({ color, t }) => {
  const a = t * Math.PI * 2; // hand turns once per simulated second
  return (
    <svg width={44} height={48} viewBox="0 0 44 48" style={{ marginRight: 14, verticalAlign: "-4px" }}>
      <rect x={18} y={0} width={8} height={6} rx={2} fill={color} />
      <circle cx={22} cy={27} r={18} fill="none" stroke={color} strokeWidth={4} />
      <line x1={22} y1={27} x2={22 + 12 * Math.sin(a)} y2={27 - 12 * Math.cos(a)} stroke={color} strokeWidth={4} strokeLinecap="round" />
    </svg>
  );
};

const Lane: React.FC<{
  y: number; color: string; name: string; sends: Send[]; acks?: { n: number; launch: number }[];
  done: number; frame: number; resultEmphasis: number;
}> = ({ y, color, name, sends, acks = [], done, frame, resultEmphasis }) => {
  const introIn = fadeIn(frame, 0, 20);
  const finished = frame >= done;
  const got = new Set(delivered(sends).filter((s) => frame >= arrival(s)).map((s) => s.n));
  const total = new Set(sends.map((s) => s.n)).size;
  const deliveredCount = new Set(delivered(sends).map((s) => s.n)).size;
  const resultIn = fadeIn(frame, done, 12);
  const complete = deliveredCount === total;

  return (
    <>
      <Endpoint label="Sender" x={LAYOUT.senderX} y={y} color={color} opacity={introIn} />
      <Endpoint label="Receiver" x={LAYOUT.receiverX} y={y} color={color} opacity={introIn} />
      <Wire y={y} color={color} opacity={0.6 * introIn} />

      {/* Lane name + running timer above the wire */}
      <div style={{
        position: "absolute", top: y - 175, width: "100%", textAlign: "center", opacity: introIn,
        fontSize: 52, fontWeight: 800, color, fontVariantNumeric: "tabular-nums",
      }}>
        {name}
        <span style={{ marginLeft: 36, color: finished ? color : COLORS.text }}>
          <Stopwatch color={finished ? color : COLORS.text} t={simTime(frame, done)} />
          {simTime(frame, done).toFixed(1)} s
        </span>
        {finished && <span style={{ marginLeft: 24, fontSize: 40, opacity: resultIn }}>done</span>}
      </div>

      {sends.map((s, i) => {
        if (frame < s.launch || frame >= arrival(s)) return null;
        const lost = lossOf(s, frame);
        if (lost >= 1) return null;
        return (
          <Packet key={i} n={s.n} x={alongWire(progress(frame, s.launch, TRAVEL, false))} y={y}
            color={color} lost={lost} label={s.label} />
        );
      })}

      {acks.map((a, i) =>
        frame >= a.launch && frame < a.launch + TRAVEL ? (
          <Ack key={i} n={a.n} x={alongWire(progress(frame, a.launch, TRAVEL, false), true)} y={y + 70} />
        ) : null,
      )}

      {/* Receiver tally + result */}
      <div style={{
        position: "absolute", top: y + LAYOUT.boxH / 2 + 18, left: LAYOUT.receiverX - 190, width: 380,
        display: "flex", justifyContent: "center", gap: 8, opacity: introIn,
      }}>
        {Array.from({ length: total }, (_, k) => k + 1).map((n) => {
          const has = got.has(n);
          const missing = finished && !has;
          return (
            <div key={n} style={{
              width: 50, height: 50, borderRadius: 10, boxSizing: "border-box", fontSize: 28, fontWeight: 800,
              display: "flex", alignItems: "center", justifyContent: "center",
              ...(has
                ? { background: color, color: COLORS.bg }
                : { border: `3px dashed ${missing ? COLORS.lost : COLORS.boxBorder}`, color: COLORS.lost }),
            }}>{has ? n : missing ? "✕" : ""}</div>
          );
        })}
      </div>
      <div style={{
        position: "absolute", top: y + LAYOUT.boxH / 2 + 18, left: LAYOUT.receiverX - 560, width: 340,
        textAlign: "right", fontSize: 38, fontWeight: 800, opacity: resultIn,
        color: complete ? COLORS.ack : COLORS.lost,
        transform: `scale(${1 + 0.12 * resultEmphasis})`, transformOrigin: "right center",
      }}>
        {deliveredCount}/{total} delivered {complete ? "✓" : "✕"}
      </div>
    </>
  );
};

export const S07Race: React.FC = () => {
  const frame = useCurrentFrame();
  const tagIn = fadeIn(frame, 10, 20);

  // "but it gives no guarantees" → pulse UDP's result; "but it's reliable" → pulse TCP's.
  const pulse = (start: number) =>
    interpolate(frame, [start, start + 8, start + 30], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const timeoutFlash = interpolate(frame, [TCP_TIMEOUT_AT, TCP_TIMEOUT_AT + 4, TCP_TIMEOUT_AT + 30],
    [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <Stage>
      <Audio src={staticFile("narration/s07.wav")} />

      <Lane y={TCP_Y} color={COLORS.tcp} name="TCP" sends={TCP_SENDS} acks={tcpAcks}
        done={TCP_DONE} frame={frame} resultEmphasis={pulse(372)} />
      <Lane y={UDP_Y} color={COLORS.udp} name="UDP" sends={UDP_SENDS}
        done={UDP_DONE} frame={frame} resultEmphasis={pulse(264)} />

      {/* TCP's timeout for packet 2 */}
      <div style={{
        position: "absolute", left: LAYOUT.senderX - 150, width: 300, top: TCP_Y + LAYOUT.boxH / 2 + 18,
        textAlign: "center", fontSize: 34, fontWeight: 800, color: COLORS.lost, opacity: timeoutFlash,
      }}>timeout!</div>

      {/* Divider between the lanes */}
      <div style={{
        position: "absolute", left: 120, right: 120, top: (TCP_Y + UDP_Y) / 2 + 20, height: 2,
        background: COLORS.boxBorder, opacity: 0.4 * tagIn,
      }} />

      {/* Honesty tag: the numbers are not real measurements */}
      <div style={{
        position: "absolute", top: 40, right: 60, padding: "8px 20px", borderRadius: 999,
        border: `2px solid ${COLORS.muted}`, color: COLORS.muted, fontSize: 28, fontWeight: 600, opacity: tagIn,
      }}>illustration · not real timings</div>
    </Stage>
  );
};
