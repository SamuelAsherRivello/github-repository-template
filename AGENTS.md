# AI Repository Guidance

## Repository purpose and scope

This repository is a reusable browser app/game template. When a user asks to
use it, first identify the requested mode:

1. **New GitHub repository:** Use GitHub's **Use this template** flow when
   authorized. The destination repository is a new project; do not push
   project-specific work to this template.
2. **Local project copy:** Copy the tracked template files into the explicitly
   named destination, excluding `.git` and its history. Do not create a
   destination the user did not identify.
3. **Reference only:** Inspect this repository as inspiration. Copy no files
   unless the user separately asks for a copy.

For either new-project mode, follow
[the template usage checklist](AGENTS_TEMPLATE_USAGE_CHECKLIST.md). Resolve
any mismatch between the requested mode and repository configuration before
copying or creating a destination. Do not treat reference-only use as permission
to copy.

When establishing a new project, determine whether the user wants a game or an
app. For a game that needs an engine, Babylon Lite is the recommended starting
point and may be replaced with another engine if desired. For an app, remove
Babylon Lite content and dependencies, along with associated imports, tests,
assets, and docs used only by that content; update the lockfile after dependency
changes.

For every new app or game concept, choose either portrait or landscape before
implementation. Use the template's corresponding viewport display for the
chosen orientation and remove the template's orientation toggle, shortcut,
and persisted override. Do not add a second orientation or a layout that
attempts to serve both orientations. Do not select square for a new app or
game concept.

When adapting the starter into a game, treat the Babylon showcase as a renderer
example and replace it with the requested game. Babylon Lite is the recommended
engine when a game needs an engine, but it may be replaced with another engine
when appropriate. For app projects, remove Babylon Lite content and
dependencies along with associated imports, tests, assets, and docs used only by
that content. Babylon Lite is WebGPU-only;
games using it must show a clear unsupported-browser message and must not add a
fallback renderer. Implement the scene and renderer setup required by the game,
including for 3D. Every 2D game uses the Pixel Perfect rendering policy, while
each game chooses its own logical resolution and render scale.

For Babylon Lite 2D Pixel Perfect games, explicitly initialize
`BabylonLiteAIEntry` with `BabylonLiteMode.PixelPerfect2D`. AI-generated game
code MUST use its `addSprite`, `move`, `update`, `updateView`, and `centerView`
methods for sprite creation, position changes, and camera-view changes. The
entry point snaps projected sprite anchors after the Lite layer view and keeps
requested simulation positions unsnapped. Read movement state from game state
or `getSimulationPosition`, never from the snapped render position. Do not call
Babylon Lite `addSprite2D` or `updateSprite2D` directly, and do not mutate
`layer.view` directly. Renderer-owned presentation helpers are reserved for
renderer infrastructure. Arbitrary sprite/view rotation or fractional view
zoom may suspend pixel-perfect appearance and must be documented when used.

The viewport is the priority location for primary game content and must remain
usable in windowed and fullscreen modes. The template gutter layout is
required, but adding secondary material there (such as design elements,
instructions, or backstory) is optional. Games have full freedom to choose
whether and how their content scrolls.

Browser zoom is a supported browser presentation change. React and the game are
both displayed through the browser's CSS-pixel viewport and may appear larger
or smaller as zoom changes. Keep the game's logical resolution, world bounds,
and camera framing independent of browser zoom. Recalculate DPR-aware backing
and internal render dimensions when viewport size or device pixel ratio changes;
the resulting native backing dimensions may remain nearly constant when zoom
changes CSS viewport size and DPR in opposite directions. Do not change the
logical game view merely to make the render-resolution readout change on zoom.

Game audio is optional; music is not recommended. If a game includes sound,
recommend 4 to 10 event-based sound effects and provide both an in-game mute
toggle and a documented URL argument that mutes all sound for silent AI
testing. Human players may enable sound in the normal experience.

## Repository and application layout

