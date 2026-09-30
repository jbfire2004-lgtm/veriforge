import fs from "node:fs";
import path from "node:path";

/** Absolute path to veriforge/docs (monorepo sibling of vera-frontend) */
export function getVeriForgeDocsRoot(): string {
  return path.join(process.cwd(), "..", "veriforge", "docs");
}

export function readVeriForgeDoc(relativeFile: string): string {
  const full = path.join(getVeriForgeDocsRoot(), relativeFile);
  if (!fs.existsSync(full)) {
    return `# Missing document\n\nCould not find \`${relativeFile}\` under \`veriforge/docs\`.\n`;
  }
  return fs.readFileSync(full, "utf8");
}
