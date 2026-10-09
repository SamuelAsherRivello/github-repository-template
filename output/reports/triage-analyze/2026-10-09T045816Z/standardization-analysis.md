[Overview](overview.md) · Standardization analysis · [Architecture analysis](architecture-analysis.md) · [Verification baseline](verification-baseline.md) · [Back](overview.md)

# Standardization analysis

## Baseline and structure

[`standards-document.md`](C:/Users/srive/.agents/skills/triage-standardize/references/standards-document.md) has not been customized by user. Using defaults. The active baseline favors clear runtime boundaries, nearby commands/docs, explicit contracts at meaningful seams, and discoverable agent safety guidance.

The repository follows its own template layout: npm/Vite configuration and repository metadata at the root; `project-name/` as the Vite root; `src/ui/` for browser composition; `src/content/` for Babylon Lite content; tests and implementation documentation within the application directory. The top-level `AGENTS.md`, README, contribution guide, coding standards, and OpenSpec specs provide unusually detailed reusable instructions. Preserve `project-name/` in this template repository as directed; renaming applies to derived projects.

The React names and paths are generally responsibility-oriented (`BrowserSurface`, `Dialog`, `layout.js`, `pixel-grid-entry.js`). `App.jsx` is a 238-line composition/state module with several distinct responsibilities, but no confirmed correctness defect follows from its size alone. Babylon Lite-specific files are grouped under `src/content/babylon/`. No static non-reference was treated as proof that a module or asset is dead.

## Findings

| # | Finding | Severity | Evidence, desired standard, and delta | Recommended owner |
| --- | --- | --- | --- | --- |
| STND01 | Test command references absent file | High | `package.json` includes `project-name/test/openspec-skills.test.mjs`; `rg --files project-name/test` returns only `page.test.mjs` and `content.test.mjs`. The desired standard is that documented/CI commands match checked-in scripts and test sources. GitHub Pages and Release workflows both run `npm test`, so this mismatch affects both paths. | Standardize |
| STND02 | README retains expected template placeholders plus one stale architecture phrase | Medium | The title/summary/getting-started/details and demo URL are explicitly template placeholders, so they are intentional and not defects in this template. However, README Project Details says the layout guide explains “future renderer responsibilities,” while the guide and source document and implement the Babylon Lite renderer. Align this current-state description with the implementation. | Standardize |
| STND03 | Contributor and agent guidance is discoverable and aligned | Positive | `AGENTS.md` establishes scope, platform/render constraints, directory ownership, and safety; `CONTRIBUTING.md` calls for scoped changes, relevant checks, browser verification, and documentation updates; OpenSpec specs describe durable behavior. Keep these sources synchronized as conventions change. | Standardize |

## AI readiness

| # | Area | Status | Evidence | Practical improvement |
| --- | --- | --- | --- | --- |
| READY01 | Canonical agent instructions | nailed | Root `AGENTS.md` is discoverable and describes template scope, constraints, and precedence. | None identified. |
| READY02 | Command discovery | partial | Root `package.json`, README, both workflows, and integration guide expose commands; the test script names a missing test file. | Reconcile script and test inventory, then keep docs and workflow commands aligned. |
| READY03 | Project orientation | nailed | README structure section, coding standards, integration guide, Vite root, and source directories identify entry points and boundaries. | Refresh the stale README renderer phrase. |
| READY04 | Definition of done | nailed | `CONTRIBUTING.md`, template checklist, and CI specify relevant automated/manual evidence expectations. | Repair the broken test command to make the gate executable. |
| READY05 | Maintenance relationships | partial | Tests inspect UI/content boundaries; OpenSpec specs govern behavior; docs describe lifecycle and rendering. Some layout/test references are hard-coded and the README renderer statement has drifted. | Keep path and architecture changes synchronized across manifest, README, specs, and tests. |
| READY06 | Safety boundaries | partial | `AGENTS.md`, `.gitignore`, `SECURITY.md`, and checklist cover scope, generated output, and secrets. `.aiignore` is absent, but current evidence does not show a specific sensitive path outside existing boundaries that needs additional protection. | No `.aiignore` recommendation from this evidence. |

## Repository integrity

Static cross-checks covered source imports/exports and callers, package scripts, test paths, CI workflows, README links/claims, current OpenSpec specs/change folders, and repository asset paths discoverable in source/docs. Results identify likely follow-up targets, not deletion instructions.

| # | Candidate | Classification | Evidence and limits | Recommended owner |
| --- | --- | --- | --- | --- |
| INTG01 | `package.json` test target `project-name/test/openspec-skills.test.mjs` | confirmed stale | Named file is absent from `project-name/test/`; test command is used by deploy and release workflows. Static evidence establishes path mismatch; actual command result was not run. | Standardize |
| INTG02 | README phrase “future renderer responsibilities” | confirmed stale | README calls renderer responsibilities future work; `project-name/src/content/Content.jsx` and `src/content/babylon/` implement a Babylon Lite showcase and lifecycle, and the linked guide describes them as current. The guide also contains clearly marked future options, which are not treated as stale. | Standardize |
| INTG03 | `openspec/changes/standardize-babylon-lite-readmes/` | intentionally future-facing | Untracked current change contains a proposal/tasks for remote README normalization. It is planning material, not shipped implementation. It was not modified; completion claims in it were not independently verified against remote repositories. | User decision |
| INTG04 | `Template.jsx`, marketing images, and renderer helpers without broad runtime caller coverage | orphan candidate | Some items have no runtime references in the narrow scans, while the marketing images may be intended for external use and `Template` may serve consumers. No removal is justified without framework/external-consumer and user-intent checks. | User decision / Standardize |

The current README contains project placeholders that are explicitly part of the template workflow (including original-prompt, project-name, and demo URL slots); classify these as intentional template markers, not confirmed stale product claims. No `.aiignore` file is proposed: absence alone is not a defect and no concrete additional protected path was found.
