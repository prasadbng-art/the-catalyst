import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import AppShell from "./components/layout/AppShell";
import BaselinePage from "./pages/baseline";
import Simulate from "./pages/simulate";

export default function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<Navigate to="/baseline" replace />} />
          <Route path="/baseline" element={<BaselinePage />} />
          <Route path="/simulation" element={<Simulate />} /> 
            
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}
