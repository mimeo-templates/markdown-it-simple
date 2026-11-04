---
phase: 1
phase_name: Template Hygiene
updated: 2026-11-04
last_commit: 3cf7110
last_entry: 6
---

## Current Focus

Phase 1 hygiene is done: package rename, npm/Node setup (DEC-011), unused
header CSS removed, repo description synced with the org README. The
repo now lives in the `mimeo-templates` org.

## Active Tasks

- [ ] Remove the same unused header CSS in blueberryhill.fyi (deferred;
      leave blueberryhill.fyi alone until asked)

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

Phase 1 has no open candidates. Check blueberryhill.fyi for build or
style changes to port upstream, or close Phase 1.
