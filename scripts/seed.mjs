import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const backend = path.join(root, "backend");

console.log("▶ prisma db seed\n");
execSync("npm run prisma:seed", {
  cwd: backend,
  stdio: "inherit",
  shell: true,
  env: process.env,
});
