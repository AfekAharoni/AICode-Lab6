// Scene 8 — Who uses which (~21 s). See SCRIPT.md.
// Narration beats (s08.wav, frames @30fps):
//   0–51    "That's why each one has its job."
//   66–154  "Web pages and file downloads use TCP,"
//   164–267 "because a single missing piece would break the page or corrupt the file."
//   286–370 "Video calls and online games use UDP."
//   387–461 "If one frame is lost, you barely notice,"
//   470–618 "but if everything paused to resend old data, the call would freeze and the game would lag."
// All icons are drawn in SVG (emoji have no glyphs at render time).
import React from "react";
import { Audio, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Stage } from "../components";
import { COLORS, fadeIn } from "../theme";

const TCP_X = 480; // column centers
const UDP_X = 1440;
const ICON_GAP = 290;
const ICON_Y = 170;
const DEMO_Y = 470;

// ---------- icons (160×120 viewBox, stroked in the column color) ----------
const Svg: React.FC<{ children: React.ReactNode; w?: number; h?: number }> = ({ children, w = 160, h = 120 }) => (
  <svg width={w} height={h} viewBox="0 0 160 120" fill="none" strokeWidth={6} strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);

const BrowserIcon: React.FC<{ c: string }> = ({ c }) => (
  <Svg>
    <rect x={10} y={12} width={140} height={96} rx={10} stroke={c} />
    <line x1={10} y1={36} x2={150} y2={36} stroke={c} />
    {[24, 38, 52].map((x) => <circle key={x} cx={x} cy={24} r={3} fill={c} stroke="none" />)}
    <line x1={28} y1={58} x2={110} y2={58} stroke={c} />
    <line x1={28} y1={76} x2={132} y2={76} stroke={c} />
    <line x1={28} y1={94} x2={90} y2={94} stroke={c} />
  </Svg>
);

const FileIcon: React.FC<{ c: string; fill?: number }> = ({ c, fill = 0.6 }) => (
  <Svg>
    <path d="M45 8 H95 L118 31 V112 H45 Z" stroke={c} />
    <path d="M95 8 V31 H118" stroke={c} />
    <rect x={55} y={84} width={53} height={12} rx={6} stroke={c} strokeWidth={4} />
    <rect x={57} y={86} width={49 * fill} height={8} rx={4} fill={c} stroke="none" />
  </Svg>
);

const MailIcon: React.FC<{ c: string }> = ({ c }) => (
  <Svg>
    <rect x={16} y={22} width={128} height={80} rx={8} stroke={c} />
    <path d="M18 26 L80 70 L142 26" stroke={c} />
  </Svg>
);

const Face: React.FC<{ cx: number; c: string; cy?: number; s?: number }> = ({ cx, c, cy = 52, s = 1 }) => (
  <g stroke={c}>
    <circle cx={cx} cy={cy} r={14 * s} />
    <path d={`M${cx - 26 * s} ${cy + 46 * s} Q${cx} ${cy + 14 * s} ${cx + 26 * s} ${cy + 46 * s}`} />
  </g>
);

const VideoCallIcon: React.FC<{ c: string }> = ({ c }) => (
  <Svg>
    <rect x={8} y={14} width={144} height={92} rx={10} stroke={c} />
    <line x1={80} y1={14} x2={80} y2={106} stroke={c} strokeWidth={4} />
    <Face cx={44} c={c} cy={48} s={0.9} />
    <Face cx={116} c={c} cy={48} s={0.9} />
  </Svg>
);

const ControllerIcon: React.FC<{ c: string }> = ({ c }) => (
  <Svg>
    <path d="M40 30 H120 C142 30 152 50 154 76 C156 100 140 108 126 94 L112 80 H48 L34 94 C20 108 4 100 6 76 C8 50 18 30 40 30 Z" stroke={c} />
    <line x1={44} y1={46} x2={44} y2={70} stroke={c} />
    <line x1={32} y1={58} x2={56} y2={58} stroke={c} />
    <circle cx={112} cy={50} r={5} fill={c} stroke="none" />
    <circle cx={126} cy={64} r={5} fill={c} stroke="none" />
  </Svg>
);

const LiveIcon: React.FC<{ c: string }> = ({ c }) => (
  <Svg>
    <rect x={14} y={12} width={132} height={82} rx={10} stroke={c} />
    <line x1={56} y1={110} x2={104} y2={110} stroke={c} />
    <path d="M70 36 L98 53 L70 70 Z" fill={c} stroke={c} strokeWidth={3} />
    <circle cx={128} cy={28} r={6} fill={COLORS.lost} stroke="none" />
  </Svg>
);

// ---------- pieces ----------
const usePop = (start: number) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - start, fps, config: { damping: 12, stiffness: 140 } });
};

