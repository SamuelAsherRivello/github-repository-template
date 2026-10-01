# Design

## Context

See proposal.md for motivation. The current Babylon Lite 2D path first renders the showcase to a preset-sized texture, then uses a presentation `SpriteRenderer` to scale that texture with nearest-neighbor sampling to the DPR-aware canvas backing size. React currently owns the logo/readout block, its CSS positioning and styling, the render preset, and the B/R actions. The pinned Babylon Lite package includes texture upload and sprite-rendering APIs; React still owns the settings dialog and viewport controls.

## Goals / Non-Goals

**Goals:**
- Compose the logo and live readout through Babylon Lite at the final native backing size, after the low-resolution scene texture has been enlarged, so changing the render preset does not pixelate or resize the HUD.
- Reuse the existing logo asset, color, title/body typography, centered alignment, 32 CSS-pixel logo size, and 9 CSS-pixel bottom inset.
- Draw the live FPS line above the logo, outside the matched logo/readout block, so the added line does not shift the existing content.
- Keep React as the source of the active resolution, scale, mode, dialog state, and user actions.
- Verify the temporary Babylon Lite copy against the existing React copy before removing the visible React version.

**Non-Goals:**
- Replacing the Babylon Lite showcase scene or changing its pixel-perfect rendering policy.
- Moving the settings dialog, unsupported-browser message, project corners, or other React UI into the world.
- Adding a renderer or runtime dependency.

## Decisions

### Composite the HUD at native output resolution

Add a transparent HUD layer to the existing Babylon Lite presentation pass, above the nearest-scaled showcase sprite. Size the HUD texture from the native canvas backing dimensions and draw its logo and text at CSS-pixel dimensions multiplied by the current DPR. Recreate or update the texture on viewport/DPR changes and refresh its readout when React reports changed values. This keeps the HUD crisp and stationary at quarter, half, native, and double render presets.

The canvas API is used only to rasterize glyphs with the same browser font metrics and styles as the existing DOM. Babylon Lite uploads and draws the resulting texture as a world-output sprite; the browser canvas does not become a fallback display renderer.

### Preserve visible parity during comparison

Keep the current React block while wiring the Babylon Lite layer. Provide a temporary comparison mode that can show either implementation at the same viewport position and state, capture both at matching viewport sizes and presets, and inspect size, logo silhouette, text shape/color, and placement. Remove the temporary comparison switch and visible React copy only after the images match. Do not ship two visible copies or a permanent comparison control.

### Keep state and actions in React

Pass the current resolution, render scale, mode text, and action callbacks through the existing viewport-info context. Keep preset persistence and sizing in React. Preserve pointer activation for the displayed `(B)` and `(R)` lines and the existing B/R shortcuts; retain accessible DOM names/actions without rendering duplicate visible text. Continue to show the same values in the React Babylon Lite settings dialog.

### Preserve failure and lifecycle behavior

Create, update, and dispose the HUD texture and sprite with the existing engine and presentation-renderer lifecycle. Handle canceled StrictMode mounts, render-target replacement, resize, and DPR changes without stale sprites or GPU resources. If WebGPU initialization fails, retain the current in-content unsupported/error message and surrounding React UI behavior.

## Risks / Trade-offs

- [Risk] A mismatch in canvas font selection, line metrics, DPR conversion, or alpha sampling changes the appearance → Use the existing CSS computed font styles, compare captures from the same viewport/state, and tune the world layer before removing the React reference.
- [Risk] A full-size transparent texture adds GPU memory proportional to the viewport backing dimensions → Allocate one HUD texture, update it in place while dimensions are stable, and replace/dispose it only when the viewport backing size changes.
- [Risk] Pointer hit areas can drift from the rendered title or resolution line after resize → Compute hit areas from the same layout metrics used to draw the HUD and cover them with focused interaction checks.

## Migration Plan

1. Capture the existing React block at representative viewport sizes and render presets.
2. Add the Babylon Lite presentation-layer HUD and temporary same-position comparison mode while leaving the React copy visible.
3. Compare matching captures and adjust until the logo and each text line match in size, shape, color, and position.
4. Remove the visible React copy and temporary comparison mode; retain accessible action semantics and dialog behavior.
5. Run focused tests, the production build, and a browser render check; remove temporary comparison assets or flags from shipped code.

Rollback is a code revert: restore the React block and remove the presentation HUD layer without changing the preset state or settings dialog.
