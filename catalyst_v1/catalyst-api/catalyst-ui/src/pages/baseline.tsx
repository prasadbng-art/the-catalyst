import { useState, useEffect } from "react";
import type { StressProfile } from "../components/visuals/motion";

/* ========================================================= */
type Persona = "CEO" | "CFO" | "CHRO";

const baselineAttritionRisk = 24.2;
const baselineAnnualCost = 1.94;

const baselineStress: StressProfile = {
  people: 65,
  cost: 70,
  macro: 60,
  execution: 45,
};

export default function BaselinePage() {
  //  const [persona, setPersona] = useState<Persona>("CEO");
  //  const [detailed, setDetailed] = useState(false);
  const [showSimulator, setShowSimulator] = useState(false);

  const [simulationOffset, setSimulationOffset] = useState<StressProfile>({
    people: 0,
    cost: 0,
    macro: 0,
    execution: 0,
  });

  const clamp = (v: number, min: number, max: number) =>
    Math.max(min, Math.min(max, v));

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.data?.type === "CATALYST_INTERVENTION_IMPACT") {
        const impact = event.data.payload;

        const people = clamp(impact.risk_delta * 0.6, -15, 15);
        const cost = clamp((impact.cost_avoided / 1_940_000) * 80, -20, 20);
        const execution = clamp(
          (impact.intervention_precision_score - 0.5) * 40,
          -10,
          15
        );

        setSimulationOffset({ people, cost, macro: 0, execution });
      }
    };

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  return (
    <div style={{ maxWidth: 1100, width: "100%" }}>
      <h1>Baseline</h1>

      <BaselineCanvas
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
        detailed={detailed}
      />

      <button onClick={() => setShowSimulator(true)}>
        Model Financial Impact
      </button>

      {showSimulator && (
        <iframe
          src="/resolution/index.html"
          style={{ width: "100%", height: 600, border: "1px solid #ddd" }}
        />
      )}
    </div>
  );
}

function BaselineCanvas({
  stress,
}: {
  stress: StressProfile;
  persona: Persona;
  detailed: boolean;
}) {
  const formatPct = (v: number) => `${v.toFixed(1)}%`;

  return (
    <div>
      People: {formatPct(stress.people)} | Cost: {formatPct(stress.cost)} |
      Macro: {formatPct(stress.macro)} | Execution:{" "}
      {formatPct(stress.execution)}
    </div>
  );
}
