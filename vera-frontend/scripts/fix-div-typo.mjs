import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

// Fix accidental JSX tag name typo (motion + Stat + Div)
const typo = ["motion", "Stat", "Div"].join("");
const fixed = "motionStatDiv".slice(0, 3); // "div"

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (p.endsWith(".tsx") || p.endsWith(".ts")) {
      const text = readFileSync(p, "utf8");
      if (text.includes(typo)) {
        writeFileSync(p, text.split(typo).join(fixed), "utf8");
        console.log("fixed", p);
      }
    }
  }
}

walk(join(process.cwd(), "components"));