const IconCard: React.FC<{ x: number; label: string; start: number; children: React.ReactNode }> = ({ x, label, start, children }) => {
  const pop = usePop(start);
  return (
    <div style={{
      position: "absolute", left: x - 120, top: ICON_Y, width: 240, textAlign: "center",
      opacity: Math.min(1, pop * 1.5), transform: `scale(${0.4 + 0.6 * pop})`,
    }}>
      <div style={{ display: "flex", justifyContent: "center" }}>{children}</div>
      <div style={{ fontSize: 32, fontWeight: 700, marginTop: 8, whiteSpace: "nowrap" }}>{label}</div>
    </div>
  );
};

const Header: React.FC<{ x: number; text: string; color: string; opacity: number }> = ({ x, text, color, opacity }) => (
  <div style={{
    position: "absolute", left: x - 300, width: 600, top: 50, textAlign: "center",
    fontSize: 80, fontWeight: 800, color, opacity, letterSpacing: 2,
  }}>{text}</div>
);

// Caption centered under one column (the shared <Caption> spans the full width).
const ColumnCaption: React.FC<{ x: number; text: string; color: string; opacity: number }> = ({ x, text, color, opacity }) => (
  <div style={{
    position: "absolute", left: x - 470, width: 940, top: 950, textAlign: "center",
    fontSize: 36, fontWeight: 700, color, opacity,
  }}>{text}</div>
);

// TCP beat: a download whose 5th chunk never arrives → the file is broken.
const BrokenFileDemo: React.FC<{ frame: number }> = ({ frame }) => {
  const CHUNKS = 8;
  const MISSING = 4; // index
  const start = 172;
  const chunkAt = (i: number) => start + i * 7;
  const broken = fadeIn(frame, chunkAt(CHUNKS - 1) + 10, 10);
  const shake = broken > 0 && broken < 1 ? Math.sin(frame * 2) * 6 : 0;
  const opacity = fadeIn(frame, start - 10, 15);
  return (
    <div style={{ position: "absolute", left: TCP_X - 380, top: DEMO_Y, width: 760, height: 360, opacity }}>
      <div style={{ fontSize: 30, color: COLORS.muted, fontWeight: 600, textAlign: "center" }}>
        if one piece went missing…
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 40, marginTop: 30 }}>
        <div style={{ position: "relative", transform: `translateX(${shake}px)` }}>
          <svg width={180} height={220} viewBox="0 0 180 220" fill="none" strokeWidth={7} strokeLinejoin="round">
            <path d="M20 10 H120 L160 50 V210 H20 Z" stroke={broken > 0 ? COLORS.lost : COLORS.tcp} />
            <path d="M120 10 V50 H160" stroke={broken > 0 ? COLORS.lost : COLORS.tcp} />
            {/* crack */}
            <path d="M70 10 L95 70 L65 110 L100 160 L80 210" stroke={COLORS.lost} opacity={broken} />
          </svg>
          <div style={{
            position: "absolute", right: -20, bottom: -10, width: 70, height: 70, borderRadius: 35,
            background: COLORS.lost, color: COLORS.bg, fontSize: 44, fontWeight: 900, opacity: broken,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>✕</div>
        </div>
        <div>
          <div style={{ display: "flex", gap: 6 }}>
            {Array.from({ length: CHUNKS }, (_, i) => {
              const arrived = frame >= chunkAt(i);
              const missing = i === MISSING;
              return (
                <div key={i} style={{
                  width: 40, height: 56, borderRadius: 8, boxSizing: "border-box",
                  ...(arrived && !missing
                    ? { background: COLORS.tcp }
                    : { border: `3px dashed ${arrived && missing ? COLORS.lost : COLORS.boxBorder}` }),
                }} />
              );
            })}
          </div>
          <div style={{ fontSize: 30, fontWeight: 700, marginTop: 18, color: broken > 0 ? COLORS.lost : COLORS.text }}>
            {broken > 0 ? "file.zip: corrupted" : "downloading file.zip…"}
          </div>
        </div>
      </div>
    </div>
  );
};

