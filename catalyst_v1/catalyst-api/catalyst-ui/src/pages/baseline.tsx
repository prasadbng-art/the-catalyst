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
  const narrative = personaConfig[persona];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1.2fr 0.8fr",
        height: "100vh",
        background: "#020617",
        color: "#e5e7eb",
      }}
    >
      {/* LEFT — Narrative & Controls */}
      <div
        style={{
          padding: "48px 56px",
          overflowY: "auto",
        }}
      >
        <div style={{ maxWidth: 640 }}>
          <h1 style={{ fontSize: 42, marginBottom: 8 }}>Baseline</h1>
          <p style={{ color: "#94a3b8", marginBottom: 20 }}>
            Current organizational pressure profile
          </p>

          {/* Persona selector */}
          <div style={{ marginBottom: 28 }}>
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

          {/* Enterprise Risk Snapshot */}
          <div
            style={{
              background: "#020617",
              border: "1px solid #1e293b",
              borderRadius: 12,
              padding: 20,
            }}
          >
            <strong>{narrative.headline}</strong>

            <p style={{ marginTop: 12, lineHeight: 1.6 }}>
              {narrative.narrative}
            </p>

            <ul style={{ marginTop: 12, color: "#cbd5f5" }}>
              <li>
                People stress level:{" "}
                {Math.round(BASELINE_STRESS.people * 100)}%
              </li>
              <li>
                Cost pressure index:{" "}
                {Math.round(BASELINE_STRESS.cost * 100)}%
              </li>
              <li>
                Execution constraint:{" "}
                {Math.round(BASELINE_STRESS.execution * 100)}%
              </li>
              <li>
                Macro exposure:{" "}
                {Math.round(BASELINE_STRESS.macro * 100)}%
              </li>
            </ul>
          </div>

          {/* CTA */}
          <button
            style={{
              marginTop: 32,
              padding: "12px 20px",
              background: "#2563eb",
              color: "white",
              borderRadius: 8,
              border: "none",
              fontWeight: 600,
              fontSize: 15,
              cursor: "pointer",
            }}
            onClick={() => {
              window.location.assign("/Catalyst/simulate");
            }}
          >
            Model Financial Impact →
          </button>
        </div>
      </div>

      {/* RIGHT — Visual Anchor */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          paddingRight: 56,
        }}
      >
        <div style={{ transform: "scale(1.15)" }}>
          <MagicCube stress={BASELINE_STRESS} persona={BASELINE_PERSONA} />
        </div>
      </div>
    </div>
  );
}
