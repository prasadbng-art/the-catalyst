import { Routes, Route } from "react-router-dom";
import AppShell from "./components/layout/AppShell";
import BaselinePage from "./pages/baseline";
import SimulationPage from "./pages/simulate";

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<BaselinePage />} />
        <Route path="/baseline" element={<BaselinePage />} />
        <Route path="/simulation" element={<SimulationPage />} />
      </Routes>
    </AppShell>
  );
}
