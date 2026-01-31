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
        <p style={{ color: "#94a3b8" }}>
          Current organizational pressure profile
        </p>

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

        {/* DETAILED SUMMARY — NOW CONSISTENT */}
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
          <p style={{ marginTop: 12, lineHeight: 1.6 }}>
            {narrative.narrative}
          </p>

          <ul style={{ marginTop: 12, color: "#cbd5f5" }}>
            <li>
              People stress level: {Math.round(BASELINE_STRESS.people * 100)}%
            </li>
            <li>
              Cost pressure index: {Math.round(BASELINE_STRESS.cost * 100)}%
            </li>
            <li>
              Execution constraint:{" "}
              {Math.round(BASELINE_STRESS.execution * 100)}%
            </li>
            <li>
              Macro exposure: {Math.round(BASELINE_STRESS.macro * 100)}%
            </li>
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

      {/* RIGHT PANEL — NOW INTENTIONAL */}
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
            <strong>Next Step</strong>
            <button onClick={() => setShowPanel(false)}>Close</button>
          </div>

          <div style={{ padding: 24, color: "#cbd5f5", flex: 1 }}>
            <p style={{ marginBottom: 16 }}>
              Move from baseline stress exposure to quantified financial impact
              using Catalyst’s financial model.
            </p>

            <button
              onClick={() => {
                const params = new URLSearchParams({
                  people: BASELINE_STRESS.people.toString(),
                  cost: BASELINE_STRESS.cost.toString(),
                  execution: BASELINE_STRESS.execution.toString(),
                  macro: BASELINE_STRESS.macro.toString(),
                  persona,
                });

                window.location.assign(`/Catalyst/simulate?${params.toString()}`);
              }}
              style={{
                padding: "10px 16px",
                background: "#2563eb",
                color: "white",
                borderRadius: 6,
                border: "none",
                fontWeight: 600,
              }}
            >
              Open Financial Model →
            </button>

          </div>

          <div style={{ padding: 16, borderTop: "1px solid #1e293b" }}>
            <button
              onClick={() =>
                window.open(
                  "/resolution/retention_simulator.html",
                  "_blank"
                )
              }
              style={{
                padding: "10px 16px",
                background: "#0f172a",
                color: "white",
                borderRadius: 6,
                border: "1px solid #2563eb",
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
