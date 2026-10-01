# babylon-lite-content Specification

## Purpose
Provides a working Babylon Lite content-layer example with a crisp 2D pixel-art policy, a small original showcase asset, and clear behavior when WebGPU is unavailable.

## Requirements

### Requirement: Developer-selectable content mode
The template SHALL expose renderer and 2D/3D content-style selection through developer-editable configuration in the content layer. Its default selection SHALL show the Babylon Lite 2D showcase, and the selection SHALL NOT require a runtime mode picker.

#### Scenario: Default content mode
- **WHEN** the template starts with its default content configuration
- **THEN** it displays the Babylon Lite 2D showcase using the Pixel Perfect policy

#### Scenario: 3D content style selected
- **WHEN** a developer selects 3D content
- **THEN** the content SHALL NOT inherit the Pixel Perfect 2D policy and SHALL use the separately documented 3D rendering policy

### Requirement: Pixel Perfect 2D rendering
When Babylon Lite and 2D content are selected, the renderer SHALL use a sharp pixel-art presentation: no anti-aliasing or smoothing, nearest texture minification and magnification sampling, mipmaps disabled for pixel-art textures, pixel-aligned content, and a DPR-aware canvas backing size with device pixel ratio accounted for exactly once. When it fits, logical content SHALL use centered integer logical-to-CSS scaling without stretching. The guarantee SHALL be logical-to-CSS sharpness; it SHALL NOT claim universal physical-pixel alignment.

#### Scenario: Pixel Perfect content on a standard viewport
- **WHEN** Babylon Lite 2D content is displayed at a viewport size that fits a positive integer scale
- **THEN** logical pixels remain sharp at centered integer CSS scale, the backing buffer accounts for DPR once, texture minification and magnification use nearest sampling with mipmaps disabled, and anti-aliasing and smoothing are disabled

#### Scenario: Fractional DPR
- **WHEN** integer logical-to-CSS scaling is used on a display with fractional DPR
- **THEN** the content remains sharply sampled in CSS space while the system makes no universal physical-pixel alignment promise

#### Scenario: No integer scale fits
- **WHEN** the available viewport cannot fit the logical scene at 1x
- **THEN** the configured nonzero fractional-fit fallback displays the scene without distortion and documents that strict integer pixel guarantees are suspended

### Requirement: Pixel-art showcase scene
The default 2D showcase SHALL render on a white background with an original 32x32 pixel-art tile consisting of concentric black and gray squares with deliberate stair-step edges. The tile SHALL rotate slowly around its visual center.

#### Scenario: Centered rotation
- **WHEN** the showcase is running
- **THEN** the tile remains centered in the content scene and rotates continuously around its center without the React UI layer moving with it

#### Scenario: Pixel-art edges
- **WHEN** the tile is rendered at its authored resolution or integer-scaled display size
- **THEN** its black and gray pixels retain hard boundaries and visibly stepped edges without blended edge colors

### Requirement: Native-size showcase sprite
The original 32x32 showcase sprite SHALL render at exactly 32x32 Babylon Lite backing-store pixels, independent of the stage scale and device pixel ratio, so its authored texels stay at native size.

#### Scenario: Render at native size
- **WHEN** the showcase renders at any supported device pixel ratio
- **THEN** Babylon Lite draws the sprite at 32x32 backing-store pixels and keeps it centered in the content scene

