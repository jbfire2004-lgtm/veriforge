import { env } from '../config/env';
import { logger } from '../utils/logger';
import type { WorkerValidationContext, EquipmentValidationContext } from '../types';

async function fetchJson<T>(url: string, token: string): Promise<T | null> {
  try {
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch (err) {
    logger.warn('upstream service unavailable', {
      url,
      error: err instanceof Error ? err.message : String(err),
    });
    return null;
  }
}

export const safetyClients = {
  async fetchWorkerContext(
    workerId: string,
    companyId: string,
    token: string,
    inline?: WorkerValidationContext,
  ): Promise<WorkerValidationContext> {
    if (inline) return inline;

    if (!env.workerSafetyServiceUrl) return {};

    const data = await fetchJson<{
      safetyScore?: number;
      riskLevel?: string;
      role?: string;
      training?: Array<{ courseId: string; expiryDate?: string | null }>;
      competencies?: Array<{ competencyCode: string }>;
      authorizations?: Array<{ equipmentType: string; expiryDate?: string | null }>;
      restrictions?: Array<{ restrictionType: string; expiryDate?: string | null }>;
    }>(`${env.workerSafetyServiceUrl}/worker/${workerId}?company_id=${companyId}`, token);

    if (!data) return {};

    const now = Date.now();
    return {
      role: data.role,
      safetyScore: data.safetyScore,
      riskLevel: data.riskLevel,
      completedTraining: (data.training ?? [])
        .filter((t) => !t.expiryDate || new Date(t.expiryDate).getTime() > now)
        .map((t) => t.courseId),
      competencies: (data.competencies ?? []).map((c) => c.competencyCode),
      equipmentAuthorizations: (data.authorizations ?? [])
        .filter((a) => !a.expiryDate || new Date(a.expiryDate).getTime() > now)
        .map((a) => a.equipmentType),
      activeRestrictions: (data.restrictions ?? [])
        .filter((r) => !r.expiryDate || new Date(r.expiryDate).getTime() > now)
        .map((r) => r.restrictionType),
    };
  },

  async fetchEquipmentContext(
    equipmentId: string,
    companyId: string,
    token: string,
    inline?: EquipmentValidationContext,
  ): Promise<EquipmentValidationContext> {
    if (inline) return inline;

    if (!env.equipmentSafetyServiceUrl) return {};

    const data = await fetchJson<{
      status?: string;
      conditionScore?: number;
      activeLockout?: boolean;
      expiredCertifications?: number;
    }>(`${env.equipmentSafetyServiceUrl}/equipment/${equipmentId}/score?company_id=${companyId}`, token);

    return data ?? {};
  },
};
