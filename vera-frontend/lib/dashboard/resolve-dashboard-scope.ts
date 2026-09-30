import type { Session } from "next-auth";
import { apiFetchJson } from "@/lib/api-fetch";
import { isStaff, isWorker } from "@/lib/phase1-roles";

type CompanyRow = { id: number; name?: string };

/**
 * Resolves company (and optional union hall) for dashboard intelligence layers.
 * The main dashboard page previously never passed companyId, so Phases 5–16 UI never rendered.
 */
export async function resolveDashboardScope(
  session: Session | null
): Promise<{ companyId?: number; unionHallId?: number }> {
  const role = session?.user?.role ?? null;
  if (!session || isWorker(role) || !isStaff(role)) {
    return {};
  }

  try {
    const companies = await apiFetchJson<CompanyRow[]>("/companies", { session });
    const list = Array.isArray(companies) ? companies : [];
    const companyId = list[0]?.id ?? 1;
    return { companyId, unionHallId: undefined };
  } catch {
    return { companyId: 1, unionHallId: undefined };
  }
}
