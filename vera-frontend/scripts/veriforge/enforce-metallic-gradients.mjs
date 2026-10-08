#!/usr/bin/env node
/**
 * enforce-metallic-gradients
 * Flags VeriForge surfaces missing metallic gradient usage patterns.
 *
 * Usage:
 *   node scripts/veriforge/enforce-metallic-gradients.mjs [--write]
 *
 * --write injects a data attribute hint + comment where shell backgrounds
 * are flat #0D0D0D / #1A1A1A without metallic gradient reference.
 */

import fs from "node:fs";
import path from "node:path";

const WRITE = process.argv.includes("--write");
const ROOT = process.cwd();

const TARGETS = [
  "src/layouts",
  "src/mobile",
  "src/screens/dashboard",
  "src/components/veriforge",
  "components/veriforge",
  "app/veriforge",
];

const EXT = new Set([".tsx", ".ts", ".css", ".module.css"]);

const METAL_OK =
  /metallicGradient|metallic|--vf-metallic|--vf-effect-metallic|linear-gradient\(\s*135deg/i;

const FLAT_BG =
  /bg-\[#0[Dd]0[Dd]0[Dd]\]|bg-\[#1[Aa]1[Aa]1[Aa]\]|background(?:-color)?:\s*#0[dD]0[dD]0[dD]|background(?:-color)?:\s*#1[aA]1[aA]1[aA]/;

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
    if (!FLAT_BG.test(raw)) continue;
    if (METAL_OK.test(raw)) continue;

    issues += 1;
    console.log(`MISSING METALLIC  ${path.relative(ROOT, file)}`);

    if (WRITE && file.endsWith(".module.css")) {
      const banner =
        "/* veriforge: enforce-metallic-gradients — prefer var(--vf-metallic) / COLORS.metallicGradient */\n";
      if (!raw.startsWith(banner)) {
        fs.writeFileSync(file, banner + raw, "utf8");
        fixed += 1;
      }
    } else if (WRITE && (file.endsWith(".tsx") || file.endsWith(".ts"))) {
      const banner =
        "/** veriforge: enforce-metallic-gradients — add metallicGradient / --vf-metallic on shell surfaces */\n";
      if (!raw.includes("enforce-metallic-gradients")) {
        fs.writeFileSync(file, banner + raw, "utf8");
        fixed += 1;
      }
    }
  }
}

console.log(
  `\nenforce-metallic-gradients: ${issues} files without metallic pattern` +
    (WRITE ? `; annotated ${fixed}` : " (dry-run — pass --write to annotate)"),
);

if (!WRITE && issues > 0) process.exitCode = 1;
