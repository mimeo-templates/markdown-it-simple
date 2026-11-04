# Decisions

Architectural decisions for markdown-it-simple. Search with
`grep -i "keyword" docs/DECISIONS.md`.

## Active Decisions

### DEC-001: One build script, no static site generator (2026-10-18)

**Status**: Active

**Context**: The template exists to show the smallest working
Markdown-to-site pipeline, next to the eleventy and pandoc templates.

**Decision**: A single `scripts/build.mjs` using markdown-it,
markdown-it-anchor, and gray-matter. No config file, no plugin system;
behavior is set by four environment variables.

**Alternatives considered**: Eleventy (already covered by six templates);
pandoc (covered by pandoc-simple).

**Consequences**: Features are added by editing the script. Anything that
needs layouts, collections, or partials belongs in an eleventy template.

**Amended 2026-10-29**: Fourth dependency, markdown-it-deflist (DEC-008).

---

### DEC-002: `public/` is the site root (2026-10-18)

**Status**: Active

**Context**: The first version built from a root `index.md`; subdirectories
and assets needed a home (`c47b575`, `331daca`).

**Decision**: Everything under `public/` lands at the same path in `_site/`.
Markdown is rendered; all other files are copied as is.

**Alternatives considered**: Content at repo root with an ignore list.

**Consequences**: The repo root holds only tooling. Images and PDFs need no
special handling.

---

### DEC-003: `{{key}}` substitution is plain text replacement (2026-10-18)

**Status**: Active

**Context**: Pages wanted to reuse front-matter values in their body
(`2da5c9d`).

**Decision**: Replace `{{key}}` / `{{a.b}}` with the page's own front-matter
value before Markdown rendering. `\{{key}}` escapes; missing keys are left in
place with a warning. No loops, conditionals, partials, or site-wide
variables.

**Alternatives considered**: A real template language (mustache, nunjucks).

**Consequences**: Values are treated as Markdown. Placeholders inside code
blocks are also replaced, so documentation of the syntax must escape it.

---

### DEC-004: Every Markdown file keeps its name (2026-10-18)

**Status**: Active (supersedes README-to-index mapping)

**Context**: `README.md` was mapped to `index.html`, so a directory with both
`README.md` and `index.md` silently wrote `index.html` twice (`30a8d0f`).

**Decision**: `foo.md` always becomes `foo.html`. Use `index.md` for a
directory's landing page.

**Alternatives considered**: Keep the mapping and error on collision.

**Consequences**: No collisions. Repos that use `README.md` as a landing page
need to rename it.

---

### DEC-005: Stylesheet lives in `public/assets/`, `CSS_SRC` overrides (2026-10-18)

**Status**: Active

**Context**: The stylesheet started in `scripts/`, outside the content
(`2da5c9d` moved it).

**Decision**: Every page links `<root>/assets/style.css`. The file comes from
`SRC_DIR`, or from `CSS_SRC` when set (copied last, so it wins). A missing
stylesheet is a warning, not an error.

**Alternatives considered**: Inline CSS in every page.

**Consequences**: The template's theme can style another folder of Markdown
(`SRC_DIR=docs CSS_SRC=public/assets/style.css`). The link path is fixed in
the script.

---

### DEC-006: Deploy with GitHub Actions Pages, cancel stale runs (2026-10-20)

**Status**: Active

**Context**: Pushes to `main` should publish the site without a `gh-pages`
branch.

**Decision**: `.github/workflows/pages.yml` builds with `npm ci` and deploys
via `deploy-pages`, filtered to paths that affect output. The `pages`
concurrency group uses `cancel-in-progress: true` (`28e1b84`).

**Alternatives considered**: Branch deploy (the build still writes
`.nojekyll` in case of that).

**Consequences**: `package-lock.json` must stay committed. New repos from the
template must set Pages source to GitHub Actions.

---

### DEC-007: Pandoc-style page markup (2026-10-18)

**Status**: Active

**Context**: The mimeo-templates pandoc templates already have HTML conventions for
the title block and TOC.

**Decision**: Use pandoc's ids and classes: `header#title-block-header`,
`h1.title`, `p.subtitle`/`.author`/`.date`, `nav#TOC[role=doc-toc]`.

