import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageShell from "../components/layout/PageShell";
import MagicCube from "../components/visuals/MagicCube";
import type { Persona } from "../types/persona";
import { personaConfig } from "../persona/personaConfig";
import { setSimulatedStress } from "../state/simulatedStressState";
import { baseOrgState } from "../state/orgState";
import {
  getScenarioAttritionDelta,
  setScenarioAttritionDelta,
  clearScenarioAttritionDelta,
} from "../state/scenarioState";

type AppliedSimulationInputs = {
  riskReductionPct: number;
  interventionCost: number;
  timeHorizon: 1 | 3;
};

/* =========================================================
   Financial model constants
========================================================= */
const DEFAULT_BASELINE_COST = 15_300_000;

const SENSITIVITY = {
  low: 0.7,
  base: 1.0,
  high: 1.3,
};

export default function SimulatePage() {
  const navigate = useNavigate();

  /* ---------------- External Scenario ---------------- */
  const scenarioDeltaPct = getScenarioAttritionDelta();
  const isScenarioActive = scenarioDeltaPct !== null;

  /* ---------------- Persona ---------------- */
  const [persona, setPersona] = useState<Persona>("CFO");

  /* ---------------- Input Controls ---------------- */
  const [riskReductionPct, setRiskReductionPct] = useState(10);
  const [interventionCost, setInterventionCost] = useState(100_000);
  const [timeHorizon, setTimeHorizon] = useState<1 | 3>(3);

  /* ---------------- Applied Simulation ---------------- */
  const [appliedInputs, setAppliedInputs] =
    useState<AppliedSimulationInputs | null>(null);

  useEffect(() => {
    if (scenarioDeltaPct !== null && appliedInputs === null) {
      setAppliedInputs({
        riskReductionPct: Math.min(Math.abs(scenarioDeltaPct) * 2, 30),
        interventionCost,
        timeHorizon,
      });
    }
  }, [scenarioDeltaPct]);

  /* =========================================================
     Effective inputs (ONLY after Apply Simulation)
  ========================================================= */
  const effectiveRiskReductionPct =
    appliedInputs?.riskReductionPct ??
    0;
  const effectiveTimeHorizon =
    appliedInputs?.timeHorizon ?? timeHorizon;

  const intensity = effectiveRiskReductionPct / 100;

  /* =========================================================
     Simulated Stress (Preview + Applied)
  ========================================================= */
  const simulatedStress = {
    people: Math.max(0, baseOrgState.stress.people - 0.4 * intensity),
    cost: Math.max(0, baseOrgState.stress.cost - 0.3 * intensity),
    execution: Math.max(0, baseOrgState.stress.execution - 0.25 * intensity),
    macro: baseOrgState.stress.macro,
  };

  /* =========================================================
     Financial Impact
  ========================================================= */
  const annualSavings = DEFAULT_BASELINE_COST * intensity;

  const ladder = {
    low: annualSavings * SENSITIVITY.low * effectiveTimeHorizon,
    base: annualSavings * SENSITIVITY.base * effectiveTimeHorizon,
    high: annualSavings * SENSITIVITY.high * effectiveTimeHorizon,
  };

  const copy = personaConfig[persona];

  /* =========================================================
     Render
  ========================================================= */
  return (
    <PageShell>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "630px 1fr 360px",
          gap: 48,
          alignItems: "start",
        }}
      >
        {/* =====================================================
            LEFT COLUMN — Controls + Financial Impact
        ====================================================== */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Header */}
          <div>
            <h1 style={{ fontSize: 36, marginBottom: 8 }}>
              Financial Simulation
            </h1>
            <p style={{ color: "#94a3b8" }}>
              Test how changes in retention risk translate into financial impact.
            </p>
          </div>

          {/* Persona */}
          <div>
            {(["CEO", "CFO", "CHRO"] as Persona[]).map((p) => {
              const active = persona === p;
              return (
                <button
                  key={p}
                  onClick={() => setPersona(p)}
                  style={{
                    marginRight: 8,
                    padding: "8px 14px",
                    borderRadius: 6,
                    border: active
                      ? "2px solid #2563eb"
                      : "1px solid #1e293b",
                    background: active ? "#2563eb" : "#020617",
                    color: active ? "#ffffff" : "#cbd5f5",
                    fontWeight: active ? 600 : 500,
                    cursor: "pointer",
                  }}
                >
                  {p}
                </button>
              );
            })}
          </div>

          {/* Inputs */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            <div>
              <label>Risk Reduction (%)</label>
              <input
                type="number"
                value={riskReductionPct}
                disabled={isScenarioActive}
                onChange={(e) => setRiskReductionPct(Number(e.target.value))}
                style={{ width: "100%", marginTop: 6 }}
              />
            </div>

            <div>
              <label>Cost of Action</label>
              <input
                type="number"
                value={interventionCost}
                disabled={isScenarioActive}
                onChange={(e) => setInterventionCost(Number(e.target.value))}
                style={{ width: "100%", marginTop: 6 }}
              />
            </div>
          </div>

          {/* Time Horizon */}
          <div>
            {[1, 3].map((y) => (
              <button
                key={y}
                onClick={() => setTimeHorizon(y as 1 | 3)}
                style={{
                  marginRight: 8,
                  padding: "6px 12px",
                  borderRadius: 6,
                  border:
                    timeHorizon === y
                      ? "2px solid #2563eb"
                      : "1px solid #1e293b",
                  background:
                    timeHorizon === y ? "#2563eb" : "#020617",
                  color:
                    timeHorizon === y ? "#ffffff" : "#cbd5f5",
                  fontWeight: timeHorizon === y ? 600 : 500,
                  cursor: "pointer",
                }}
              >
                {y} Year{y === 3 ? "s" : ""}
              </button>
            ))}
          </div>

          {/* Apply / Reset */}
          <div style={{ display: "flex", gap: 12 }}>
            <button
              onClick={() =>
                setAppliedInputs({
                  riskReductionPct,
                  interventionCost,
                  timeHorizon,
                })
              }
              style={{
                padding: "8px 14px",
                background: "#2563eb",
                borderRadius: 8,
                border: "none",
                color: "#ffffff",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Apply Simulation
            </button>

            <button
              onClick={() => {
                clearScenarioAttritionDelta();
                setSimulatedStress(null);
                setAppliedInputs(null);
                setRiskReductionPct(10);
                setInterventionCost(100_000);
                setTimeHorizon(3);
              }}
              style={{
                padding: "8px 14px",
                background: "#020617",
                borderRadius: 8,
                border: "1px solid #1e293b",
                color: "#ffffff",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Reset to Baseline
            </button>
          </div>

          {/* Financial Impact */}
          <div>
            <h2 style={{ marginBottom: 16 }}>Financial Impact</h2>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
              <Metric label="Low Impact" value={`$${Math.round(ladder.low).toLocaleString()}`} />
              <Metric label="Expected Impact" value={`$${Math.round(ladder.base).toLocaleString()}`} />
              <Metric label="High Impact" value={`$${Math.round(ladder.high).toLocaleString()}`} />
            </div>

            <p style={{ marginTop: 16, opacity: 0.85 }}>{copy.narrative}</p>
          </div>

          {/* CTAs */}
          <div style={{ display: "flex", gap: 16 }}>
            <button
              onClick={() => {
                setSimulatedStress(simulatedStress);
                setScenarioAttritionDelta(-effectiveRiskReductionPct);
                navigate("/ground-reality");
              }}
              style={{
                padding: "12px 20px",
                background: "#2563eb",
                borderRadius: 8,
                border: "none",
                color: "#ffffff",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Explore Ground Reality →
            </button>

            <button
              onClick={() => navigate("/retention-simulator")}
              style={{
                padding: "12px 20px",
                background: "#020617",
                borderRadius: 8,
                border: "1px solid #1e293b",
                color: "#ffffff",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Run Retention Simulation →
            </button>
          </div>
        </div>

        {/* Spacer */}
        <div />

        {/* =====================================================
            RIGHT COLUMN — Cube
        ====================================================== */}
        <div style={{ alignSelf: "center" }}>
          <div
            style={{
              background: "#020617",
              border: "1px solid #1e293b",
              borderRadius: 16,
              padding: 24,
              width: 360,
              marginLeft: -190,
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                color: "#94a3b8",
                textAlign: "center",
                marginBottom: 12,
              }}
            >
              Organizational Stress (Simulated)
            </div>

            <MagicCube
              stress={simulatedStress}
              persona={persona}
              size={300}
            />
          </div>
        </div>
      </div>
    </PageShell>
  );
}

/* =========================================================
   Metric Card
========================================================= */
function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        padding: 16,
        borderRadius: 8,
        border: "1px solid #1e293b",
        background: "#020617",
      }}
    >
      <div style={{ fontSize: 12, opacity: 0.7 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 600 }}>{value}</div>
    </div>
  );
}
