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

  const clamp = (v: number, min: number, max: number) =>
    Math.max(min, Math.min(max, v));

  /* =====================================================
     Listen to Retention Simulator (iframe)
  ===================================================== */
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      console.log("MESSAGE RECEIVED:", event.data);
      if (event.data?.type !== "CATALYST_INTERVENTION_IMPACT") return;

      const impact = event.data.payload;

      const people = clamp(impact.risk_delta * 0.6, -15, 15);
      const cost = clamp((impact.cost_avoided / 1_940_000) * 80, -20, 20);
      const execution = clamp(
        (impact.intervention_precision_score - 0.5) * 40,
        -10,
        15
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
            people: clamp(baselineStress.people + simulationOffset.people, 0, 100),
            cost: clamp(baselineStress.cost + simulationOffset.cost, 0, 100),
            macro: baselineStress.macro,
            execution: clamp(
              baselineStress.execution + simulationOffset.execution,
              0,
              100
            ),
          }}
          persona={persona}
        />
      </div>
      <div style={{ marginBottom: 24, color: "#0f172a" }}>
        <p>
          <strong>People pressure:</strong>{" "}
          {Math.round(baselineStress.people + simulationOffset.people)}%
        </p>
        <p>
          <strong>Cost pressure:</strong>{" "}
          {Math.round(baselineStress.cost + simulationOffset.cost)}%
        </p>
        <p>
          <strong>Execution posture:</strong>{" "}
          {Math.round(baselineStress.execution + simulationOffset.execution)}%
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
            <button onClick={() => setShowSimulator(false)}>Close</button>
          </div>

          <iframe
            src="/resolution/index.html"
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
