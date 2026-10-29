---
phase: 1
phase_name: Template Hygiene
updated: 2026-10-29
last_commit: 28e1b84
last_entry: 4
---

## Current Focus

Template works and deploys; definition lists landed this session. Phase 1
continues with matching tepiton conventions; the candidate list needs triage.

## Active Tasks

- [ ] Triage candidate tasks in IMPLEMENTATION.md (Phase 1)
- [ ] `package.json` name `markdown-pages-site` vs repo `markdown-it-simple`
- [ ] Repo description vs org README one-liner
- [ ] npm hygiene (`.npmrc`, `engines.node`, `.nvmrc`) like the eleventy templates

## Blockers

None.

## Context

- Whole build is `scripts/build.mjs`; config is env vars only (DEC-001)
- `public/` is the site root (DEC-002); stylesheet at `public/assets/style.css` (DEC-005)
- `{{key}}` substitution runs before rendering, also inside code (DEC-003)
- Definition lists via markdown-it-deflist (DEC-008), ported from blueberryhill.fyi,
  the first site built from this template
- No tests: `npm run build` on the sample content is the check
- Org-level conventions live in `~/projects/tepiton/CLAUDE.md`

## Next Session

Read this file, then decide which Phase 1 candidates to do. Changes made in
blueberryhill.fyi are a source of features to port upstream.
