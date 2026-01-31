import { NavLink, useLocation } from "react-router-dom";

const linkStyle = {
  display: "block",
  padding: "8px 12px",
  borderRadius: 6,
  textDecoration: "none",
  marginBottom: 4,
  fontSize: 14,
};

export default function Sidebar() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside
      style={{
        width: 220,
        padding: 20,
        borderRight: "1px solid #1e293b",
        background: "#020617",
        color: "#e5e7eb",
        minHeight: "100vh",
      }}
    >
      <h2 style={{ marginBottom: 24 }}>Catalyst</h2>

      {/* ACTIVE MODULES */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 12, opacity: 0.6, marginBottom: 8 }}>
          ANALYSIS
        </div>

        <NavLink
          to="/baseline"
          style={{
            ...linkStyle,
            background: isActive("/baseline") ? "#1e293b" : "transparent",
            color: "#e5e7eb",
          }}
        >
          Baseline
        </NavLink>

        <NavLink
          to="/simulation"
          style={{
            ...linkStyle,
            background: isActive("/simulate") ? "#1e293b" : "transparent",
            color: "#e5e7eb",
          }}
        >
          Simulation
        </NavLink>
      </div>

      {/* FUTURE MODULES */}
      <div>
        <div style={{ fontSize: 12, opacity: 0.6, marginBottom: 8 }}>
          PRODUCTION MODULES
        </div>

        {[
          "Data Upload",
          "Scenario Comparison",
          "Portfolio View",
          "Settings",
        ].map((item) => (
          <div
            key={item}
            style={{
              ...linkStyle,
              color: "#64748b",
              cursor: "not-allowed",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>{item}</span>
            <span style={{ fontSize: 11, opacity: 0.6 }}>Soon</span>
          </div>
        ))}
      </div>
    </aside>
  );
}
