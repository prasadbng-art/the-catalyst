import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <aside
      style={{
        width: "220px",
        background: "#111",
        color: "#fff",
        padding: "24px",
      }}
    >
      <h2 style={{ marginBottom: "24px" }}>Catalyst</h2>

      <nav style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <Link to="/baseline" style={{ color: "#fff", textDecoration: "none" }}>
          Baseline
        </Link>
        <Link to="/simulation" style={{ color: "#fff", textDecoration: "none" }}>
          Simulation
        </Link>
      </nav>
    </aside>
  );
}
