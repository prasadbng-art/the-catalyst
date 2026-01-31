import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function AppShell() {
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
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
    </div>
  );
}
