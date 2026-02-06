import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function AppShell() {
  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        border: "1px solid #0f172a",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      <Sidebar />

      {/* MAIN CONTENT AREA */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
        }}
      >
        <main
          style={{
            width: "100%",
            maxWidth: 1600,
            margin: 0,              // ❌ no centering
            padding: "32px 24px 32px 24px",   // tight, intentional gutter
            boxSizing: "border-box",
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
