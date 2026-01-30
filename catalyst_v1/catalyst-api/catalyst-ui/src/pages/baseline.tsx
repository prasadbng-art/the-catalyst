import { useState } from "react";
import MagicCube from "../components/visuals/MagicCube";
import type { StressProfile } from "../components/visuals/motion";

/* =========================================================
   Types & Baseline
========================================================= */
type Persona = "CEO" | "CFO" | "CHRO";

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

  return (
    <div style={{ padding: 24, maxWidth: 1100 }}>
      <h1>Baseline</h1>
      <p style={{ color: "#94a3b8", marginBottom: 16 }}>
        Current organizational pressure profile
      </p>

      {/* Controls */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ marginRight: 8 }}>View as:</label>
        <select
          value={persona}
          onChange={(e) => setPersona(e.target.value as Persona)}
        >
          <option value="CEO">CEO</option>
          <option value="CFO">CFO</option>
          <option value="CHRO">CHRO</option>
        </select>
      </div>

      <label style={{ display: "block", marginBottom: 24 }}>
        <input
          type="checkbox"
          checked={detailed}
          onChange={() => setDetailed(!detailed)}
        />{" "}
        Detailed analysis
      </label>

      {/* ===== MAIN ROW ===== */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.4fr 1fr",
          gap: 24,
          marginBottom: 24,
        }}
      >
        {/* Cube & Narrative */}
        <section
          style={{
            background: "#020617",
            border: "1px solid #1e293b",
            borderRadius: 8,
            padding: 20,
            color: "#e5e7eb",
          }}
        >
          <h3 style={{ marginBottom: 16 }}>
            Organizational Stress Profile
          </h3>

          <MagicCube stress={baselineStress} persona={persona} />

          <ul style={{ marginTop: 16, lineHeight: 1.6 }}>
            {!detailed ? (
              <>
                <li>
                  <strong>Main pressure:</strong> People risk (65%) and cost
                  pressure (70%) are both high.
                </li>
                <li>
                  <strong>What this means:</strong> External uncertainty (60%)
                  makes exits harder to manage.
                </li>
              </>
            ) : (
              <>
                <li>
                  <strong>Primary concentration:</strong> Workforce exposure and
                  structural cost pressure.
                </li>
                <li>
                  <strong>System impact:</strong> Volatility amplifies attrition
                  and execution risk.
                </li>
              </>
            )}
          </ul>
        </section>

        {/* Persona Advisory */}
        <section
          style={{
            background: "#f8fafc",
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            padding: 20,
            color: "#0f172a",
          }}
        >
          <h3>Executive Interpretation</h3>

          {persona === "CEO" && (
            <>
              <h4>Organizational Stability</h4>
              <p>
                The company is under pressure from both workforce risk and cost
                exposure.
              </p>
            </>
          )}

          {persona === "CFO" && (
            <>
              <h4>Financial Risk</h4>
              <p>
                Elevated attrition risk introduces latent cost exposure not yet
                visible in budgets.
              </p>
            </>
          )}

          {persona === "CHRO" && (
            <>
              <h4>Workforce Stability</h4>
              <p>
                Sustained pressure increases resignation risk across critical
                talent pools.
              </p>
            </>
          )}
        </section>
      </div>

      {/* CTA */}
      <button
        onClick={() => setShowSimulator(true)}
        style={{
          padding: "10px 16px",
          borderRadius: 6,
          border: "none",
          background: "#1e40af",
          color: "white",
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        Model Financial Impact
      </button>

      {/* ===== RETENTION SIMULATOR PANEL ===== */}
      {showSimulator && (
        <div
          style={{
            position: "fixed",
            top: 0,
            right: 0,
            width: "50%",
            height: "100%",
            background: "white",
            borderLeft: "1px solid #e5e7eb",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              padding: 12,
              borderBottom: "1px solid #e5e7eb",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <strong>Targeted Retention Scenarios</strong>
            <button onClick={() => setShowSimulator(false)}>Close</button>
          </div>

          <iframe
            src="Catalyst/resolution/retention_simulator.html"
            style={{
              width: "100%",
              height: "calc(100% - 48px)",
              border: "none",
            }}
            title="Retention Simulator"
          />
        </div>
      )}
    </div>
  );
}
