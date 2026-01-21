import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppShell from "./components/layout/AppShell";

import BaselinePage from "./pages/baseline";
import PersonaPage from "./pages/persona";
import SimulationPage from "./pages/simulate";

export default function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          {/* Default landing */}
          <Route path="/" element={<Navigate to="/baseline" replace />} />

          <Route path="/baseline" element={<BaselinePage />} />
          <Route path="/persona" element={<PersonaPage />} />
          <Route path="/simulation" element={<SimulationPage />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}
