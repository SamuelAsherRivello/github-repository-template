# Spec Delta

## ADDED Requirements

### Requirement: Configured Babylon Lite pixel-grid entry point
Babylon Lite 2D Pixel Perfect content SHALL explicitly configure its sprite-position entry point before sprite creation or movement. Use before configuration or with an unsupported mode SHALL fail with a clear error.

#### Scenario: Pixel Perfect entry point is unconfigured
- **WHEN** game code attempts to create or move a managed sprite before configuration
- **THEN** the operation fails with an error that identifies the missing configuration

#### Scenario: Unsupported mode is selected
- **WHEN** game code configures the 2D pixel-grid entry point with an unsupported mode
- **THEN** configuration fails with a clear error

### Requirement: Sprite positions align after the layer view
Managed Babylon Lite sprite positions SHALL be snapped to the nearest logical screen pixel after the layer view transform and converted back to layer coordinates before rendering. The requested simulation position SHALL remain available without snapping, and managed sprites SHALL be resnapped when their layer view changes.

#### Scenario: Fractional sprite and camera positions
- **WHEN** a managed sprite has a fractional requested position or the layer view places it at a fractional screen position
- **THEN** its rendered anchor is aligned to the nearest logical screen pixel
- **AND** its requested simulation position remains unchanged and available to game logic

#### Scenario: Layer view changes after sprite movement
- **WHEN** game code changes the pan, zoom, or rotation of a layer containing managed sprites through the entry point
- **THEN** all managed sprites on that layer are resnapped using the updated view before rendering

### Requirement: Sprite position updates use the entry point
Game code SHALL route Babylon Lite sprite creation, every `positionPx` update, and layer view changes through the configured entry point. Automated repository checks SHALL flag sprite or view mutations that bypass it.

#### Scenario: Position update bypasses the entry point
- **WHEN** a game source file submits a sprite position patch directly to Babylon Lite outside the approved entry point
- **THEN** the automated check fails and identifies the bypass

#### Scenario: Layer view mutation bypasses the entry point
- **WHEN** game source directly mutates a managed layer's view outside the approved entry point
- **THEN** the automated check fails and identifies the bypass

#### Scenario: Non-position sprite properties change
- **WHEN** game code changes a managed sprite's frame, visibility, or other non-position property
- **THEN** that property can be updated without changing its stored simulation position
