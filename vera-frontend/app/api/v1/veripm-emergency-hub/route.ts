import { buildEmergencyHub } from "@/lib/veripm-emergency-hub";
import type { ErpScenario } from "@/lib/veripm-emergency-hub";
import {
  resolveVeriPmPlane,
  type VeriPmAccessPlane,
} from "@/lib/veripm-ai-intelligence";
import { cachedJsonResponse } from "@/lib/verisuite-intelligence-ui/aggregate-cache";

const NS = "veripm-emergency-hub";

function parsePlane(raw: string | null): VeriPmAccessPlane | undefined {
  if (raw === "project" || raw === "company" || raw === "subcontractor") return raw;
  return undefined;
}

function parseScenario(raw: string | null): ErpScenario | undefined {
  const ok = [
    "electrical",
    "fall",
    "trench",
    "chemical",
    "rollover",
    "general",
  ] as const;
  if (raw && (ok as readonly string[]).includes(raw)) return raw as ErpScenario;
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
  const hazardsRaw = url.searchParams.get("hazards");
  const hazards = hazardsRaw
    ? hazardsRaw.split("|").map((s) => s.trim()).filter(Boolean)
    : undefined;
  const includeEmsRaw = url.searchParams.get("includeEms");
  const includeEmsIds = includeEmsRaw
    ? includeEmsRaw.split("|").map((s) => s.trim()).filter(Boolean)
    : undefined;

  return cachedJsonResponse(
    NS,
    {
      projectId,
      companyId,
      plane: plane ?? "project",
      workType: url.searchParams.get("workType"),
      region: url.searchParams.get("region"),
      projectScope: url.searchParams.get("projectScope"),
      scenario: url.searchParams.get("scenario"),
      hazards: hazardsRaw,
      generateToken: url.searchParams.get("generateToken"),
      includeEms: includeEmsRaw,
      role,
    },
    () =>
      buildEmergencyHub({
        projectId,
        companyId,
        plane,
        role,
        workType: url.searchParams.get("workType") ?? undefined,
        region: url.searchParams.get("region") ?? undefined,
        projectScope: url.searchParams.get("projectScope") ?? undefined,
        scenario: parseScenario(url.searchParams.get("scenario")),
        hazards,
        generateToken: url.searchParams.get("generateToken") ?? undefined,
        includeEmsIds,
      }),
  );
}