// One webcam call window. `glitch` (0→1) scrambles it briefly; `frozen` greys it out with a spinner.
const CallWindow: React.FC<{
  x: number; frame: number; title: string; glitch?: number; frozenFrom?: number; opacity?: number;
}> = ({ x, frame, title, glitch = 0, frozenFrom, opacity = 1 }) => {
  const W = 400;
  const H = 260;
  const frozen = frozenFrom !== undefined && frame >= frozenFrom;
  const clockFrame = frozen ? frozenFrom! : frame;
  const secs = 12 + Math.floor(clockFrame / 30);
  const bob = frozen ? 0 : Math.sin(clockFrame / 8) * 4; // faces move while the call is live
  const g = glitch > 0 && glitch < 1;
  return (
    <div style={{ position: "absolute", left: x - W / 2, top: DEMO_Y + 70, width: W, opacity }}>
      <div style={{
        position: "relative", width: W, height: H, borderRadius: 18, overflow: "hidden",
        border: `5px solid ${frozen ? COLORS.boxBorder : COLORS.udp}`, background: COLORS.box,
        filter: frozen ? "grayscale(1) brightness(0.6)" : undefined,
      }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} fill="none" strokeWidth={7} strokeLinecap="round">
          <line x1={W / 2} y1={0} x2={W / 2} y2={H} stroke={COLORS.boxBorder} strokeWidth={4} />
          <g transform={`translate(${g ? 18 : 0}, ${bob})`}><Face cx={100} cy={90} s={2} c={COLORS.udp} /></g>
          <g transform={`translate(${g ? -14 : 0}, ${-bob})`}><Face cx={300} cy={90} s={2} c={COLORS.udp} /></g>
        </svg>
        {/* glitch: offset colour bands for a few frames */}
        {g && [40, 110, 170].map((y, i) => (
          <div key={y} style={{
            position: "absolute", left: (i % 2 ? -30 : 40), top: y, width: W, height: 26 + i * 6,
            background: i % 2 ? "#22d3ee55" : `${COLORS.lost}66`,
          }} />
        ))}
        {frozen && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width={90} height={90} viewBox="0 0 90 90" style={{ transform: `rotate(${(frame - frozenFrom!) * 12}deg)` }}>
              <circle cx={45} cy={45} r={34} stroke={COLORS.text} strokeWidth={9} fill="none" strokeDasharray="160 60" strokeLinecap="round" />
            </svg>
          </div>
        )}
        <div style={{
          position: "absolute", left: 14, top: 10, fontSize: 24, fontWeight: 800, color: COLORS.text,
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <div style={{ width: 14, height: 14, borderRadius: 7, background: COLORS.lost, opacity: frozen ? 0.4 : 0.5 + 0.5 * Math.sin(frame / 6) }} />
          0:{String(secs).padStart(2, "0")}
        </div>
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, textAlign: "center", marginTop: 12, whiteSpace: "nowrap", color: frozen ? COLORS.lost : COLORS.text }}>
        {frozen ? "frozen: waiting to resend" : title}
      </div>
    </div>
  );
};

export const S08UseCases: React.FC = () => {
  const frame = useCurrentFrame();

  const headersIn = fadeIn(frame, 8, 20);
  const tcpCaptionIn = fadeIn(frame, 215, 20);
  const glitch = interpolate(frame, [400, 414], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const callIn = fadeIn(frame, 375, 15);
  const frozenIn = fadeIn(frame, 470, 15);
  const udpCaptionIn = fadeIn(frame, 432, 20);

  return (
    <Stage>
      <Audio src={staticFile("narration/s08.wav")} />

      <Header x={TCP_X} text="TCP" color={COLORS.tcp} opacity={headersIn} />
      <Header x={UDP_X} text="UDP" color={COLORS.udp} opacity={headersIn} />
      <div style={{ position: "absolute", left: 958, top: 60, width: 4, height: 940, background: COLORS.boxBorder, opacity: 0.5 * headersIn }} />

      {/* TCP: web page, file download, email (on "Web pages and file downloads use TCP") */}
      <IconCard x={TCP_X - ICON_GAP} label="web pages" start={72}><BrowserIcon c={COLORS.tcp} /></IconCard>
      <IconCard x={TCP_X} label="downloads" start={100}><FileIcon c={COLORS.tcp} fill={interpolate(frame, [100, 160], [0.1, 0.9], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} /></IconCard>
      <IconCard x={TCP_X + ICON_GAP} label="email" start={128}><MailIcon c={COLORS.tcp} /></IconCard>

      <BrokenFileDemo frame={frame} />
      <ColumnCaption x={TCP_X} text="a file with a missing piece is broken" color={COLORS.tcp} opacity={tcpCaptionIn} />

      {/* UDP: video call, game, live stream (on "Video calls and online games use UDP") */}
      <IconCard x={UDP_X - ICON_GAP} label="video calls" start={290}><VideoCallIcon c={COLORS.udp} /></IconCard>
      <IconCard x={UDP_X} label="online games" start={318}><ControllerIcon c={COLORS.udp} /></IconCard>
      <IconCard x={UDP_X + ICON_GAP} label="live streams" start={346}><LiveIcon c={COLORS.udp} /></IconCard>

      <div style={{
        position: "absolute", left: UDP_X - 450, width: 900, top: DEMO_Y, textAlign: "center",
        fontSize: 30, color: COLORS.muted, fontWeight: 600, opacity: callIn,
      }}>if one frame is lost…</div>
      <CallWindow x={UDP_X - 215} frame={frame} title="glitch, keeps going ✓" glitch={glitch} opacity={callIn} />
      <CallWindow x={UDP_X + 215} frame={frame} title="" frozenFrom={470} opacity={frozenIn} />
      <ColumnCaption x={UDP_X} text="a lost frame is better than a frozen call" color={COLORS.udp} opacity={udpCaptionIn} />
    </Stage>
  );
};
