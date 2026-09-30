import { apiGet, apiPost } from "@/lib/api";

const BASE = "/api/v1/maintenance-calibration";

export type McDashboard = {
  maintenanceRecordCount: number;
  calibrationRecordCount: number;
  maintenanceDueWithin14Days: number;
  calibrationDueWithin14Days: number;
  maintenanceOverdue: number;
  calibrationOverdue: number;
  recentMaintenance: unknown[];
  recentCalibration: unknown[];
};

export async function getMaintenanceCalibrationDashboard(companyId?: number) {
  const qs = companyId ? `?companyId=${companyId}` : "";
  return apiGet<McDashboard>(`${BASE}/dashboard${qs}`);
}

export async function listMaintenanceRecords(equipmentId?: number) {
  const params = new URLSearchParams();
  if (equipmentId) params.set("equipmentId", String(equipmentId));
  const q = params.toString();
  return apiGet<unknown[]>(`${BASE}/maintenance-records${q ? `?${q}` : ""}`);
}

export async function listCalibrationRecords(equipmentId?: number) {
  const params = new URLSearchParams();
  if (equipmentId) params.set("equipmentId", String(equipmentId));
  const q = params.toString();
  return apiGet<unknown[]>(`${BASE}/calibration-records${q ? `?${q}` : ""}`);
}

export async function createMaintenanceRecord(body: Record<string, unknown>) {
  return apiPost(`${BASE}/maintenance-records`, body);
}

export async function createCalibrationRecord(body: Record<string, unknown>) {
  return apiPost(`${BASE}/calibration-records`, body);
}

export async function notifyMaintenanceCalibrationDue(companyId?: number) {
  const qs = companyId ? `?companyId=${companyId}` : "";
  return apiPost(`${BASE}/notify-due${qs}`, {});
}
