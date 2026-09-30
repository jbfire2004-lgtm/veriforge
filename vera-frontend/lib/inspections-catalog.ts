import type { Session } from "next-auth";
import { apiFetchJson } from "@/lib/api-client";
import type { PmInspectionTemplate } from "@/lib/pm-inspections";

const BASE = "/api/v1/inspections";

export type VeraApiContext = { session?: Session | null };

export type InspectionTemplateCatalog = {
  templates: PmInspectionTemplate[];
  counts: {
    smart_site: number;
    focus_audit: number;
    checklist: number;
  };
};

export type SmartInspectionCatalog = {
  categories: Array<{
    id: string;
    name: string;
    description?: string | null;
    inspectionKind?: string;
    libraryGroup?: string;
    industry?: string;
    sortOrder?: number;
  }>;
  smartSiteTemplate: PmInspectionTemplate | null;
  focusAudits: PmInspectionTemplate[];
  counts: InspectionTemplateCatalog["counts"];
  photoFirst: boolean;
};

export type InspectionChecklistCatalog = {
  core: Array<{
    id: number;
    name: string;
    category: string;
    inspectionType: string;
    items: unknown;
  }>;
  pm: PmInspectionTemplate[];
  counts: { core: number; pm: number };
};

function catalogQuery(
  companyId: number,
  projectId?: number,
  extra?: Record<string, string | undefined>,
) {
  const q = new URLSearchParams({ companyId: String(companyId) });
  if (projectId != null) q.set("projectId", String(projectId));
  if (extra) {
    for (const [key, value] of Object.entries(extra)) {
      if (value != null) q.set(key, value);
    }
  }
  return q.toString();
}

/** Published PM + seeded inspection templates. */
export async function fetchInspectionTemplates(
  companyId: number,
  projectId?: number,
  options?: { kind?: string; session?: Session | null },
): Promise<InspectionTemplateCatalog> {
  const qs = catalogQuery(companyId, projectId, {
    kind: options?.kind,
    status: "published",
  });
  return apiFetchJson<InspectionTemplateCatalog>(`${BASE}/templates?${qs}`, {
    session: options?.session,
  });
}

/** Smart site template, focus audits, and category metadata. */
export async function fetchSmartInspectionCatalog(
  companyId: number,
  projectId?: number,
  session?: Session | null,
): Promise<SmartInspectionCatalog> {
  const qs = catalogQuery(companyId, projectId);
  return apiFetchJson<SmartInspectionCatalog>(`${BASE}/smart?${qs}`, { session });
}

/** PM checklist templates plus Vera Core equipment checklists (`GET /inspections/checklists/pm`). */
export async function fetchInspectionChecklists(
  companyId: number,
  projectId?: number,
  session?: Session | null,
): Promise<InspectionChecklistCatalog> {
  const qs = catalogQuery(companyId, projectId);
  return apiFetchJson<InspectionChecklistCatalog>(`${BASE}/checklists/pm?${qs}`, {
    session,
  });
}
