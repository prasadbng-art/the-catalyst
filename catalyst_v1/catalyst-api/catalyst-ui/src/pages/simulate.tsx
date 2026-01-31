import { useState } from "react";
import type { Persona } from "../types/persona";
import { personaConfig } from "../persona/personaConfig";
import MagicCube from "../components/visuals/MagicCube";
import type { StressProfile } from "../components/visuals/motion";

/* =========================================================
   Baseline stress (mirrors Baseline page exactly)
========================================================= */
const BASELINE_STRESS: StressProfile = {
  people: 0.65,
  cost: 0.7,
  execution: 0.45,
  macro: 0.6,
};

/* =========================================================
   Financial model constants
========================================================= */
const DEFAULT_BASELINE_COST = 1_940_000;

const SENSITIVITY = {
  low: 0.7,
  base: 1.0,
  high: 1.3,
};

export default function SimulatePage() {
  /* ---------------- Persona ---------------- */
  const [persona, setPersona] = useState<Persona>("CFO");

  /* ---------------- Scenario inputs ---------------- */
  const [riskReductionPct, setRiskReductionPct] = useState(10);
  const [interventionCost, setInterventionCost] = useState(100000);
  const [timeHorizon, setTimeHorizon] = useState<1 | 3>(3);

  /* =========================================================
     Stress derivation (PURE, DETERMINISTIC)
     No mutation. No accumulation. No history.
  ========================================================= */
  const intensity = riskReductionPct / 100;

  const stress: StressProfile = {
    people: Math.max(0, BASELINE_STRESS.people - 0.4 * intensity),
    cost: Math.max(0, BASELINE_STRESS.cost - 0.3 * intensity),
    execution: Math.max(0, BASELINE_STRESS.execution - 0.25 * intensity),
    macro: BASELINE_STRESS.macro, // macro unchanged by retention
  };

  /* =========================================================
     Financial model
  ========================================================= */
  const annualSavings = DEFAULT_BASELINE_COST * intensity;

  const ladder = {
    low: annualSavings * SENSITIVITY.low * timeHorizon,
    base: annualSavings * SENSITIVITY.base * timeHorizon,
    high: annualSavings * SENSITIVITY.high * timeHorizon,
  };

  const copy = personaConfig[persona];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 360px",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      {/* ================= MAIN ================= */}
      <div style={{ padding: "32px 40px", overflowY: "auto" }}>
        <h1>{copy.headline}</h1>
        <p style={{ opacity: 0.75 }}>
          Model the financial impact of reducing organizational stress and attrition risk.
        </p>
        <p style={{ marginTop: 8, fontSize: 14, opacity: 0.65 }}>
          You can adjust the inputs below to test different scenarios. The cube and
          impact ranges update based on your selections.
        </p>

        {/* Persona selector */}
        <div style={{ margin: "24px 0" }}>
          {(["CEO", "CFO", "CHRO"] as Persona[]).map(p => {
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
                    : "1px solid #cbd5e1",
                  background: active ? "#2563eb" : "#f8fafc",
                  color: active ? "#ffffff" : "#0f172a",
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
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 24,
            marginBottom: 24,
          }}
        >
          <div>
            <label>Risk Reduction (%)</label>
            <input
              type="number"
              value={riskReductionPct}
              onChange={e => setRiskReductionPct(Number(e.target.value))}
              style={{ width: "100%", marginTop: 6 }}
            />
          </div>

          <div>
            <label>Intervention Cost</label>
            <input
              type="number"
              value={interventionCost}
              onChange={e => setInterventionCost(Number(e.target.value))}
              style={{ width: "100%", marginTop: 6 }}
            />
          </div>
        </div>

        {/* Time horizon */}
        <div style={{ marginBottom: 24 }}>
          {[1, 3].map(y => (
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
                    : "1px solid #cbd5e1",
                background:
                  timeHorizon === y ? "#2563eb" : "#f8fafc",
                color:
                  timeHorizon === y ? "#ffffff" : "#0f172a",
                fontWeight:
                  timeHorizon === y ? 600 : 500,
                cursor: "pointer",
              }}
            >
              {y} Year{y === 3 ? "s" : ""}
            </button>
          ))}
        </div>

        {/* Enterprise Risk Snapshot */}
        <div
          style={{
            background: "#020617",
            border: "1px solid #1e293b",
            borderRadius: 12,
            padding: 20,
            maxWidth: 520,
          }}
        >
          <strong>Enterprise Risk Snapshot</strong>
          <ul style={{ marginTop: 12, color: "#cbd5f5" }}>
            <li>People stress level: {Math.round(stress.people * 100)}%</li>
            <li>Cost pressure index: {Math.round(stress.cost * 100)}%</li>
            <li>Execution constraint: {Math.round(stress.execution * 100)}%</li>
            <li>Macro exposure: {Math.round(stress.macro * 100)}%</li>
          </ul>
        </div>

        {/* Financial Impact */}
        <div style={{ marginTop: 32 }}>
          <h2>Financial Impact</h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 16,
            }}
          >
            <Metric
              label="Low Impact"
              value={`$${Math.round(ladder.low).toLocaleString()}`}
            />
            <Metric
              label="Expected Impact"
              value={`$${Math.round(ladder.base).toLocaleString()}`}
            />
            <Metric
              label="High Impact"
              value={`$${Math.round(ladder.high).toLocaleString()}`}
            />
          </div>

          <p style={{ marginTop: 12, fontSize: 13, opacity: 0.65 }}>
            Values show estimated cost avoided over {timeHorizon} year
            {timeHorizon === 3 ? "s" : ""}.
          </p>

          <p style={{ marginTop: 20, opacity: 0.85 }}>
            {copy.narrative}
          </p>
        </div>
      </div>

      {/* ================= RIGHT RAIL ================= */}
      <div
        style={{
          borderLeft: "1px solid #e5e7eb",
          padding: 24,
          display: "flex",
          flexDirection: "column",
          gap: 24,
        }}
      >
        <MagicCube stress={stress} persona={persona} />

        <p style={{ fontSize: 13, opacity: 0.7 }}>
          The cube reflects normalized stress across people, cost, macro, and execution.
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   Metric
========================================================= */
function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ padding: 16, borderRadius: 8, border: "1px solid #e5e7eb" }}>
      <div style={{ fontSize: 12, opacity: 0.7 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 600 }}>{value}</div>
    </div>
  );
}
