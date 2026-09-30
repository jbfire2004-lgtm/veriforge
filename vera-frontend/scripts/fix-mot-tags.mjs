import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

const tag = ["d", "i", "v"].join("");
const typo = ["motion", "Stat", "Div"].join("");

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.tsx?$/.test(name)) {
      let text = readFileSync(p, "utf8");
      const before = text;
      text = text.replace(/<\/?mot\b/g, (m) => m.replace("mot", tag));
      if (text.includes(typo)) {
        text = text.split(typo).join(tag);
      }
      if (text !== before) {
        writeFileSync(p, text, "utf8");
        console.log("fixed", p);
      }
    }
  }
}

walk(join(process.cwd(), "components", "vera-core"));
