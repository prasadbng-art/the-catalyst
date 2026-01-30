import { useState } from "react";
import MagicCube from "../components/visuals/MagicCube";
import type { StressProfile } from "../components/visuals/motion";
import { PERSONAS, type Persona } from "../types/persona";
import { personaConfig } from "../persona/personaConfig";

const BASELINE_PERSONA = PERSONAS.CEO;
const BASELINE_STRESS: StressProfile = {
  people: 0.65,
  cost: 0.7,
  execution: 0.45,
  macro: 0.6,
};

export default function BaselinePage() {
  const [persona, setPersona] = useState<Persona>("CEO");
  const [showPanel, setShowPanel] = useState(false);

  const narrative = personaConfig[persona];

  return (
    <div style={{ display: "flex", height: "100vh", background: "#020617" }}>
      {/* LEFT */}
      <div style={{ flex: 1, padding: 40, color: "#e5e7eb", overflowY: "auto" }}>
        <h1 style={{ fontSize: 42 }}>Baseline</h1>
        <p style={{ color: "#94a3b8" }}>Current organizational pressure profile</p>

        <div style={{ marginTop: 12 }}>
          <label>View as: </label>
          <select
            value={persona}
            onChange={(e) => setPersona(e.target.value as Persona)}
          >
            <option value="CEO">CEO</option>
            <option value="CFO">CFO</option>
            <option value="CHRO">CHRO</option>
          </select>
        </div>

        <div style={{ marginTop: 32, width: 320 }}>
          <MagicCube stress={BASELINE_STRESS} persona={BASELINE_PERSONA} />
        </div>

        <div
          style={{
            marginTop: 32,
            background: "#020617",
            border: "1px solid #1e293b",
            borderRadius: 12,
            padding: 20,
            maxWidth: 520,
          }}
        >
          <strong>{narrative.headline}</strong>
          <p style={{ marginTop: 12, lineHeight: 1.6 }}>{narrative.narrative}</p>

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
            background: "#2563eb",
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

      {/* RIGHT PANEL */}
      {showPanel && (
        <div
          style={{
            width: "40%",
            display: "flex",
            flexDirection: "column",
            borderLeft: "1px solid #1e293b",
            background: "#020617",
          }}
        >
          <div
            style={{
              height: 48,
              padding: "8px 12px",
              borderBottom: "1px solid #1e293b",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              color: "#e5e7eb",
            }}
          >
            <strong>Financial Impact Modeling</strong>
            <button onClick={() => setShowPanel(false)}>Close</button>
          </div>

          <iframe
            src="/Catalyst/simulation"
            style={{ flex: 1, border: "none" }}
            title="Financial Model"
          />

          <div style={{ padding: 16, borderTop: "1px solid #1e293b" }}>
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
