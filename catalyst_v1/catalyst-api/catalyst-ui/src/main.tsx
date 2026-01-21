import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("ROOT ELEMENT NOT FOUND");
}

ReactDOM.createRoot(root).render(
  <App />
);
