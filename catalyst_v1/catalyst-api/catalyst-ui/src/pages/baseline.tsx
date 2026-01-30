import { useState, useEffect } from "react";
import MagicCube from "../components/visuals/MagicCube";
import type { StressProfile } from "../components/visuals/motion";

/* =========================================================
   Types & Baseline
========================================================= */
type Persona = "CEO" | "CFO" | "CHRO";

const baselineStress: StressProfile = {
  people: 65,
  cost: 70,
  macro: 60,
  execution: 45,
};

/* =========================================================
   Page
========================================================= */
export default function BaselinePage() {
  const [persona] = useState<Persona>("CEO");
  const [showSimulator, setShowSimulator] = useState(false);

  const [simulationOffset, setSimulationOffset] = useState<StressProfile>({
    people: 0,
    cost: 0,
    macro: 0,
    execution: 0,
  });

  /* =========================================================
     Helpers
  ========================================================= */
  const clamp = (v: number, min: number, max: number) =>
    Math.max(min, Math.min(max, v));

  // Demo-only visual amplification (presentation layer only)
  const demoAmplify = (delta: number, baseline: number) =>
    clamp(baseline + delta * 2.5, 0, 100);

  /* =========================================================
     Listen to Retention Simulator (iframe)
  ========================================================= */
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      console.log("MESSAGE RECEIVED:", event.data);
      if (event.data?.type !== "CATALYST_INTERVENTION_IMPACT") return;

      const impact = event.data.payload;

      const people = clamp(impact.risk_delta * 1.2, -15, 15);
      const cost = clamp((impact.cost_avoided / 1_940_000) * 120, -30, 30);
      const execution = clamp(
        (impact.intervention_precision_score - 0.5) * 60,
        -20,
        25
      );

      setSimulationOffset({
        people,
        cost,
        macro: 0,
        execution,
      });
    };

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  /* =========================================================
     Render
  ========================================================= */
  return (
    <div style={{ maxWidth: 1100, width: "100%", padding: 24 }}>
      <h1>Baseline</h1>
      <p style={{ color: "#64748b", marginBottom: 16 }}>
        Current organizational pressure profile
      </p>

      {/* Cube */}
      <div style={{ marginBottom: 24 }}>
        <MagicCube
          stress={{
            people: demoAmplify(
              simulationOffset.people,
              baselineStress.people
            ),
            cost: demoAmplify(
              simulationOffset.cost,
              baselineStress.cost
            ),
            macro: baselineStress.macro,
            execution: demoAmplify(
              simulationOffset.execution,
              baselineStress.execution
            ),
          }}
          persona={persona}
        />
      </div>

      {/* Narrative */}
      <div
        style={{
          marginTop: 16,
          marginBottom: 24,
          padding: 16,
          background: "#020617",
          border: "1px solid #1e293b",
          borderRadius: 8,
          color: "#e5e7eb",
          maxWidth: 420,
        }}
      >
        <p style={{ marginBottom: 8 }}>
          <strong>People pressure:</strong>{" "}
          {Math.round(
            baselineStress.people + simulationOffset.people
          )}
          %
        </p>
        <p style={{ marginBottom: 8 }}>
          <strong>Cost pressure:</strong>{" "}
          {Math.round(
            baselineStress.cost + simulationOffset.cost
          )}
          %
        </p>
        <p>
          <strong>Execution posture:</strong>{" "}
          {Math.round(
            baselineStress.execution + simulationOffset.execution
          )}
          %
        </p>
      </div>

      {/* CTA */}
      <button
        onClick={() => setShowSimulator(true)}
        style={{
          padding: "10px 16px",
          borderRadius: 6,
          border: "none",
          background: "#1e40af",
          color: "white",
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        Model Financial Impact
      </button>

      {/* Simulator Panel */}
      {showSimulator && (
        <div
          style={{
            position: "fixed",
            top: 0,
            right: 0,
            width: "50%",
            height: "100%",
            background: "white",
            borderLeft: "1px solid #e5e7eb",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              padding: 12,
              borderBottom: "1px solid #e5e7eb",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <strong>Targeted Retention Scenarios</strong>
            <button onClick={() => setShowSimulator(false)}>
              Close
            </button>
          </div>

          <iframe
            src={'${import.meta.env.BASE_URL}resolution/retention_simulator.html'}
            style={{
              width: "100%",
              height: "calc(100% - 48px)",
              border: "none",
            }}
            title="Retention Simulator"
          />
        </div>
      )}
    </div>
  );
}
