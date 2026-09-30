import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const backend = path.join(root, "backend");
const frontend = path.join(root, "vera-frontend");

function run(label, cmd, cwd) {
  console.log(`\n▶ ${label}\n   ${cmd}\n   (cwd: ${cwd})\n`);
  execSync(cmd, { cwd, stdio: "inherit", shell: true, env: process.env });
}

run(
  "migrate",
  "npx prisma migrate deploy && npx prisma generate",
  backend
);
run("seed", "npm run prisma:seed", backend);

const children = [];
function start(name, npmScript, cwd) {
  const child = spawn(
    process.platform === "win32" ? "npm.cmd" : "npm",
    ["run", npmScript],
    {
      cwd,
      stdio: "inherit",
      shell: process.platform === "win32",
      env: { ...process.env, FORCE_COLOR: "1" },
    }
  );
  children.push(child);
}

console.log("\n▶ dev servers (Ctrl+C stops both)\n");
start("backend", "start:dev", backend);
start("frontend", "dev", frontend);

function shutdown() {
  for (const c of children) {
    try {
      c.kill("SIGTERM");
    } catch {
      /* ignore */
    }
  }
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
