import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.jsx";
import "./style.css";

createRoot(document.getElementById("ui_layer")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
