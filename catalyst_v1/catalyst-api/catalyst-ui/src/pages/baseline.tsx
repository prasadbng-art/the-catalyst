import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  const narrative = personaConfig[persona];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(520px, 1fr) 420px",
        gap: 48,
        alignItems: "start",
        height: "100%",
      }}
    >
      {/* LEFT */}
      <div>
        <h1 style={{ margin: 0 }}>Baseline</h1>
        <p style={{ color: "#94a3b8" }}>
          Current organizational pressure profile
        </p>

        <div style={{ marginBottom: 24 }}>
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
          }}
        >
          <strong>{narrative.headline}</strong>
          <p style={{ marginTop: 12 }}>{narrative.narrative}</p>

          <ul style={{ marginTop: 12 }}>
            <li>People stress level: {Math.round(BASELINE_STRESS.people * 100)}%</li>
            <li>Cost pressure index: {Math.round(BASELINE_STRESS.cost * 100)}%</li>
            <li>Execution constraint: {Math.round(BASELINE_STRESS.execution * 100)}%</li>
            <li>Macro exposure: {Math.round(BASELINE_STRESS.macro * 100)}%</li>
          </ul>
        </div>

        <button
          style={{
            marginTop: 24,
            padding: "10px 16px",
            background: "#2563eb",
            color: "#fff",
            borderRadius: 6,
            border: "none",
            cursor: "pointer",
          }}
          onClick={() => navigate("/simulation")}
        >
          Model Financial Impact →
        </button>
      </div>

      {/* RIGHT */}
      <div
        style={{
          background: "#020617",
          border: "1px solid #1e293b",
          borderRadius: 12,
          padding: 24,
        }}
      >
        <MagicCube
          stress={BASELINE_STRESS}
          persona={BASELINE_PERSONA}
          size={280}
        />
      </div>
    </div>
  );
}
