import { Routes, Route, Navigate } from "react-router-dom";
import AppShell from "./components/layout/AppShell";
import BaselinePage from "./pages/baseline";
import GroundRealityPage from "./pages/ground-reality";
import UnifiedSimulationPage from "./pages/UnifiedSimulationPage";

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Navigate to="baseline" replace />} />
        <Route path="baseline" element={<BaselinePage />} />
        <Route path="/simulation" element={<UnifiedSimulationPage />} />
        <Route path="ground-reality" element={<GroundRealityPage />} />
      </Route>
    </Routes>
  );
}
