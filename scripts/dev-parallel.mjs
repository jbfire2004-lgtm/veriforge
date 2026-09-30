import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const backend = path.join(root, "backend");
const frontend = path.join(root, "vera-frontend");

const children = [];

function run(name, npmScript, cwd) {
  const child = spawn(
    process.platform === "win32" ? "npm.cmd" : "npm",
    ["run", npmScript],
    {
      cwd,
      stdio: "inherit",
      // Windows: shell:false + npm.cmd often yields spawn EINVAL; POSIX is fine either way.
      shell: process.platform === "win32",
      env: {
        ...process.env,
        FORCE_COLOR: "1",
        ...(name === "frontend"
          ? { NODE_OPTIONS: "--max-old-space-size=8192" }
          : {}),
      },
    }
  );
  child.on("exit", (code, signal) => {
    if (code !== 0 && code !== null) {
      console.error(`[${name}] exited with code ${code}`);
    }
    if (signal) {
      console.error(`[${name}] killed (${signal})`);
    }
  });
  children.push(child);
}

run("backend", "start:dev", backend);
run("frontend", "dev", frontend);

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
