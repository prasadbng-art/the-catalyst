import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageShell from "../components/layout/PageShell";
import MagicCube from "../components/visuals/MagicCube";
import type { Persona } from "../types/persona";
import { personaConfig } from "../persona/personaConfig";
import { setSimulatedStress } from "../state/simulatedStressState";
import { baseOrgState } from "../state/orgState";

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

  /* ---------------- Persona ---------------- */
  const [persona, setPersona] = useState<Persona>("CFO");

  /* ---------------- Scenario inputs ---------------- */
  const [riskReductionPct, setRiskReductionPct] = useState(10);
  const [interventionCost, setInterventionCost] = useState(100000);
  const [timeHorizon, setTimeHorizon] = useState<1 | 3>(3);

  /* =========================================================
     Stress derivation (PREVIEW ONLY)
  ========================================================= */
  const intensity = riskReductionPct / 100;

  const simulatedStressPreview = {
    people: Math.max(0, baseOrgState.stress.people - 0.4 * intensity),
    cost: Math.max(0, baseOrgState.stress.cost - 0.3 * intensity),
    execution: Math.max(0, baseOrgState.stress.execution - 0.25 * intensity),
    macro: baseOrgState.stress.macro,
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

  /* =========================================================
     Render
  ========================================================= */
  return (
    <PageShell>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(520px, 1.2fr) minmax(420px, 0.8fr)",
          gridTemplateRows: "auto 1fr",
          columnGap: "clamp(40px, 6vw, 80px)",
          rowGap: 32,
          alignItems: "start",
        }}
      >
        {/* =====================================================
            LEFT — TOP (Controls)
        ====================================================== */}
        <div style={{ gridColumn: 1, gridRow: 1 }}>
          <h1 style={{ fontSize: 36, marginBottom: 8 }}>
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
                onChange={(e) =>
                  setRiskReductionPct(Number(e.target.value))
                }
                style={{ width: "100%", marginTop: 6 }}
              />
            </div>

            <div>
              <label>Cost of Action</label>
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
        </div>

        {/* =====================================================
            RIGHT — TOP (Cube, anchored)
        ====================================================== */}
        <div
          style={{
            gridColumn: 2,
            gridRow: 1,
            alignSelf: "start",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "#020617",
              border: "1px solid #1e293b",
              borderRadius: 16,
              padding: 24,
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
              stress={simulatedStressPreview}
              persona={persona}
              size={300}
            />
          </div>
        </div>

        {/* =====================================================
            LEFT — BOTTOM (Impact + CTAs)
        ====================================================== */}
        <div style={{ gridColumn: 1, gridRow: 2 }}>
          <h2 style={{ marginBottom: 16 }}>Financial Impact</h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 24,
              marginBottom: 16,
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

          <p style={{ fontSize: 13, opacity: 0.65 }}>
            Estimated cost avoided over {timeHorizon} year
            {timeHorizon === 3 ? "s" : ""}.
          </p>

          <p style={{ marginTop: 20, opacity: 0.85 }}>
            {copy.narrative}
          </p>

          {/* CTAs */}
          <div style={{ marginTop: 32, display: "flex", gap: 16 }}>
            <button
              onClick={() => navigate("/ground-reality")}
              style={{
                padding: "12px 20px",
                background: "#2563eb",
                border: "none",
                borderRadius: 8,
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
                background: "#1e293b",
                border: "1px solid #334155",
                borderRadius: 8,
                color: "#e5e7eb",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Run Retention Simulation →
            </button>
          </div>

          {/* Reset */}
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginTop: 16,
              fontSize: 13,
              color: "#94a3b8",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              onChange={() => {
                setSimulatedStress(null);
                setRiskReductionPct(10);
                setInterventionCost(100000);
                setTimeHorizon(3);
              }}
            />
            Reset simulation inputs
          </label>
        </div>
      </div>
    </PageShell>
  );
}

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
