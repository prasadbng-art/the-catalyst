import {
  computeMotionState,
  getMotionAnnotation,
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
  // Motion semantics
  // =====================================================
  const motionState: MotionState = computeMotionState(stress);
  const annotation = getMotionAnnotation(motionState);

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
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
        alignItems: "flex-start",
        maxWidth: 260,
      }}
    >
      {/* Annotation Caption */}
      <div
        style={{
          background: "#020617",
          border: "1px solid #1e293b",
          borderRadius: 6,
          padding: "10px 12px",
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: "#e5e7eb",
            marginBottom: 4,
          }}
        >
          {annotation.title}
        </div>

        <div
          style={{
            fontSize: 12,
            color: "#cbd5f5",
            lineHeight: 1.4,
          }}
        >
          {annotation.message}
        </div>
      </div>

      {/* Magic Cube */}
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

        {/* Axis labels */}
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
      </svg>
    </div>
  );
}
