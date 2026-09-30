import {
  buildVeriPmAiIntelligence,
  resolveVeriPmPlane,
  type VeriPmAccessPlane,
  type VeriPmPageContext,
} from "@/lib/veripm-ai-intelligence";
import { cachedJsonResponse } from "@/lib/verisuite-intelligence-ui/aggregate-cache";

const NS = "veripm-ai-intelligence";

const PAGES: VeriPmPageContext[] = [
  "home",
  "incidents",
  "action-management",
  "safety-meetings",
  "inspections",
  "training",
  "project-safety",
  "predictive",
  "jha-flha",
  "emergency",
];

function parsePage(raw: string | null): VeriPmPageContext {
  if (raw && (PAGES as string[]).includes(raw)) {
    return raw as VeriPmPageContext;
  }
  return "home";
}

function parsePlane(raw: string | null): VeriPmAccessPlane | undefined {
  if (raw === "project" || raw === "company" || raw === "subcontractor") {
    return raw;
  }
  return undefined;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const projectId = Number(url.searchParams.get("projectId") ?? "1");
  const companyId = Number(url.searchParams.get("companyId") ?? "1");
  const page = parsePage(url.searchParams.get("page"));
  const role = url.searchParams.get("role");
  const plane =
    parsePlane(url.searchParams.get("plane")) ??
    (role ? resolveVeriPmPlane(role) : undefined);

  return cachedJsonResponse(
    NS,
    { projectId, companyId, page, plane: plane ?? "project", role },
    () =>
      buildVeriPmAiIntelligence({
        page,
        plane,
        role,
        projectId,
        companyId,
      }),
  );
}
