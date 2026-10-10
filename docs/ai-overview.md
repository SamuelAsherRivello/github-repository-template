# AI Overview

## Built-in

- `AGENTS.md` contains repository-specific AI agent guidance.
- `AGENTS_TEMPLATE_USAGE_CHECKLIST.md` contains the template reuse checklist.
- [openspec](../openspec/) contains the repository's specification workflow
  configuration.

## Optional

Skills are not bundled by default. Keep skills in global storage when they are
part of an individual's workflow; add a project-local skill only when the
project depends on that skill and collaborators or automation need the same
capability. Before adding one, check its license, maintenance status, and
whether it introduces generated files or additional setup.

These repositories are possible sources for optional skills:

- [ai-skills-blender](https://github.com/SamuelAsherRivello/ai-skills-blender) -
  Blender-focused skills.
- [ai-skills-library](https://github.com/SamuelAsherRivello/ai-skills-library/) -
  general-purpose skills.
- [ai-skills-tiled](https://github.com/SamuelAsherRivello/ai-skills-tiled/) -
  Tiled-focused skills.

Humans should choose and install only the relevant skill using their AI tool's
normal skill-installation mechanism. AI agents should first follow the
repository's `AGENTS.md`, then use an available global skill, and finally use
a project-local skill when the repository explicitly includes or requires one.
Do not assume that a link alone installs or activates a skill.
