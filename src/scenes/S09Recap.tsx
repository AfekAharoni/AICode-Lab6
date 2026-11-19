// Scene 9 — Recap (~11 s). See SCRIPT.md.
// Narration beats (s09.wav, frames @30fps, from silencedetect):
//   0–69     "To sum up: TCP is reliable."                         → TCP card
//   82–171   "It waits for acknowledgments and resends anything lost." → TCP bullets
//   184–223  "UDP is fast."                                         → UDP card
//   232–280  "It sends and never looks back."                       → UDP bullets
//   295–337  "Pick the one your app needs."                         → bottom line
// No emoji: the render font has no glyphs for them (✓ and ✕ are fine).
import { Audio, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Stage, Title } from "../components";
import { COLORS, fadeIn } from "../theme";

type Bullet = { mark: "✓" | "✕" | "–"; text: string; at: number };

const CARDS: { name: string; tagline: string; color: string; at: number; bullets: Bullet[]; x: number }[] = [
  {
    name: "TCP", tagline: "reliable", color: COLORS.tcp, at: 30, x: 110,
    bullets: [
      { mark: "✓", text: "every packet arrives", at: 85 },
      { mark: "✓", text: "in the right order", at: 108 },
      { mark: "✓", text: "resends anything lost", at: 131 },
      { mark: "–", text: "slower: it waits", at: 160 },
    ],
  },
  {
    name: "UDP", tagline: "fast", color: COLORS.udp, at: 184, x: 1010,
    bullets: [
      { mark: "✓", text: "low delay", at: 205 },
      { mark: "✓", text: "never waits for replies", at: 232 },
      { mark: "✕", text: "no checking", at: 252 },
      { mark: "–", text: "lost packets stay lost", at: 270 },
    ],
  },
];

const CARD_W = 800;

export const S09Recap: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <Stage>
      <Audio src={staticFile("narration/s09.wav")} />
      <Title text="To sum up" opacity={fadeIn(frame, 0, 15)} y={70} size={72} />

      {CARDS.map((c) => {
        const pop = spring({ frame: frame - c.at, fps, config: { damping: 14 } });
        return (
          <div key={c.name} style={{
            position: "absolute", left: c.x, top: 220, width: CARD_W, height: 560, borderRadius: 32,
            background: COLORS.box, border: `6px solid ${c.color}`, boxSizing: "border-box", padding: "40px 56px",
            opacity: pop, transform: `translateY(${interpolate(pop, [0, 1], [40, 0])}px) scale(${interpolate(pop, [0, 1], [0.94, 1])})`,
          }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 24 }}>
              <div style={{ fontSize: 96, fontWeight: 900, color: c.color }}>{c.name}</div>
              <div style={{ fontSize: 52, fontWeight: 700, color: COLORS.text }}>= {c.tagline}</div>
            </div>
            <div style={{ marginTop: 36, display: "flex", flexDirection: "column", gap: 26 }}>
              {c.bullets.map((b) => {
                const o = fadeIn(frame, b.at, 10);
                const markColor = b.mark === "✓" ? (c.name === "TCP" ? COLORS.ack : COLORS.udp) : b.mark === "✕" ? COLORS.lost : COLORS.muted;
                return (
                  <div key={b.text} style={{ display: "flex", alignItems: "center", gap: 22, fontSize: 42, whiteSpace: "nowrap", fontWeight: 700,
                    opacity: o, transform: `translateX(${interpolate(o, [0, 1], [-20, 0])}px)`,
                    color: b.mark === "–" ? COLORS.muted : COLORS.text }}>
                    <span style={{ width: 44, textAlign: "center", color: markColor, fontWeight: 900 }}>{b.mark}</span>
                    {b.text}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* "vs" between the cards */}
      <div style={{ position: "absolute", left: 910, width: 100, top: 470, textAlign: "center", fontSize: 44,
        fontWeight: 800, color: COLORS.muted, opacity: fadeIn(frame, 184, 12) }}>vs</div>

      <div style={{ position: "absolute", top: 850, width: "100%", textAlign: "center", fontSize: 60, fontWeight: 800,
        opacity: fadeIn(frame, 295, 15),
        transform: `scale(${interpolate(fadeIn(frame, 295, 15), [0, 1], [0.95, 1])})` }}>
        <span style={{ color: COLORS.tcp }}>Reliable</span>
        <span style={{ color: COLORS.muted }}> or </span>
        <span style={{ color: COLORS.udp }}>fast</span>
        <span style={{ color: COLORS.text }}>: pick what your app needs.</span>
      </div>
    </Stage>
  );
};
