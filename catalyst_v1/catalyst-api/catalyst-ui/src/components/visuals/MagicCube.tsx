import type { StressProfile, Persona } from "./motion";
import { getMotionState, getMotionAnnotation } from "./motion";

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
  const motionState = getMotionState(stress);
  const annotation = getMotionAnnotation(motionState, persona);

  return (
    <div style={{ position: "relative", width: size }}>
      {/* Placeholder cube geometry (static for now) */}
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={40} r={6} fill="#38bdf8" />
        <circle cx={size - 40} cy={size / 2} r={6} fill="#38bdf8" />
        <circle cx={size / 2} cy={size - 40} r={6} fill="#38bdf8" />
        <circle cx={40} cy={size / 2} r={6} fill="#38bdf8" />
      </svg>

      {/* Annotation */}
      <div
        style={{
          marginTop: 12,
          background: "#020617",
          border: "1px solid #1e293b",
          padding: 10,
          borderRadius: 6,
          color: "#e5e7eb",
          fontSize: 13,
        }}
      >
        <strong>{annotation.title}</strong>
        <div>{annotation.message}</div>
      </div>
    </div>
  );
}
