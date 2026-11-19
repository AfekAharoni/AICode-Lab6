// Scene 1 — Two ways to send data (~10 s). See SCRIPT.md.
import { Audio, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Caption, Endpoints, Stage, Title } from "../components";
import { COLORS, LAYOUT, WIRE_END, WIRE_START, fadeIn, progress } from "../theme";

const LANE_GAP = 70; // how far the TCP / UDP lanes split above / below the wire

export const S01Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const titleIn = fadeIn(frame, 0, 20);
  const boxesIn = fadeIn(frame, 20, 20);
  const wireReveal = progress(frame, 40, 40);
  const split = progress(frame, 150, 40); // lanes split as narration says "TCP and UDP"
  const labelsIn = fadeIn(frame, 170, 20);

  const midX = (WIRE_START + WIRE_END) / 2;
  const lane = (dir: -1 | 1, color: string) => {
    const offset = dir * LANE_GAP * split;
    return (
      <svg style={{ position: "absolute", left: 0, top: 0 }} width={1920} height={1080}>
        <path
          d={`M ${WIRE_START - 60} ${LAYOUT.wireY}
              C ${WIRE_START + 150} ${LAYOUT.wireY}, ${WIRE_START + 150} ${LAYOUT.wireY + offset}, ${midX - 300} ${LAYOUT.wireY + offset}
              L ${midX + 300} ${LAYOUT.wireY + offset}
              C ${WIRE_END - 150} ${LAYOUT.wireY + offset}, ${WIRE_END - 150} ${LAYOUT.wireY}, ${WIRE_END + 60} ${LAYOUT.wireY}`}
          fill="none"
          stroke={split > 0 ? color : COLORS.wire}
          strokeWidth={6}
          strokeDasharray="18 14"
        />
      </svg>
    );
  };

  return (
    <Stage>
      <Audio src={staticFile("narration/s01.wav")} />
      <Title text="TCP vs UDP" opacity={titleIn} />
      <Caption text="two ways to send data over the internet" y={240} opacity={titleIn} size={42} />
      <Endpoints opacity={boxesIn} />
      {/* mask that reveals the wire left → right */}
      <div style={{ position: "absolute", left: 0, top: 0, height: 1080, overflow: "hidden",
        width: WIRE_START - 60 + (WIRE_END - WIRE_START + 120) * wireReveal }}>
        {lane(-1, COLORS.tcp)}
        {lane(1, COLORS.udp)}
      </div>
      <div style={{
        position: "absolute", top: LAYOUT.wireY - LANE_GAP - 80, width: "100%", textAlign: "center",
        fontSize: 56, fontWeight: 800, color: COLORS.tcp, opacity: labelsIn,
      }}>TCP</div>
      <div style={{
        position: "absolute", top: LAYOUT.wireY + LANE_GAP + 16, width: "100%", textAlign: "center",
        fontSize: 56, fontWeight: 800, color: COLORS.udp, opacity: labelsIn,
        transform: `translateY(${interpolate(labelsIn, [0, 1], [10, 0])}px)`,
      }}>UDP</div>
    </Stage>
  );
};
