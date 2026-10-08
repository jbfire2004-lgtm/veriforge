#!/usr/bin/env node
/**
 * enforce-angular-geometry
 * Fails if border-radius utilities / CSS remain under VeriForge paths.
 * Optionally rewrites border-radius: Npx → 0 in CSS modules.
 *
 * Usage:
 *   node scripts/veriforge/enforce-angular-geometry.mjs [--write]
 */

import fs from "node:fs";
import path from "node:path";

const WRITE = process.argv.includes("--write");
const ROOT = process.cwd();

const TARGETS = [
  "app/veriforge",
  "components/veriforge",
  "src/components/veriforge",
  "src/layouts",
  "src/mobile",
  "src/screens/dashboard",
  "src/router",
  "src/styles",
];

const EXT = new Set([".ts", ".tsx", ".css", ".module.css"]);

const ROUNDED_CLASS =
  /\brounded-(?!none)(?:sm|md|lg|xl|2xl|3xl|full|[trblxy](?:-\w+)?)\b/;
const RADIUS_CSS = /border-radius\s*:\s*(?!0(?:px)?\b)[^;]+;/gi;

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

let issues = 0;
let fixed = 0;

for (const rel of TARGETS) {
  for (const file of walk(path.join(ROOT, rel))) {
    // Skip debug toolkit itself (documents rounded offenders)
    if (file.includes("veriforge-debug.css")) continue;

    let raw = fs.readFileSync(file, "utf8");
    const classHits = raw.match(new RegExp(ROUNDED_CLASS.source, "g")) ?? [];
    const cssHits = raw.match(RADIUS_CSS) ?? [];
    if (classHits.length === 0 && cssHits.length === 0) continue;

    issues += classHits.length + cssHits.length;
    console.log(
      `NON-ANGULAR  ${path.relative(ROOT, file)}` +
        (classHits.length ? ` classes=${[...new Set(classHits)].join(",")}` : "") +
        (cssHits.length ? ` css=${cssHits.length}` : ""),
    );

    if (WRITE) {
      let next = raw.replace(
        new RegExp(ROUNDED_CLASS.source, "g"),
        "",
      );
      next = next.replace(RADIUS_CSS, "border-radius: 0;");
      next = next.replace(/[ \t]{2,}/g, " ");
      if (next !== raw) {
        fs.writeFileSync(file, next, "utf8");
        fixed += 1;
      }
    }
  }
}

console.log(
  `\nenforce-angular-geometry: ${issues} non-angular hits` +
    (WRITE ? `; rewrote ${fixed} files` : " (dry-run — pass --write to apply)"),
);

if (!WRITE && issues > 0) process.exitCode = 1;
