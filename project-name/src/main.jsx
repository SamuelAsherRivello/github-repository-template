import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Content } from "./content/Content.jsx";
import {
  BabylonLiteReadout,
  BabylonLiteSettings,
  BabylonPresentationProvider,
} from "./content/babylon/BabylonPresentation.jsx";
import { App } from "./ui/App.jsx";
import "./ui/style.css";

function AppComposition() {
  return (
    <App
      content={<Content />}
      contentPresentation={{
        title: "Babylon Lite",
        Readout: BabylonLiteReadout,
        Settings: BabylonLiteSettings,
      }}
    />
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BabylonPresentationProvider>
      <AppComposition />
    </BabylonPresentationProvider>
  </StrictMode>,
);
