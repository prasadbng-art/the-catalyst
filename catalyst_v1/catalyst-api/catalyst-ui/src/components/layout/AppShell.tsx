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
        border: "1px solid #0f172a",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      <Sidebar />

      {/* MAIN + RIGHT CLUSTER (LEFT-ANCHORED) */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            width: "100%",
            maxWidth: isGroundReality ? 1400 : "none",
            gap: isGroundReality ? 24 : 0,
            paddingLeft: 16,
            paddingRight: 16,
            boxSizing: "border-box",
          }}
        >
          {/* MAIN CONTENT */}
          <main style={{ flex: 1 }}>
            <Outlet />
          </main>

          {/* RIGHT PANEL — ACTION PLANS */}
          {isGroundReality && (
            <aside
              style={{
                width: 360,
                background: "#020617",
                border: "1px solid #1e293b",
                borderRadius: 16,
                padding: 16,
                paddingTop: 16,
                height: "fit-content",
                marginTop: 195,
              }}
            >
              <ActionPlans />
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
