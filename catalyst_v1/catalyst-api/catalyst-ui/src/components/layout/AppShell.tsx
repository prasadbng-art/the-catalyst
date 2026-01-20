import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export default function AppShell({ children }: Props) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside
        style={{
          width: 220,
          padding: 16,
          background: "#111",
          color: "#fff",
        }}
      >
        <h3>Catalyst</h3>
        <div style={{ opacity: 0.7 }}>Baseline</div>
        <div style={{ opacity: 0.7 }}>Persona</div>
        <div style={{ opacity: 0.7 }}>Simulation</div>
      </aside>

      <main style={{ flex: 1, padding: 24 }}>{children}</main>
    </div>
  );
}
