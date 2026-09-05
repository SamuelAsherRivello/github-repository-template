## 1. Documentation assets (apply phase only)

- [x] 1.1 Delete the four exact Markdown paths listed in proposal.md; verify all four are absent and no unrelated files were removed.
- [x] 1.2 Use the imagegen skill to create `documentation/images/screenshot01.png` with the visual treatment in design.md; verify PNG decoding and visually confirm centered, correctly spelled `screenshot`, a monochrome palette, generous whitespace, and a thin border.

- [x] 1.3 Copy the supplied banner unchanged to `documentation/images/samuel-asher-rivello-banner.png`; verify the source and destination bytes match.

## 2. Image approval and README integration

- [x] 2.1 Send the generated full-size PNG review URL/link to the user during development and obtain explicit image approval before README integration; verify the link opens the actual PNG, and revise/resend if requested.
- [x] 2.2 Embed the supplied banner as the first README content before the existing comment/title; verify it renders without distortion and precedes all existing content.
- [x] 2.3 Replace the README placeholder under Screenshots immediately before Live Demo (recreate that confirmed section locally if absent) with the linked HTML image in design.md and update the documentation folder description; verify it displays at 400 pixels wide and clicking it opens the full-size PNG.
- [x] 2.4 Remove README references to the deleted brief and design discussion, and convert the A1 story link to plain text; verify no links to any of the four deleted files remain in README.md and surrounding content is preserved.
- [x] 2.5 Inspect final Git status and diff plus the new PNG; verify implementation changes are limited to the four deletions, two images, and README.md, and report any unavailable visual checks. Do not run application builds for this static-only change.
