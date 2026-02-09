import { Routes, Route, Navigate } from "react-router-dom";
import AppShell from "./components/layout/AppShell";
import BaselinePage from "./pages/baseline";
import SimulatePage from "./pages/simulate";
import GroundRealityPage from "./pages/ground-reality";
import RetentionSimulatorPage from "./pages/RetentionSimulator";
import UnifiedSimulationPage from "./pages/UnifiedSimulationPage";

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Navigate to="baseline" replace />} />
        <Route path="baseline" element={<BaselinePage />} />
        <Route path="simulation" element={<SimulatePage />} />
        <Route path="retention-simulator" element={<RetentionSimulatorPage />} />
        <Route path="ground-reality" element={<GroundRealityPage />} />
        <Route path="/unified-simulation" element={<UnifiedSimulationPage />} />

      </Route>
    </Routes>
  );
}
