// Scene 5 — TCP: putting packets back in order (~14 s). See SCRIPT.md.
// Narration beats (s05.wav, frames @30fps):
//   0–93    "Packets can also take different paths and arrive out of order."
//   109–284 "Because every packet is numbered, TCP puts them back into the right order
//            before handing the data to your app."
//   301–402 "You get exactly what was sent, in exactly the right order."
import React from "react";
import { Audio, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Caption, Endpoint, Packet, SceneLabel, Stage } from "../components";
import { COLORS, LAYOUT, WIRE_END, WIRE_START, fadeIn, progress } from "../theme";

const Y = 400; // Sender / Receiver / straight path
const ARC = 260; // bezier control offset for the upper / lower paths (peak = ARC / 2)
const TRAY_Y = 700; // packet centers inside the buffer tray
const SLOT_GAP = 110;
const TRAY_X = LAYOUT.receiverX - 160; // tray center (pulled left so it stays on screen)
const SENT_X = LAYOUT.senderX + 160; // "what was sent" bar center, mirrored on the left

type Path = "top" | "straight" | "bottom";
const PATH_OFFSET: Record<Path, number> = { top: -ARC, straight: 0, bottom: ARC };

// Sent in order 1,2,3,4 — but over different paths, so they arrive 3,1,4,2.
const PACKETS: { n: number; path: Path; launch: number; travel: number }[] = [
  { n: 1, path: "top", launch: 15, travel: 60 }, // arrives 75
  { n: 2, path: "bottom", launch: 25, travel: 75 }, // arrives 100
  { n: 3, path: "straight", launch: 35, travel: 25 }, // arrives 60
  { n: 4, path: "top", launch: 45, travel: 45 }, // arrives 90
];
const arrivalOf = (p: (typeof PACKETS)[number]) => p.launch + p.travel;
const ARRIVAL_ORDER = [...PACKETS].sort((a, b) => arrivalOf(a) - arrivalOf(b)).map((p) => p.n); // [3,1,4,2]

const DROP = 15; // frames to drop from the Receiver into the tray
const HIGHLIGHT_AT = 118; // "every packet is numbered"
const SORT_START = 165; // "TCP puts them back into the right order"
const SORT_DURATION = 45;
const MERGE_START = 235; // "before handing the data to your app"
const MERGE_DURATION = 25;
const MATCH_AT = 305; // "You get exactly what was sent"

const slotX = (i: number) => TRAY_X + (i - 1.5) * SLOT_GAP;

// Point on a quadratic bezier from the Sender to the Receiver.
const onPath = (path: Path, t: number) => {
  const x0 = WIRE_START, x2 = WIRE_END, cx = (x0 + x2) / 2;
  const cy = Y + PATH_OFFSET[path];
  const u = 1 - t;
  return { x: u * u * x0 + 2 * u * t * cx + t * t * x2, y: u * u * Y + 2 * u * t * cy + t * t * Y };
};

const PathLine: React.FC<{ path: Path; opacity: number }> = ({ path, opacity }) => {
  const cx = (WIRE_START + WIRE_END) / 2;
  return (
    <path d={`M ${WIRE_START - 60} ${Y} L ${WIRE_START} ${Y} Q ${cx} ${Y + PATH_OFFSET[path]} ${WIRE_END} ${Y} L ${WIRE_END + 60} ${Y}`}
      fill="none" stroke={COLORS.wire} strokeWidth={5} strokeDasharray="16 14" opacity={opacity} />
  );
};

// Four touching segments that read as one "your data" bar.
const DataBar: React.FC<{ x: number; y: number; opacity: number; label: string }> = ({ x, y, opacity, label }) => (
  <div style={{ position: "absolute", left: x - 220, top: y - 35, width: 440, opacity }}>
    <div style={{ display: "flex", borderRadius: 14, overflow: "hidden", boxShadow: `0 0 24px ${COLORS.tcp}55` }}>
      {[1, 2, 3, 4].map((n) => (
        <div key={n} style={{
          width: 110, height: 70, background: COLORS.tcp, color: COLORS.bg, fontSize: 34, fontWeight: 800,
          display: "flex", alignItems: "center", justifyContent: "center",
          borderLeft: n > 1 ? `2px solid ${COLORS.bg}55` : undefined,
        }}>{n}</div>
      ))}
    </div>
    <div style={{ textAlign: "center", fontSize: 30, fontWeight: 700, marginTop: 12, color: COLORS.muted, whiteSpace: "nowrap" }}>{label}</div>
  </div>
);

