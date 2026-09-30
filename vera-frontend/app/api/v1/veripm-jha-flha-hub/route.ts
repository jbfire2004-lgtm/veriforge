import { buildJhaFlhaHub } from "@/lib/veripm-jha-flha-hub";
import type { JhaIndustry } from "@/lib/veripm-jha-flha-hub";
import {
  resolveVeriPmPlane,
  type VeriPmAccessPlane,
} from "@/lib/veripm-ai-intelligence";
import { cachedJsonResponse } from "@/lib/verisuite-intelligence-ui/aggregate-cache";

const NS = "veripm-jha-flha-hub";

function parsePlane(raw: string | null): VeriPmAccessPlane | undefined {
  if (raw === "project" || raw === "company" || raw === "subcontractor") return raw;
  return undefined;
}

function parseIndustry(raw: string | null): JhaIndustry | undefined {
  if (
    raw === "mining" ||
    raw === "construction" ||
    raw === "manufacturing" ||
    raw === "utilities"
  ) {
    return raw;
  }
  return undefined;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const projectId = Number(url.searchParams.get("projectId") ?? "1");
  const companyId = Number(url.searchParams.get("companyId") ?? "1");
  const role = url.searchParams.get("role");
  const plane =
    parsePlane(url.searchParams.get("plane")) ??
    (role ? resolveVeriPmPlane(role) : undefined);
  const industry = parseIndustry(url.searchParams.get("industry"));
  const workType = url.searchParams.get("workType") ?? undefined;
  const region = url.searchParams.get("region") ?? undefined;

  return cachedJsonResponse(
    NS,
    {
      projectId,
      companyId,
      plane: plane ?? "project",
      industry: industry ?? "construction",
      workType,
      region,
      role,
    },
    () =>
      buildJhaFlhaHub({
        projectId,
        companyId,
        plane,
        role,
        industry,
        workType,
        region,
      }),
  );
}
