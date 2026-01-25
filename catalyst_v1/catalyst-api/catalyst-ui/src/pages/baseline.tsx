import { useState } from "react";
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

  return (
    <div style={{ maxWidth: 1100 }}>
      <BaselineHeader />

      {/* Persona selector */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ marginRight: 8 }}>View as:</label>
        <select value={persona} onChange={(e) => setPersona(e.target.value as Persona)}>
          <option value="CEO">CEO</option>
          <option value="CFO">CFO</option>
          <option value="CHRO">CHRO</option>
        </select>
      </div>

      <BaselineCanvas stress={baselineStress} persona={persona} />

      <BaselineIndicators
        baselineAttritionRisk={baselineAttritionRisk}
        baselineAnnualCost={baselineAnnualCost}
      />

      <PersonaAdvisoryPanel persona={persona} />
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
function BaselineCanvas({ stress, persona }: { stress: StressProfile; persona: Persona }) {
  return (
    <section
      style={{
        background: "#020617",
        border: "1px solid #1e293b",
        borderRadius: 8,
        padding: 20,
        marginBottom: 24,
        color: "#e5e7eb",
      }}
    >
      <h3 style={{ marginBottom: 16 }}>Organizational Stress Profile</h3>

      <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
        <div style={{ flex: "0 0 320px" }}>
          <MagicCube stress={stress} persona={persona} />
        </div>

        <div style={{ flex: 1 }}>
          <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.6 }}>
            <li>
              <strong>Primary stress driver:</strong> People risk ({stress.people}%) and cost
              pressure ({stress.cost}%) are jointly constraining organizational flexibility.
            </li>
            <li>
              <strong>Risk implication:</strong> Elevated macro volatility ({stress.macro}%)
              increases sensitivity to attrition-related shocks.
            </li>
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
        marginBottom: 24,
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
        <KpiCard
          title="Annual Attrition Cost Exposure"
          value={`$${(baselineAnnualCost * 1_000_000).toLocaleString()}`}
        />
        <KpiCard title="Signal Confidence" value="High" />
      </div>
    </section>
  );
}

/* =========================================================
   Persona Panel
========================================================= */
function PersonaAdvisoryPanel({ persona }: { persona: Persona }) {
  return (
    <section
      style={{
        background: "#f8fafc",
        borderTop: "1px solid #e5e7eb",
        padding: 20,
        borderRadius: 8,
      }}
    >
      <div style={{ maxWidth: 760, color: "#0f172a" }}>
        <h3 style={{ marginBottom: 12 }}>Executive Interpretation</h3>

        {persona === "CEO" && (
          <>
            <h4>Organizational Resilience Snapshot</h4>
            <p>
              Pressure is concentrated around cost rigidity and talent exposure, reducing
              flexibility under external volatility.
            </p>
            <p>
              While surface performance appears stable, system resilience is being tested
              beneath the surface.
            </p>
          </>
        )}

        {persona === "CFO" && (
          <>
            <h4>Human Capital Risk Exposure</h4>
            <p>
              Current conditions increase sensitivity to people-related cost shocks, even
              without immediate budget overruns.
            </p>
            <p>
              Downside risk becomes less predictable if attrition accelerates under stress.
            </p>
          </>
        )}

        {persona === "CHRO" && (
          <>
            <h4>Workforce Stability Outlook</h4>
            <p>
              Elevated pressure on people systems increases the likelihood of regretted exits,
              particularly in high-demand roles.
            </p>
            <p>
              Early intervention can stabilize the workforce before visible attrition
              materializes.
            </p>
          </>
        )}
      </div>
    </section>
  );
}
