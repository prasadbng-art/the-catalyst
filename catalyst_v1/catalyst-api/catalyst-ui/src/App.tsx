import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppShell from "./components/layout/AppShell";

import BaselinePage from "./pages/baseline";
import PersonaPage from "./pages/persona";

export default function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<BaselinePage />} />
          <Route path="/baseline" element={<BaselinePage />} />
          <Route path="/persona" element={<PersonaPage />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}
