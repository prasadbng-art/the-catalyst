import { useState } from "react";
import PageShell from "../components/layout/PageShell";
import MagicCube from "../components/visuals/MagicCube";
import type { StressProfile } from "../components/visuals/motion";
import type { Persona } from "../types/persona";
import { personaConfig } from "../persona/personaConfig";

/* =========================================================
   Baseline stress (mirrors Baseline page)
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
     Stress derivation (pure, deterministic)
  ========================================================= */
  const intensity = riskReductionPct / 100;

  const stress: StressProfile = {
    people: Math.max(0, BASELINE_STRESS.people - 0.4 * intensity),
    cost: Math.max(0, BASELINE_STRESS.cost - 0.3 * intensity),
    execution: Math.max(0, BASELINE_STRESS.execution - 0.25 * intensity),
    macro: BASELINE_STRESS.macro,
  };

  /* =========================================================
     Financial impact
  ========================================================= */
  const annualSavings = DEFAULT_BASELINE_COST * intensity;

  const ladder = {
    low: annualSavings * SENSITIVITY.low * timeHorizon,
    base: annualSavings * SENSITIVITY.base * timeHorizon,
    high: annualSavings * SENSITIVITY.high * timeHorizon,
  };

  const copy = personaConfig[persona];

  return (
    <PageShell>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(520px, 1.2fr) minmax(420px, 0.8fr)",
          gap: "clamp(40px, 6vw, 80px)",
          alignItems: "start",
        }}
      >
        {/* ================= LEFT — Simulation Controls ================= */}
        <div style={{ maxWidth: 640 }}>
          <h1 style={{ fontSize: "clamp(28px, 4vw, 42px)", marginBottom: 8 }}>
            Financial Simulation
          </h1>

          <p style={{ color: "#94a3b8", marginBottom: 24 }}>
            Test how changes in retention risk translate into financial impact.
          </p>

          {/* Persona selector */}
          <div style={{ marginBottom: 24 }}>
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
                onChange={(e) => setRiskReductionPct(Number(e.target.value))}
                style={{ width: "100%", marginTop: 6 }}
              />
            </div>

            <div>
              <label>Cost of Action</label>
              <input
                type="number"
                value={interventionCost}
                onChange={(e) => setInterventionCost(Number(e.target.value))}
                style={{ width: "100%", marginTop: 6 }}
              />
            </div>
          </div>

          {/* Time horizon */}
          <div style={{ marginBottom: 32 }}>
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
                  fontWeight:
                    timeHorizon === y ? 600 : 500,
                  cursor: "pointer",
                }}
              >
                {y} Year{y === 3 ? "s" : ""}
              </button>
            ))}
          </div>

          {/* Financial impact */}
          <h2 style={{ marginBottom: 16 }}>Financial Impact</h2>

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
            Estimated cost avoided over {timeHorizon} year
            {timeHorizon === 3 ? "s" : ""}.
          </p>

          <p style={{ marginTop: 20, opacity: 0.85 }}>
            {copy.narrative}
          </p>

          {/* Deep dive CTA */}
          <button
            style={{
              marginTop: 32,
              padding: "12px 20px",
              background: "#2563eb",
              color: "#ffffff",
              borderRadius: 8,
              border: "none",
              fontWeight: 600,
              cursor: "pointer",
            }}
            onClick={() => {
              window.open(
                "/Catalyst/resolution/retention_simulator.html",
                "_blank"
              );
            }}
          >
            Explore Ground Reality →
          </button>
        </div>

        {/* ================= RIGHT — Organizational Stress ================= */}
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
            <MagicCube stress={stress} persona={persona} size={300} />
          </div>
        </div>
      </div>
    </PageShell>
  );
}

/* =========================================================
   Metric
========================================================= */
function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ padding: 16, borderRadius: 8, border: "1px solid #1e293b" }}>
      <div style={{ fontSize: 12, opacity: 0.7 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 600 }}>{value}</div>
    </div>
  );
}
