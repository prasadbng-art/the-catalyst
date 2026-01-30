import { useState } from "react";
import MagicCube from "../components/visuals/MagicCube";
import type { StressProfile } from "../components/visuals/motion";
import type { Persona } from "../types/persona";
import { personaConfig } from "../persona/personaConfig";

/* =======================
   STATIC BASELINE DATA
   ======================= */

const BASELINE_STRESS: StressProfile = {
  people: 0.65,
  cost: 0.7,
  execution: 0.45,
  macro: 0.6,
};

const DEFAULT_PERSONA: Persona = "CEO";

/* =======================
   BASELINE PAGE
   ======================= */

export default function BaselinePage() {
  const [activePersona, setActivePersona] =
    useState<Persona>(DEFAULT_PERSONA);

  const [showPanel, setShowPanel] = useState(false);

  const personaMeta = personaConfig[activePersona];

  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        background: "#0f172a",
        color: "#e5e7eb",
      }}
    >
      {/* ================= LEFT ================= */}
      <div
        style={{
          flex: 1,
          padding: "32px 40px",
          overflowY: "auto",
        }}
      >
        <h1 style={{ fontSize: 42, fontWeight: 700 }}>Baseline</h1>

        <p style={{ marginTop: 6, color: "#94a3b8" }}>
          Current organizational pressure profile
        </p>

        {/* Persona Selector */}
        <div style={{ marginTop: 16 }}>
          <label style={{ fontSize: 14, marginRight: 8 }}>
            View as:
          </label>

          <select
            value={activePersona}
            onChange={(e) =>
              setActivePersona(e.target.value as Persona)
            }
          >
            <option value="CEO">CEO</option>
            <option value="CFO">CFO</option>
            <option value="CHRO">CHRO</option>
          </select>
        </div>

        {/* ===== Magic Cube ===== */}
        <div style={{ marginTop: 32, width: 320 }}>
          <MagicCube
            stress={BASELINE_STRESS}
            persona={activePersona}
          />
        </div>

        {/* ===== Persona Narrative ===== */}
        <div
          style={{
            marginTop: 32,
            background: "#020617",
            borderRadius: 10,
            padding: 20,
            maxWidth: 520,
          }}
        >
          <strong>{personaMeta.headline}</strong>

          <p style={{ marginTop: 12, lineHeight: 1.5 }}>
            {personaMeta.narrative}
          </p>

          <ul style={{ marginTop: 12 }}>
            <li>People risk: 65%</li>
            <li>Cost pressure: 70%</li>
            <li>Execution posture: 45%</li>
          </ul>
        </div>

        <button
          style={{
            marginTop: 28,
            padding: "10px 16px",
            background: "#1e40af",
            color: "white",
            borderRadius: 6,
            border: "none",
            fontWeight: 600,
          }}
          onClick={() => setShowPanel(true)}
        >
          Model Financial Impact
        </button>
      </div>

      {/* ================= RIGHT PANEL ================= */}
      {showPanel && (
        <div
          style={{
            width: "50%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            borderLeft: "1px solid #1e293b",
            background: "#020617",
          }}
        >
          {/* Header */}
          <div
            style={{
              height: 48,
              padding: "8px 12px",
              borderBottom: "1px solid #1e293b",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <strong>Financial Impact Modeling</strong>
            <button onClick={() => setShowPanel(false)}>
              Close
            </button>
          </div>

          {/* Financial Model */}
          <iframe
            src="/Catalyst/simulation"
            title="Financial Model"
            style={{
              flex: 1,
              border: "none",
              width: "100%",
            }}
          />

          {/* Retention CTA */}
          <div
            style={{
              padding: 16,
              borderTop: "1px solid #1e293b",
            }}
          >
            <button
              onClick={() =>
                window.open(
                  "/Catalyst/resolution/retention_simulator.html",
                  "_blank"
                )
              }
              style={{
                padding: "10px 16px",
                background: "#2563eb",
                color: "white",
                borderRadius: 6,
                border: "none",
                fontWeight: 600,
              }}
            >
              Open Retention Impact Simulator →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
