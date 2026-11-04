#!/usr/bin/env node
// Recursively convert Markdown in SRC_DIR to styled HTML in OUT_DIR with
// markdown-it, preserving subdirectory structure and copying other assets.
import fs from "node:fs/promises";
import path from "node:path";
import MarkdownIt from "markdown-it";
import anchor from "markdown-it-anchor";
import deflist from "markdown-it-deflist";
import matter from "gray-matter";
import { execFileSync } from "node:child_process";

const SRC_DIR = path.resolve(process.env.SRC_DIR ?? "public");
const OUT_DIR = path.resolve(process.env.OUT_DIR ?? "_site");
const SITE_TITLE = process.env.SITE_TITLE ?? "Documentation";
// The stylesheet normally lives in SRC_DIR at assets/style.css; CSS_SRC, if
// set, replaces it (useful when SRC_DIR points at a folder without one).
const CSS_PATH = path.join("assets", "style.css");
const CSS_SRC = process.env.CSS_SRC && path.resolve(process.env.CSS_SRC);
const MD_EXT = /\.(md|markdown)$/i;

const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

// GitHub-style heading slugs.
const slugify = (s) =>
  s.trim().toLowerCase().replace(/[^\p{L}\p{N}\s_-]/gu, "").replace(/\s+/g, "-");

// YAML dates come back from gray-matter as Date objects; print them as YYYY-MM-DD.
const fmtDate = (v) => (v instanceof Date ? v.toISOString().slice(0, 10) : v);

// Last-commit dates (YYYY-MM-DD) from git, keyed by path relative to dir,
// plus the newest date overall. Empty if git or history is unavailable
// (CI needs a full clone: actions/checkout with fetch-depth: 0).
function gitDates(dir) {
  const files = new Map();
  let latest = null;
  try {
    const out = execFileSync(
      "git", ["log", "--relative", "--name-only", "--format=%x00%cs", "--", "."],
      { cwd: dir, encoding: "utf8", maxBuffer: 64 * 1024 * 1024, stdio: ["ignore", "pipe", "ignore"] });
    for (const chunk of out.split("\0").slice(1)) {
      const [date, ...names] = chunk.trim().split("\n");
      latest ??= date;
      for (const n of names) if (n && !files.has(n)) files.set(n, date);
    }
  } catch {
    console.warn("  warning: git history unavailable; 'date: auto' falls back to today");
  }
  return { files, latest };
}

// An HTML comment passes through markdown-it untouched (html: true).
const TOC_MARK = "<!--toc-->";

// Poor man's mustache: replace {{key}} (or {{a.b}}) with the front-matter
// value. \{{key}} yields a literal {{key}}; unknown keys are left in place.
const fill = (content, fm, rel) =>
  content.replace(/(\\?)\{\{\s*([\w.]+)\s*\}\}/g, (match, esc, key) => {
    if (esc) return match.slice(1);
    // {{toc}} becomes a marker swapped for the table of contents after
    // rendering, once the headings are known.
    if (key === "toc" && fm.toc == null) return TOC_MARK;
    const value = key.split(".").reduce((o, k) => o?.[k], fm);
    if (value == null) {
      console.warn(`  warning: ${rel}: no front-matter value for {{${key}}}`);
      return match;
    }
    return String(fmtDate(value));
  });

// Output name for a Markdown file: foo.md -> foo.html.
const htmlName = (file) => file.replace(MD_EXT, ".html");

const md = new MarkdownIt({ html: true, linkify: true });
md.use(deflist);
md.use(anchor, {
  slugify,
  // Collect headings per render for the table of contents.
  callback: (token, { slug, title }) => {
    md._headings?.push({ level: Number(token.tag.slice(1)), slug, title });
  },
});

// Rewrite relative links to .md files so they point at the generated .html.
const defaultLinkOpen =
  md.renderer.rules.link_open ?? ((t, i, o, e, self) => self.renderToken(t, i, o));
