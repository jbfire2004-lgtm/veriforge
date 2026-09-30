import { Prisma } from '@prisma/client';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import type { WorkerValidationContext, EquipmentValidationContext } from '../types';

async function fetchJson<T>(url: string, token: string, init?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(url, {
      ...init,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...(init?.headers ?? {}),
      },
    });
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
      role?: string;
      safetyScore?: number;
      riskLevel?: string;
      restrictions?: Array<{ restrictionType: string; expiryDate?: string | null }>;
      jhaSignatures?: Array<{ jhaId: string }>;
    }>(`${env.workerSafetyServiceUrl}/worker/${workerId}?company_id=${companyId}`, token);

    if (!data) return {};

    const now = Date.now();
    return {
      role: data.role,
      safetyScore: data.safetyScore,
      riskLevel: data.riskLevel,
      activeRestrictions: (data.restrictions ?? [])
        .filter((r) => !r.expiryDate || new Date(r.expiryDate).getTime() > now)
        .map((r) => r.restrictionType),
      signedJhaIds: (data.jhaSignatures ?? []).map((j) => j.jhaId),
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

  async validateJha(jhaId: string, workerId: string, companyId: string, token: string): Promise<boolean> {
    if (!env.jhaServiceUrl) return true;

    const data = await fetchJson<{ signed?: boolean; approved?: boolean }>(
      `${env.jhaServiceUrl}/safety/jha/${jhaId}?company_id=${companyId}&worker_id=${workerId}`,
      token,
    );

    return Boolean(data?.signed && data?.approved);
  },
};