### Requirement: Viewport settings label and modal-controlled world-edge outline
Babylon Lite SHALL render its 32x32 logo and four-line viewport readout in its world output, centered horizontally with the readout block ending 9 CSS pixels above the viewport bottom. The displayed logo SHALL remain 32x32 CSS pixels. The text SHALL use the current `#e0694b` color, with `(B) Babylon Lite` matching the existing `corner-title` style and the remaining `(R) RenderResolution: <width>x<height>`, `Render Scale: <scale>x`, and `Mode: 2DPixelPerfect` lines matching `corner-body`. The text and logo SHALL retain their current apparent size, glyph/image shape, color, alignment, and position independently of render-resolution preset and DPR. The visible React copy SHALL remain until the Babylon Lite-rendered copy has been visually compared at representative viewport sizes and render presets and the match verified; after verification, only the Babylon Lite-rendered copy SHALL remain visible. Clicking `(B)` SHALL open the existing React settings dialog, and clicking `(R)` or pressing R SHALL cycle the four render-resolution presets. The accessible UI SHALL continue to expose the label and both actions. The dialog SHALL continue to show the active settings with visible text in `#e0694b`. While that dialog is open, Babylon Lite SHALL draw a 5-CSS-pixel `#e0694b` outline on all four content-world edges; closing the dialog with its close control or Escape SHALL remove the outline. The outline SHALL use nearest-sampled sprites and update after viewport/DPR changes. Babylon Lite processing, including rendering and sprite animations, SHALL pause while any Config, Stats, or Babylon Lite dialog is visible and SHALL resume when all such dialogs are closed.

#### Scenario: World-rendered logo and readout
- **WHEN** the default Babylon Lite 2D showcase is visible
- **THEN** Babylon Lite renders the original logo at 32x32 CSS pixels and displays the title, active render-resolution, render-scale, and mode lines centered at the bottom of the viewport
- **AND** the readout block ends 9 CSS pixels above the viewport bottom and matches the former React copy's glyph/image shape, color, apparent size, and alignment
- **AND** the active dimensions and render scale update after a preset change, viewport resize, or DPR change

#### Scenario: Scale and mode label
- **WHEN** the default Babylon Lite 2D showcase is visible
- **THEN** the world-rendered readout includes `(R) RenderResolution: <width>x<height>`, `Render Scale: <scale>x`, and `Mode: 2DPixelPerfect`
- **AND** the title matches `corner-title` styling while the remaining lines match `corner-body`

#### Scenario: World-rendered actions and accessible controls
- **WHEN** a user clicks `(B)` or `(R)`, or activates the equivalent accessible action, or presses B or R
- **THEN** `(B)` opens the Babylon Lite settings dialog and `(R)` advances the persisted render-resolution preset
- **AND** the rendered readout and dialog show the same active values

#### Scenario: React settings dialog
- **WHEN** the user activates the accessible Babylon Lite settings action or presses B
- **THEN** a React settings dialog opens and repeats the viewport name, active render resolution, render scale, and mode

#### Scenario: React comparison copy removal
- **WHEN** the Babylon Lite-rendered logo and readout have been visually compared with the React copy at representative viewport sizes and render-resolution presets
- **AND** their size, shape, color, and position match
- **THEN** the visible React logo and readout are removed while the Babylon Lite-rendered version remains visible

#### Scenario: Dialog shows and hides Babylon Lite world bounds
- **WHEN** the settings dialog opens or closes through its close control or Escape
- **THEN** Babylon Lite shows the 5-CSS-pixel `#e0694b` outline on all four content-world edges while open and removes it when closed
- **AND** Babylon Lite processing pauses while the dialog is open and resumes when it closes

### Requirement: WebGPU unavailable state
If Babylon Lite cannot initialize because WebGPU is unavailable, the template SHALL show a clear in-content message that the game requires WebGPU and SHALL keep the surrounding React application usable where possible.

#### Scenario: Browser has no WebGPU support
- **WHEN** the application starts in a browser without usable WebGPU
- **THEN** the app displays the unsupported message instead of a blank or crashed content region, and the surrounding template UI remains usable

### Requirement: Renderer lifecycle and resize
The Babylon Lite content integration SHALL initialize and release renderer resources with the React content lifecycle and SHALL update its presentation when the content viewport resizes or changes device-pixel ratio. Repeated setup and cleanup SHALL be safe under React StrictMode remounts.

#### Scenario: Resize and remount
- **WHEN** the viewport resizes, DPR changes, or React StrictMode remounts the content
- **THEN** the renderer updates its backing dimensions and releases stale resources, observers, and animation callbacks without duplicate loops
