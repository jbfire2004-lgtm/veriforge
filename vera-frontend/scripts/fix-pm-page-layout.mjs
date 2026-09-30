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

const files = walk(path.join("src", "pages", "pm")).filter((f) => {
  const src = fs.readFileSync(f, "utf8");
  return src.includes("<VeraPageLayout") && !src.includes("</VeraPageLayout>");
});

for (const file of files) {
  let src = fs.readFileSync(file, "utf8");

  // Remove redundant outer page wrapper — VeraAppShell already provides layout padding.
  src = src.replace(
    /return \(\s*\n\s*<div className="mx-auto max-w-6xl space-y-6 px-4 py-8">\s*\n\s*<VeraPageLayout/g,
    "return (\n    <VeraPageLayout",
  );
  src = src.replace(
    /return \(\s*\n\s*<div className="mx-auto max-w-4xl space-y-6 px-4 py-8">\s*\n\s*<VeraPageLayout/g,
    "return (\n    <VeraPageLayout",
  );

  // Collapse extra blank lines inside VeraPageLayout opening tag.
  src = src.replace(
    /<VeraPageLayout\n+\s*title="/g,
    '<VeraPageLayout\n      title="',
  );
  src = src.replace(
    /"\n+\s*description="/g,
    '"\n      description="',
  );
  src = src.replace(
    /"\n+\s*>\n+/g,
    '"\n    >\n',
  );

  // Close VeraPageLayout instead of stray outer div.
  src = src.replace(/\n(\s*)<\/div>\s*\n(\s*)\);\s*\n\}$/, "\n$1</VeraPageLayout>\n$2);\n}");

  fs.writeFileSync(file, src);
  console.log("fixed", file);
}

console.log("done", files.length);
