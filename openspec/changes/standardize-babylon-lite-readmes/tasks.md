# Tasks

## 1. Preflight and evidence

- [x] 1.1 Fetch the latest `main` state for all 20 target repositories, verify each working tree is clean and push access is available, and record the starting commit before any edit.
- [x] 1.2 Inventory each README, documentation tree, demo URL, screenshot candidates, project root, and prompt provenance; verify the inventory identifies only documentation paths as eligible edit targets.
- [x] 1.3 Recover and verify the earliest available prompt for `babylon-lite-zero-company`, `babylon-lite-ascii-rpg`, `babylon-lite-astra-blender-demo`, `babylon-light-2d-racer`, and the placeholder prompt in `babylon-lite-enter-the-gungeon-clone`; record any unresolved source instead of fabricating content. Full README history confirms no verifiable prompt source for the first four; Gungeon's current prompt remains a placeholder and is not yet safe to publish as original provenance.

## 2. README normalization: first batch

- [x] 2.1 Update `babylon-lite-danger-room/README.md` to the standard outline, verified demo link, one gameplay screenshot, prompt section, and project-specific details; validate all image/link targets and confirm the diff contains only README/documentation paths.
- [x] 2.2 Update `babylon-lite-pixel-walker/README.md` with the standard outline while retaining its prompt, demo, screenshot, and particle-resolution notes; validate links/images and the documentation-only diff.
- [x] 2.3 SKIPPED: `babylon-lite-zero-company` has no verifiable original prompt in its README, documentation, or full README history; no files changed.
- [x] 2.4 Update `babylon-lite-dungeon-crawl/README.md` with a verified screenshot and standard outline while retaining controls and release details; validate links/images and the documentation-only diff.
- [x] 2.5 Update `babylon-lite-bomberman-clone/README.md` to the standard outline with one representative screenshot while retaining multiplayer, controls, and verification details; validate links/images and the documentation-only diff.

## 3. README normalization: second batch

- [x] 3.1 Update `babylon-lite-ring-rivals/README.md` with standard heading order, TOC, credits, prompt, demo, and screenshot; validate links/images and the documentation-only diff.
- [x] 3.2 SKIPPED: `babylon-lite-ascii-rpg` has no verifiable original prompt in its README, documentation, or full README history; no files changed.
- [x] 3.3 Update `babylon-lite-arkanoid-clone/README.md` with a dedicated Images section, standard credits/details, and retained multiplayer/art notes; validate links/images and the documentation-only diff.
- [x] 3.4 Update `babylon-lite-sumo-battle/README.md` with standard outline and TOC while retaining prompt, demo, screenshot, browser verification, and hosting limits; validate links/images and the documentation-only diff.
- [x] 3.5 Update `babylon-lite-garden-chat/README.md` with standard Images and TOC sections while retaining chat/multiplayer documentation; validate links/images and the documentation-only diff.

## 4. README normalization: third batch

- [x] 4.1 Update `babylon-lite-multiplayer-draw/README.md` with only the structural normalization needed for the template outline, retaining its prompt, demo, screenshot, and server details; validate links/images and the documentation-only diff. Already compliant; no commit required.
- [x] 4.2 Update `babylon-lite-qbert-clone/README.md` with standard TOC, headings, credits, and project details while retaining prompt, demo, screenshot, controls, and technology notes; validate links/images and the documentation-only diff.
- [x] 4.3 Update `babylon-lite-street-fighter-clone/README.md` with one representative screenshot and standard sections while retaining duel, controls, fighters, artwork, and release details; validate links/images and the documentation-only diff. Already compliant; no commit required.
- [x] 4.4 SKIPPED: `babylon-lite-astra-blender-demo` has no verifiable original prompt in its README, documentation, or full README history; no files changed.
- [x] 4.5 Update `babylon-lite-super-offroad-clone/README.md` with standard Images and TOC organization while retaining the approved prompt, demo, controls, assets, and delivery notes; validate links/images and the documentation-only diff.

## 5. README normalization: fourth batch

- [x] 5.1 SKIPPED: `babylon-lite-enter-the-gungeon-clone` retains a prompt placeholder rather than verifiable original prompt provenance; no files changed.
- [x] 5.2 Update `babylon-lite-gauntlet-clone-3d/README.md` with standard Images and TOC sections while retaining co-op, artwork, prompt, demo, and release information; validate links/images and the documentation-only diff.
- [x] 5.3 Update `babylon-lite-gauntlet-clone-2d/README.md` with one representative README screenshot and standard TOC/section order while retaining multiplayer, verification, art provenance, and known limits; validate links/images and the documentation-only diff.
- [x] 5.4 Update `babylon-lite-pacman-maze-chase-clone/README.md` by renaming `Play` to `Live Demo` and reorganizing its game-design material beneath the standard outline; validate links/images and the documentation-only diff.
- [x] 5.5 SKIPPED: `babylon-light-2d-racer` has no verifiable original prompt in its README, documentation, or full README history; no files changed.

## 6. Commit and integration verification

- [x] 6.1 For each repository, inspect the final staged path list and confirm it contains only `README.md` and/or documentation-folder files; stop and restore the pre-edit state if any other path is present.
- [x] 6.2 Commit each repository's completed documentation update separately with a focused message, push to `main`, and verify the remote commit URL and changed-path list.
- [x] 6.3 Run a final read-only audit across all 20 remote READMEs confirming the standard sections, one demo link, one representative screenshot, prompt handling, and retained project-specific content; record blocked or unverified repositories without claiming completion.
