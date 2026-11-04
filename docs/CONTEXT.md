---
phase: 1
phase_name: Template Hygiene
updated: 2026-11-03
last_commit: 3a5a61e
last_entry: 5
---

## Current Focus

Ported explicit placement from blueberryhill.fyi: front matter and the TOC
appear only where `{{key}}` / `{{toc}}` put them, and `date: auto` reads
commit dates from git (DEC-009, DEC-010). Phase 1 hygiene candidates still
need triage.

## Active Tasks

- [x] Package rename, npm/Node setup (DEC-011), unused header CSS removed
- [x] GitHub repo description set to the org README one-liner
- [ ] Remove the same unused header CSS in blueberryhill.fyi

## Blockers

None.

## Context

- Whole build is `scripts/build.mjs`; config is env vars only (DEC-001); `public/` is the site root (DEC-002)
- Header is title only; everything else needs `{{key}}`; TOC needs `{{toc}}` on its own line (DEC-009)
- `date: auto` = file's last commit; root index = newest under `public/`; needs `fetch-depth: 0` (DEC-010)
- `{{key}}` substitution runs before rendering, also inside code (DEC-003)
- blueberryhill.fyi is the first site from this template and the source of ported features
- No tests: `npm run build` on the sample content is the check
- Node version lives in `.nvmrc` only; CI reads it via `node-version-file` (DEC-011)

## Next Session

Read this file, then decide which Phase 1 candidates to do. Check
blueberryhill.fyi for further build or style changes to port upstream.
