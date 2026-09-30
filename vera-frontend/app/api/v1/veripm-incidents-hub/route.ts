import {
  buildIncidentsHub,
  resolveIncidentPlane,
  type IncidentAccessPlane,
} from "@/lib/veripm-incidents-hub";
import { cachedJsonResponse } from "@/lib/verisuite-intelligence-ui/aggregate-cache";

const NS = "veripm-incidents-hub";

function parsePlane(raw: string | null): IncidentAccessPlane | undefined {
  if (raw === "project" || raw === "company" || raw === "subcontractor") {
    return raw;
  }
  return undefined;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const projectId = Number(url.searchParams.get("projectId") ?? "1");
  const companyId = Number(url.searchParams.get("companyId") ?? "1");
  const months = Number(url.searchParams.get("months") ?? "24");
  const role = url.searchParams.get("role");
  const plane =
    parsePlane(url.searchParams.get("plane")) ??
    (role ? resolveIncidentPlane(role) : undefined);

  return cachedJsonResponse(
    NS,
    { projectId, companyId, months, plane: plane ?? "project", role },
    () =>
      buildIncidentsHub({
        projectId,
        companyId,
        months: Number.isFinite(months) ? months : 24,
        plane,
        role,
      }),
  );
}
