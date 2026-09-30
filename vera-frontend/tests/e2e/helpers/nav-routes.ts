import fs from "node:fs";
import path from "node:path";

const ROOT = path.join(process.cwd());
const NAV_PATH = path.join(ROOT, "lib/navigation/vera-nav-config.ts");
const APP_DIR = path.join(ROOT, "app");

/** All static hrefs from vera-nav-config (query strings stripped). */
export function collectNavHrefs(): string[] {
  const text = fs.readFileSync(NAV_PATH, "utf8");
  const hrefs = [...text.matchAll(/href:\s*["']([^"']+)["']/g)].map((m) => m[1]);
  return [
    ...new Set(
      hrefs
        .filter((h) => h.startsWith("/") && !h.startsWith("http"))
        .map((h) => h.split("?")[0]!),
    ),
  ];
}

export function resolvePageFile(routePath: string): string | null {
  const segments = routePath.split("/").filter(Boolean);
  let cur = APP_DIR;
  for (const seg of segments) {
    if (!fs.existsSync(cur)) return null;
    const entries = fs.readdirSync(cur);
    if (entries.includes(seg)) {
      cur = path.join(cur, seg);
      continue;
    }
    const dynamic = entries.find((e) => e.startsWith("[") && e.endsWith("]"));
    if (dynamic) {
      cur = path.join(cur, dynamic);
      continue;
    }
    return null;
  }
  const page = path.join(cur, "page.tsx");
  return fs.existsSync(page) ? page : null;
}

/** Routes that must not return 5xx when unauthenticated (marketing / verify). */
export const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/auth/login",
  "/welcome",
  "/verify/1",
  "/verify/worker",
  "/verify/equipment",
  "/verify/credential",
  "/verify/training",
  "/qr",
  "/jobs",
  "/safety",
  "/safety-bulletins",
  "/safety-recalls",
  "/feedback",
  "/home",
] as const;

/** Authenticated module entry points (smoke). */
export const DEEP_MODULE_ROUTES = [
  "/hub",
  "/hub/activity",
  "/core/workers",
  "/core/readiness",
  "/core/safety-knowledge",
  "/core/training-ingest",
  "/core/verification",
  "/pm",
  "/pm/projects",
  "/pm/inspections",
  "/pm/safety-forms",
  "/pm/incidents",
  "/pm/sms",
  "/pm/safety-hub",
  "/pm/corrective-actions",
  "/admin",
  "/admin/workers",
  "/admin/equipment",
  "/admin/training",
  "/contractor",
  "/supervisor",
  "/field",
] as const;

/** Detail + edit deep links (numeric placeholders). */
export const DETAIL_EDIT_ROUTES = [
  { path: "/admin/workers/1", expectText: /worker|Worker/i },
  { path: "/admin/workers/1/edit", expectText: /edit|Edit/i },
  { path: "/admin/workers/1/competency", expectText: /competency|Competency/i },
  { path: "/admin/equipment/1", expectText: /equipment|Equipment/i },
  { path: "/admin/equipment/1/edit", expectText: /edit|Edit/i },
  { path: "/admin/training/1", expectText: /training|Training/i },
  { path: "/pm/projects/1", expectText: /project|Project/i },
  { path: "/pm/inspections/1", expectText: /inspection|Inspection|Loading/i },
  { path: "/core/workers/1", expectText: /worker|Worker|profile/i },
] as const;

/** Legacy QR router and field supervisor targets. */
export const ROUTING_FIXTURE_ROUTES = [
  { from: "/verify?type=worker&id=42", expectPath: /\/verify\/42/ },
  {
    from: "/verify?type=equipment&id=9",
    expectPath: /\/verify\/equipment\?id=9/,
  },
  { from: "/verify/training?id=5", expectPath: /\/verify\/core\/training\/5/ },
  { from: "/scan/worker/42", expectPath: /\/verify\/42/ },
  { from: "/scan/equipment/9", expectPath: /\/verify\/equipment\?id=9/ },
] as const;
