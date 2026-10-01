# Proposal

## Why

The Babylon Lite logo and its live renderer readout currently sit in a React overlay, separate from the Babylon Lite world. Rendering this block through Babylon Lite will make the showcase's branding and render state part of the world output while preserving its current appearance and controls.

## What Changes

- Render the Babylon Lite logo and the title, render-resolution, render-scale, mode, and live FPS readout in the Babylon Lite world. Keep the FPS line above the logo so it does not shift the logo or matched title and readout lines.
- Keep the existing React version visible while the world-rendered version is brought up, then visually compare size, logo shape, text styling/color, and bottom-center placement at representative viewport sizes and render presets before removing the visible React copy.
- Preserve live resolution updates, the B and R keyboard shortcuts, the clickable title and resolution actions, and the Babylon Lite settings dialog.
- Keep WebGPU-unavailable messaging and other React viewport controls outside the world display.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `babylon-lite-content`: The Babylon Lite logo and live renderer readout move from the React overlay into the Babylon Lite world, while the settings dialog and its world-edge outline remain.
- `babylon-render-resolution`: The active resolution is displayed by Babylon Lite world rendering instead of the React HUD; preset selection, persistence, actual-dimension reporting, and the settings dialog remain synchronized.

## Impact

- Affected implementation: `project-name/src/content/Content.jsx`, `project-name/src/ui/App.jsx`, `project-name/src/ui/ViewportInfoContext.jsx`, and Babylon Lite content/rendering helpers and styles as needed.
- Affected checks: `project-name/test/content.test.mjs` and any focused renderer lifecycle/layout checks needed to protect world text updates, placement, and control behavior.
- Runtime dependency changes: none expected; use the text and sprite rendering APIs already present in the pinned Babylon Lite package.
