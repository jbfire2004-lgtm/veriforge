#!/usr/bin/env node
/**
 * Prepare Playwright mocked/authenticated projects:
 * 1. Ensure playwright/.env.e2e exists
 * 2. Verify API + app are reachable
 * 3. Build production frontend (for `next start`)
 * 4. Run auth setup → playwright/.auth/user.json
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadPlaywrightEnv } from "./load-playwright-env.mjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const envExample = path.join(root, "playwright", ".env.e2e.example");
const envFile = path.join(root, "playwright", ".env.e2e");
const authFiles = [
  path.resolve(root, process.env.PLAYWRIGHT_STORAGE_STATE_ADMIN ?? path.join("playwright", ".auth", "admin.json")),
  path.resolve(root, process.env.PLAYWRIGHT_STORAGE_STATE_PM ?? path.join("playwright", ".auth", "pm.json")),
  path.resolve(root, process.env.PLAYWRIGHT_STORAGE_STATE_CONTRACTOR ?? path.join("playwright", ".auth", "contractor.json")),
];

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, {
    cwd: root,
    stdio: "inherit",
    shell: process.platform === "win32",
    ...opts,
  });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

async function probe(url, label) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    console.log(`✓ ${label} (${res.status}) — ${url}`);
    return true;
  } catch (e) {
    console.error(`✗ ${label} unreachable — ${url}`);
    console.error(`  ${e instanceof Error ? e.message : e}`);
    return false;
  }
}

if (!fs.existsSync(envFile)) {
  if (fs.existsSync(envExample)) {
    fs.copyFileSync(envExample, envFile);
    console.log("Created playwright/.env.e2e from example.");
  } else {
    console.error("Missing playwright/.env.e2e.example");
    process.exit(1);
  }
}

loadPlaywrightEnv();

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
const baseUrl = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:5175/vera";

console.log("\nChecking services…");
const apiOk = await probe(apiUrl, "Backend API");
const appOk = await probe(baseUrl, "Frontend");

if (!apiOk) {
  console.error(
    "\nStart the API first, e.g. from repo root: npm run dev:backend",
  );
  process.exit(1);
}
if (!appOk) {
  console.error(
    "\nStart the frontend first, e.g. npm run build && npm run start (in vera-frontend)",
  );
  process.exit(1);
}

if (!process.env.PLAYWRIGHT_TEST_EMAIL || !process.env.PLAYWRIGHT_TEST_PASSWORD) {
  console.error("PLAYWRIGHT_TEST_EMAIL and PLAYWRIGHT_TEST_PASSWORD required in .env.e2e");
  process.exit(1);
}

const refresh = process.env.PLAYWRIGHT_AUTH_REFRESH === "1";
const allAuthExist = authFiles.every((f) => fs.existsSync(f));
if (allAuthExist && !refresh) {
  console.log("\nAuth storage already exists for admin, pm, and contractor.");
  authFiles.forEach((f) => console.log(`  ${f}`));
  console.log("Set PLAYWRIGHT_AUTH_REFRESH=1 to re-login.\n");
} else {
  console.log("\nInstalling Playwright Chromium (if needed)…");
  run("npx", ["playwright", "install", "chromium"]);

  console.log("\nRunning Playwright auth setup…");
  run("npx", [
    "playwright",
    "test",
    "--project=setup",
  ], {
    env: {
      ...process.env,
      PLAYWRIGHT_SKIP_WEB_SERVER: "1",
      PLAYWRIGHT_BASE_URL: baseUrl,
    },
  });
}

const missingAuth = authFiles.filter((f) => !fs.existsSync(f));
if (missingAuth.length) {
  console.error("\nAuth setup did not create all role storage files:");
  missingAuth.forEach((f) => console.error(`  missing ${f}`));
  process.exit(1);
}

console.log("\n✓ E2E prep complete.");
if (process.env.PLAYWRIGHT_PREP_RUN_MOCKED === "1") {
  console.log("\nRunning mocked Playwright project…");
  run("npx", ["playwright", "test", "--project=mocked", "--workers=1"], {
    env: {
      ...process.env,
      PLAYWRIGHT_SKIP_WEB_SERVER: "1",
      PLAYWRIGHT_BASE_URL: baseUrl,
    },
  });
} else {
  console.log("Run mocked tests:");
  console.log("  set PLAYWRIGHT_SKIP_WEB_SERVER=1");
  console.log("  npm run test:e2e:mocked");
  console.log("\nOr prep + mocked in one step:");
  console.log("  set PLAYWRIGHT_PREP_RUN_MOCKED=1 && npm run test:e2e:prep\n");
}
