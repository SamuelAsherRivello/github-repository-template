# babylon-render-resolution Specification

## Purpose

Provides a runtime-selectable Babylon Lite render resolution independent of game logical coordinates. It keeps the same 2D world view while making resolution and nearest-neighbor presentation behavior visible and adjustable.

## Requirements

### Requirement: Logical resolution independent of render resolution
Babylon Lite 2D content SHALL define a developer-editable logical resolution for game coordinates and camera framing independently from the internal render resolution. Changing the internal render resolution SHALL NOT change logical coordinates, visible world bounds, or camera framing.

#### Scenario: Render target changes while playing
- **WHEN** the selected render resolution changes
- **THEN** the same logical scene and camera view are rendered at the newly selected internal target dimensions
- **AND** game positions and visible world bounds remain unchanged

### Requirement: Four native-relative render resolutions
The Babylon Lite 2D integration SHALL offer four render-resolution presets: quarter-native, half-native, native, and double-native dimensions. The native dimensions SHALL be the current DPR-aware canvas backing dimensions. Each choice SHALL scale both axes by its stated factor while preserving aspect ratio, and its pixel dimensions SHALL be integral.

#### Scenario: Resolution presets at a native backing size
- **WHEN** the native backing is 1280 by 720 pixels
- **THEN** the four target resolutions are 320 by 180, 640 by 360, 1280 by 720, and 2560 by 1440 pixels

#### Scenario: Resolution presets after resize or DPR change
- **WHEN** the content viewport or device pixel ratio changes
- **THEN** all four target dimensions are recalculated from the new native backing dimensions
- **AND** the selected preset remains the same

#### Scenario: Browser zoom changes CSS size and DPR
- **WHEN** browser zoom changes the CSS viewport size and device pixel ratio
- **THEN** native backing dimensions are recalculated from the current CSS content size and DPR
- **AND** the selected preset and game logical view remain unchanged
- **AND** native pixel dimensions may remain nearly constant when CSS size and DPR change in opposite directions

### Requirement: Nearest-neighbor presentation
The selected internal render target SHALL be presented into the native backing buffer using nearest-neighbor sampling when its dimensions differ from the native backing dimensions. This behavior SHALL retain hard, intentionally jagged pixel-art edges when enlarging or reducing the rendered image.

#### Scenario: Smaller render target is enlarged
- **WHEN** the half-native render target is selected
- **THEN** its output is enlarged into the native backing buffer with nearest-neighbor sampling and no blended edge colors

#### Scenario: Larger render target is reduced
- **WHEN** the double-native render target is selected
- **THEN** its output is reduced into the native backing buffer with nearest-neighbor sampling and no blended edge colors

### Requirement: React-owned render-resolution control
The Babylon Lite world output SHALL show `(R) RenderResolution: <width>x<height>` below the Babylon Lite title, appending `(Native)` for Native, and SHALL show the active render scale and `Mode: 2DPixelPerfect` on the following lines. A live FPS line SHALL be drawn above the logo without shifting the logo or the matched resolution/readout block. Clicking the world-rendered control or pressing R SHALL cycle quarter-native, half-native, native, and double-native, wrapping to quarter-native. React SHALL own the selection, default it to Native, persist the preset in local storage, and pass it to Babylon Lite. The Babylon Lite settings dialog SHALL show the same active value. The visible readout SHALL stay crisp and match its existing CSS-pixel size and placement regardless of internal render target size or device-pixel ratio. If a render target is capped to WebGPU limits, the world-rendered readout SHALL show the actual capped dimensions.

#### Scenario: Default and displayed selection
- **WHEN** the application starts without a saved render-resolution preference
- **THEN** Native is selected and the Babylon Lite world displays `(R) RenderResolution: <native width>x<native height> (Native)`

#### Scenario: User cycles render resolution
- **WHEN** the user clicks the world-rendered `(R)` control or presses R
- **THEN** React advances and persists the selected preset and passes it to Babylon Lite
- **AND** Babylon Lite updates its displayed dimensions and scale, including the Native label when applicable
- **AND** the Babylon Lite settings dialog displays the same active dimensions

#### Scenario: Saved preset restored
- **WHEN** the application restarts with a saved render-resolution preference
- **THEN** React restores that preset and Babylon Lite recalculates its dimensions from the current native backing size

#### Scenario: WebGPU-capped target is displayed
- **WHEN** the selected double-native render target exceeds an active WebGPU texture-dimension limit
- **THEN** Babylon Lite uses the largest supported capped dimensions while preserving aspect ratio
- **AND** the selected preset remains double-native and the world-rendered readout and settings dialog show the actual capped dimensions

### Requirement: WebGPU render-target limits
Any upscaled render target SHALL be capped to the largest dimensions supported by the active WebGPU device when either scaled dimension exceeds its texture dimension limit. The cap SHALL preserve aspect ratio, the selected preset SHALL remain unchanged, and the HUD SHALL display the actual capped dimensions. Babylon Lite SHALL continue using WebGPU and SHALL NOT switch to another renderer.

#### Scenario: WebGPU-capped target is displayed
- **WHEN** twice the native width or height exceeds the active WebGPU device's supported texture dimensions
- **THEN** Babylon Lite uses the largest supported capped dimensions while preserving aspect ratio
- **AND** the selected preset remains double-native and the world-rendered readout and settings dialog show the actual capped dimensions
