import { useState } from "react";
import KpiCard from "../components/kpi/KpiCard";

export default function BaselinePage() {
  return (
    <div style={{ maxWidth: 1100 }}>
      <BaselineHeader />
      <BaselineCanvas />
      <BaselineIndicators />
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
   Main Canvas (Magic Cube placeholder)
========================================================= */

function BaselineCanvas() {
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
        {/* Magic Cube placeholder */}
        <div style={{ flex: "0 0 360px" }}>
          <div
            style={{
              width: 360,
              height: 300,
              background: "#020617",
              border: "1px dashed #334155",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#64748b",
              fontSize: 13,
            }}
          >
            Magic Cube (Baseline)
          </div>
        </div>

        {/* Stress annotations */}
        <div style={{ flex: 1 }}>
          <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.6 }}>
            <li>
              <strong>Primary stress driver:</strong>{" "}
              Elevated cost rigidity under external economic pressure
            </li>
            <li>
              <strong>Risk implication:</strong>{" "}
              Increased sensitivity to attrition-related cost shocks
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   Baseline Indicators
========================================================= */

function BaselineIndicators() {
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
          value="24.2%"
        />

        <KpiCard
          title="Annual Attrition Cost Exposure"
          value="$1.94M"
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
   Persona Advisory Panel
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
              Pressure is currently concentrated around cost
              rigidity and talent exposure, reducing flexibility
              under external volatility.
            </p>
            <p>
              While surface performance may appear stable,
              resilience is being tested beneath the system.
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
