import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { sessionRole } from "@/lib/phase1-roles";
import {
  buildVeriPmHomeDashboard,
  type HomeAccessPlane,
  type TrendWindowMonths,
} from "@/lib/veripm-home-dashboard";
import { cachedJsonResponse } from "@/lib/verisuite-intelligence-ui/aggregate-cache";

const NS = "veripm-home-dashboard";

function parseMonths(raw: string | null): TrendWindowMonths {
  const n = Number(raw);
  if (n === 12 || n === 36) return n;
  return 24;
}

function parsePlane(raw: string | null): HomeAccessPlane | undefined {
  if (raw === "project" || raw === "company" || raw === "subcontractor") {
    return raw;
  }
  return undefined;
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const role = sessionRole(session);
  const url = new URL(req.url);
  const plane = parsePlane(url.searchParams.get("plane"));
  const trendWindowMonths = parseMonths(url.searchParams.get("months"));
  const projectId = url.searchParams.get("projectId")
    ? Number(url.searchParams.get("projectId"))
    : null;
  const companyId = url.searchParams.get("companyId")
    ? Number(url.searchParams.get("companyId"))
    : null;

  return cachedJsonResponse(
    NS,
    {
      plane: plane ?? "project",
      months: trendWindowMonths,
      projectId,
      companyId,
      role: role ?? "anon",
    },
    () =>
      buildVeriPmHomeDashboard({
        plane,
        role,
        trendWindowMonths,
        projectId,
        companyId,
      }),
  );
}
