import type { ReactNode } from "react";
import Sidebar from "./Sidebar";

type Props = {
  children: ReactNode;
};

export default function AppShell({ children }: Props) {
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",     // ✅ critical
        alignItems: "stretch", // ✅ critical
      }}
    >
      <Sidebar />
      <main
        style={{
          flex: 1,
          padding: "24px",
          display: "flex",     // optional, but helps
          flexDirection: "column",
        }}
      >
        {children}
      </main>
    </div>
  )
}
