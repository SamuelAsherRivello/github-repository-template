[Overview](overview.md) · [Standardization analysis](standardization-analysis.md) · Architecture analysis · [Verification baseline](verification-baseline.md) · [Back](overview.md)

# Architecture analysis

## Module map

```text
project-name/src/main.jsx
  ├─ ui/App.jsx ── ui/BrowserSurface.jsx ── ui/layout.js
  │    ├─ dialogs, corners, persisted settings, viewport diagnostics
  │    └─ ViewportInfoContext ── content/Content.jsx
  └─ content/Content.jsx
       └─ content/babylon/* (configuration, pixel-grid adapter, resolution,
          HUD, renderer helpers, initialization messages, assets)
```

The two primary subtrees have legible roles: `ui/` owns React composition, browser surface, and styles; `content/` owns the showcase, WebGPU/Babylon Lite lifecycle, and renderer policy. `BrowserSurface` encapsulates viewport/gutter calculations, and `layout.js` provides reusable layout validation and fitting behavior. `Content.jsx` owns asynchronous renderer setup and teardown. `ViewportInfoContext` communicates a small set of viewport/render state between shell and content.

## Contracts and ownership

The strongest explicit contract is `BabylonLiteAIEntry`: it provides an application-facing static API for adding/moving/updating sprites and changing view state while preserving simulation positions and snap behavior. Tests exercise transforms and guard against direct mutation outside its adapter. `BrowserSurface` accepts layout, gutters, UI, content, and resize callback props. `layout.js` validates dimensions and calculates fit. These seams keep core calculations independently testable.

The UI shell owns persisted settings, dialogs, fullscreen, orientation, HUD visibility, and render-resolution selection. Content owns engine initialization, render target, sprites and cleanup. This is a deliberate template currently tailored to a Babylon Lite showcase; it is not evidence of a general multi-renderer abstraction.

## Pressure points and candidates

| # | Candidate | Evidence and expected value | Risk and non-goals | Urgency / owner |
| --- | --- | --- | --- | --- |
| ARCH01 | Renderer-specific imports in `ui/App.jsx` | The shell imports `getRenderScaleDisplayText`, `cycleRenderResolutionPreset`, `getRenderResolutionDimensions`, and `isRenderResolutionPreset` from `content/babylon/`. This makes generic UI composition depend on the current renderer policy and can complicate substituting app content or another renderer. An explicit diagnostics/settings contract could isolate that dependency. | Low-to-medium risk: the values and dialog are currently renderer-specific by design, and extracting a contract may add indirection without a real alternate consumer. Non-goal: introduce a plugin renderer architecture. | Low; Rearchitect only if reuse requires substitution. |
| ARCH02 | Large shell state/composition in `App.jsx` | At 238 lines, the component combines persistence, keyboard shortcuts, fullscreen lifecycle, viewport/DPR reporting, FPS sampling, dialogs, and shell markup. Naming is readable and each concern is currently local, but changes have a broad UI integration surface. Small state/lifecycle hooks could reduce review friction if these concerns change independently. | Moderate risk of premature extraction and prop/context churn. No evidence of a current runtime bug or performance issue. Non-goal: split solely to meet line-count preference. | Low; Standardize for small local cleanup, Rearchitect only for a selected ownership change. |
| ARCH03 | `Content.jsx` lifecycle integration | The component initializes the engine and sprites, observes viewport changes, coordinates context state, and cleans up listeners/resources. Existing tests cover several renderer calculations and static constraints, but there is no discovered browser-level lifecycle test seam. A real-browser manual check would provide evidence for WebGPU availability, resizing, and cleanup behavior. | Browser/WebGPU automation adds environment dependence. Non-goal: claim renderer lifecycle fails based on absent browser evidence. | Medium confidence, low urgency; verify in approved changes. |

Dependencies otherwise point in a workable direction: UI uses layout primitives and exposes a context to content; Babylon-specific work remains grouped under content. No cross-process communication or server boundary exists. No module is recommended for deletion based only on lack of static references.
