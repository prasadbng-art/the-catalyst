import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppShell from "./components/layout/AppShell";
import BaselinePage from "./pages/baseline";
import Simulate from "./pages/simulate";

export default function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          {/* Default route */}
          <Route path="/" element={<Navigate to="/baseline" replace />} />

          {/* Main pages */}
          <Route path="/baseline" element={<BaselinePage />} />
          <Route path="/simulation" element={<Simulate />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}
