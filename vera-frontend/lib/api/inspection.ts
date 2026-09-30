import { apiGet, apiPost } from "@/lib/api";

const BASE = "/api/v1/inspections";

export type InspectionType =
  | "PRE_USE"
  | "SCHEDULED"
  | "PME"
  | "CRANE_LIFT"
  | "LIFTING_GEAR"
  | "VEHICLE"
  | "TOOL"
  | "HYDRAULIC_PNEUMATIC";

export type ChecklistItem = { id: string; label: string; required?: boolean };

export type InspectionChecklist = {
  id: number;
  name: string;
  category: string;
  inspectionType: InspectionType;
  items: ChecklistItem[];
  intervalDays: number | null;
  intervalHours: number | null;
  active: boolean;
};

export type InspectionRecord = {
  id: number;
  equipmentId: number | null;
  workerId: number | null;
  inspectorId?: number | null;
  inspectionType: InspectionType;
  passed: boolean | null;
  status: string;
  lockoutTriggered: boolean;
  nextInspectionDate: string | null;
  correctiveActions: string | null;
  completedAt: string | null;
  createdAt: string;
  equipment?: { id: number; name: string };
  worker?: { id: number; firstName: string; lastName: string };
  checklistTemplate?: InspectionChecklist;
};

export type InspectionDashboard = {
  totalInspections: number;
  passed: number;
  failed: number;
  lockedOutEquipment: number;
  dueWithin7Days: number;
  recent: InspectionRecord[];
};

export async function getInspectionDashboard(companyId?: number) {
  const qs = companyId ? `?companyId=${companyId}` : "";
  return apiGet<InspectionDashboard>(`${BASE}/dashboard${qs}`);
}

export async function listInspectionChecklists(inspectionType?: InspectionType) {
  const qs = inspectionType ? `?inspectionType=${inspectionType}` : "";
  return apiGet<InspectionChecklist[]>(`${BASE}/checklists${qs}`);
}

export async function getEquipmentInspections(equipmentId: number) {
  return apiGet<InspectionRecord[]>(`${BASE}/equipment/${equipmentId}`);
}

export async function submitInspection(body: {
  equipmentId: number;
  workerId?: number;
  siteId?: number;
  checklistId?: number;
  inspectionType?: InspectionType;
  checklist: Record<string, { passed: boolean; notes?: string }>;
  passed: boolean;
  photos?: string[];
  correctiveActions?: string;
  notes?: string;
  meterReading?: number;
  signature?: string;
}) {
  return apiPost<InspectionRecord>(BASE, body);
}

export async function unlockEquipmentAfterInspection(
  equipmentId: number,
  notes?: string,
) {
  return apiPost(`${BASE}/equipment/${equipmentId}/unlock`, { notes });
}

export async function listDueInspections(companyId?: number, withinDays = 7) {
  const params = new URLSearchParams();
  if (companyId) params.set("companyId", String(companyId));
  params.set("withinDays", String(withinDays));
  return apiGet<InspectionRecord[]>(`${BASE}/due?${params}`);
}

export async function notifyDueInspections(companyId?: number, withinDays = 7) {
  const params = new URLSearchParams();
  if (companyId) params.set("companyId", String(companyId));
  params.set("withinDays", String(withinDays));
  return apiPost<{ notified: number; equipmentCount: number }>(
    `${BASE}/notify-due?${params}`,
    {},
  );
}
