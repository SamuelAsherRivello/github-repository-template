# Design

## Context

See `proposal.md` for motivation and repository scope. The target repositories are independent GitHub repositories with different application roots and documentation paths. The read-only inventory found a shared family resemblance but not a single reliable project directory name: some READMEs use paths such as `project-name/`, while others use repository-specific folders. Several repositories already contain prompt details and screenshots; a smaller subset has missing or placeholder prompt content.

The template README is the presentation reference, not a source of application code. The implementation must therefore be repository-local and content-preserving.

## Goals / Non-Goals

**Goals:**

- Give every target README the same recognizable reading flow and section vocabulary.
- Use verified, repository-specific demo URLs, screenshots, prompt text, commands, and attribution.
- Keep screenshots and other documentation assets in the target repository's existing documentation location.
- Make each repository's commit independently auditable and limited to documentation paths.

**Non-Goals:**

- No source-code, package, lockfile, workflow, deployment, runtime, or license changes.
- No forced renaming of project-specific documentation directories.
- No invented prompt provenance, screenshots, demo URLs, contributors, or technical claims.
- No pull requests or changes to the template application's own README.

## Decisions

### Use a common outline with project-specific subsections

Each README will use the template order—title/summary, Original AI Prompt, Live Demo, Images, Table of Contents, Getting Started, Project Details, Credits—but existing game-specific material will be moved under the nearest appropriate section. This preserves useful controls, multiplayer setup, architecture, verification, release, and asset notes without flattening distinct projects into identical prose.

Alternative considered: replace each README wholesale with the template. Rejected because it would discard project behavior and verification information.

### Prefer existing documentation assets

The implementation will select one representative gameplay screenshot already present in each repository's documentation tree. If a target lacks a suitable screenshot, a documentation-only asset may be added only when it can be sourced from the repository's existing tracked material or an explicitly verified project capture. Other existing assets remain available to linked documentation unless their README-only placement is the source of a broken or misleading presentation.

Alternative considered: add a new generated screenshot to every repository. Rejected because it introduces unnecessary asset changes and risks misrepresenting the current build.

### Treat prompt provenance as an evidence requirement

For each README, inspect the current file, tracked documentation, and README history before changing the prompt section. Preserve existing prompt text when it is present. For missing or placeholder prompts, use only an earliest prompt recoverable from repository history or a durable project artifact; otherwise report the repository as blocked rather than fabricate text. Where the source URL cannot be verified, retain the prompt text and mark provenance for follow-up instead of inventing a link.

Alternative considered: synthesize prompts from repository descriptions. Rejected because the template requires the earliest substantive prompt, not an AI-generated summary.

### Verify the documentation-only boundary per commit

For each target, work from the current `main` state, update only `README.md` and allowed documentation-folder files, inspect the diff, and verify the changed-path list before committing. The commit is pushed only after the path check and a lightweight README/link/image validation. If an unrelated change appears, stop and preserve it for the repository owner rather than overwriting it.

Alternative considered: batch-edit all repositories from one generated README. Rejected because paths, commands, prompts, and demo URLs differ and would make false substitutions likely.

## Risks / Trade-offs

- [Remote branch changes during preparation] → Fetch the latest `main` immediately before editing and stop if the working tree is not clean or the remote advances before push.
- [A project has no verifiable original prompt or demo] → Record the gap and do not fabricate; request a source or leave that repository uncommitted.
- [Relative image links break after section cleanup] → Validate every README image/link target against the repository tree before committing.
- [A project uses a nonstandard app root] → Preserve the existing root and commands; only normalize prose and headings around verified paths.
- [README-only review misses a stale asset reference] → Run a targeted documentation-link/path check and inspect the final changed-file list for every repository.

## Migration Plan

1. Fetch and inspect each repository's current `main` branch, README, documentation tree, prompt history, demo URL, and working-tree state.
2. Prepare the README and any explicitly necessary documentation asset changes one repository at a time.
3. Validate structure, links, image targets, prompt provenance, and changed paths.
4. Commit the documentation-only change with a focused message and push to `main`.
5. Record the commit URL, changed paths, validation result, and any unresolved provenance issue before proceeding to the next repository.

Rollback is a repository-local revert of the focused documentation commit. No source or dependency rollback is required.
