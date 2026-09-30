import { buildWorkAtHeightsHub } from "@/lib/veripm-work-at-heights/build";
import { cachedJsonResponse } from "@/lib/verisuite-intelligence-ui/aggregate-cache";

const NS = "veripm-work-at-heights";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const projectId = Number(url.searchParams.get("projectId") ?? "1");
  const companyId = Number(url.searchParams.get("companyId") ?? "1");
  const industry = url.searchParams.get("industry") ?? undefined;

  return cachedJsonResponse(
    NS,
    { projectId, companyId, industry: industry ?? "" },
    () => buildWorkAtHeightsHub({ projectId, companyId, industry }),
  );
}
