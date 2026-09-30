#!/usr/bin/env node
/**
 * One-shot migration: PM lib modules → unified api-client (apiFetchJson).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const libDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "lib");

const SKIP = new Set([
  "pm-sms-core.ts",
  "pm-inspection-v2.ts",
  "pm-inspection-template-builder.ts",
  "pm-inspection-scope.ts",
  "pm-inspection-route-scope.ts",
  "pm-inspection-library-server.ts",
]);

function migrateFile(filePath) {
  const name = path.basename(filePath);
  if (!name.startsWith("pm-") || !name.endsWith(".ts") || SKIP.has(name)) {
    return false;
  }

  let src = fs.readFileSync(filePath, "utf8");
  if (!src.includes("fetchJson") && !src.includes("from \"./api\"")) {
    return false;
  }

  const original = src;

  src = src.replace(
    /import \{ API_URL \} from "\.\/api";\r?\n/g,
    "",
  );
  src = src.replace(
    /import \{ fetchJson(?:, fetchArrayBuffer)? \} from "\.\/core";\r?\n/g,
    (match) => {
      if (match.includes("fetchArrayBuffer")) {
        return 'import { fetchArrayBuffer } from "./core";\nimport { apiFetchJson } from "./api-client";\n';
      }
      return 'import { apiFetchJson } from "./api-client";\n';
    },
  );
  src = src.replace(
    /import \{ fetchArrayBuffer, fetchJson \} from "\.\/core";\r?\n/g,
    'import { fetchArrayBuffer } from "./core";\nimport { apiFetchJson } from "./api-client";\n',
  );
  src = src.replace(
    /import \{ apiFetchJson \} from ['"]@\/lib\/api-fetch['"];\r?\n/g,
    'import { apiFetchJson } from "./api-client";\n',
  );
  src = src.replace(
    /import \{ apiFetchJson, API_URL \} from ['"]@\/lib\/api-fetch['"];\r?\n/g,
    'import { apiFetchJson } from "./api-client";\n',
  );

  src = src.replace(/\$\{API_URL\}(\/api\/v1\/[^`'"]+)/g, "$1");
  src = src.replace(/fetchJson/g, "apiFetchJson");

  if (src === original) return false;
  fs.writeFileSync(filePath, src, "utf8");
  console.log("migrated", name);
  return true;
}

const files = fs.readdirSync(libDir).filter((f) => f.startsWith("pm-") && f.endsWith(".ts"));
let count = 0;
for (const f of files) {
  if (migrateFile(path.join(libDir, f))) count++;
}
console.log(`Done. ${count} file(s) updated.`);
