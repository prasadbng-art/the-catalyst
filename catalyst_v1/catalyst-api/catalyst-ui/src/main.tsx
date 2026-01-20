import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
import { Routes, Route, Navigate } from "react-router-dom";

import AppShell from "./components/layout/AppShell";

import Baseline from "./pages/baseline";
import Simulate from "./pages/simulate";
import Persona from "./pages/persona";

export default function App() {
  return (
    <AppShell>
      <Routes>
        {/* Default */}
        <Route path="/" element={<Navigate to="/baseline" replace />} />

        {/* Core views */}
        <Route path="/baseline" element={<Baseline />} />
        <Route path="/simulate" element={<Simulate />} />
        <Route path="/persona" element={<Persona />} />

        {/* Safety */}
        <Route path="*" element={<Navigate to="/baseline" replace />} />
      </Routes>
    </AppShell>
  );
}
