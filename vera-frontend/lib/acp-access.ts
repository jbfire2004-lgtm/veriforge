import type { AcpAccessContext } from "./acp-api";
import { fetchAcpAccessMe, fetchAcpHubModules } from "./acp-api";

let cachedContext: AcpAccessContext | null = null;
let cachedHubModules: Map<string, boolean> | null = null;

export async function getAcpAccessContext(force = false): Promise<AcpAccessContext | null> {
  if (cachedContext && !force) return cachedContext;
  try {
    cachedContext = await fetchAcpAccessMe();
    return cachedContext;
  } catch {
    return null;
  }
}

export async function getHubModuleAllowMap(force = false): Promise<Map<string, boolean>> {
  if (cachedHubModules && !force) return cachedHubModules;
  try {
    const rows = await fetchAcpHubModules();
    cachedHubModules = new Map(rows.map((r) => [r.moduleId, r.allowed]));
    return cachedHubModules;
  } catch {
    return new Map();
  }
}

export function clearAcpAccessCache() {
  cachedContext = null;
  cachedHubModules = null;
}

export function hasAcpPermission(ctx: AcpAccessContext | null, key: string): boolean {
  if (!ctx) return true;
  if (ctx.isPlatformAdmin || ctx.permissions.includes("*")) return true;
  return ctx.permissions.includes(key);
}

export function hasAcpFeature(ctx: AcpAccessContext | null, key: string): boolean {
  if (!ctx) return true;
  if (ctx.isPlatformAdmin) return true;
  return ctx.features.includes(key);
}

/** Map PM nav href to hub module gate id. */
export function hrefToHubModuleId(href: string): string | null {
  if (href === "/pm" || href === "/pm/") return "pm";
  if (href.startsWith("/pm/safety-hub")) return "pm.safety-hub";
  if (href.startsWith("/pm/sms")) return "pm.sms";
  if (href.startsWith("/contractor")) return "contractor";
  const path = href.replace(/\/$/, "");
  const segment = path.split("/").slice(0, 3).join("/");
  return segment.length > 1 ? segment : null;
}

export async function isPmLinkAllowedByAcp(href: string): Promise<boolean> {
  const moduleId = hrefToHubModuleId(href);
  if (!moduleId) return true;
  const map = await getHubModuleAllowMap();
  if (!map.size) return true;
  const allowed = map.get(moduleId);
  return allowed !== false;
}
