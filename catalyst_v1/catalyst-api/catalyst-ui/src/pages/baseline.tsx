import { useState } from "react";
import MagicCube from "../components/visuals/MagicCube";
import type { StressProfile } from "../components/visuals/motion";
import { PERSONAS, type Persona } from "../types/persona";
import { personaConfig } from "../persona/personaConfig";
import PageShell from "../components/layout/PageShell";

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
    <PageShell>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(420px, 1fr) minmax(420px, 1fr)",
          alignItems: "start",
          gap: "clamp(40px, 6vw, 80px)",
        }}
      >
        {/* LEFT — Narrative & Snapshot */}
        <div style={{ maxWidth: 560, paddingTop: 8 }}>
          <h1 style={{ fontSize: "clamp(28px, 4vw, 42px)", marginBottom: 8 }}>
            Baseline
          </h1>

          <p style={{ color: "#94a3b8", marginBottom: 24 }}>
            Current organizational pressure profile
          </p>

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

          <div
            style={{
              background: "#020617",
              border: "1px solid #1e293b",
              borderRadius: 14,
              padding: "clamp(16px, 2.5vw, 24px)",
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

        {/* RIGHT — Organizational Stress Visualization */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              color: "#94a3b8",
            }}
          >
            Organizational Stress
          </div>

          <div
            style={{
              background: "#020617",
              border: "1px solid #1e293b",
              borderRadius: 16,
              padding: 24,
            }}
          >
            <MagicCube
              stress={BASELINE_STRESS}
              persona={BASELINE_PERSONA}
              size={300}
            />
          </div>
        </div>
      </div>
    </PageShell>
  );
}
