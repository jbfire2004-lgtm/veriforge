import { cachedJsonResponse } from "@/lib/verisuite-intelligence-ui/aggregate-cache";
import { loadSafetyHubIntelligence } from "@/lib/pm-safety-hub-intelligence";

const NS = "pm-safety-hub-intelligence";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const projectId = Number(url.searchParams.get("projectId") ?? "1");
  const companyId = Number(url.searchParams.get("companyId") ?? "1");

  return cachedJsonResponse(
    NS,
    { projectId, companyId },
    () =>
      loadSafetyHubIntelligence({
        projectId: Number.isFinite(projectId) ? projectId : 1,
        companyId: Number.isFinite(companyId) ? companyId : 1,
      }),
  );
}
