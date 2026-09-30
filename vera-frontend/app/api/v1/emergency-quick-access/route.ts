import { buildEmergencyQuickAccessPack } from "@/lib/emergency-quick-access";
import type { QuickAccessScenario } from "@/lib/emergency-quick-access";

function parseScenario(raw: string | null): QuickAccessScenario | undefined {
  const ok = [
    "electrical",
    "fall",
    "trench",
    "chemical",
    "rollover",
    "general",
  ] as const;
  if (raw && (ok as readonly string[]).includes(raw)) {
    return raw as QuickAccessScenario;
  }
  return undefined;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const projectId = Number(url.searchParams.get("projectId") ?? "1");
  const companyId = Number(url.searchParams.get("companyId") ?? "1");

  const pack = buildEmergencyQuickAccessPack({
    projectId,
    companyId,
    projectName: url.searchParams.get("projectName") ?? undefined,
    regionCode: url.searchParams.get("region") ?? undefined,
    scenario: parseScenario(url.searchParams.get("scenario")),
    siteAddress: url.searchParams.get("siteAddress") ?? undefined,
    radioChannel: url.searchParams.get("radioChannel") ?? undefined,
    musterPrimary: url.searchParams.get("musterPrimary") ?? undefined,
    musterAlternate: url.searchParams.get("musterAlternate") ?? undefined,
    siteCoordinatorPhone: url.searchParams.get("siteCoordinatorPhone"),
    hsePhone: url.searchParams.get("hsePhone"),
  });

  return Response.json(
    { data: pack },
    {
      headers: {
        "Cache-Control": "private, max-age=60",
        "X-Vera-Offline-Cache-Key": pack.offline.cacheKey,
      },
    },
  );
}
