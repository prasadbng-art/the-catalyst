import type { StressProfile, Persona } from "./motion";
import { getMotionState, getMotionAnnotation } from "./motion";

/* =========================================================
   MagicCube — Stress-Weighted Geometry (Phase IV.3)
========================================================= */

type MagicCubeProps = {
  stress: StressProfile;
  persona: Persona;
  size?: number;
};

/**
 * Geometry model:
 * - Center is fixed
 * - Each vertex is pushed outward based on stress (0–100)
 * - Shape deformation = intelligence
 */
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
     Geometry constants
  --------------------------------------------- */
  const CENTER = size / 2;
  const BASE_RADIUS = size * 0.25;     // neutral shape
  const MAX_DELTA = size * 0.18;       // max deformation

  const radius = (value: number) =>
    BASE_RADIUS + value * MAX_DELTA;

  /* ---------------------------------------------
     Stress-weighted vertices
  --------------------------------------------- */
  const vertices = [
    {
      key: "people",
      label: "People",
      x: CENTER,
      y: CENTER - radius(stress.people),
    },
    {
      key: "cost",
      label: "Cost",
      x: CENTER + radius(stress.cost),
      y: CENTER,
    },
    {
      key: "execution",
      label: "Execution",
      x: CENTER,
      y: CENTER + radius(stress.execution),
    },
    {
      key: "macro",
      label: "Macro",
      x: CENTER - radius(stress.macro),
      y: CENTER,
    },
  ] as const;

  /* ---------------------------------------------
     Dominant stress detection
  --------------------------------------------- */
  const dominantKey = (Object.entries(stress) as [
    keyof StressProfile,
    number
  ][])
    .sort((a, b) => b[1] - a[1])[0][0];

  /* =========================================================
     Render
  ========================================================= */
  return (
    <div style={{ width: size }}>
      {/* ================= Cube ================= */}
      <svg width={size} height={size}>
        {/* Crosshair */}
        <line
          x1={CENTER}
          y1={0}
          x2={CENTER}
          y2={size}
          stroke="#1e293b"
          strokeDasharray="4 4"
        />
        <line
          x1={0}
          y1={CENTER}
          x2={size}
          y2={CENTER}
          stroke="#1e293b"
          strokeDasharray="4 4"
        />

        {/* Deformed polygon */}
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
              {/* Glow for dominant stress */}
              {isDominant && (
                <circle
                  cx={v.x}
                  cy={v.y}
                  r={14}
                  fill="#38bdf8"
                  opacity={0.25}
                />
              )}

              {/* Core point */}
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
                    ? v.y - 10
                    : v.key === "execution"
                      ? v.y + 18
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
          padding: 12,
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
