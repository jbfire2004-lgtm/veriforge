import { buildInspectionsHub } from "@/lib/veripm-inspections-hub";
import {
  resolveVeriPmPlane,
  type VeriPmAccessPlane,
} from "@/lib/veripm-ai-intelligence";
import { cachedJsonResponse } from "@/lib/verisuite-intelligence-ui/aggregate-cache";

const NS = "veripm-inspections-hub";

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
  const focus = url.searchParams.get("focus");
  const role = url.searchParams.get("role");
  const plane =
    parsePlane(url.searchParams.get("plane")) ??
    (role ? resolveVeriPmPlane(role) : undefined);

  return cachedJsonResponse(
    NS,
    { projectId, companyId, focus, plane: plane ?? "project", role },
    () =>
      buildInspectionsHub({
        projectId,
        companyId,
        focus,
        plane,
        role,
      }),
  );
}
