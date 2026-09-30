import type { Page, Response } from "@playwright/test";
import { expect } from "@playwright/test";
import {
  MOCK_EQUIPMENT_ID,
  MOCK_INSPECTION_ID,
  MOCK_PROJECT_ID,
  MOCK_WORKER_ID,
} from "./mock-api";

export type DeepCrawlRoute = {
  path: string;
  /** Optional text that should appear when the shell loads */
  expectText?: RegExp;
  /** When true, a 404 is acceptable (dynamic id placeholders) */
  allowNotFound?: boolean;
};

export type DeepCrawlDomain = {
  id: string;
  label: string;
  routes: DeepCrawlRoute[];
};

const APPLICATION_ERROR = /Application error/i;
const LOGIN_REDIRECT = /\/(login|auth\/login)/;

export async function assertPublicDeepRoute(
  page: Page,
  route: DeepCrawlRoute,
): Promise<Response | null> {
  const response = await page.goto(route.path, { waitUntil: "domcontentloaded" });
  const status = response?.status() ?? 0;
  expect(status).toBeLessThan(500);
  if (!route.allowNotFound) {
    expect(status).not.toBe(404);
  }
  await expect(page.locator("body")).toBeVisible();
  await expect(page.locator("body")).not.toContainText(APPLICATION_ERROR);
  if (route.expectText) {
    await expect(page.locator("body")).toContainText(route.expectText);
  }
  return response;
}

export async function assertAuthenticatedDeepRoute(
  page: Page,
  route: DeepCrawlRoute,
): Promise<Response | null> {
  const response = await page.goto(route.path, { waitUntil: "domcontentloaded" });
  const status = response?.status() ?? 0;
  expect(status).toBeLessThan(500);

  const url = page.url();
  expect(url).not.toMatch(LOGIN_REDIRECT);

  await expect(page.locator("body")).toBeVisible();
  await expect(page.locator("body")).not.toContainText(APPLICATION_ERROR);

  if (route.expectText && status !== 404) {
    await expect(page.locator("body")).toContainText(route.expectText);
  }
  return response;
}

/** Public marketing, QR, verify, and documentation shells. */
export const PUBLIC_DEEP_CRAWL_DOMAINS: DeepCrawlDomain[] = [
  {
    id: "home",
    label: "Home & entry",
    routes: [
      { path: "/", expectText: /VERA|safety|workforce|sign/i },
      { path: "/login", expectText: /sign|log|password|email/i },
      { path: "/welcome" },
      { path: "/home" },
    ],
  },
  {
    id: "qr",
    label: "QR & verify",
    routes: [
      { path: "/qr", expectText: /QR|scan|Verify/i },
      { path: `/verify/${MOCK_WORKER_ID}`, expectText: /verify|wallet|compliance/i },
      { path: "/verify/worker", expectText: /worker|verify/i },
      { path: "/verify/equipment", expectText: /equipment|verify/i },
      { path: "/verify/credential" },
      { path: "/verify/training" },
      { path: "/verify/company" },
      { path: "/scan/worker/42" },
      { path: "/scan/equipment/9" },
    ],
  },
  {
    id: "public-docs",
    label: "Public documentation",
    routes: [
      { path: "/safety-bulletins", expectText: /bulletin|safety/i },
      { path: "/safety-recalls", expectText: /recall|safety/i },
      { path: "/jobs", expectText: /job|career|work/i },
      { path: "/feedback" },
    ],
  },
];

/** Admin workspace deep routes (storage: admin). */
export const ADMIN_DEEP_CRAWL_DOMAINS: DeepCrawlDomain[] = [
  {
    id: "admin-detail",
    label: "Admin detail pages",
    routes: [
      {
        path: `/admin/workers/${MOCK_WORKER_ID}`,
        expectText: /worker|training|fit test|profile/i,
      },
      {
        path: `/admin/equipment/${MOCK_EQUIPMENT_ID}`,
        expectText: /equipment|serial|asset/i,
        allowNotFound: true,
      },
      {
        path: "/admin/projects",
        expectText: /project/i,
      },
      {
        path: `/admin/projects/${MOCK_PROJECT_ID}`,
        allowNotFound: true,
      },
    ],
  },
  {
    id: "admin-lists",
    label: "Admin module lists",
    routes: [
      { path: "/admin", expectText: /admin|dashboard/i },
      { path: "/admin/workers", expectText: /worker/i },
      { path: "/admin/equipment", expectText: /equipment/i },
    ],
  },
];

