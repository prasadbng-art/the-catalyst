import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MagicCube from "../components/visuals/MagicCube";
import { PERSONAS, type Persona } from "../types/persona";
import { baseOrgState } from "../state/orgState";

const BASELINE_PERSONA = PERSONAS.CEO;
const BASELINE_STRESS = baseOrgState.stress;

export default function BaselinePage() {
  const [persona, setPersona] = useState<Persona>("CEO");
  const navigate = useNavigate();

  return (
    <div style={{ padding: "40px 60px" }}>
      {/* ===== HEADER ===== */}
      <div style={{ textAlign: "center", marginBottom: 120 }}>
        <h2 style={{ fontSize: 28, letterSpacing: "0.08em" }}>ENTERPRISE EQUILIBRIUM SCORE</h2>
      </div>

      {/* ===== MAIN 3-COLUMN LAYOUT ===== */}
      <div
        style={{
          maxWidth: 1400,
          marginLeft: 0,
          paddingLeft: 90,
          margin: 0,
          display: "grid",
          gap: 120,
          alignItems: "start",
          gridTemplateColumns: "520px 720px 420px",
        }}
      >
        {/* ================= LEFT PANEL ================= */}
        <div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ marginRight: 8 }}>View as:</label>
            <select
              value={persona}
              onChange={(e) => setPersona(e.target.value as Persona)}
            >
              <option value="CEO">CEO</option>
              <option value="CFO">CFO</option>
              <option value="CHRO">CHRO</option>
            </select>
          </div>

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
              <li>People stress level: {Math.round(BASELINE_STRESS.people * 100)}%</li>
              <li>Cost pressure index: {Math.round(BASELINE_STRESS.cost * 100)}%</li>
              <li>Execution constraint: {Math.round(BASELINE_STRESS.execution * 100)}%</li>
              <li>Macro exposure: {Math.round(BASELINE_STRESS.macro * 100)}%</li>
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
              background: "radial-gradient(circle at 50% 40%, #0b1220 0%, #020617 70%)",
              border: "1px solid rgba(56,189,248,0.15)",
              borderRadius: 20,
              padding: 28,
              boxShadow: `
                0 0 80px rgba(0,0,0,0.65)
                0 0 25px rgba(56,189,248,0.08)
              `,

            }}
          >
            <MagicCube stress={BASELINE_STRESS} persona={BASELINE_PERSONA} size={540} />
          </div>
        </div>

        {/* ================= RIGHT PANEL ================= */}
        <div>
          <div style={{ marginBottom: 8, fontSize: 12, opacity: 0.6 }}>
            DOMINANT STRESS DRIVER
          </div>

          <div style={{ color: "#fb923c", letterSpacing: "0.05em", fontWeight: 700, marginBottom: 14 }}>
            Cost Pressure
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
