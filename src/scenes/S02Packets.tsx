// Scene 2 — Data travels in packets (~13 s). See SCRIPT.md.
// Narration beats (s02.wav, frames @30fps, from silencedetect):
//   0–66     "Data isn't sent all at once."
//   66–138   "It's chopped into small pieces called packets,"
//   147–219  "and each one travels across the network on its own."
//   239–266  "Along the way,"
//   266–301  "packets can be delayed,"          → packet 2 crawls (3 and 4 pass it)
//   310–341  "arrive out of order,"            → Receiver row reads 1 3 4, then 2
//   347–390  "or get lost completely."         → packet 5 is lost
import { Audio, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Caption, Endpoints, Packet, Stage, Wire } from "../components";
import { COLORS, LAYOUT, WIRE_END, WIRE_START, fadeIn, progress } from "../theme";

const DATA = "#e2e8f0"; // neutral: these packets are neither TCP nor UDP yet
const BAR_Y = 330;
const BAR_LEFT = 120;
const PIECE_W = 100;

// Per-packet trip: departure frame, travel time, optional loss frame.
const TRIPS: { n: number; start: number; dur: number; label?: string; labelAt?: number; hops?: number[]; lostAt?: number }[] = [
  { n: 1, start: 150, dur: 70 },
  { n: 2, start: 165, dur: 190, label: "delayed", labelAt: 262 }, // crawls; 3 and 4 hop over it
  { n: 3, start: 185, dur: 100, hops: [207] },
  { n: 4, start: 205, dur: 100, hops: [249] },
  { n: 5, start: 260, dur: 120, label: "lost", labelAt: 345, lostAt: 350 },
];

// Order packets reach the Receiver (they're shown in a row above it in this order).
const ARRIVAL_ORDER = [...TRIPS].filter((t) => !t.lostAt).sort((a, b) => a.start + a.dur - (b.start + b.dur)).map((t) => t.n);
const slotX = (k: number) => LAYOUT.receiverX - 150 + k * 100;

export const S02Packets: React.FC = () => {
  const frame = useCurrentFrame();
  const sceneIn = fadeIn(frame, 0, 20);
  const barIn = fadeIn(frame, 15, 20);
  const gap = 20 * progress(frame, 70, 40); // bar splits into pieces
  const morph = fadeIn(frame, 112, 18); // pieces become numbered packets
  const captionIn = fadeIn(frame, 239, 15);

  const pieceCenter = (i: number, g: number) => BAR_LEFT + PIECE_W / 2 + i * (PIECE_W + g);

  return (
    <Stage>
      <Audio src={staticFile("narration/s02.wav")} />
      <Endpoints opacity={sceneIn} />
      <Wire opacity={sceneIn} />

      {/* "your data" bar, splitting into pieces */}
      <div style={{ position: "absolute", left: BAR_LEFT, top: BAR_Y - 95, fontSize: 36, fontWeight: 700,
        color: COLORS.muted, opacity: barIn * (1 - morph) }}>your data</div>
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} style={{
          position: "absolute", left: pieceCenter(i, gap) - PIECE_W / 2, top: BAR_Y - 30, width: PIECE_W, height: 60,
          background: DATA, opacity: barIn * (1 - morph),
          borderRadius: `${i === 0 ? 12 : gap > 1 ? 8 : 0}px ${i === 4 ? 12 : gap > 1 ? 8 : 0}px ${i === 4 ? 12 : gap > 1 ? 8 : 0}px ${i === 0 ? 12 : gap > 1 ? 8 : 0}px`,
        }} />
      ))}
      <div style={{ position: "absolute", left: BAR_LEFT, top: BAR_Y + 50, fontSize: 34, fontWeight: 700,
        color: COLORS.text, opacity: morph * interpolate(frame, [150, 170], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
        packets
      </div>

      {/* packets: wait as pieces, then travel the wire */}
      {TRIPS.map((t, i) => {
        const p = progress(frame, t.start, t.dur, false);
        const arrived = frame >= t.start + t.dur && !t.lostAt;
        let x: number;
        let y: number;
        if (arrived) {
          const k = ARRIVAL_ORDER.indexOf(t.n);
          const settle = progress(frame, t.start + t.dur, 12);
          x = interpolate(settle, [0, 1], [WIRE_END, slotX(k)]);
          y = interpolate(settle, [0, 1], [LAYOUT.wireY, BAR_Y]);
        } else {
          x = interpolate(p, [0, 0.15, 1], [pieceCenter(i, 20), WIRE_START, WIRE_END]);
          y = interpolate(p, [0, 0.15], [BAR_Y, LAYOUT.wireY], { extrapolateRight: "clamp" });
          // hop over the slow packet while overtaking it
          for (const h of t.hops ?? []) y -= 90 * Math.exp(-(((frame - h) / 14) ** 2));
        }
        const lost = t.lostAt ? progress(frame, t.lostAt, 35, false) : 0;
        const showLabel = t.labelAt !== undefined && frame >= t.labelAt && !arrived;
        return (
          <Packet key={t.n} n={t.n} x={x} y={y} color={DATA} opacity={morph} lost={lost}
            label={showLabel ? t.label : undefined} />
        );
      })}

      <div style={{ position: "absolute", left: slotX(0) - 45, width: 390, top: BAR_Y - 95, textAlign: "center",
        fontSize: 34, fontWeight: 800, color: COLORS.lost, opacity: fadeIn(frame, 310, 12) }}>out of order!</div>

      <Caption text="the network can delay, reorder, or lose packets" opacity={captionIn} />
    </Stage>
  );
};
