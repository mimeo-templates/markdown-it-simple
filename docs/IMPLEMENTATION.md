# Implementation

Phase tracker for markdown-it-simple. Session pickup starts at
[CONTEXT.md](CONTEXT.md); decisions live in [DECISIONS.md](DECISIONS.md);
per-session history lives in `chronicles/`.

## Phase Overview

| Phase | Name | Dates | Status | Chronicle |
|-------|------|-------|--------|-----------|
| 0 | Foundation | 2026-10-18 – 2026-10-20 | Complete | [phase-0-foundation.md](chronicles/phase-0-foundation.md) |
| 1 | Template Hygiene | 2026-10-29 – | Current | [phase-1-template-hygiene.md](chronicles/phase-1-template-hygiene.md) |

## Phase 0: Foundation (Complete)

Commits `f93434a`..`28e1b84`.

- Single-file build (`scripts/build.mjs`) with markdown-it, markdown-it-anchor,
  and gray-matter; no static site generator (DEC-001)
- `public/` is the site root: Markdown renders to HTML, everything else is
  copied; directory structure preserved (DEC-002)
- Front matter header block, heading slugs, TOC for 2+ `##`/`###` headings,
  `.md` link rewriting, generated index when no root `index.md`
- `{{key}}` front-matter substitution before rendering (DEC-003)
- Every Markdown file keeps its name; `README.md` no longer maps to
  `index.html` (DEC-004)
- GitHub Pages workflow with `cancel-in-progress` concurrency (DEC-006)
- Duckburg sample content and a full README

Details: [chronicles/phase-0-foundation.md](chronicles/phase-0-foundation.md)

## Phase 1: Template Hygiene (Current)

**Goal**: bring the template in line with the conventions the other mimeo-templates
templates follow, and settle loose ends left from Phase 0.

### Completed

- [x] Project tracking set up (`docs/`)
- [x] Definition lists via markdown-it-deflist, ported from blueberryhill.fyi
      (DEC-008)
- [x] Front matter shown only via `{{key}}`; TOC only via `{{toc}}`
      (DEC-009), ported from blueberryhill.fyi
- [x] `date: auto` from git commit dates; workflow `fetch-depth: 0` (DEC-010)
- [x] TOC box border removed; samples and README updated
- [x] `package.json` `name` renamed to `markdown-it-simple`
- [x] npm/Node setup: `.npmrc` (`fund=false`), `engines.node >=22`,
      `.nvmrc` 24, workflow `node-version-file: .nvmrc` (DEC-011)
- [x] Removed unused `header .subtitle/.author/.date` CSS (built `_site/`
      diffed: only change is in `style.css`)
- [x] Content-fixture matrix: no. It reads `public/`, not `content/`
- [x] GitHub repo description set to the org README one-liner (was
      "a markdown-it markdown template"); remote moved to the renamed
      `mimeo-templates` org

### Candidate tasks

- [ ] Remove the same unused header CSS in blueberryhill.fyi

### Notes

- No tests. A build of the sample content (`npm run build`) is the check.
- The build has no dev server; preview with `npx serve _site`.

## Future Phases

Not planned. Possible directions, only if a need shows up:

- Site-wide variables for substitution (currently per-page only)
- Optional nav or breadcrumb generated from the directory tree
- A watch mode for local editing
