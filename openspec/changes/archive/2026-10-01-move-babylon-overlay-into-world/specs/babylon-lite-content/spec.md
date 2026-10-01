# Spec Delta

## MODIFIED Requirements

### Requirement: Viewport settings label and modal-controlled world-edge outline
Babylon Lite SHALL render its 32x32 logo and title plus three-line viewport readout in its world output, centered horizontally with the readout block ending 9 CSS pixels above the viewport bottom. The displayed logo SHALL remain 32x32 CSS pixels. The text SHALL use the current `#e0694b` color, with `(B) Babylon Lite` matching the existing `corner-title` style and the remaining `(R) RenderResolution: <width>x<height>`, `Render Scale: <scale>x`, and `Mode: 2DPixelPerfect` lines matching `corner-body`. The text and logo SHALL retain their current apparent size, glyph/image shape, color, alignment, and position independently of render-resolution preset and DPR. A live FPS line SHALL be drawn above the logo without shifting the matched content. The visible React copy SHALL remain until the Babylon Lite-rendered copy has been visually compared at representative viewport sizes and render presets and the match verified; after verification, only the Babylon Lite-rendered copy SHALL remain visible. Clicking `(B)` SHALL open the existing React settings dialog, and clicking `(R)` or pressing R SHALL cycle the four render-resolution presets. The accessible UI SHALL continue to expose the label and both actions. The dialog SHALL continue to show the active settings with visible text in `#e0694b`. While that dialog is open, Babylon Lite SHALL draw a 5-CSS-pixel `#e0694b` outline on all four content-world edges; closing the dialog with its close control or Escape SHALL remove the outline. The outline SHALL use nearest-sampled sprites and update after viewport/DPR changes. Babylon Lite processing, including rendering and sprite animations, SHALL pause while any Config, Stats, or Babylon Lite dialog is visible and SHALL resume when all such dialogs are closed.

#### Scenario: World-rendered logo and readout
- **WHEN** the default Babylon Lite 2D showcase is visible
- **THEN** Babylon Lite renders the original logo at 32x32 CSS pixels and displays the title, active render-resolution, render-scale, and mode lines centered at the bottom of the viewport
- **AND** the readout block ends 9 CSS pixels above the viewport bottom and matches the former React copy's glyph/image shape, color, apparent size, and alignment
- **AND** a live FPS line is drawn above the logo without shifting the logo or matched title and readout lines
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
