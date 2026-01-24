import {
  computeMotionState,
  type MotionState,
  type StressProfile,
} from "./motion";

type MagicCubeProps = {
  stress: StressProfile;
  size?: number;
};

export default function MagicCube({
  stress,
  size = 240,
}: MagicCubeProps) {
  // =====================================================
  // Motion state (semantic, not animated yet)
  // =====================================================
  const motionState: MotionState = computeMotionState(stress);

  // =====================================================
  // Geometry
  // =====================================================
  const center = size / 2;
  const radius = size * 0.35;

  const points = [
    {
      label: "People",
      x: center,
      y: center - radius * stress.peopleRisk,
    },
    {
      label: "Cost",
      x: center + radius * stress.costPressure,
      y: center,
    },
    {
      label: "Execution",
      x: center,
      y: center + radius * stress.executionStrain,
    },
    {
      label: "Macro",
      x: center - radius * stress.macroVolatility,
      y: center,
    },
  ];

  const polygonPoints = points
    .map((p) => `${p.x},${p.y}`)
    .join(" ");

  // =====================================================
  // Render
  // =====================================================
  return (
    <svg width={size} height={size}>
      {/* Axes */}
      <line
        x1={center}
        y1={0}
        x2={center}
        y2={size}
        stroke="#334155"
        strokeDasharray="4"
      />
      <line
        x1={0}
        y1={center}
        x2={size}
        y2={center}
        stroke="#334155"
        strokeDasharray="4"
      />

      {/* Stress polygon */}
      <polygon
        points={polygonPoints}
        fill="rgba(56,189,248,0.15)"
        stroke="#38bdf8"
        strokeWidth={2}
      />

      {/* Vertices */}
      {points.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={4}
          fill="#38bdf8"
        />
      ))}

      {/* Labels */}
      {points.map((p, i) => (
        <text
          key={i}
          x={p.x}
          y={p.y - 8}
          fontSize="10"
          fill="#cbd5f5"
          textAnchor="middle"
        >
          {p.label}
        </text>
      ))}

      {/* Motion state (temporary dev visibility) */}
      <text
        x={center}
        y={size - 8}
        fontSize="10"
        fill="#94a3b8"
        textAnchor="middle"
      >
        State: {motionState.toUpperCase()}
      </text>
    </svg>
  );
}