**Alternatives considered**: Template-specific markup.

**Consequences**: Stylesheets can move between this template and the pandoc
ones with little change.

**Amended 2026-11-03** (DEC-009): the header now emits only `h1.title`;
`nav#TOC` appears where `{{toc}}` is placed.

---

### DEC-008: Definition lists via markdown-it-deflist (2026-10-29)

**Status**: Active

**Context**: blueberryhill.fyi, the first site built from this template,
added definition lists to replace bold-leader bullets on its Reference page.

**Decision**: Port that change upstream: `md.use(deflist)` in `build.mjs`,
plus `dt`/`dd` rules in `style.css`. Syntax is Pandoc/PHP Markdown Extra
(`Term` / `: description`).

**Alternatives considered**: Raw `<dl>` HTML in Markdown (already works, but
is awkward to write).

**Consequences**: Sites made from the template get definition lists without
editing the build. A line starting with `: ` after a paragraph now becomes a
definition.

---

### DEC-009: Front matter appears only where `{{key}}` places it (2026-11-03)

**Status**: Active

**Context**: blueberryhill.fyi showed an author and date under the home
page title only because that page's front matter set them, and every page
with two or more headings got a TOC at the top whether it wanted one or
not.

**Decision**: The page header renders only the title. `subtitle`,
`author`, `date`, and every other key appear only where the body uses
`{{key}}`. The TOC is no longer automatic: `{{toc}}` marks where it goes
(an HTML comment marker, swapped for the TOC after rendering, once the
headings are known). A `toc` front-matter key overrides it. The
two-heading minimum is dropped; an explicit `{{toc}}` renders whenever
the page has any `##`/`###` heading.

**Alternatives considered**: Keep the automatic header lines and TOC with
opt-out keys (`toc: false`).

**Consequences**: Layout is visible in the Markdown. Sites upgrading from
the old build lose their header lines and TOC until they add the
placeholders; the samples show the pattern
(`*{{subtitle}}* · {{author}} · {{date}}`, then `**On this page**` and
`{{toc}}`). Amends DEC-007: `p.subtitle`/`.author`/`.date` are no longer
emitted.

---

### DEC-010: `date: auto` takes the date from git (2026-11-03)

**Status**: Active

**Context**: A hand-typed "updated" date goes stale.

**Decision**: `date: auto` is replaced with the page file's last commit
date (`git log --relative --name-only --format=%cs`, one call per build).
The root `index.md` gets the newest commit date under `SRC_DIR`. Without
git history the build uses today's date and warns. The Pages workflow
checks out with `fetch-depth: 0`.

**Alternatives considered**: Build date (changes every page on every
deploy); file mtime (meaningless after a fresh checkout).

**Consequences**: Uncommitted edits don't move the date. Commits outside
`SRC_DIR` don't count. A shallow clone would give every page the same date,
hence the workflow change.

---

### DEC-011: npm and Node setup follows the eleventy templates, minus `audit=false` (2026-11-03)

**Status**: Active

**Context**: The eleventy templates got npm install cleanup on 2026-10-03
(DEC-004 in `~/projects/WEBSITES/mimeo-templates/docs/`). markdown-it-simple had no
`.npmrc`, no `engines`, and built on `lts/*` in CI.

**Decision**: Commit `.npmrc` with `fund=false` only; `engines.node`
`>=22`; `.nvmrc` `24`; the workflow reads `node-version-file: .nvmrc`
(and `.nvmrc` is in its `paths` trigger). `package.json` `name` becomes
`markdown-it-simple`.

**Alternatives considered**: `audit=false` as in the eleventy repos.
Rejected: it hides a chokidar finding that only eleventy 3 has, and
`npm audit` here reports 0 vulnerabilities. Hard-coding `node-version: 24`
in the workflow, as the eleventy repos do, was also rejected: reading
`.nvmrc` keeps the Node version in one file.

**Consequences**: `.nvmrc` sets the Node version for both local work and
CI. Nothing in `build.mjs` needs Node newer than 22; `>=22` is the oldest
Node release line that is still supported.

---

## Superseded/Deprecated

None.
