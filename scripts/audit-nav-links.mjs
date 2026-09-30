import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");
const root = path.join(repoRoot, "vera-frontend");
const appDir = path.join(root, "app");
const pages = new Set();

function walkApp(d, prefix = "") {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const full = path.join(d, e.name);
    if (e.isDirectory()) {
      if (e.name.startsWith("(") && e.name.endsWith(")")) walkApp(full, prefix);
      else if (e.name.startsWith("_")) continue;
      else walkApp(full, `${prefix}/${e.name}`);
    } else if (e.name === "page.tsx" || e.name === "page.ts") {
      pages.add(prefix || "/");
    } else if (e.name === "route.ts" || e.name === "route.js") {
      pages.add(prefix || "/");
    }
  }
}

walkApp(appDir);

const srcPages = path.join(root, "src/pages");
if (fs.existsSync(srcPages)) {
  function walkPages(d, prefix = "") {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, e.name);
      if (e.isDirectory()) walkPages(full, `${prefix}/${e.name}`);
      else if (/\.(tsx|ts|jsx|js)$/.test(e.name)) {
        const base = e.name.replace(/\.(tsx|ts|jsx|js)$/, "");
        const route = base === "index" ? prefix || "/" : `${prefix}/${base}`;
        pages.add(route);
      }
    }
  }
  walkPages(srcPages);
}

function routeExists(href) {
  const clean = href.split("?")[0].split("#")[0];
  if (!clean.startsWith("/") || clean.startsWith("/api")) return true;
  if (pages.has(clean)) return true;
  for (const p of pages) {
    if (!p.includes("[")) continue;
    const re = new RegExp(
      `^${p
        .replace(/\[\[\.\.\.[^\]]+\]\]/g, ".*")
        .replace(/\[[^\]]+\]/g, "[^/]+")}$`,
    );
    if (re.test(clean)) return true;
  }
  return false;
}

const hrefRe = /href=["'](\/[^"'#?]+)["']/g;
const broken = new Map();

function scanFile(file) {
  const text = fs.readFileSync(file, "utf8");
  let m;
  hrefRe.lastIndex = 0;
  while ((m = hrefRe.exec(text))) {
    const href = m[1];
    if (!routeExists(href)) {
      if (!broken.has(href)) broken.set(href, new Set());
      broken.get(href).add(path.relative(root, file));
    }
  }
}

function scanDir(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const full = path.join(d, e.name);
    if (e.isDirectory() && e.name !== "node_modules" && e.name !== ".next") scanDir(full);
    else if (/\.(tsx|ts|jsx|js)$/.test(e.name)) scanFile(full);
  }
}

scanDir(root);

const sorted = [...broken.entries()].sort((a, b) => a[0].localeCompare(b[0]));
console.log(`Total routes: ${pages.size}`);
console.log(`Broken hrefs: ${sorted.length}`);
for (const [href, files] of sorted) {
  console.log(href);
  for (const f of files) console.log(`  ${f}`);
}

process.exit(sorted.length > 0 ? 1 : 0);
