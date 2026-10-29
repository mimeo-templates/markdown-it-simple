# Phase 1: Template Hygiene

Started 2026-10-29.

## Entry 3: Project tracking setup (2026-10-29)

**What**: Added `docs/` with CONTEXT, IMPLEMENTATION, DECISIONS, and
chronicles; documented Phase 0 retroactively.

**Why**: Give future sessions a short pickup file and a record of why the
build works the way it does.

**How**:

- Two phases: Foundation (complete), Template Hygiene (current)
- Seven decisions extracted from commits and `build.mjs`
- Candidate hygiene tasks listed in IMPLEMENTATION.md, none committed to

**Files**: `docs/`

## Entry 4: Definition lists from blueberryhill.fyi (2026-10-29)

**What**: Ported definition-list support from blueberryhill.fyi, the first
site built from this template.

**Why**: The site needed `dl`/`dt`/`dd` for a glossary-style Reference page;
other sites made from the template will want the same thing.

**How**:

- Added `markdown-it-deflist@^4.0.0`; `md.use(deflist)` in `build.mjs`
- `dt`/`dd` styles in `public/assets/style.css`, same as the site
- Sample: "Telling them apart" list on `public/louie/index.md`
- README: dependency count, syntax note under Details

**Decisions**:

- DEC-008: definition lists via markdown-it-deflist

**Files**: `package.json`, `package-lock.json`, `scripts/build.mjs`,
`public/assets/style.css`, `public/louie/index.md`, `README.md`
