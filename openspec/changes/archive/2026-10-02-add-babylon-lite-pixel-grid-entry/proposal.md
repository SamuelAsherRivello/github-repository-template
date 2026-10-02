# Proposal

## Why

Babylon Lite's 2D sprite API accepts fractional `positionPx` values, and its camera view can add fractional screen positions even when sprite coordinates are whole numbers. Pixel-perfect guidance currently requires pixel alignment but gives AI contributors no mandatory Babylon Lite movement entry point or reliable way to detect bypasses, so sprites can blur or shimmer despite nearest sampling.

## What Changes

- Add a required, explicitly configured Babylon Lite 2D pixel-grid entry point for creating and moving `Sprite2DHandle` sprites.
- Keep requested simulation positions separate from positions submitted to Babylon Lite; calculate the final layer-screen position through the Lite `Sprite2DView`, snap to the logical pixel grid, then map back to layer coordinates before calling `updateSprite2D`. Resnap managed sprites whenever their layer view changes.
- Define explicit behavior for unconfigured use, unsupported modes, fractional camera views, transforms, and non-position sprite patches.
- Require game code and AI-generated examples to route sprite position changes through the entry point; add an automated repository check that catches direct position updates outside its implementation.
- Document the rendering invariant and its scope: positions are snapped after the layer view transform; this does not guarantee pixel-perfect arbitrary rotations or fractional presentation scaling.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `babylon-lite-content`: Define and enforce the Babylon Lite 2D sprite position-snap contract.
- `game-integration-guidance`: Require AI-authored 2D game code to use the entry point and state its pixel-alignment limits.

## Impact

- Babylon Lite content utilities and their existing showcase call sites under `project-name/src/content/`.
- Babylon Lite content and game-integration specs and documentation.
- Automated source-level checks in the repository's existing Node test suite; no new runtime dependency or alternate renderer.
- Babylon Lite `1.32.0` APIs verified in the installed package: `Sprite2DHandle`, `addSprite2D`, `updateSprite2D`, `sprite2DWorldToScreenToRef`, and `sprite2DScreenToWorldToRef`.
