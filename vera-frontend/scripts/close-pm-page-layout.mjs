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
  const closeIdx = src.lastIndexOf(");");
  const before = src.slice(0, closeIdx);
  const lastDiv = before.lastIndexOf("</div>");
  if (lastDiv === -1) {
    console.log("no div", file);
    continue;
  }
  src = before.slice(0, lastDiv) + "</VeraPageLayout>" + before.slice(lastDiv + 6) + src.slice(closeIdx);
  fs.writeFileSync(file, src);
  console.log("closed", file);
}

console.log("done", files.length);
