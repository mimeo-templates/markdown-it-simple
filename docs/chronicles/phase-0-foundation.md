# Phase 0: Foundation

2026-10-18 – 2026-10-20. Retroactive entries written 2026-10-29.

## Entry 1: Build script and site layout (2026-10-18)

**What**: First working template: a build script that renders Markdown to
styled HTML and a Pages workflow that deploys it.

**Why**: A minimal markdown-it template alongside the eleventy and pandoc
ones.

**How**:

- `scripts/build.mjs`: walk `SRC_DIR`, render with markdown-it, wrap in a page
- Content moved from repo root into `public/`, then into subdirectories
- Heading slugs, TOC, `.md` link rewriting, generated index fallback
- Duckburg sample content (Huey/Dewey/Louie pages)

**Decisions**:

- DEC-001: one script, no SSG
- DEC-002: `public/` is the site root
- DEC-007: pandoc-style markup

**Files**: see commits `f93434a`..`58db276`

## Entry 2: Substitution, stylesheet, README, naming (2026-10-18 – 2026-10-20)

**What**: Added `{{key}}` substitution, moved the stylesheet into `public/`,
wrote the README, dropped the README-to-index mapping, and enabled
cancellation of stale Pages runs.

**Why**: Pages needed front-matter values in body text; the stylesheet
belonged with the content; `README.md` and `index.md` could collide.

**How**:

- `fill()` in `build.mjs`: dotted keys, `\{{` escape, warning on missing key
- `CSS_SRC` env var to override the stylesheet
- `htmlName()` maps every `.md` to `.html` with the same base name
- `cancel-in-progress: true` in the workflow

**Decisions**:

- DEC-003: plain text substitution
- DEC-004: every file keeps its name
- DEC-005: stylesheet location and override
- DEC-006: Actions Pages deploy

**Files**: see commits `2da5c9d`, `30a8d0f`, `28e1b84`
