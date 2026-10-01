import { createContext, useContext } from "react";

export const ViewportInfoContext = createContext({
  scale: 2,
  setScale: () => {},
  renderPreset: "native",
  setRenderResolutionInfo: () => {},
  sceneBorderVisible: false,
  processingPaused: false,
});

export function useViewportInfo() {
  return useContext(ViewportInfoContext);
}