md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
  const href = tokens[idx].attrGet("href");
  if (href && !/^([a-z][\w+.-]*:|\/\/|#)/i.test(href)) {
    const [, p, frag = ""] = href.match(/^([^#?]*)(.*)$/);
    if (MD_EXT.test(p)) {
      const dir = p.includes("/") ? p.slice(0, p.lastIndexOf("/") + 1) : "";
      tokens[idx].attrSet("href", dir + htmlName(p.slice(dir.length)) + frag);
    }
  }
  return defaultLinkOpen(tokens, idx, options, env, self);
};

function renderToc(headings) {
  const items = headings.filter((h) => h.level >= 2 && h.level <= 3);
  if (items.length === 0) return "";
  const lis = items
    .map((h) => `<li class="toc-h${h.level}"><a href="#${h.slug}">${escapeHtml(h.title)}</a></li>`)
    .join("\n");
  return `<nav id="TOC" role="doc-toc">\n<ul>\n${lis}\n</ul>\n</nav>\n`;
}

// Only the title is rendered automatically. Other front-matter values
// (date, author, ...) appear only where the page body uses {{key}}.
function page({ title, fm, body, root }) {
  const header = fm.title
    ? `<header id="title-block-header">
<h1 class="title">${escapeHtml(fm.title)}</h1>
</header>\n`
    : "";
  return `<!DOCTYPE html>
<html lang="${escapeHtml(fm.lang ?? "en")}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(`${SITE_TITLE} – ${title}`)}</title>
${fm.description ? `<meta name="description" content="${escapeHtml(fm.description)}">\n` : ""}<link rel="stylesheet" href="${root}/assets/style.css">
</head>
<body>
${header}${body}</body>
</html>
`;
}

async function* walk(dir) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (entry.isFile()) yield full;
  }
}

async function main() {
  await fs.access(SRC_DIR).catch(() => {
    console.error(`Source directory '${SRC_DIR}' not found`);
    process.exit(1);
  });
  await fs.rm(OUT_DIR, { recursive: true, force: true });
  await fs.mkdir(OUT_DIR, { recursive: true });
  await fs.writeFile(path.join(OUT_DIR, ".nojekyll"), "");

  const files = [];
  for await (const f of walk(SRC_DIR)) files.push(f);
  files.sort();

  const dates = gitDates(SRC_DIR);
  const today = new Date().toISOString().slice(0, 10);

  let count = 0;
  for (const src of files) {
    const rel = path.relative(SRC_DIR, src);
    const relDir = path.dirname(rel);

    if (!MD_EXT.test(rel)) {
      const dest = path.join(OUT_DIR, rel);
      await fs.mkdir(path.dirname(dest), { recursive: true });
      await fs.copyFile(src, dest);
      continue;
    }

    const { data: fm, content } = matter(await fs.readFile(src, "utf8"));
    // date: auto -> last commit date. The root index summarizes the whole
    // site, so it takes the newest commit anywhere under SRC_DIR.
    if (fm.date === "auto") {
      const key = rel.split(path.sep).join("/");
      fm.date = (/^index\.(md|markdown)$/i.test(key) ? dates.latest : dates.files.get(key)) ?? today;
    }
    md._headings = [];
    const headings = md._headings;
    const body = md.render(fill(content, fm, rel)).replaceAll(TOC_MARK, () => renderToc(headings));
    const h1 = headings.find((h) => h.level === 1);
    const title = fm.title ?? h1?.title ?? path.basename(rel).replace(MD_EXT, "");
    const root = relDir === "." ? "." : relDir.split(path.sep).map(() => "..").join("/");

    const outRel = path.join(relDir, htmlName(path.basename(rel)));
    const dest = path.join(OUT_DIR, outRel);
    await fs.mkdir(path.dirname(dest), { recursive: true });
    await fs.writeFile(dest, page({ title, fm, body, root }));
    console.log(`  ${rel} -> ${outRel}`);
    count++;
  }

  // Copied after the content so an explicit CSS_SRC wins.
  const cssDest = path.join(OUT_DIR, CSS_PATH);
  if (CSS_SRC) {
    await fs.mkdir(path.dirname(cssDest), { recursive: true });
    await fs.copyFile(CSS_SRC, cssDest);
  }
  if (!(await fs.stat(cssDest).catch(() => null))) {
    console.warn(`  warning: no ${CSS_PATH} in ${SRC_DIR} and CSS_SRC not set; pages will be unstyled`);
  }

  // Ensure a root index exists.
  const indexPath = path.join(OUT_DIR, "index.html");
  if (!(await fs.stat(indexPath).catch(() => null))) {
    console.log("No index.md at root; generating page list.");
    const pages = [];
    for await (const f of walk(OUT_DIR)) if (f.endsWith(".html")) pages.push(path.relative(OUT_DIR, f).split(path.sep).join("/"));
    const list = pages.sort().map((p) => `<li><a href="${p}">${escapeHtml(p)}</a></li>`).join("\n");
    await fs.writeFile(indexPath, page({ title: SITE_TITLE, fm: {}, body: `<h1>${escapeHtml(SITE_TITLE)}</h1>\n<ul>\n${list}\n</ul>\n`, root: "." }));
  }

  console.log(`Built ${count} page(s) into ${path.relative(process.cwd(), OUT_DIR) || OUT_DIR}/`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
