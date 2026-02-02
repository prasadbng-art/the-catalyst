import { useEffect } from "react";
import type { StressProfile, Persona } from "./motion";
import { getMotionState, getMotionAnnotation } from "./motion";

/* =========================================================
   MagicCube — Stress-Weighted Geometry (Enhanced Visuals)
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
     Inject pulse animation once
  --------------------------------------------- */
  useEffect(() => {
    const styleId = "magiccube-pulse-style";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.innerHTML = `
        @keyframes cubePulse {
          0% { filter: drop-shadow(0 0 4px rgba(56,189,248,0.4)); }
          50% { filter: drop-shadow(0 0 16px rgba(56,189,248,0.9)); }
          100% { filter: drop-shadow(0 0 4px rgba(56,189,248,0.4)); }
        }
        @keyframes cubeBreath {
          0% { transform: scale(1);}
          50% { transform: scale(1.015);}
          100% { transform: scale(1);}
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  /* ---------------------------------------------
     Motion + annotation
  --------------------------------------------- */
  const motionState = getMotionState(stress);
  const annotation = getMotionAnnotation(motionState, persona);

  /* ---------------------------------------------
     Geometry constants
  --------------------------------------------- */
  const CENTER = size / 2;
  const BASE_RADIUS = size * 0.25;
  const MAX_DELTA = size * 0.18;

  const radius = (value: number) =>
    BASE_RADIUS + value * MAX_DELTA;

  /* ---------------------------------------------
     Stress-weighted vertices
  --------------------------------------------- */
  const vertices = [
    { key: "people", label: "People", x: CENTER, y: CENTER - radius(stress.people) },
    { key: "cost", label: "Cost", x: CENTER + radius(stress.cost), y: CENTER },
    { key: "execution", label: "Execution", x: CENTER, y: CENTER + radius(stress.execution) },
    { key: "macro", label: "Macro", x: CENTER - radius(stress.macro), y: CENTER },
  ] as const;

  /* ---------------------------------------------
     Dominant stress detection
  --------------------------------------------- */
  const dominantKey = (Object.entries(stress) as [
    keyof StressProfile,
    number
  ][]).sort((a, b) => b[1] - a[1])[0][0];

  /* =========================================================
     Render
  ========================================================= */
  return (
    <div style={{ width: size }}>
      <svg width={size} height={size}>
        {/* ===== DEFINITIONS (Glow + Gradient) ===== */}
        <defs>
          <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <linearGradient id="cubeGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
        </defs>

        {/* Crosshair */}
        <line x1={CENTER} y1={0} x2={CENTER} y2={size} stroke="#1e293b" strokeDasharray="4 4" />
        <line x1={0} y1={CENTER} x2={size} y2={CENTER} stroke="#1e293b" strokeDasharray="4 4" />

        {/* Deformed polygon */}
        <polygon
          points={vertices.map(v => `${v.x},${v.y}`).join(" ")}
          fill="none"
          stroke="url(#cubeGlow)"
          strokeWidth={2.5}
          filter="url(#softGlow)"
          style={{
            animation: "cubeBreathe 6s ease-in-out infinite",
            transformOrigin: `$(CENTER)px $(CENTER)px`,
          }}
        />

        {/* Vertices */}
        {vertices.map(v => {
          const isDominant = v.key === dominantKey;

          return (
            <g key={v.key}>
              {isDominant && (
                <circle
                  cx={v.x}
                  cy={v.y}
                  r={14}
                  fill="url(#cubeGlow)"
                  style={{ animation: "cubePulse 2.8s ease-in-out infinite" }}
                />
              )}

              <circle
                cx={v.x}
                cy={v.y}
                r={5}
                fill={isDominant ? "#38bdf8" : "#94a3b8"}
              />

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
                fontSize={13}
                fontWeight={500}
                letterSpacing="0.03em"
                fill={isDominant ? "#e5e7eb" : "#94a3b8"}
                style={{ textShadow: "0 0 6px rgba(0,0,0,0.8)" }}
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
        <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 6 }}>
          Dominant stress driver: <strong>{dominantKey.toUpperCase()}</strong>
        </div>

        <strong>{annotation.title}</strong>
        <div>{annotation.message}</div>
      </div>
    </div>
  );
}
