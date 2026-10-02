# Tasks

## 1. Pixel-grid API

- [x] 1.1 Implement the Babylon Lite entry module with required mode configuration, sprite creation/update helpers, unsnapped simulation-position storage, view-aware logical-pixel snapping, and resnapping after view changes; verify projection/unprojection round trips, fractional camera pan, zoom, and view updates with focused tests.
- [x] 1.2 Route showcase/game sprite creation, updates, and view changes through the entry module while retaining the documented renderer-owned presentation path; verify the existing showcase still positions and animates correctly.
- [x] 1.3 Add repository checks that reject direct Babylon Lite sprite add/update APIs and direct layer-view mutations outside the approved module and renderer-owned path; verify the check passes for approved calls and fails on deliberate sprite and view bypass fixtures.

## 2. AI guidance and verification

- [x] 2.1 Update game integration guidance with the required initialization, sprite and view APIs, fractional simulation versus snapped rendering, transform limitations, and an example; verify the guide matches the implemented signatures.
- [x] 2.2 Run `npm test`, `npm run build`, and `openspec validate add-babylon-lite-pixel-grid-entry`; verify all pass and resolve any implementation or spec mismatch.
