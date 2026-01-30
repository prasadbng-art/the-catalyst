import Sidebar from "./components/layout/Sidebar";

export default function App() {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />

      <main
        style={{
          flex: 1,
          background: "#1f2937",
          color: "#e5e7eb",
          padding: 32,
        }}
      >
        <h1>Baseline</h1>
        <p>Current organizational pressure profile</p>
      </main>
    </div>
  );
}
