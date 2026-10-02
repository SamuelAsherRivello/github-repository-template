# Design

## Context

The repository pins `@babylonjs/lite` 1.32.0. Its 2D sprite API stores `Sprite2DHandle` positions as `positionPx`; each `Sprite2DLayer` has a mutable `view` with pan, zoom, and rotation. Lite exports pure projection/unprojection helpers for that view and `updateSprite2D` for handle updates. Existing content creates the showcase and presentation sprites directly. The render-target presentation sprite is renderer infrastructure and can intentionally use a half-pixel center for odd target dimensions, so it must be distinguished from game sprites.

## Goals / Non-Goals

**Goals:**
- Give AI contributors one required API for game sprite creation, position updates, and other handle updates.
- Preserve requested simulation coordinates while submitting a render position whose projected anchor is on an integer logical pixel.
- Make direct Lite sprite mutation outside the entry module detectable in repository checks.
- Retain explicitly named internal renderer operations for presentation sprites that must not use gameplay snapping.

**Non-Goals:**
- Modify Babylon Lite, implement a general 3D transform wrapper, or change renderer selection.
- Promise pixel-perfect rasterization for arbitrary sprite rotation, layer rotation, fractional view zoom, or fractional CSS presentation scale.
- Snap physics state or dictate the game's logical resolution.

## Decisions

1. **Use Lite's pixel-space sprite contract.** The game-facing API accepts a `Sprite2DHandle` and `[x, y]` logical-pixel positions. It uses the installed Lite `sprite2DWorldToScreenToRef` and `sprite2DScreenToWorldToRef` functions to project through `handle.layer.view`, round the projected anchor, and unproject it. This handles camera pan in the same coordinate system Lite renders. It avoids generic world-matrix adapters and standard Babylon.js APIs.

2. **Keep simulation and render positions distinct.** Store the requested position in a `WeakMap` keyed by Lite sprite handle. Position updates set that simulation value, then update the Lite handle with the snapped position. Game movement/physics reads from its own simulation state or the entry's getter, never from a snapped sprite coordinate.

3. **Route sprite and view mutations through one module.** Export configuration, add, move, update, view update/centering, and simulation-position access from the entry module. Its `update` method detects a `positionPx` patch and routes it through snapping; non-position patches are passed to Lite unchanged. Changing a view updates the view first, then resnaps every managed sprite registered to that layer. Repository tests reject direct imports of Lite `addSprite2D`, `updateSprite2D`, or view-mutating helpers, and direct writes to `layer.view`, outside this module. Renderer-owned full-surface presentation sprites use a separately named internal path so odd-sized targets retain their correct half-pixel center; game code must not use that path.

4. **Fail closed on mode configuration.** Mode is null until setup explicitly chooses `PixelPerfect2D`. Calls before setup and unsupported values throw. This template entry point supports the Lite Pixel Perfect 2D sprite workflow only; 3D continues to use its separately documented integration.

5. **Keep sampling and presentation policy separate.** Existing `msaaSamples: 1`, nearest min/mag texture filters, disabled mipmaps, and CSS `image-rendering: pixelated` remain the rendering setup. The entry point only enforces sprite anchor placement. Integer camera zoom/rotation and integer logical-to-CSS scale remain necessary for the broader crisp-pixel guarantee; arbitrary sprite rotation is an explicit visual exception.

## Risks / Trade-offs

- [Snapping changes apparent movement at low speeds] → Keep fractional simulation coordinates and use only the snapped position for rendering.
- [A sprite's pivot or arbitrary rotation can leave texel edges between pixels even when its anchor is aligned] → Define the guarantee for the projected anchor, document grid-preserving transform constraints, and add a diagnostic check for edge behavior.
- [The internal presentation path could be misused by game code] → Keep it narrowly named and documented, and have source checks permit its use only in the renderer integration.
- [Lite API changes could invalidate projection assumptions] → Pin behavior to the installed package API and add focused tests for pan, zoom, and round-trip projection.
- [A camera change can invalidate positions snapped during an earlier frame] → Resnap all registered sprites after every game-facing view update, and route camera changes through the entry module.
