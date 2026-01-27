import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppShell from "./components/layout/AppShell";
import BaselinePage from "./pages/baseline";
import Simulate from "./pages/simulate";

export default function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<BaselinePage />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}
<Route path="/simulation" element={<Simulate />} />
