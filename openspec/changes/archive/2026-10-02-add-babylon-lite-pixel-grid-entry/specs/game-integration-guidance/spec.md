# Spec Delta

## ADDED Requirements

### Requirement: AI game guidance mandates pixel-grid movement
Game integration guidance SHALL direct AI contributors implementing Babylon Lite 2D Pixel Perfect games to initialize and use the provided entry point for all sprite creation, position changes, and layer view changes. It SHALL distinguish fractional simulation state from snapped render positions and state that arbitrary rotation or non-integer scaling can suspend pixel-perfect appearance.

#### Scenario: AI implements 2D sprite movement
- **WHEN** an AI contributor adds or moves a Babylon Lite sprite in a 2D Pixel Perfect game
- **THEN** the contributor uses the configured entry point and keeps simulation coordinates separate from snapped render coordinates

#### Scenario: AI moves the layer view
- **WHEN** an AI contributor changes a layer's pan, zoom, or rotation
- **THEN** the contributor uses the entry point so managed sprites are resnapped for the updated view

#### Scenario: AI introduces a non-grid-preserving transform
- **WHEN** an AI contributor uses arbitrary sprite rotation or non-integer view scaling
- **THEN** the contributor documents that strict pixel-perfect appearance is suspended for that transform
