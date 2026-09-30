import { buildWorkAtHeightsHub } from "./build";
import type {
  ClearanceParams,
  FallEquipmentProfile,
  WahHubDashboard,
  WahIndustryPlaybook,
  WorksheetGeometry,
  WorksheetRecord,
} from "./types";
import { WAH_INDUSTRY_PLAYBOOKS } from "./types";
import { apiFetchJson } from "@/lib/api-fetch";

const FC = "/api/v1/fall-clearance";
const WAH = "/api/v1/pm/work-at-heights";

export async function fetchWahHub(input: {
  companyId: number;
  projectId: number;
  industry?: string;
}): Promise<WahHubDashboard> {
  const qs = new URLSearchParams({
    companyId: String(input.companyId),
    projectId: String(input.projectId),
    ...(input.industry ? { industry: input.industry } : {}),
  });
  try {
    return await apiFetchJson<WahHubDashboard>(`${WAH}/hub?${qs}`);
  } catch {
    return buildWorkAtHeightsHub(input);
  }
}

export async function fetchWahIndustries(): Promise<WahIndustryPlaybook[]> {
  try {
    return await apiFetchJson<WahIndustryPlaybook[]>(`${WAH}/industries`);
  } catch {
    return WAH_INDUSTRY_PLAYBOOKS;
  }
}

export async function listFallEquipment(all = false): Promise<FallEquipmentProfile[]> {
  const data = await apiFetchJson<
    FallEquipmentProfile[] | { items?: FallEquipmentProfile[] }
  >(`${FC}/equipment${all ? "?all=true" : ""}`);
  return Array.isArray(data) ? data : data.items ?? [];
}

export async function createFallEquipment(body: {
  type: string;
  manufacturer: string;
  model: string;
  clearanceParams: ClearanceParams;
  standardRefs?: string[];
  rawManualData?: string;
}): Promise<FallEquipmentProfile> {
  return apiFetchJson<FallEquipmentProfile>(`${FC}/equipment`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function ingestFallEquipmentManual(
  id: string,
  text: string,
): Promise<{
  equipment: FallEquipmentProfile;
  extracted: Partial<ClearanceParams>;
  warnings: string[];
  confidence: number;
}> {
  return apiFetchJson(`${FC}/equipment/${id}/ingest-manual`, {
    method: "POST",
    body: JSON.stringify({ text }),
  });
}

export async function approveFallEquipment(id: string): Promise<FallEquipmentProfile> {
  return apiFetchJson(`${FC}/equipment/${id}/approve`, { method: "POST" });
}

export async function rejectFallEquipment(id: string): Promise<FallEquipmentProfile> {
  return apiFetchJson(`${FC}/equipment/${id}/reject`, { method: "POST" });
}

export async function saveClearanceWorksheet(body: {
  id?: string;
  companyId?: number;
  projectId?: number;
  industry?: string;
  equipmentId?: string;
  referenceParams: ClearanceParams;
  userParams: ClearanceParams;
  geometry?: WorksheetGeometry;
  userRequiredM?: number;
  userAvailableM?: number;
  userNotes?: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
}): Promise<WorksheetRecord> {
  return apiFetchJson<WorksheetRecord>(`${FC}/worksheet/save`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function listClearanceWorksheets(input: {
  companyId: number;
  projectId: number;
}): Promise<WorksheetRecord[]> {
  const qs = new URLSearchParams({
    companyId: String(input.companyId),
    projectId: String(input.projectId),
  });
  return apiFetchJson<WorksheetRecord[]>(`${FC}/worksheets?${qs}`);
}
