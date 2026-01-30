import Sidebar from "./Sidebar";
import type { ReactNode } from "react";

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />

      <main
        style={{
          flex: 1,
          padding: 32,
          background: "#020617",
          color: "#e5e7eb",
        }}
      >
        <h1>APP SHELL TEST</h1>
        <p>If you see this, AppShell is rendering children correctly.</p>
        {children}
      </main>
    </div>
  );
}
