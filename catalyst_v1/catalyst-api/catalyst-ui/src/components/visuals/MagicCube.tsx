type StressProfile = {
  peopleRisk: number;
  costPressure: number;
  executionStrain: number;
  macroVolatility: number;
};

export default function StaticMagicCube({
  stress,
  size = 240,
}: {
  stress: StressProfile;
  size?: number;
}) {
  const center = size / 2;
  const radius = size * 0.35;

  // Convert normalized stress (0–1) into radial points
  const points = [
    {
      label: "People",
      value: stress.peopleRisk,
      x: center,
      y: center - radius * stress.peopleRisk,
    },
    {
      label: "Cost",
      value: stress.costPressure,
      x: center + radius * stress.costPressure,
      y: center,
    },
    {
      label: "Execution",
      value: stress.executionStrain,
      x: center,
      y: center + radius * stress.executionStrain,
    },
    {
      label: "Macro",
      value: stress.macroVolatility,
      x: center - radius * stress.macroVolatility,
      y: center,
    },
  ];

  const polygonPoints = points
    .map((p) => `${p.x},${p.y}`)
    .join(" ");

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
    </svg>
  );
}
