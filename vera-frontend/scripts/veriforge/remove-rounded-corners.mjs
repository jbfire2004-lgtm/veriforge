#!/usr/bin/env node
/**
 * remove-rounded-corners
 * Strips Tailwind rounded-* utilities from VeriForge source files.
 *
 * Usage:
 *   node scripts/veriforge/remove-rounded-corners.mjs [--write] [--path <dir>]
 */

import fs from "node:fs";
import path from "node:path";

const WRITE = process.argv.includes("--write");
const pathIdx = process.argv.indexOf("--path");
const ROOT = path.resolve(
  pathIdx >= 0 && process.argv[pathIdx + 1]
    ? process.argv[pathIdx + 1]
    : path.join(process.cwd()),
);

const TARGETS = [
  "app/veriforge",
  "components/veriforge",
  "src/components/veriforge",
  "src/layouts",
  "src/mobile",
  "src/screens/dashboard",
  "src/router",
  "src/theme",
  "src/styles",
];

const EXT = new Set([".ts", ".tsx", ".css", ".module.css"]);

const ROUNDED_RE =
  /\brounded-(?:none|sm|md|lg|xl|2xl|3xl|full|[trbl](?:-[a-z0-9]+)?|[xy](?:-[a-z0-9]+)?|[tlbr]{1,2}(?:-[a-z0-9]+)?)\b/g;

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === ".next") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (EXT.has(path.extname(entry.name)) || entry.name.endsWith(".module.css")) {
      out.push(full);
    }
  }
  return out;
}

function cleanClassString(value) {
  return value
    .replace(ROUNDED_RE, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+"/g, '"')
    .replace(/\s+`/g, "`")
    .replace(/\s+'/g, "'")
    .trim();
}

let filesTouched = 0;
let matchCount = 0;

for (const rel of TARGETS) {
  const abs = path.join(ROOT, rel);
  for (const file of walk(abs)) {
    const raw = fs.readFileSync(file, "utf8");
    const matches = raw.match(ROUNDED_RE);
    if (!matches) continue;
    matchCount += matches.length;
    const next = raw.replace(ROUNDED_RE, "").replace(/[ \t]{2,}/g, " ");
    const cleaned = next === raw ? raw : cleanClassString(next) && next;
    console.log(
      `${WRITE ? "FIX" : "FOUND"} ${path.relative(ROOT, file)} (${matches.length}) → ${[...new Set(matches)].join(", ")}`,
    );
    if (WRITE && next !== raw) {
      fs.writeFileSync(file, next, "utf8");
      filesTouched += 1;
    }
  }
}

console.log(
  `\nremove-rounded-corners: ${matchCount} matches across VeriForge paths` +
    (WRITE ? `; wrote ${filesTouched} files` : " (dry-run — pass --write to apply)"),
);

if (!WRITE && matchCount > 0) process.exitCode = 1;
