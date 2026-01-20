import { Routes, Route, Navigate } from "react-router-dom";
import AppShell from "./components/layout/AppShell";
import Baseline from "./pages/baseline";
import Simulate from "./pages/simulate";
import Persona from "./pages/persona";

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Navigate to="/baseline" />} />
        <Route path="/baseline" element={<Baseline />} />
        <Route path="/simulate" element={<Simulate />} />
        <Route path="/persona" element={<Persona />} />
      </Routes>
    </AppShell>
  );
}
