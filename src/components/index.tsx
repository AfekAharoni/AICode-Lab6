// Shared building blocks. All positions are absolute pixels on the 1920×1080 canvas.
import React from "react";
import { AbsoluteFill } from "remotion";
import { COLORS, FONT, LAYOUT, WIRE_END, WIRE_START } from "../theme";

/** Full-screen background every scene sits on. */
export const Stage: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ background: COLORS.bg, fontFamily: FONT, color: COLORS.text }}>{children}</AbsoluteFill>
);

/** Big centered title near the top. */
export const Title: React.FC<{ text: string; opacity?: number; y?: number; size?: number }> = ({
  text, opacity = 1, y = 110, size = 96,
}) => (
  <div style={{ position: "absolute", top: y, width: "100%", textAlign: "center", fontSize: size, fontWeight: 800, opacity }}>
    {text}
  </div>
);

/** Small protocol tag in the top-left corner ("TCP" / "UDP"). */
export const SceneLabel: React.FC<{ text: string; color: string; opacity?: number }> = ({ text, color, opacity = 1 }) => (
  <div style={{
    position: "absolute", top: 50, left: 60, padding: "10px 28px", borderRadius: 14,
    border: `4px solid ${color}`, color, fontSize: 52, fontWeight: 800, opacity, letterSpacing: 2,
  }}>{text}</div>
);

/** Sender / Receiver box, centered on (x, y). */
export const Endpoint: React.FC<{
  label: string; x: number; y?: number; color?: string; opacity?: number; children?: React.ReactNode;
}> = ({ label, x, y = LAYOUT.wireY, color = COLORS.boxBorder, opacity = 1, children }) => (
  <div style={{
    position: "absolute", left: x - LAYOUT.boxW / 2, top: y - LAYOUT.boxH / 2, width: LAYOUT.boxW, height: LAYOUT.boxH,
    borderRadius: 24, background: COLORS.box, border: `5px solid ${color}`, opacity,
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontSize: 44, fontWeight: 700,
  }}>
    {label}
    {children}
  </div>
);

/** Convenience: Sender on the left and Receiver on the right at the default layout. */
export const Endpoints: React.FC<{ y?: number; color?: string; opacity?: number }> = ({ y, color, opacity }) => (
  <>
    <Endpoint label="Sender" x={LAYOUT.senderX} y={y} color={color} opacity={opacity} />
    <Endpoint label="Receiver" x={LAYOUT.receiverX} y={y} color={color} opacity={opacity} />
  </>
);

/** Dashed horizontal network wire. `reveal` (0→1) draws it from left to right. */
export const Wire: React.FC<{ y?: number; x1?: number; x2?: number; color?: string; reveal?: number; opacity?: number }> = ({
  y = LAYOUT.wireY, x1 = WIRE_START - 60, x2 = WIRE_END + 60, color = COLORS.wire, reveal = 1, opacity = 1,
}) => (
  <div style={{
    position: "absolute", left: x1, top: y - 3, width: (x2 - x1) * reveal, height: 0,
    borderTop: `6px dashed ${color}`, opacity,
  }} />
);

/**
 * A numbered packet centered on (x, y).
 * `lost` (0→1) animates the loss: turns red, shakes, fades out with a ✕.
 */
export const Packet: React.FC<{
  n: number | string; x: number; y?: number; color: string; lost?: number; opacity?: number; scale?: number; label?: string;
}> = ({ n, x, y = LAYOUT.wireY, color, lost = 0, opacity = 1, scale = 1, label }) => {
  const shake = lost > 0 && lost < 0.6 ? Math.sin(lost * 80) * 10 : 0;
  const fill = lost > 0.05 ? COLORS.lost : color;
  const fade = lost > 0.6 ? 1 - (lost - 0.6) / 0.4 : 1;
  return (
    <div style={{
      position: "absolute", left: x - 45 + shake, top: y - 35, width: 90, height: 70, borderRadius: 14,
      background: fill, opacity: opacity * fade, transform: `scale(${scale})`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 40, fontWeight: 800, color: COLORS.bg, boxShadow: `0 0 24px ${fill}66`,
    }}>
      {lost > 0.3 ? "✕" : n}
      {label && (
        <div style={{ position: "absolute", top: -44, whiteSpace: "nowrap", fontSize: 28, fontWeight: 700, color: fill }}>{label}</div>
      )}
    </div>
  );
};

/** Green acknowledgment travelling back (Receiver → Sender). */
export const Ack: React.FC<{ n: number | string; x: number; y?: number; opacity?: number }> = ({
  n, x, y = LAYOUT.wireY + 70, opacity = 1,
}) => (
  <div style={{
    position: "absolute", left: x - 60, top: y - 24, width: 120, height: 48, borderRadius: 24,
    background: COLORS.ack, opacity, display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 28, fontWeight: 800, color: COLORS.bg,
  }}>ACK {n}</div>
);

/** Centered caption line, usually under the wire. */
export const Caption: React.FC<{ text: string; y?: number; opacity?: number; color?: string; size?: number }> = ({
  text, y = 820, opacity = 1, color = COLORS.muted, size = 40,
}) => (
  <div style={{ position: "absolute", top: y, width: "100%", textAlign: "center", fontSize: size, color, opacity, fontWeight: 600 }}>
    {text}
  </div>
);
