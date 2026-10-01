# Tasks

## 1. Capture the current display and prepare world HUD

- [x] 1.1 Capture a baseline of the visible React logo/readout at a representative viewport and record its rendered bounds, color, and current text values for comparison. At 1016x572 CSS pixels with quarter preset, it shows a 32x32 CSS-pixel logo, `#e0694b` text, centered 9 CSS pixels above the bottom, `(B) Babylon Lite`, `(R) RenderResolution: 254x143`, `Render Scale: 0.25x`, and `Mode: 2DPixelPerfect`; capture stored temporarily at `%TEMP%/babylon-hud-react-quarter.png`.
- [x] 1.2 Add a Babylon Lite presentation-layer HUD using the existing logo and matching CSS title/body metrics at native backing resolution; verify it updates on preset, viewport, and DPR changes without changing size or position as the scene render target changes. Compared quarter and native presets at 1016x572 and 1280x720, and DPR 1 and 2; CSS-pixel placement stayed stable as expected. Kept the live FPS line above the logo so the matched logo and text positions remain unchanged.

## 2. Preserve controls and verify visual parity

- [x] 2.1 Preserve B/R pointer and keyboard actions, accessible names, settings-dialog values, and renderer cleanup; verify focused control and lifecycle checks pass. Browser check opened the settings dialog, clicked the resolution line to select half, pressed R to return to native, and the test suite passed.
- [x] 2.2 Compare the Babylon Lite HUD with the React baseline at matching viewport sizes and render presets; inspect logo shape, text glyphs, color, size, alignment, and bottom inset, then adjust until they match. Final captures at quarter and native settings visually match in size, shape, color, and placement; DPR 1 and 2 captures were compared against React baselines. The supplemental FPS line does not shift the compared block.
- [x] 2.3 After parity is visually verified, remove the visible React copy and temporary comparison mode while keeping accessible actions; verify only one visible logo/readout remains and its controls still work. Confirmed the React copy and `babylonHudCompare` query branch are absent.

## 3. Validate and finalize implementation

- [x] 3.1 Run `npm test` and `npm run build`; verify all checks pass and inspect a final browser capture of the Babylon Lite-rendered HUD at representative presets. `npm test` passed (15/15), `npm run build` passed, and final WebGPU browser captures were inspected at quarter (1016x572) and native (1280x720) presets.
