import { defineConfig, devices } from "@playwright/test";

import fs from "node:fs";

import path from "node:path";

const rootDir = process.cwd();

function loadPlaywrightEnvFile() {
  const envPath = path.join(rootDir, "playwright/.env.e2e");

  if (!fs.existsSync(envPath)) return;

  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) continue;

    const eq = trimmed.indexOf("=");

    if (eq < 1) continue;

    const key = trimmed.slice(0, eq).trim();

    let value = trimmed.slice(eq + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (process.env[key] === undefined) process.env[key] = value;
  }
}

loadPlaywrightEnvFile();

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:5175/vera";

const adminAuthFile = path.resolve(
  rootDir,
  process.env.PLAYWRIGHT_STORAGE_STATE_ADMIN ??
    process.env.PLAYWRIGHT_STORAGE_STATE ??
    "playwright/.auth/admin.json",
);

const pmAuthFile = path.resolve(
  rootDir,
  process.env.PLAYWRIGHT_STORAGE_STATE_PM ?? "playwright/.auth/pm.json",
);

const contractorAuthFile = path.resolve(
  rootDir,
  process.env.PLAYWRIGHT_STORAGE_STATE_CONTRACTOR ??
    "playwright/.auth/contractor.json",
);

/** Legacy default — admin storage for mocked/authenticated projects */
const legacyAuthFile = path.resolve(
  rootDir,
  process.env.PLAYWRIGHT_STORAGE_STATE ?? adminAuthFile,
);

function chromeWithStorage(storageState: string) {
  return {
    ...devices["Desktop Chrome"],
    storageState,
  };
}

export default defineConfig({
  testDir: "./tests/e2e",

  timeout: 90_000,

  expect: { timeout: 15_000 },

  retries: process.env.CI ? 1 : 0,

  workers: process.env.PLAYWRIGHT_E2E_WORKERS
    ? Number(process.env.PLAYWRIGHT_E2E_WORKERS)
    : undefined,

  reporter: [["list"], ["html", { open: "never" }]],

  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "setup",
      testMatch: /setup\/auth\.setup\.ts/,
    },
    {
      name: "deep-crawl-public",
      testMatch: /routing\/public-deep-crawl\.spec\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "deep-crawl-admin",
      dependencies: ["setup"],
      testMatch: /routing\/admin-deep-crawl\.spec\.ts/,
      use: chromeWithStorage(adminAuthFile),
    },
    {
      name: "deep-crawl-pm",
      dependencies: ["setup"],
      testMatch: /routing\/pm-deep-crawl\.spec\.ts/,
      use: chromeWithStorage(pmAuthFile),
    },
    {
      name: "deep-crawl-contractor",
      dependencies: ["setup"],
      testMatch: /routing\/contractor-deep-crawl\.spec\.ts/,
      use: chromeWithStorage(contractorAuthFile),
    },
    {
      name: "public",
      testMatch:
        /routing\/public-routes\.spec\.ts|routing\/qr-deep-links\.spec\.ts|smart-features\/qr-and-wallet\.spec\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mocked",
      dependencies: ["setup"],
      testMatch: /\.mocked\.spec\.ts/,
      use: chromeWithStorage(legacyAuthFile),
      fullyParallel: false,
      retries: 1,
    },
    {
      name: "authenticated",
      dependencies: ["setup"],
      testMatch:
        /routing\/(deep-links|detail-edit|breadcrumbs-back|nav-config-routes|authenticated-deep-crawl)\.spec\.ts|assessment\/assessment\.integration\.spec\.ts/,
      use: chromeWithStorage(legacyAuthFile),
    },
  ],

  webServer: process.env.PLAYWRIGHT_SKIP_WEB_SERVER
    ? undefined
    : {
        command: "npm run start",
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});

if (process.env.CI) {
  for (const [label, file] of [
    ["admin", adminAuthFile],
    ["pm", pmAuthFile],
    ["contractor", contractorAuthFile],
  ] as const) {
    if (!fs.existsSync(file)) {
      console.warn(
        `[playwright] ${label} storage missing at ${file} — ${label} deep-crawl project will skip tests.`,
      );
    }
  }
}
