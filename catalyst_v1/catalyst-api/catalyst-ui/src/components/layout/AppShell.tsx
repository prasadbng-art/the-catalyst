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
        overflow: "hidden"
      }}
    >
      <Sidebar />

      {/* MAIN CONTENT AREA */}
      <div
        style={{
          flex: 1,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <main
          style={{
            flex: 1,
            width: "100%",
            maxWidth: "1600",
            margin: 0,
            padding: "32px 24px",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}