import { useNavigate } from "react-router-dom";
import MagicCube from "../components/visuals/MagicCube";
import { baseOrgState } from "../state/orgState";
import {
  getSimulatedStress,
  setSimulatedStress,
} from "../state/simulatedStressState";
import { PERSONAS } from "../types/persona";

/* =========================================================
   Helpers
========================================================= */
function getDominantStress(stress: typeof baseOrgState.stress) {
  return (Object.entries(stress) as [keyof typeof stress, number][])
    .sort((a, b) => b[1] - a[1])[0][0];
}

export default function BaselinePage() {
  const simulated = getSimulatedStress();
  const stress = simulated ?? baseOrgState.stress;
  const navigate = useNavigate();
  const BASELINE_PERSONA = PERSONAS.CEO

  /* =========================================================
     Stress source (single truth)
  ========================================================= */
  const dominantStress = getDominantStress(stress);

  return (
    <div style={{ padding: "40px 60px" }}>
      {/* ===== HEADER ===== */}
      <div style={{ textAlign: "center", marginBottom: 120 }}>
        <h2 style={{ fontSize: 28, letterSpacing: "0.08em" }}>
          ENTERPRISE EQUILIBRIUM SCORE
        </h2>

        {simulated && (
          <div
            style={{
              marginTop: 12,
              display: "flex",
              gap: 12,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                padding: "6px 12px",
                background: "#1e293b",
                border: "1px solid #334155",
                borderRadius: 999,
                fontSize: 12,
                color: "#38bdf8",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              Simulation Active
            </div>

            <button
              onClick={() => {
                setSimulatedStress(null);
              }}
              style={{
                padding: "6px 12px",
                background: "#334155",
                color: "#e2e8f0",
                border: "1px solid #475569",
                borderRadius: 999,
                fontSize: 12,
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
              Return to Baseline
            </button>
          </div>
        )}
      </div>

      {/* ===== MAIN 3-COLUMN LAYOUT ===== */}
      <div
        style={{
          maxWidth: 1400,
          paddingLeft: 90,
          display: "grid",
          gap: 120,
          alignItems: "start",
          gridTemplateColumns: "520px 720px 420px",
        }}
      >
        {/* ================= LEFT PANEL ================= */}
        <div>
          <div
            style={{
              background: "#020617",
              border: "1px solid #1e293b",
              borderRadius: 12,
              padding: 24,
              marginBottom: 24,
            }}
          >

            <strong>Enterprise Risk Snapshot</strong>
            <p style={{ marginTop: 12 }}>
              This view shows the level of workforce pressure the organization is
              currently carrying. If attrition continues at this level, it can
              affect delivery timelines, leadership continuity, and overall
              stability.
            </p>

            <ul style={{ marginTop: 12 }}>
              <li>People stress level: {Math.round(stress.people * 100)}%</li>
              <li>Cost pressure index: {Math.round(stress.cost * 100)}%</li>
              <li>
                Execution constraint: {Math.round(stress.execution * 100)}%
              </li>
              <li>Macro exposure: {Math.round(stress.macro * 100)}%</li>
            </ul>
          </div>

          <div>
            <button
              onClick={() => navigate("/simulation")}
              style={{
                padding: "10px 16px",
                background: "#2563eb",
                color: "#fff",
                borderRadius: 6,
                border: "none",
                cursor: "pointer",
                marginRight: 16,
              }}
            >
              Model Financial Impact →
            </button>

            <button
              onClick={() => navigate("/retention-simulator")}
              style={{
                padding: "10px 14px",
                background: "#1d4ed8",
                color: "white",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Retention Intervention Simulator →
            </button>
          </div>
        </div>

        {/* ================= CENTER PANEL ================= */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <div
            style={{
              background:
                "radial-gradient(circle at 50% 40%, #0b1220 0%, #020617 70%)",
              border: "1px solid rgba(56,189,248,0.15)",
              borderRadius: 20,
              padding: 28,
              boxShadow: `
                0 0 80px rgba(0,0,0,0.65),
                0 0 25px rgba(56,189,248,0.08)
              `,
            }}
          >
            <MagicCube stress={stress} persona={BASELINE_PERSONA} size={540} />
          </div>
        </div>

        {/* ================= RIGHT PANEL ================= */}
        <div>
          <div style={{ marginBottom: 8, fontSize: 12, opacity: 0.6 }}>
            DOMINANT STRESS DRIVER
          </div>

          <div
            style={{
              color: "#fb923c",
              letterSpacing: "0.05em",
              fontWeight: 700,
              marginBottom: 14,
              textTransform: "uppercase",
            }}
          >
            {dominantStress}
          </div>

          <div
            style={{
              background: "#0f172a",
              border: "1px solid #1e293b",
              borderRadius: 12,
              padding: 16,
              lineHeight: 1.6,
            }}
          >
            System absorbing pressure. Organizational stress remains elevated
            but contained. No structural instability detected under current
            operating conditions.
          </div>
        </div>
      </div>
    </div>
  );
}
