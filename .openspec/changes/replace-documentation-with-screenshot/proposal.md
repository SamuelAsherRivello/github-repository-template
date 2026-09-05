## Why

Simplify the documentation folder to a visual placeholder and make it accessible from the README. The user requests removal of the four existing Markdown documents and an original black-and-white screenshot placeholder.

## What Changes

- Delete exactly `documentation/ACCOUNT_ADDRESSES_VERIFICATION.md`, `documentation/BGS_PROJECT_BRIEF.md`, `documentation/design-discussion.md`, and `documentation/User Story Diagrams.md`.
- Create `documentation/images/screenshot01.png`, an original, polished black-and-white placeholder displaying the text `screenshot`.
- Replace the user-specified existing README image in place with a 400-pixel-wide image linked to the full-size PNG; remove README links to the deleted documents and update its documentation folder description.
- Confirmed filename: `screenshot01.png`. Use a white background, centered black `screenshot` text, generous whitespace, and a thin black border.
- During development, generate the image and provide a review URL/link for user approval before README integration.
- The GitHub main README confirms the existing placeholder under `### Screenshots`, immediately before Live Demo; use that position.
- Add the supplied Samuel Asher Rivello banner unchanged as `documentation/images/samuel-asher-rivello-banner.png` and embed it as the very first README content.

## Capabilities

### New Capabilities

None. This is a documentation and static-asset change; set `skip_specs: true`.

### Modified Capabilities

None. Existing runtime requirements remain unchanged.

## Impact

Implementation affects only the four named documents, the two PNG assets, and README.md. No application code, dependencies, or runtime verification is involved.

Existing `.openspec/config.yaml` cites the documents being removed, and `story-driven-demo` specifications call for synchronized story documentation. This requested deletion removes that supporting material; it does not assert those historical evidence requirements are satisfied or repeal them. Preserve existing OpenSpec configuration, specifications, and historical changes; broader reconciliation is outside this documentation cleanup.
