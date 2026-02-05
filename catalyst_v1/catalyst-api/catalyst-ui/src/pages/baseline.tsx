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
  const dominantStress = getDominantStress(stress);
  const navigate = useNavigate();

  const BASELINE_PERSONA = PERSONAS.CEO;

  const ctaStyle: React.CSSProperties = {
    padding: "12px 22px",
    background: "#2563eb",
    border: "none",
    borderRadius: 10,
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: 600,
    minWidth: 240,
    textAlign: "center",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#020617",
        color: "#e5e7eb",
      }}
    >
      {/* ===== SINGLE LAYOUT CONTAINER (BOLT STYLE) ===== */}
      <div
        style={{
          maxWidth: 1400,
          margin: "0 auto",
          padding: "32px",
        }}
      >
        {/* ===== HEADER ===== */}
        <header
          style={{
            textAlign: "center",
            marginBottom: 48,
          }}
        >
          <h1
            style={{
              fontSize: 36,
              fontWeight: 400,
              letterSpacing: "0.04em",
              marginBottom: 12,
            }}
          >
            Enterprise Equilibrium Score
          </h1>

          {simulated && (
            <div
              style={{
                marginTop: 16,
                padding: "10px 14px",
                borderRadius: 8,
                background: "#1e293b",
                border: "1px solid #334155",
                display: "inline-flex",
                alignItems: "center",
                gap: 16,
              }}
            >
              <span style={{ fontSize: 14 }}>
                Simulation Active — Viewing adjusted organizational state
              </span>

              <button
                type="button"
                onClick={() => setSimulatedStress(null)}
                style={{
                  padding: "6px 12px",
                  borderRadius: 6,
                  border: "1px solid #475569",
                  background: "#0f172a",
                  color: "#ffffff",
                  cursor: "pointer",
                  fontSize: 13,
                }}
              >
                Return to Baseline
              </button>
            </div>
          )}
        </header>

        {/* ===== MAIN GRID (3 / 6 / 3) ===== */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "3fr 6fr 3fr",
            gap: 48,
            alignItems: "start",
            marginBottom: 64,
          }}
        >
          {/* LEFT PANEL */}
          <aside>
            <div
              style={{
                background: "#020617",
                border: "1px solid #1e293b",
                borderRadius: 12,
                padding: 24,
              }}
            >
              <strong>Enterprise Risk Snapshot</strong>

              <p style={{ marginTop: 12, lineHeight: 1.6 }}>
                This view shows the level of workforce pressure the organization
                is currently carrying.
              </p>

              <ul style={{ marginTop: 12 }}>
                <li>People stress level: {Math.round(stress.people * 100)}%</li>
                <li>Cost pressure index: {Math.round(stress.cost * 100)}%</li>
                <li>
                  Execution constraint:{" "}
                  {Math.round(stress.execution * 100)}%
                </li>
                <li>Macro exposure: {Math.round(stress.macro * 100)}%</li>
              </ul>
            </div>
          </aside>

          {/* CENTER HERO */}
          <main>
            <div
              style={{
                background:
                  "radial-gradient(circle at 50% 40%, #0b1220 0%, #020617 70%)",
                border: "1px solid rgba(56,189,248,0.15)",
                borderRadius: 20,
                padding: 32,
                display: "flex",
                justifyContent: "center",
              }}
            >
              <MagicCube
                stress={stress}
                persona={BASELINE_PERSONA}
                size={540}
              />
            </div>
          </main>

          {/* RIGHT PANEL */}
          <aside>
            <div
              style={{
                background: "#0f172a",
                border: "1px solid #1e293b",
                borderRadius: 12,
                padding: 16,
                lineHeight: 1.6,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  opacity: 0.6,
                  marginBottom: 8,
                }}
              >
                DOMINANT STRESS DRIVER
              </div>

              <div
                style={{
                  fontWeight: 700,
                  color: "#fb923c",
                  textTransform: "uppercase",
                  marginBottom: 12,
                }}
              >
                {dominantStress}
              </div>

              System absorbing pressure. Organizational stress remains elevated
              but contained. No structural instability detected.
            </div>
          </aside>
        </div>

        {/* ===== CTA ROW ===== */}
        <footer style={{ textAlign: "center" }}>
          <div
            style={{
              display: "inline-flex",
              gap: 20,
              flexWrap: "wrap",
            }}
          >
            <button
              style={ctaStyle}
              onClick={() => navigate("/ground-reality")}
            >
              Explore Operational Drivers →
            </button>

            <button style={ctaStyle} onClick={() => navigate("/simulation")}>
              Model Financial Impact →
            </button>

            <button
              style={ctaStyle}
              onClick={() => navigate("/retention-simulator")}
            >
              Run Retention Scenario →
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
