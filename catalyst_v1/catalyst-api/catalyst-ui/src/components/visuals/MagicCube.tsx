import type { StressProfile, Persona } from "./motion";
import {
  getMotionState,
  getMotionAnnotation,
} from "./motion";

/* =========================================================
   MagicCube — Static Stress Geometry (Phase IV.2)
========================================================= */

type MagicCubeProps = {
  stress: StressProfile;
  persona: Persona;
  size?: number;
};

export default function MagicCube({
  stress,
  persona,
  size = 220,
}: MagicCubeProps) {
  /* ---------------------------------------------
     Motion + annotation
  --------------------------------------------- */
  const motionState = getMotionState(stress);
  const annotation = getMotionAnnotation(motionState, persona);

  /* ---------------------------------------------
     Dominant stress detection
  --------------------------------------------- */
  const dominantKey = (Object.entries(stress) as [
    keyof StressProfile,
    number
  ][])
    .sort((a, b) => b[1] - a[1])[0][0];

  /* ---------------------------------------------
     Geometry
  --------------------------------------------- */
  const vertices = [
    { key: "people", x: size / 2, y: 28, label: "People" },
    { key: "cost", x: size - 28, y: size / 2, label: "Cost" },
    { key: "execution", x: size / 2, y: size - 28, label: "Execution" },
    { key: "macro", x: 28, y: size / 2, label: "Macro" },
  ] as const;

  /* =========================================================
     Render
  ========================================================= */
  return (
    <div style={{ width: size }}>
      {/* ================= Cube ================= */}
      <svg width={size} height={size}>
        {/* Crosshair */}
        <line
          x1={size / 2}
          y1={0}
          x2={size / 2}
          y2={size}
          stroke="#1e293b"
          strokeDasharray="4 4"
        />
        <line
          x1={0}
          y1={size / 2}
          x2={size}
          y2={size / 2}
          stroke="#1e293b"
          strokeDasharray="4 4"
        />

        {/* Polygon */}
        <polygon
          points={vertices.map(v => `${v.x},${v.y}`).join(" ")}
          fill="none"
          stroke="#38bdf8"
          strokeWidth={2}
        />

        {/* Vertices */}
        {vertices.map(v => {
          const isDominant = v.key === dominantKey;

          return (
            <g key={v.key}>
              {/* Soft glow for dominant stress */}
              {isDominant && (
                <circle
                  cx={v.x}
                  cy={v.y}
                  r={12}
                  fill="#38bdf8"
                  opacity={0.25}
                />
              )}

              {/* Core dot */}
              <circle
                cx={v.x}
                cy={v.y}
                r={5}
                fill={isDominant ? "#38bdf8" : "#94a3b8"}
              />

              {/* Label */}
              <text
                x={v.x}
                y={
                  v.key === "people"
                    ? v.y - 12
                    : v.key === "execution"
                    ? v.y + 20
                    : v.y + 4
                }
                textAnchor="middle"
                fontSize={11}
                fill={isDominant ? "#e5e7eb" : "#64748b"}
              >
                {v.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* ================= Annotation ================= */}
      <div
        style={{
          marginTop: 12,
          background: "#020617",
          border: "1px solid #1e293b",
          padding: 10,
          borderRadius: 6,
          color: "#e5e7eb",
          fontSize: 13,
          lineHeight: 1.5,
        }}
      >
        <div
          style={{
            fontSize: 12,
            color: "#94a3b8",
            marginBottom: 6,
          }}
        >
          Dominant stress driver:{" "}
          <strong>{dominantKey.toUpperCase()}</strong>
        </div>

        <strong>{annotation.title}</strong>
        <div>{annotation.message}</div>
      </div>
    </div>
  );
}
