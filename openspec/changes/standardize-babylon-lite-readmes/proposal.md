# Proposal

## Why

The 20 repositories returned by the owner's `babylon-lite` search use several README structures, inconsistent demo headings, different screenshot conventions, and incomplete prompt provenance. This makes the projects harder to compare and leaves them out of alignment with the maintained repository-template README format.

This change will establish a consistent, documentation-only presentation while preserving each project's actual game description, controls, technical notes, links, artwork attribution, and release instructions.

## What Changes

- Update the README in each matched repository to follow the template's recognizable order: title and summary, Original AI Prompt, Live Demo, Images, Table of Contents, Getting Started, Project Details, and Credits.
- Keep exactly one representative gameplay screenshot in the README's Images section, using an existing documentation asset wherever possible; retain other documentation assets on disk when they remain useful to linked documentation.
- Make the Live Demo section contain the project's verified public demo URL as one link, renaming equivalent headings such as `Play` or `Demo` when necessary.
- Preserve each repository's earliest verifiable original prompt in a collapsible prompt section. For repositories without a retained prompt, search repository history and documented project artifacts; do not invent missing prompt text or source URLs.
- Normalize project-specific build, run, release, controls, multiplayer, verification, architecture, and asset information beneath the standard sections instead of deleting useful content.
- Normalize relative documentation links and screenshot paths to the repository's actual project/documentation directory, correcting known template-path leftovers when verified.
- Add or update only README files and, where needed, files under each repository's documentation folder.
- Create one focused documentation commit per repository and push it to that repository's `main` branch after verification.
- Do not change application source, dependencies, workflows, generated output, licensing terms, or unrelated repository files. Do not create pull requests unless separately requested.

## Capabilities

### New Capabilities

None. This is a documentation-only consistency change; `skip_specs: true` is declared for the OpenSpec change.

### Modified Capabilities

None. No runtime or user-facing application behavior is being changed.

## Impact

- Affected systems: these 20 public repositories owned by `SamuelAsherRivello`:
  - `babylon-lite-danger-room`
  - `babylon-lite-pixel-walker`
  - `babylon-lite-zero-company`
  - `babylon-lite-dungeon-crawl`
  - `babylon-lite-bomberman-clone`
  - `babylon-lite-ring-rivals`
  - `babylon-lite-ascii-rpg`
  - `babylon-lite-arkanoid-clone`
  - `babylon-lite-sumo-battle`
  - `babylon-lite-garden-chat`
  - `babylon-lite-multiplayer-draw`
  - `babylon-lite-qbert-clone`
  - `babylon-lite-street-fighter-clone`
  - `babylon-lite-astra-blender-demo`
  - `babylon-lite-super-offroad-clone`
  - `babylon-lite-enter-the-gungeon-clone`
  - `babylon-lite-gauntlet-clone-3d`
  - `babylon-lite-gauntlet-clone-2d`
  - `babylon-lite-pacman-maze-chase-clone`
  - `babylon-light-2d-racer`
- The current template repository is used only as the format reference and OpenSpec planning home; its application files will not be changed.
- External GitHub authentication, push access, and each repository's current default branch state are prerequisites for implementation.
- Acceptance requires that every pushed commit changes only `README.md` and/or documentation-folder contents, and that no project-specific prompt, demo URL, or attribution is fabricated.
