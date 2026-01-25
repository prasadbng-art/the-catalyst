import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import AppShell from "./components/layout/AppShell";
import BaselinePage from "./pages/baseline";
import SimulationPage from "./pages/simulate";

export default function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<Navigate to="/baseline" replace />} />
          <Route path="/baseline" element={<BaselinePage />} />
          <Route path="/simulation" element={<SimulationPage result={{
            totalCost: 0,
            totalBenefit: 0
          }} />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}
