// Shared visual language for every scene (see SCRIPT.md "Visual language").
// Owned by the main window — scenes import from here, they don't edit it.
import { Easing, interpolate } from "remotion";

export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;

export const COLORS = {
  bg: "#0f172a",
  box: "#1e293b",
  boxBorder: "#475569",
  text: "#f8fafc",
  muted: "#94a3b8",
  tcp: "#38bdf8",
  udp: "#f59e0b",
  ack: "#22c55e",
  lost: "#ef4444",
  wire: "#64748b",
};

export const FONT = "'Segoe UI', 'Helvetica Neue', Arial, sans-serif";

// Default layout: Sender on the left, Receiver on the right, wire across the middle.
export const LAYOUT = {
  senderX: 260, // center x of Sender box
  receiverX: 1660, // center x of Receiver box
  wireY: 540, // y of the wire (and default lane)
  boxW: 280,
  boxH: 180,
};

// Where a packet starts / ends when it travels the wire (packet centers).
export const WIRE_START = LAYOUT.senderX + LAYOUT.boxW / 2 + 50;
export const WIRE_END = LAYOUT.receiverX - LAYOUT.boxW / 2 - 50;

/** 0→1 progress between two frames, clamped and eased. */
export const progress = (frame: number, start: number, duration: number, ease = true) =>
  interpolate(frame, [start, start + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease ? Easing.inOut(Easing.cubic) : undefined,
  });

/** x position of something moving Sender→Receiver (or reverse) along the wire. */
export const alongWire = (p: number, reverse = false) =>
  reverse ? WIRE_END + (WIRE_START - WIRE_END) * p : WIRE_START + (WIRE_END - WIRE_START) * p;

/** Simple fade-in opacity starting at `start`. */
export const fadeIn = (frame: number, start: number, duration = 15) =>
  interpolate(frame, [start, start + duration], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
