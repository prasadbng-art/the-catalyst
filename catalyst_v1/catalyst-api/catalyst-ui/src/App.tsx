import { Routes, Route, Navigate } from "react-router-dom";
import AppShell from "./components/layout/AppShell";

import Baseline from "./pages/baseline";
import UnifiedSimulationPage from "./pages/UnifiedSimulationPage";

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        {/* Landing page */}
        <Route path="/" element={<Baseline />} />

        {/* Unified simulation */}
        <Route path="/simulation" element={<UnifiedSimulationPage />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
