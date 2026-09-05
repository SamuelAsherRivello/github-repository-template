## Context

See proposal.md for motivation and the exact deletion list. The repository has four files in documentation/ and no images directory. README.md links to the brief, design discussion, and story diagrams in several sections. Its opening comment permits additions/removals when requested, as they are here. The checkout contains no application packages or package manifest.

## Goals / Non-Goals

**Goals:** Establish a simple visual treatment and a portable README reference while limiting implementation edits to the requested documentation and README.

**Non-Goals:** Rewriting the rest of the README, changing runtime behavior, or reconciling historical OpenSpec artifacts.

## Decisions

- Copy the user-supplied banner from `/tmp/herdr-clipboard-images-1000/client-4-clipboard-1788614240633212532-0.png` unchanged to `documentation/images/samuel-asher-rivello-banner.png` during apply. Put `![Samuel Asher Rivello](documentation/images/samuel-asher-rivello-banner.png)` first in README.md, before the existing comment and title. Preserve its aspect ratio and original pixels. The generated screenshot approval step does not apply to this supplied asset.
- Use the user-confirmed filename `screenshot01.png`, with no hyphen.
- Generate an original landscape PNG using the imagegen skill during apply. Use the confirmed white-background treatment; retain 16:9 as a recommended aspect ratio. The composition has a white background, thin black inset frame, generous whitespace, and centered lowercase `screenshot` in clear black sans-serif lettering. Antialiased neutral gray edges are acceptable; no color accents, product UI, or additional text. A realistic application capture would obscure its placeholder purpose.
- During development, generate the PNG and send the user a review URL/link to the full-size image. Wait for explicit image approval before README integration; revise and resend if requested. A clickable local artifact link is sufficient in this workspace; do not imply it is publicly hosted.
- Replace the existing README image in place using `<a href="documentation/images/screenshot01.png"><img src="documentation/images/screenshot01.png" width="400" alt="Screenshot placeholder" /></a>`. This preserves the requested display width and opens the full-size source PNG when clicked. Do not add a duplicate image to the Documentation section. The remote main README contains `<img src="" width=400" />` under `### Screenshots`, immediately before `## Live Demo`. The local README differs. Use this confirmed section position, adding the section locally if still absent, without replacing unrelated local content or performing Git synchronization.
- Remove the obsolete reading sentence in Getting Started, the brief/design Documentation bullets, and the Source brief resource bullet. Convert the completed A1 link to plain text to preserve its claim. Update the documentation/ structure description to describe screenshot assets. Preserve surrounding content.
- Validate the PNG by decoding it and visually inspecting the composition, text, and monochrome palette. Check the README relative target and absence of links to the four removed documents. No application test suite or new automated tests are needed for this static edit.

## Risks / Trade-offs

- Generated lettering may be misspelled or colored → inspect the actual PNG and regenerate if needed.
- Removing documents invalidates historical references in OpenSpec → disclose this consequence without expanding the requested edit scope or claiming historical requirements are satisfied.
- A broad README rewrite could capture unrelated cleanup → restrict edits to the image, removed-document references, and documentation folder description.

## Migration Plan

During a separately requested apply phase, remove the four exact files, generate the PNG, update the README, and inspect the resulting diff. No deployment is required. Any later rollback involving Git mutations requires explicit authorization under the repository policy.

## Source evidence

The public main README at https://raw.githubusercontent.com/SamuelAsherRivello/github-repository-template/main/README.md was inspected directly and confirms the Screenshots placeholder at line 11. The earlier missing-location concern is resolved; it came from a different local README revision.
