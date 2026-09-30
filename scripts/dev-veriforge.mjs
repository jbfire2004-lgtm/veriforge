/**
 * Local VeriForge dual-stack boot:
 *   Browser: :5175 only  |  Internal: SaaS :3020, Nest :3001, Next :3000
 *
 * Open http://localhost:5175  (/api→3020, /vera→3000, /nest→3001)
 * Requires Postgres+Redis for SaaS (compose: infra/veriforge) and Postgres for Nest.
 */
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const children = [];

function run(name, npmScript, cwd, extraEnv = {}) {
  console.log(`[dev:veriforge] starting ${name} (${npmScript})…`);
  const child = spawn(
    process.platform === "win32" ? "npm.cmd" : "npm",
    ["run", npmScript],
    {
      cwd,
      stdio: "inherit",
      shell: process.platform === "win32",
      env: {
        ...process.env,
        FORCE_COLOR: "1",
        ...extraEnv,
      },
    },
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

console.log(`
VeriForge local stack
  Browser (use this):  http://localhost:5175
  SaaS API (internal): http://127.0.0.1:3020
  Nest API (internal): http://127.0.0.1:3001  (browser proxy: /nest)
  Vera Next (internal): http://127.0.0.1:3000  (browser proxy: /vera)
`);

run("saas-api", "dev", path.join(root, "services", "veriforge-saas-service"));
run("nest-api", "start:dev", path.join(root, "backend"));
run("vera-next", "dev", path.join(root, "vera-frontend"), {
  NEXT_PUBLIC_BASE_PATH: "/vera",
  NEXTAUTH_URL: "http://localhost:5175/vera",
  NEXT_PUBLIC_SITE_URL: "http://localhost:5175/vera",
  NODE_OPTIONS: "--max-old-space-size=8192",
});
run("vf-spa", "dev", path.join(root, "apps", "veriforge-frontend"));

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
