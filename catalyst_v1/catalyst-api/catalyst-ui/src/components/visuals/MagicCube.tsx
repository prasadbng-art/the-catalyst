import { useEffect, useRef, useState } from "react";
import type { StressProfile, Persona } from "./motion";
import { getMotionState, getMotionAnnotation } from "./motion";

/* =========================================================
   MagicCube — Stress-Weighted Geometry (Perceptual 3D)
========================================================= */

type MagicCubeProps = {
  stress: StressProfile;
  persona: Persona;
  size?: number;
  showAnnotation?: boolean;
};

export default function MagicCube({
  stress,
  persona,
  size = 220,
  showAnnotation = true,
}: MagicCubeProps) {
  /* ---------------------------------------------
     Inject animations once
  --------------------------------------------- */
  useEffect(() => {
    const styleId = "magiccube-style";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.innerHTML = `
        @keyframes cubePulse {
          0% { filter: drop-shadow(0 0 4px rgba(56,189,248,0.4)); }
          50% { filter: drop-shadow(0 0 16px rgba(56,189,248,0.9)); }
          100% { filter: drop-shadow(0 0 4px rgba(56,189,248,0.4)); }
        }
        @keyframes cubeBreathe {
          0% { transform: scale(1); }
          50% { transform: scale(1.015); }
          100% { transform: scale(1); }
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
     Parallax state
  --------------------------------------------- */
  const cubeRef = useRef<HTMLDivElement | null>(null);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const el = cubeRef.current;
    if (!el) return;

    const handleMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      setParallax({
        x: Math.max(-4, Math.min(4, -y * 8)),
        y: Math.max(-4, Math.min(4, x * 8)),
      });
    };

    const reset = () => setParallax({ x: 0, y: 0 });

    el.addEventListener("mousemove", handleMove);
    el.addEventListener("mouseleave", reset);

    return () => {
      el.removeEventListener("mousemove", handleMove);
      el.removeEventListener("mouseleave", reset);
    };
  }, []);

  /* ---------------------------------------------
     Geometry
  --------------------------------------------- */
  const CENTER = size / 2;
  const BASE_RADIUS = size * 0.25;
  const MAX_DELTA = size * 0.18;

  const radius = (v: number) => BASE_RADIUS + v * MAX_DELTA;

  const vertices = [
    { key: "people", label: "People", x: CENTER, y: CENTER - radius(stress.people) },
    { key: "cost", label: "Cost", x: CENTER + radius(stress.cost), y: CENTER },
    { key: "execution", label: "Execution", x: CENTER, y: CENTER + radius(stress.execution) },
    { key: "macro", label: "Macro", x: CENTER - radius(stress.macro), y: CENTER },
  ] as const;

  /* ---------------------------------------------
     Dominant stress + tilt
  --------------------------------------------- */
  const dominantKey = (Object.entries(stress) as [
    keyof StressProfile,
    number
  ][]).sort((a, b) => b[1] - a[1])[0][0];

  const tiltBias = {
    people: { x: 8, y: 0 },
    cost: { x: 0, y: -10 },
    execution: { x: 0, y: 10 },
    macro: { x: -6, y: 0 },
  }[dominantKey];

  const baseX = 28 + tiltBias.x;
  const baseY = -36 + tiltBias.y;

  const finalX = baseX + parallax.x;
  const finalY = baseY + parallax.y;

  /* =========================================================
     Render
  ========================================================= */
  return (
    <div
      style={{
        width: size,
        perspective: "1200px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* ===== CUBE ONLY (3D) ===== */}
      <div
        ref={cubeRef}
        style={{
          transform: `rotateX(${finalX}deg) rotateY(${finalY}deg)`,
          transformStyle: "preserve-3d",
          transition: "transform 0.25s ease-out",
          boxShadow: "0 60px 120px rgba(0,0,0,0.65)",
        }}
      >
        <svg width={size} height={size}>
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

          <line x1={CENTER} y1={0} x2={CENTER} y2={size} stroke="#1e293b" strokeDasharray="4 4" />
          <line x1={0} y1={CENTER} x2={size} y2={CENTER} stroke="#1e293b" strokeDasharray="4 4" />

          <polygon
            points={vertices.map(v => `${v.x},${v.y}`).join(" ")}
            fill="none"
            stroke="url(#cubeGlow)"
            strokeWidth={3}
            filter="url(#softGlow)"
            style={{ animation: "cubeBreathe 6s ease-in-out infinite" }}
          />

          {vertices.map(v => {
            const isDominant = v.key === dominantKey;
            return (
              <g key={v.key}>
                {isDominant && (
                  <circle
                    cx={v.x}
                    cy={v.y}
                    r={16}
                    fill="url(#cubeGlow)"
                    style={{ animation: "cubePulse 2.8s ease-in-out infinite" }}
                  />
                )}
                <circle cx={v.x} cy={v.y} r={5} fill={isDominant ? "#38bdf8" : "#94a3b8"} />
                <text
                  x={v.x}
                  y={v.key === "people" ? v.y - 12 : v.key === "execution" ? v.y + 20 : v.y + 4}
                  textAnchor="middle"
                  fontSize={13}
                  fill={isDominant ? "#e5e7eb" : "#94a3b8"}
                >
                  {v.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* ===== FLAT ANNOTATION ===== */}
      {showAnnotation && (
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
      )}
    </div>
  );
}
