import { Routes, Route, Navigate } from "react-router-dom";
import UnifiedSimulationPage from "./pages/UnifiedSimulationPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<UnifiedSimulationPage />} />

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
