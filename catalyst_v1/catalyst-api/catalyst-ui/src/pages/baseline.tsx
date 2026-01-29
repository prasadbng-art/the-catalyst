import { useState, useEffect } from "react";
import KpiCard from "../components/kpi/KpiCard";
import MagicCube from "../components/visuals/MagicCube";
import type { StressProfile } from "../components/visuals/motion";

/* =========================================================
   Types
========================================================= */
type Persona = "CEO" | "CFO" | "CHRO";

/* =========================================================
   Baseline constants
========================================================= */
const baselineAttritionRisk = 24.2;
const baselineAnnualCost = 1.94; // in $M

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
  const [persona, setPersona] = useState<Persona>("CEO");
  const [detailed, setDetailed] = useState(false);
  const [showSimulator, setShowSimulator] = useState(false);
  const [simulationOffset, setSimulationOffset] = useState<StressProfile>({
    people: 0,
    cost: 0,
    macro: 0,
    execution: 0,
  });

  const clamp = (val: number, min: number, max: number) =>
    Math.max(min, Math.min(max, val));

  const applySimulationImpact = (impact: any) => {
    const {
      risk_delta,
      high_risk_reduction_count,
      population_size,
      cost_avoided,
      exits_avoided,
      intervention_precision_score,
    } = impact;

    const peopleDelta = clamp(
      risk_delta * 0.6 +
      (high_risk_reduction_count / population_size) * 40,
      -15,
      15
    );

    const costDelta = clamp(
      (cost_avoided / (baselineAnnualCost * 1_000_000)) * 80 +
      (exits_avoided / population_size) * 20,
      -20,
      20
    );

    const executionDelta = clamp(
      (intervention_precision_score - 0.5) * 40,
      -10,
      15
    );

    setSimulationOffset({
      people: peopleDelta,
      cost: costDelta,
      macro: 0,
      execution: executionDelta,
    });
  };

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.data?.type === "CATALYST_INTERVENTION_IMPACT") {
        applySimulationImpact(event.data.payload);
      }
    };

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  return (
    <div style={{ maxWidth: 1100, width: "100%" }}>
      <BaselineHeader />

      {/* Controls */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ marginRight: 8 }}>View as:</label>
        <select value={persona} onChange={(e) => setPersona(e.target.value as Persona)}>
          <option value="CEO">CEO</option>
          <option value="CFO">CFO</option>
          <option value="CHRO">CHRO</option>
        </select>
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="checkbox"
            checked={detailed}
            onChange={() => setDetailed(!detailed)}
          />
          Detailed analysis
        </label>
      </div>

      {/* ===== TOP EXECUTIVE ROW ===== */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.4fr 1fr",
          gap: 24,
          alignItems: "stretch",
          marginBottom: 24,
        }}
      >
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

        <PersonaAdvisoryPanel persona={persona} detailed={detailed} />
      </div>

      {/* ===== KPI ROW ===== */}
      <BaselineIndicators
        baselineAttritionRisk={baselineAttritionRisk}
        baselineAnnualCost={baselineAnnualCost}
      />

      {/* ===== CTA TO SIMULATION ===== */}
      <section
        style={{
          marginTop: 32,
          padding: 20,
          borderRadius: 8,
          background: "#eef2ff",
          border: "1px solid #c7d2fe",
          color: "#1e293b",
        }}
      >
        <h3 style={{ marginBottom: 8 }}>
          Ready to quantify the financial impact?
        </h3>

        <p style={{ marginBottom: 16, maxWidth: 720 }}>
          Use the simulation tool to estimate how reducing attrition risk could translate into financial return and ROI.
        </p>

        <button
          type="button"
          onClick={() => setShowSimulator(true)}
          style={{
            padding: "10px 18px",
            borderRadius: 6,
            border: "none",
            background: "#1e40af",
            color: "white",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Model Financial Impact →
        </button>
      </section>
      {showSimulator && (
        <div style={{
          position: "fixed",
          top: 0,
          right: 0,
          width: "50%",
          height: "100%",
          background: "white",
          borderLeft: "1px solid #e5e7eb",
          zIndex: 1000,
          boxShadow: "-4px 0 12px rgba(0,0,0,0.1)"
        }}>
          <div style={{ padding: 12, borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between" }}>
            <strong>Retention Intervention Simulator</strong>
            <button onClick={() => setShowSimulator(false)}>Close</button>
          </div>

          <iframe
            src="/resolution/index.html"
            style={{ width: "100%", height: "calc(100% - 48px)", border: "none" }}
            title="Resolution Simulator"
          />
        </div>
      )}

    </div>
  );
}

/* =========================================================
   Header
========================================================= */
function BaselineHeader() {
  return (
    <header style={{ marginBottom: 24 }}>
      <h1>Baseline</h1>
      <p style={{ color: "#9ca3af", fontSize: 14 }}>
        Current organizational pressure profile
      </p>
    </header>
  );
}

/* =========================================================
   Stress Canvas
========================================================= */
function BaselineCanvas({
  stress,
  persona,
  detailed,
}: {
  stress: StressProfile;
  persona: Persona;
  detailed: boolean;
}) {
  const formatPct = (value: number, decimals = 1) =>
    `${value.toFixed(decimals)}%`;
  return (
    <section
      style={{
        background: "#020617",
        border: "1px solid #1e293b",
        borderRadius: 8,
        padding: 20,
        color: "#e5e7eb",
        height: "100%",
      }}
    >
      <h3 style={{ marginBottom: 16 }}>Organizational Stress Profile</h3>

      <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
        <div style={{ flex: "0 0 320px" }}>
          <MagicCube stress={stress} persona={persona} />
        </div>

        <div style={{ flex: 1 }}>
          <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.6 }}>
            {!detailed ? (
              <>
                <li><strong>Main pressure:</strong> People risk ({formatPct(stress.people)}) and cost pressure ({formatPct(stress.cost)}) are both high.</li>
                <li><strong>What this means:</strong> External uncertainty ({formatPct(stress.macro)}) makes employee exits harder to manage.</li>
              </>
            ) : (
              <>
                <li><strong>Primary stress concentration:</strong> Workforce exposure and structural cost pressure are both elevated.</li>
                <li><strong>System implication:</strong> Macroeconomic volatility amplifies attrition and productivity shocks.</li>
              </>
            )}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   Indicators
========================================================= */
function BaselineIndicators({
  baselineAttritionRisk,
  baselineAnnualCost,
}: {
  baselineAttritionRisk: number;
  baselineAnnualCost: number;
}) {
  return (
    <section
      style={{
        padding: 16,
        border: "1px solid #1f2937",
        borderRadius: 6,
        background: "#020617",
        color: "#e5e7eb",
      }}
    >
      <h3 style={{ marginBottom: 12 }}>Key Baseline Indicators</h3>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <KpiCard title="Baseline Attrition Risk" value={`${baselineAttritionRisk}%`} />
        <KpiCard title="Annual Attrition Cost Exposure" value={`$${(baselineAnnualCost * 1_000_000).toLocaleString()}`} />
        <KpiCard title="Signal Confidence" value="High" />
      </div>
    </section>
  );
}

/* =========================================================
   Persona Panel
========================================================= */
function PersonaAdvisoryPanel({
  persona,
  detailed,
}: {
  persona: Persona;
  detailed: boolean;
}) {
  return (
    <section
      style={{
        background: "#f8fafc",
        borderTop: "1px solid #e5e7eb",
        padding: 20,
        borderRadius: 8,
        height: "100%",
      }}
    >
      <div style={{ maxWidth: 760, color: "#0f172a" }}>
        <h3 style={{ marginBottom: 12 }}>Executive Interpretation</h3>

        {persona === "CEO" && (
          <>
            <h4>Organizational Stability</h4>
            <p>The company is under pressure from both costs and workforce risks.</p>
            <p>If conditions worsen, responding quickly may be difficult.</p>
          </>
        )}

        {persona === "CFO" && (
          <>
            <h4>Financial Risk</h4>
            {!detailed ? (
              <>
                <p>Workforce pressure can create unexpected costs.</p>
                <p>Attrition and productivity loss may increase financial strain.</p>
              </>
            ) : (
              <>
                <p>Elevated workforce strain introduces latent financial exposure not yet visible in budgets.</p>
              </>
            )}
          </>
        )}

        {persona === "CHRO" && (
          <>
            <h4>Workforce Stability</h4>
            <p>Employees are under pressure, increasing the risk of resignations.</p>
            <p>Early action can reduce exits before they become visible.</p>
          </>
        )}
      </div>
    </section>
  );
}
