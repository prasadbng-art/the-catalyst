import { createRoot } from "react-dom/client";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Root element not found");
}

createRoot(root).render(
  <div style={{ color: "red", padding: 40, fontSize: 24 }}>
    🔴 React is mounted
  </div>
);
