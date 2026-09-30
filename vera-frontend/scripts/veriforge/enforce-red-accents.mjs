#!/usr/bin/env node
/**
 * enforce-red-accents
 * Ensures critical / active / focus patterns reference forge red (#C62828).
 *
 * Usage:
 *   node scripts/veriforge/enforce-red-accents.mjs [--write]
 */

import fs from "node:fs";
import path from "node:path";

const WRITE = process.argv.includes("--write");
const ROOT = process.cwd();

const TARGETS = [
  "src/layouts",
  "src/mobile",
  "src/pages/dashboard",
  "src/components/veriforge",
  "src/router",
  "components/veriforge",
];

const EXT = new Set([".tsx", ".css", ".module.css"]);

const HAS_RED = /#C62828|#c62828|forgeRed|forge-red|--vf-forge-red|--vf-color-forge-red|redGlowPulse/i;
const NEEDS_ACCENT =
  /critical|active|focus-visible|:focus|navLinkActive|linkActive|alert/i;

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
    const raw = fs.readFileSync(file, "utf8");
    if (!NEEDS_ACCENT.test(raw)) continue;
    if (HAS_RED.test(raw)) continue;

    issues += 1;
    console.log(`MISSING RED ACCENT  ${path.relative(ROOT, file)}`);

    if (WRITE) {
      const banner =
        "/* veriforge: enforce-red-accents — wire #C62828 / COLORS.forgeRed / redGlowPulse for active+critical */\n";
      if (!raw.includes("enforce-red-accents")) {
        fs.writeFileSync(file, banner + raw, "utf8");
        fixed += 1;
      }
    }
  }
}

console.log(
  `\nenforce-red-accents: ${issues} accent-related files missing forge red` +
    (WRITE ? `; annotated ${fixed}` : " (dry-run — pass --write to annotate)"),
);

if (!WRITE && issues > 0) process.exitCode = 1;