/** PM / supervisor workspace (storage: pm). */
export const PM_DEEP_CRAWL_DOMAINS: DeepCrawlDomain[] = [
  {
    id: "pm-projects",
    label: "PM projects",
    routes: [
      { path: "/pm/projects", expectText: /project/i },
      {
        path: `/pm/projects/${MOCK_PROJECT_ID}`,
        expectText: /project/i,
        allowNotFound: true,
      },
    ],
  },
  {
    id: "pm-inspections",
    label: "PM inspections",
    routes: [
      { path: "/pm/inspections", expectText: /inspection/i },
      {
        path: `/pm/inspections/${MOCK_INSPECTION_ID}`,
        expectText: /inspection|checklist|walk|loading/i,
      },
      {
        path: "/pm/inspections/1",
        expectText: /inspection|checklist|loading/i,
        allowNotFound: true,
      },
    ],
  },
  {
    id: "pm-sif-sms",
    label: "SIF-HECA & SMS",
    routes: [
      { path: "/pm/sif-heca", expectText: /SIF|HECA|energy|hazard/i },
      { path: "/pm/sms", expectText: /SMS|leading|SCL|safety/i },
      { path: "/pm/sms?companyId=1", expectText: /SMS|leading|SCL|safety/i },
    ],
  },
  {
    id: "pm-hub",
    label: "PM workspace shell",
    routes: [
      { path: "/pm", expectText: /project|safety|PM/i },
      { path: "/pm/safety-forms", expectText: /form|permit|safety/i },
      { path: "/pm/incidents", expectText: /incident|safety/i },
    ],
  },
];

/** Contractor portal (storage: contractor). */
export const CONTRACTOR_DEEP_CRAWL_DOMAINS: DeepCrawlDomain[] = [
  {
    id: "contractor-portal",
    label: "Contractor portal",
    routes: [
      {
        path: "/contractor",
        expectText: /contractor|inbox|portal|dispatch|finding/i,
      },
    ],
  },
];

/** Core readiness & assessment (admin or pm storage). */
export const CORE_DEEP_CRAWL_DOMAINS: DeepCrawlDomain[] = [
  {
    id: "core-readiness",
    label: "Core readiness",
    routes: [
      { path: "/core/readiness", expectText: /readiness|worker|equipment/i },
      { path: "/core/safety-knowledge", expectText: /safety knowledge|SKE|evaluate/i },
      { path: "/core/training-ingest", expectText: /training|ingest|import/i },
      {
        path: `/core/workers/${MOCK_WORKER_ID}`,
        expectText: /worker|profile|readiness/i,
        allowNotFound: true,
      },
    ],
  },
];

/** Staff wallet routes (admin or pm). */
export const WALLET_DEEP_CRAWL_DOMAINS: DeepCrawlDomain[] = [
  {
    id: "wallet-staff",
    label: "Staff wallet",
    routes: [
      { path: "/wallet", expectText: /wallet|verify|worker/i },
      {
        path: `/wallet/${MOCK_WORKER_ID}`,
        expectText: /wallet|verify|worker|download/i,
        allowNotFound: true,
      },
    ],
  },
];

/** @deprecated use role-specific domain arrays */
export const AUTHENTICATED_DEEP_CRAWL_DOMAINS: DeepCrawlDomain[] = [
  ...PM_DEEP_CRAWL_DOMAINS,
  ...CONTRACTOR_DEEP_CRAWL_DOMAINS,
  ...WALLET_DEEP_CRAWL_DOMAINS,
  ...CORE_DEEP_CRAWL_DOMAINS,
  {
    id: "legacy-hub",
    label: "Hub",
    routes: [{ path: "/hub", expectText: /hub|readiness|activity/i }],
  },
];

export function flattenDomains(domains: DeepCrawlDomain[]): DeepCrawlRoute[] {
  return domains.flatMap((d) => d.routes);
}
