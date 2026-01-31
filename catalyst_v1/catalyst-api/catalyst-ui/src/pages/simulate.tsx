import { useEffect, useState } from "react";
import type { Persona } from "../types/persona";
import { personaConfig } from "../persona/personaConfig";
import MagicCube from "../components/visuals/MagicCube";
import type { StressProfile } from "../components/visuals/motion";

const DEFAULT_BASELINE_COST = 1_940_000; // annual attrition cost (demo-safe)

const SENSITIVITY = {
  low: 0.7,
  base: 1.0,
  high: 1.3,
};

export default function SimulatePage() {
  /* ---------------- Persona (from URL or default) ---------------- */
  const params = new URLSearchParams(window.location.search);
  const initialPersona = (params.get("persona") as Persona) || "CFO";

  const [persona, setPersona] = useState<Persona>(initialPersona);

  /* ---------------- Time Horizon (FIXED POSITION) ---------------- */
  const [timeHorizon, setTimeHorizon] = useState<1 | 3>(1);
  // Stress deltas driven by retention actions (0 = no change)
  const [stressDelta, setStressDelta] = useState<StressProfile>({
    people: 0,
    cost: 0,
    execution: 0,
    macro: 0,
  });

  /* ---------------- Stress (from URL) ---------------- */
  function readStressFromURL(): StressProfile {
    const params = new URLSearchParams(window.location.search);

    const read = (key: string, fallback: number) => {
      const v = Number(params.get(key));
      return Number.isFinite(v) ? v : fallback;
    };

    return {
      people: read("people", 0.26),
      cost: read("cost", 0.31),
      execution: read("execution", 0.22),
      macro: read("macro", 0.18),
    };
  }

  const baseStress = readStressFromURL();

  const stress: StressProfile = {
    people: Math.max(0, baseStress.people + stressDelta.people),
    cost: Math.max(0, baseStress.cost + stressDelta.cost),
    execution: Math.max(0, baseStress.execution + stressDelta.execution),
    macro: Math.max(0, baseStress.macro + stressDelta.macro),
  };


  /* ---------------- Inputs ---------------- */
  const [riskReductionPct, setRiskReductionPct] = useState(15);
  const [interventionCost, setInterventionCost] = useState(250000);

  /* ---------------- Async state (kept, but secondary) ---------------- */
  const [loading, setLoading] = useState(false);

  useEffect(() => {

  }, []);

  /* ---------------- Frontend Financial Engine ---------------- */
  function computeFinancials() {
    const annualSavings =
      DEFAULT_BASELINE_COST * (riskReductionPct / 100);

    const horizonMultiplier = timeHorizon;

    const ladder = {
      low: annualSavings * SENSITIVITY.low * horizonMultiplier,
      base: annualSavings * SENSITIVITY.base * horizonMultiplier,
      high: annualSavings * SENSITIVITY.high * horizonMultiplier,
    };

    const roi =
      ((ladder.base - interventionCost) / interventionCost) * 100;

    return {
      ladder,
      roi: Math.round(roi),
    };
  }

  const financials = computeFinancials();

  /* ---------------- Backend call (non-authoritative) ---------------- */
  async function runSimulation() {
    setLoading(true);
    try {
      const res = await fetch("/intelligence/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          persona,
          stress,
          risk_reduction_pct: riskReductionPct,
          intervention_cost: interventionCost,
        }),
      });

      if (!res.ok) throw new Error("Simulation failed");

      await res.json(); //backend response ignored - frontend model is authoritative

    } catch {
    } finally {
      setLoading(false);
    }
  }

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
      {/* ---------------- MAIN ---------------- */}
      <div style={{ padding: "32px 40px", overflowY: "auto" }}>
        <h1>{copy.headline}</h1>
        <p style={{ opacity: 0.75 }}>
          Model the financial impact of reducing organizational stress and attrition risk.
        </p>

        {/* Persona selector */}
        <div style={{ margin: "24px 0" }}>
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
              onChange={(e) =>
                setRiskReductionPct(Number(e.target.value))
              }
              style={{ width: "100%", marginTop: 6 }}
            />
          </div>

          <div>
            <label>Intervention Cost</label>
            <input
              type="number"
              value={interventionCost}
              onChange={(e) =>
                setInterventionCost(Number(e.target.value))
              }
              style={{ width: "100%", marginTop: 6 }}
            />
          </div>
        </div>

        {/* Time Horizon */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 13, display: "block", marginBottom: 6 }}>
            Time Horizon
          </label>

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

        <button
          onClick={runSimulation}
          disabled={loading}
          style={{
            padding: "10px 18px",
            borderRadius: 8,
            background: "#4f46e5",
            color: "#ffffff",
            border: "none",
            cursor: "pointer",
            marginBottom: 16,
          }}
        >
          {loading ? "Running Model…" : "Update Scenario"}
        </button>

        {/* Financial Impact */}
        <div style={{ marginTop: 24 }}>
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
              value={`$${Math.round(
                financials.ladder.low
              ).toLocaleString()}`}
            />
            <Metric
              label="Expected Impact"
              value={`$${Math.round(
                financials.ladder.base
              ).toLocaleString()}`}
            />
            <Metric
              label="High Impact"
              value={`$${Math.round(
                financials.ladder.high
              ).toLocaleString()}`}
            />
          </div>

          <p style={{ marginTop: 12, fontSize: 13, opacity: 0.65 }}>
            Values show estimated cost avoided over {timeHorizon} year
            {timeHorizon === 3 ? "s" : ""}, under different execution conditions.
          </p>

          <p style={{ marginTop: 20, opacity: 0.85 }}>
            {copy.narrative}
          </p>
        </div>
      </div>

      {/* ---------------- RIGHT RAIL ---------------- */}
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

        <button
          onClick={() =>
            setStressDelta({
              people: -0.1,
              cost: -0.08,
              execution: -0.05,
              macro: 0,
            })
          }
          style={{ width: "100%" }}
        >
          Apply Retention Improvement →
        </button>

      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ padding: 16, borderRadius: 8, border: "1px solid #e5e7eb" }}>
      <div style={{ fontSize: 12, opacity: 0.7 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 600 }}>{value}</div>
    </div>
  );
}
