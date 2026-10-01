# Spec Delta

## MODIFIED Requirements

### Requirement: React-owned render-resolution control
The Babylon Lite world output SHALL show `(R) RenderResolution: <width>x<height>` below the Babylon Lite title, appending `(Native)` for Native, and SHALL show the active render scale and `Mode: 2DPixelPerfect` on the following lines. A live FPS line SHALL be drawn above the logo without shifting the logo or matched resolution/readout block. Clicking the world-rendered control or pressing R SHALL cycle quarter-native, half-native, native, and double-native, wrapping to quarter-native. React SHALL own the selection, default it to Native, persist the preset in local storage, and pass it to Babylon Lite. The Babylon Lite settings dialog SHALL show the same active value. The visible readout SHALL stay crisp and match its existing CSS-pixel size and placement regardless of internal render target size or device-pixel ratio. If a render target is capped to WebGPU limits, the world-rendered readout SHALL show the actual capped dimensions.

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