- The repository root is the npm project root and contains `.git`, package
  configuration, and repository metadata. Run Git, dependency, build, test,
  and run commands from this root unless the resulting project's inspected
  configuration says otherwise.
- `project-name/` is the Vite application root. Keep app source, tests, and
  assets there unless the chosen stack deliberately changes the layout.
- Project documentation assets belong in `project-name/documentation/`.
- Keep `project-name/` as the Vite root and synchronize the GitHub repository
  URL with the resulting project repository when this template baseline is
  retained.
- When creating a project from this template, rename the copied
  `project-name/` directory to a concise, fitting name for the new app or game
  before project implementation. Update every dependent path and configuration,
  including Vite's `root`, project documentation paths, and generated-output
  exclusions in `.gitignore`. Do not leave the generic `project-name/` name in
  the resulting project. This instruction applies only to template usages; keep
  the directory named `project-name/` in this template repository.

## Browser testing capability fallback

If the AI task requires WebGPU or another capability unsupported by the
embedded browser, switch to Microsoft Edge for browser testing and
interaction. Do not spend time debugging the embedded browser's limitation.
Verify that Edge is using hardware acceleration and WebGPU, then continue the
task there. Use the embedded browser only for tasks it supports.

## React code and styles

The README must include an **Original AI Prompt** section linking to the
earliest substantive user prompt that started the project. This is usually the
prompt that invoked a project-creation skill. Use the prompt's source URL as
both the Markdown link text and destination, for example
`[https://example.com/prompt](https://example.com/prompt)`. In the untouched
template, retain `[{original-ai-prompt-url}]({original-ai-prompt-url})` as the
placeholder. Do not substitute a later refinement or an AI-generated summary
for the initiating prompt.

- Do not leave dead code or dead styles. Remove unused React components,
  imports, variables, CSS selectors, and custom properties when they are no
  longer used.
- When changing React UI, check that its JSX class names and IDs match the
  styles, and remove obsolete selectors left behind by the change.
- The page structure supports keeping the full HUD visible inside the viewport
  during fullscreen. Gutters are not visible in fullscreen, so custom gutter UI
  may be added only as secondary UI. Keep all primary UI in React and within
  the viewport.

## HTML template corner roles

The default HTML template uses four reusable `corner` instances inside
`ui_layer`. Preserve these roles when adapting the template:

- Upper left: project title.
- Upper right: project links.
- Lower right: project version.
- Lower left: project settings.

Format content in each corner using either the menu title style or the menu
body style. Represent boolean settings with checkboxes.

## OpenSpec setup

The template preserves `.agents/skills/.openspec-target` but does not bundle
generated OpenSpec skills. When the resulting project requires OpenSpec, follow
the authoritative setup and verification procedure in
[the template usage checklist](AGENTS_TEMPLATE_USAGE_CHECKLIST.md#openspec-setup-when-required).
Do not hand-edit generated OpenSpec skills.

## Optional AI skills

This template does not bundle general-purpose or tool-specific skills by
default. Prefer global skills for a user's personal workflow. Add a skill under
the resulting project's local skill directory only when the project requires
that capability to be reproducible for collaborators or automation, and record
the source, version or commit, license, and any installation steps. Do not copy
an entire skills repository when only one skill is needed.

Possible sources include:

- `https://github.com/SamuelAsherRivello/ai-skills-library/`
- `https://github.com/SamuelAsherRivello/ai-skills-tiled/`
- `https://github.com/SamuelAsherRivello/ai-skills-blender`

Links are references, not installations. Agents should use skills already
available in their environment first and should not fetch or activate an
external skill unless the user or repository workflow calls for it. When a
project-local skill is present, follow its instructions only after confirming
that it applies to the current task.

## Pull request workflow

Do not create a pull request unless the user explicitly asks for one in the
current request. A push, commit, or completed template/OpenSpec workflow does
not imply approval to create a pull request.
