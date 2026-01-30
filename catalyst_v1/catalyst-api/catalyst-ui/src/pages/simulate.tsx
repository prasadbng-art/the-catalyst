export default function SimulationPage() {
  return (
    <div
      style={{
        height: "100vh",
        padding: 40,
        background: "#0b1220",
        color: "#e5e7eb",
      }}
    >
      <h1 style={{ fontSize: 36 }}>Financial Impact Model</h1>

      <p style={{ marginTop: 12, maxWidth: 600 }}>
        This model estimates the annual financial exposure driven by workforce
        attrition under current organizational pressure conditions.
      </p>

      <div
        style={{
          marginTop: 32,
          padding: 24,
          background: "#020617",
          borderRadius: 10,
          maxWidth: 520,
        }}
      >
        <strong>Baseline Exposure</strong>
        <ul style={{ marginTop: 12 }}>
          <li>Annual Attrition Cost: $12.4M</li>
          <li>Projected Leavers: 429</li>
          <li>Cost per Exit: $124,000</li>
        </ul>
      </div>
    </div>
  );
}
