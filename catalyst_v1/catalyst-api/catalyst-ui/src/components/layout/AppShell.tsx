import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import ActionPlans from "../../pages/ground-reality/ActionPlans";

export default function AppShell() {
  const location = useLocation();
  const isGroundReality = location.pathname.includes("ground-reality");

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        border: "1px solid #0f172a", // visual reference frame
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      <Sidebar />

      {/* MAIN CONTENT */}
      <main
        style={{
          flex: 1,
          overflowY: "auto",
          display: "felx",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: isGroundReality ? 1200 : "none",
            paddingRight: isGroundReality ? 24 : 0,
          }}
        >

        </div>
        <Outlet />
      </main>

      {/* RIGHT PANEL — ACTION PLANS */}
      <aside
        style={{
          width: 360,
          borderLeft: "1px solid #1e293b",
          background: "#020617",
          padding: 16,
          overflowY: "auto",
          display: isGroundReality ? "block" : "none",
        }}
      >
        <ActionPlans />
      </aside>
    </div>
  );
}
