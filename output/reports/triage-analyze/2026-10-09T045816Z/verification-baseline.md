[Overview](overview.md) · [Standardization analysis](standardization-analysis.md) · [Architecture analysis](architecture-analysis.md) · Verification baseline · [Back](overview.md)

# Verification baseline

No automated checks or browser/manual scenarios were run during this analysis. The following is command and procedure discovery from manifests, CI, tests, and documentation; it is not a pass claim.

| # | Check or scenario | Source and scope | State | Result or limitation |
| --- | --- | --- | --- | --- |
| VERI01 | `npm test` | Root `package.json`; Node test runner configured to run `project-name/test/page.test.mjs`, `content.test.mjs`, and `openspec-skills.test.mjs`. Also invoked by `.github/workflows/deploy-pages.yml` and `release.yml`. | discovered, not run | Static inventory shows the third named file is absent from `project-name/test/`. This is expected to cause the command to fail, but no execution result is claimed. |
| VERI02 | `npm run build` | Root Vite script; builds from `project-name/` as configured by `vite.config.js`; CI uses it for Pages artifact creation. | discovered, not run | No build evidence captured. |
| VERI03 | `npm ci` | README, integration guide, and both GitHub workflows; clean dependency installation from lockfile. | discovered, not run | No install evidence captured. |
| VERI04 | `npm run dev`, open Vite URL | README and Vite `dev` script; starts local browser preview. | discovered, not run | No browser rendering, responsiveness, or interaction evidence captured in this triage run. |
| VERI05 | Browser checks: viewport fit, fullscreen, resize/DPR, dialogs and WebGPU failure messaging | `CONTRIBUTING.md` calls for browser verification; `project-name/documentation/layout-and-game-integration.md` describes resize/fullscreen/zoom/render-resolution scenarios. | discovered, not run | Manual procedure is descriptive rather than a complete step-by-step checklist. Requires a WebGPU-capable browser for successful-render cases. |
| VERI06 | Static focused layout and renderer calculations | `project-name/test/page.test.mjs` and `content.test.mjs`; layout contracts, pixel-grid transforms, render-resolution calculations, UI/source constraints, and renderer helper behavior. | discovered, not run | Test source provides meaningful unit/static seams. It does not prove end-to-end browser lifecycle, WebGPU operation, visual parity, or cleanup under actual browser remounts. |
| VERI07 | Lint, format, and type checks | Root manifest and workflow inventory. | not applicable / not discovered | No lint, format, or type-check script/config was discovered in the scanned repository files. |

## Verification sequence for a later approved change

1. Reconcile the missing test target, then run `npm ci` and `npm test` from the repository root.
2. Run `npm run build` from the repository root.
3. For UI or renderer changes, run `npm run dev` and inspect the app in a browser at representative viewport sizes; exercise fullscreen, resize/DPR, relevant dialogs, and WebGPU-unavailable handling as applicable.
4. Record which manual scenarios were actually observed. Deployment and release workflows mutate/publish external state, so they are not part of local triage verification.
