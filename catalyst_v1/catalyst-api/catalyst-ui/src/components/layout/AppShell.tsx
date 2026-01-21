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
        minHeight: "100vh",
        background: "#f5f5f5",
        color: "#000",
      }}
    >
      <Sidebar />

      <main
        style={{
          flex: 1,
          padding: "24px",
          background: "#ffffff",
          color: "#000",
        }}
      >
        {children}
      </main>
    </div>
  );
}