export const S05TcpOrder: React.FC = () => {
  const frame = useCurrentFrame();

  const introIn = fadeIn(frame, 0, 15);
  const trayIn = fadeIn(frame, 40, 15);
  const pathsDim = interpolate(frame, [110, 140], [0.7, 0.25], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const highlight = interpolate(frame, [HIGHLIGHT_AT, HIGHLIGHT_AT + 8, HIGHLIGHT_AT + 24], [0, 1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const sort = progress(frame, SORT_START, SORT_DURATION);
  const merge = progress(frame, MERGE_START, MERGE_DURATION);
  const matchIn = fadeIn(frame, MATCH_AT, 15);
  const slotLabelsIn = fadeIn(frame, SORT_START - 15, 15);
  const trayLabel = frame < SORT_START + SORT_DURATION ? "buffer: as they arrived" : "buffer: back in order";

  return (
    <Stage>
      <Audio src={staticFile("narration/s05.wav")} />
      <SceneLabel text="TCP" color={COLORS.tcp} opacity={introIn} />

      <svg style={{ position: "absolute", left: 0, top: 0 }} width={1920} height={1080}>
        {(["top", "straight", "bottom"] as Path[]).map((p) => <PathLine key={p} path={p} opacity={introIn * pathsDim} />)}
      </svg>
      <Endpoint label="Sender" x={LAYOUT.senderX} y={Y} color={COLORS.tcp} opacity={introIn} />
      <Endpoint label="Receiver" x={LAYOUT.receiverX} y={Y} color={COLORS.tcp} opacity={introIn} />

      {/* What was sent — stays under the Sender for the final comparison */}
      <DataBar x={SENT_X} y={TRAY_Y} opacity={0.35 * introIn + 0.65 * matchIn} label="what was sent" />

      {/* Buffer tray under the Receiver */}
      <div style={{
        position: "absolute", left: TRAY_X - 250, top: TRAY_Y - 70, width: 500, height: 140, borderRadius: 20,
        background: COLORS.box, border: `4px dashed ${COLORS.boxBorder}`, opacity: trayIn * (1 - merge),
      }} />
      <div style={{
        position: "absolute", left: TRAY_X - 250, width: 500, top: TRAY_Y - 120, textAlign: "center",
        fontSize: 30, fontWeight: 700, color: COLORS.muted, opacity: trayIn * (1 - merge),
      }}>{trayLabel}</div>
      {[1, 2, 3, 4].map((n) => (
        <div key={n} style={{
          position: "absolute", left: slotX(n - 1) - 50, width: 100, top: TRAY_Y + 78, textAlign: "center", whiteSpace: "nowrap",
          fontSize: 26, fontWeight: 700, color: COLORS.muted, opacity: slotLabelsIn * (1 - merge),
        }}>#{n}</div>
      ))}

      {/* Packets: fly along their path, drop into the tray, then sort themselves */}
      {PACKETS.map((p) => {
        if (frame < p.launch || merge >= 1) return null;
        const arrive = arrivalOf(p);
        let x: number;
        let y: number;
        if (frame < arrive) {
          ({ x, y } = onPath(p.path, progress(frame, p.launch, p.travel, false)));
        } else {
          const from = slotX(ARRIVAL_ORDER.indexOf(p.n));
          const to = slotX(p.n - 1);
          const drop = progress(frame, arrive, DROP);
          // during the sort, packets moving right hop up and packets moving left dip down, so they never collide
          const hop = Math.sin(Math.PI * sort) * 30 * Math.sign(to - from);
          x = interpolate(drop, [0, 1], [WIRE_END, from]) + (to - from) * sort;
          y = interpolate(drop, [0, 1], [Y, TRAY_Y]) - hop;
        }
        return (
          <Packet key={p.n} n={p.n} x={x} y={y} color={COLORS.tcp}
            scale={1 + 0.25 * highlight} opacity={fadeIn(frame, p.launch, 5) * (1 - merge)} />
        );
      })}

      {/* Merged back into one piece of data, handed to the app */}
      <DataBar x={TRAY_X} y={TRAY_Y} opacity={merge} label="your data → to your app" />
      <div style={{
        position: "absolute", left: (SENT_X + TRAY_X) / 2 - 150, width: 300, top: TRAY_Y - 55, textAlign: "center", whiteSpace: "nowrap",
        fontSize: 80, fontWeight: 900, color: COLORS.ack, opacity: matchIn,
        transform: `scale(${interpolate(matchIn, [0, 1], [0.6, 1])})`,
      }}>= ✓</div>

      <Caption text="exactly what was sent, in exactly the right order" y={900} opacity={matchIn} color={COLORS.text} size={42} />
      <Caption text="different paths → packets arrive out of order" y={900} size={36}
        opacity={fadeIn(frame, 60, 15) * (1 - fadeIn(frame, HIGHLIGHT_AT - 15, 12))} />
      <Caption text="every packet is numbered" y={900} size={36} color={COLORS.tcp}
        opacity={fadeIn(frame, HIGHLIGHT_AT, 15) * (1 - fadeIn(frame, SORT_START - 10, 10))} />
      <Caption text="sorted by number before your app gets it" y={900} size={36} color={COLORS.tcp}
        opacity={fadeIn(frame, SORT_START, 12) * (1 - fadeIn(frame, MATCH_AT - 15, 12))} />
    </Stage>
  );
};
