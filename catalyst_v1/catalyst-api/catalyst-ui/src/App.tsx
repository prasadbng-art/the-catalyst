import { BrowserRouter, Routes, Route } from "react-router-dom";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<div>Baseline works</div>} />
        <Route path="/simulation" element={<div>Simulation works</div>} />
      </Routes>
    </BrowserRouter>
  );
}
