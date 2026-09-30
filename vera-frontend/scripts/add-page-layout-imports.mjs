import fs from "fs";
import path from "path";

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith(".tsx")) out.push(p);
  }
  return out;
}

const importLine =
  'import { VeraPageLayout } from "@/src/components/navigation";\n';

const files = walk(path.join("src", "pages", "pm")).filter((f) => {
  const s = fs.readFileSync(f, "utf8");
  return s.includes("VeraPageLayout") && !s.includes(importLine.trim());
});

for (const f of files) {
  let s = fs.readFileSync(f, "utf8");
  if (s.includes('"use client";')) {
    s = s.replace(/"use client";\r?\n\r?\n/, `"use client";\n\n${importLine}`);
  } else {
    s = importLine + s;
  }
  fs.writeFileSync(f, s);
  console.log("import", f);
}
console.log("done", files.length);
