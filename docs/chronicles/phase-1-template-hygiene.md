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

## Entry 5: Explicit placement and `date: auto`, from blueberryhill.fyi (2026-11-03)

**What**: Ported three build changes from blueberryhill.fyi: front matter
renders only through `{{key}}`, the TOC renders only where `{{toc}}` is,
and `date: auto` fills the date from git. TOC border removed.

**Why**: The site's home page showed an author line nobody placed and a
hand-typed date that went stale; the automatic TOC couldn't be positioned.

**How**:

- `build.mjs`: `gitDates()`, `TOC_MARK` swapped after render, header is title only
- `pages.yml`: `fetch-depth: 0`; `style.css`: `#TOC` border/padding removed
- Samples: `*{{subtitle}}* · {{author}} · {{date}}`, `**On this page**` + `{{toc}}`; home uses `date: auto`
- README: Details, Front matter table, new `date: auto` section, `{{toc}}` rule

**Decisions**:

- DEC-009: front matter appears only where `{{key}}` places it (amends DEC-007)
- DEC-010: `date: auto` from git

**Files**: `scripts/build.mjs`, `public/assets/style.css`, `.github/workflows/pages.yml`, `public/**/index.md`, `README.md`
