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

const root = path.join("src", "pages", "pm");
const files = walk(root).filter((f) =>
  fs.readFileSync(f, "utf8").includes("← Project management"),
);

const headerRe =
  /(\s*)<header>\s*<Link href="\/pm"[^>]*>\s*← Project management\s*<\/Link>\s*<h1 className="mt-2 text-2xl font-semibold">([\s\S]*?)<\/h1>\s*<p className="text-sm text-\[var\(--sf-text-muted\)\]">\s*([\s\S]*?)\s*<\/p>\s*<\/header>/;

let n = 0;
for (const file of files) {
  let src = fs.readFileSync(file, "utf8");
  if (src.includes("VeraPageLayout")) continue;
  const m = src.match(headerRe);
  if (!m) {
    console.log("SKIP pattern:", file);
    continue;
  }
  const indent = m[1];
  const title = m[2].trim().replace(/"/g, '\\"');
  const desc = m[3].trim().replace(/"/g, '\\"');

  if (src.startsWith('"use client";')) {
    src = src.replace(
      '"use client";\n\n',
      '"use client";\n\nimport { VeraPageLayout } from "@/src/components/navigation";\n',
    );
  } else {
    src = `import { VeraPageLayout } from "@/src/components/navigation";\n${src}`;
  }

  src = src.replace(
    headerRe,
    `${indent}<VeraPageLayout\n${indent}  title="${title}"\n${indent}  description="${desc}"\n${indent}>`,
  );

  if (/return \(\s*\n\s*<div className="mx-auto max-w-6xl/.test(src)) {
    src = src.replace(
      /\n(\s*)<\/div>\s*\n(\s*)\);\s*\n\}$/,
      "\n$1</VeraPageLayout>\n$2);\n}",
    );
  }

  fs.writeFileSync(file, src);
  n++;
  console.log("OK", file);
}
console.log("Updated", n, "files");
