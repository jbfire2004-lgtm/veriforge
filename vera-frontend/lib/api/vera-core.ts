import { apiGet, apiPost } from "@/lib/api";

const BASE = "/api/v1/core";

export type CompanyLink = {
  id: number;
  workerId: number;
  companyId: number;
  active: boolean;
  startDate: string;
  endDate: string | null;
  role: string | null;
  trade: string | null;
  worker?: { id: number; firstName: string; lastName: string; email?: string | null };
};

export type EquipmentLink = {
  id: number;
  equipmentId: number;
  companyId: number;
  active: boolean;
  complianceStatus: string;
  equipment?: { id: number; name: string; serialNumber?: string | null };
};

export type Project = {
  id: number;
  companyId: number;
  name: string;
  code: string | null;
  status: string;
};

export async function searchEquipment(params: {
  q?: string;
  serial?: string;
  assetTag?: string;
  limit?: number;
}) {
  const qs = new URLSearchParams();
  if (params.q) qs.set("q", params.q);
  if (params.serial) qs.set("serial", params.serial);
  if (params.assetTag) qs.set("assetTag", params.assetTag);
  if (params.limit) qs.set("limit", String(params.limit));
  return apiGet<unknown[]>(`${BASE}/equipment/search?${qs}`);
}

export async function getEquipmentProfile(equipmentId: number) {
  return apiGet<unknown>(`${BASE}/equipment/${equipmentId}/profile`);
}

export async function searchWorkers(params: {
  q?: string;
  phone?: string;
  email?: string;
  limit?: number;
}) {
  const qs = new URLSearchParams();
  if (params.q) qs.set("q", params.q);
  if (params.phone) qs.set("phone", params.phone);
  if (params.email) qs.set("email", params.email);
  if (params.limit) qs.set("limit", String(params.limit));
  return apiGet<unknown[]>(`${BASE}/workers/search?${qs}`);
}

export async function getWorkerProfile(workerId: number) {
  return apiGet<unknown>(`${BASE}/workers/${workerId}/profile`);
}

export async function getCompanyWorkers(companyId: number, activeOnly = true) {
  return apiGet<CompanyLink[]>(
    `${BASE}/companies/${companyId}/workers?activeOnly=${activeOnly}`,
  );
}

export async function linkWorkerToCompany(body: {
  workerId: number;
  companyId: number;
  role?: string;
  trade?: string;
}) {
  return apiPost<CompanyLink>(`${BASE}/company-links`, body);
}

export async function linkWorkerByQr(qrToken: string, companyId: number) {
  return apiPost<CompanyLink>(`${BASE}/company-links/scan`, { qrToken, companyId });
}

export async function endWorkerAssignment(workerId: number, companyId: number) {
  return apiPost(`${BASE}/company-links/${workerId}/${companyId}/end`, {});
}

export async function getCompanyEquipment(companyId: number) {
  return apiGet<EquipmentLink[]>(`${BASE}/companies/${companyId}/equipment`);
}

export async function linkEquipmentToCompany(equipmentId: number, companyId: number) {
  return apiPost(`${BASE}/equipment-links`, { equipmentId, companyId });
}

export async function linkEquipmentByQr(qrToken: string, companyId: number) {
  return apiPost<{
    linked?: boolean;
    equipmentId: number;
    companyId: number;
    complianceStatus?: string;
    equipmentName?: string | null;
    walletUrl?: string;
  }>(`${BASE}/equipment-links/scan`, { qrToken, companyId });
}

export async function getCompanyProjects(companyId: number) {
  return apiGet<Project[]>(`${BASE}/companies/${companyId}/projects`);
}

export async function createProject(body: {
  companyId: number;
  name: string;
  code?: string;
  siteId?: number;
}) {
  return apiPost<Project>(`${BASE}/projects`, body);
}

export async function assignWorkerToProject(projectId: number, workerId: number) {
  return apiPost(`${BASE}/projects/${projectId}/assign-worker`, { workerId });
}

export async function getWorkerWallet(workerId: number) {
  return apiGet<unknown>(`${BASE}/wallets/worker/${workerId}`);
}

export async function getEquipmentWallet(equipmentId: number) {
  return apiGet<unknown>(`${BASE}/wallets/equipment/${equipmentId}`);
}

export async function listUnionHalls() {
  return apiGet<unknown[]>(`${BASE}/union-halls`);
}

export async function getUnionMembers(hallId: number) {
  return apiGet<unknown[]>(`${BASE}/union-halls/${hallId}/members`);
}

export async function dispatchWorker(hallId: number, workerId: number, companyId: number) {
  return apiPost(`${BASE}/union-halls/${hallId}/dispatch`, { workerId, companyId });
}
