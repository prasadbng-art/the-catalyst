import { Routes, Route } from "react-router-dom";
import AppShell from "./components/layout/AppShell";
import Baseline from "./pages/baseline";
import UnifiedSimulationPage from "./pages/UnifiedSimulationPage";
import GroundRealityIndex from "./pages/ground-reality";

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<Baseline />} />
        <Route path="/mapped-metrics" element={<GroundRealityIndex />} />
        <Route path="/unified-simulation" element={<UnifiedSimulationPage />} />
      </Route>
    </Routes>
  );
}
