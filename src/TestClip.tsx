import { AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame } from "remotion";

// 5-second test clip: a packet travels from Client to Server, with narration.
export const TestClip: React.FC = () => {
  const frame = useCurrentFrame();
  const x = interpolate(frame, [20, 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const titleOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });

  const box = (label: string) => (
    <div style={{ width: 260, height: 160, borderRadius: 24, background: "#1e293b", border: "4px solid #38bdf8",
      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48, color: "white" }}>{label}</div>
  );

  return (
    <AbsoluteFill style={{ background: "#0f172a", fontFamily: "sans-serif", alignItems: "center", justifyContent: "center" }}>
      <Audio src={staticFile("test-narration.wav")} />
      <div style={{ position: "absolute", top: 140, fontSize: 90, fontWeight: 700, color: "white", opacity: titleOpacity }}>
        TCP vs UDP
      </div>
      <div style={{ width: 1400, display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative" }}>
        {box("Client")}
        {box("Server")}
        <div style={{ position: "absolute", left: 280 + x * 760, top: 50, width: 80, height: 60, borderRadius: 10,
          background: "#f59e0b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 700 }}>
          📦
        </div>
      </div>
    </AbsoluteFill>
  );
};
