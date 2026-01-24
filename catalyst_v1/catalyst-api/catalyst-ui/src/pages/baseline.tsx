import { useState } from "react";
import KpiCard from "../components/kpi/KpiCard";
import StaticMagicCube from "../components/visuals/MagicCube";

/* =========================================================
   Baseline stress model (Phase III – explicit & deterministic)
========================================================= */

type BaselineStressProfile = {
  peopleRisk: number;
  costPressure: number;
  executionStrain: number;
  macroVolatility: number;
};

const baselineStress: BaselineStressProfile = {
  peopleRisk: 0.65,
  costPressure: 0.7,
  executionStrain: 0.4,
  macroVolatility: 0.6,
};

/* =========================================================
   Page
========================================================= */

export default function BaselinePage() {
  // Canonical baseline values (must match Simulation assumptions)
  const baselineAttritionRisk = 24.2;
  const baselineAnnualCost = 1.94; // $M

  return (
    <div style={{ maxWidth: 1100 }}>
      <BaselineHeader />

      <BaselineCanvas stress={baselineStress} />

      <BaselineIndicators
        baselineAttritionRisk={baselineAttritionRisk}
        baselineAnnualCost={baselineAnnualCost}
      />

      <PersonaAdvisoryPanel />
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
   Main Canvas (Magic Cube placeholder, stress-wired)
========================================================= */

function BaselineCanvas({
  stress,
}: {
  stress: BaselineStressProfile;
}) {
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
      <h3 style={{ marginBottom: 16 }}>
        Organizational Stress Profile
      </h3>

      <div
        style={{
          display: "flex",
          gap: 24,
          alignItems: "center",
        }}
      >
        <div style={{ flex: "0 0 360px" }}>
          <StaticMagicCube stress={stress} persona={persona} />
        </div>

        {/* Stress annotations */}
        <div style={{ flex: 1 }}>
          <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.6 }}>
            <li>
              <strong>Primary stress driver:</strong>{" "}
              People risk ({Math.round(stress.peopleRisk * 100)}%) and
              cost pressure ({Math.round(stress.costPressure * 100)}%)
              are jointly constraining organizational flexibility.
            </li>
            <li>
              <strong>Risk implication:</strong>{" "}
              Elevated macro volatility ({Math.round(
                stress.macroVolatility * 100
              )}%) increases sensitivity to attrition-related shocks.
            </li>
          </ul>
        </div>

      </div>
    </section>
  );
}

/* =========================================================
   Baseline Indicators (real data wired)
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
      <h3 style={{ marginBottom: 12 }}>
        Key Baseline Indicators
      </h3>

      <div
        style={{
          display: "flex",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <KpiCard
          title="Baseline Attrition Risk"
          value={`${baselineAttritionRisk}%`}
        />

        <KpiCard
          title="Annual Attrition Cost Exposure"
          value={`$${baselineAnnualCost.toLocaleString()}M`}
        />

        <KpiCard
          title="Signal Confidence"
          value="High"
        />
      </div>
    </section>
  );
}

/* =========================================================
   Persona Advisory Panel (lens, not data)
========================================================= */

function PersonaAdvisoryPanel() {
  const [persona, setPersona] =
    useState<"CEO" | "CFO" | "CHRO">("CEO");

  return (
    <section
      style={{
        background: "#f8fafc",
        borderTop: "1px solid #e5e7eb",
        padding: 20,
        borderRadius: 8,
      }}
    >
      {/* Persona toggle */}
      <div
        style={{
          marginBottom: 12,
          display: "flex",
          gap: 12,
          alignItems: "center",
        }}
      >
        <strong>View as:</strong>
        <select
          value={persona}
          onChange={(e) =>
            setPersona(
              e.target.value as "CEO" | "CFO" | "CHRO"
            )
          }
        >
          <option value="CEO">CEO</option>
          <option value="CFO">CFO</option>
          <option value="CHRO">CHRO</option>
        </select>
      </div>

      {/* Advisory copy */}
      <div style={{ maxWidth: 760 }}>
        {persona === "CEO" && (
          <>
            <h4>Organizational Resilience Snapshot</h4>
            <p>
              Pressure is concentrated around cost rigidity and
              talent exposure, reducing flexibility under
              external volatility.
            </p>
            <p>
              While surface performance appears stable, system
              resilience is being tested beneath the surface.
            </p>
          </>
        )}

        {persona === "CFO" && (
          <>
            <h4>Human Capital Risk Exposure</h4>
            <p>
              Current conditions increase sensitivity to
              people-related cost shocks, even without immediate
              budget overruns.
            </p>
            <p>
              Downside risk becomes less predictable if attrition
              accelerates under stress.
            </p>
          </>
        )}

        {persona === "CHRO" && (
          <>
            <h4>Workforce Stability Outlook</h4>
            <p>
              Elevated pressure on people systems increases the
              likelihood of regretted exits, particularly in
              high-demand roles.
            </p>
            <p>
              Early intervention can stabilize the workforce
              before visible attrition materializes.
            </p>
          </>
        )}
      </div>
    </section>
  );
}
