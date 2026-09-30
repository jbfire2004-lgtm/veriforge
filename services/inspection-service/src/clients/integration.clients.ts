import { env } from '../config/env';
import { logger } from '../utils/logger';

export const integrationClients = {
  async createCorrectiveAction(input: {
    companyId: string;
    projectId: string;
    sourceId: string;
    title: string;
    description?: string;
    severity?: string;
    hazardId?: string;
    controlId?: string;
    equipmentId?: string;
    workerId?: string;
    token: string;
  }): Promise<{ id?: string; created: boolean }> {
    if (!env.correctiveActionServiceUrl) return { created: false };

    try {
      const res = await fetch(`${env.correctiveActionServiceUrl}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${input.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          company_id: input.companyId,
          project_id: input.projectId,
          source_type: 'inspection',
          source_id: input.sourceId,
          action_type: 'permanent',
          title: input.title,
          description: input.description,
          severity: input.severity ?? 'medium',
          hazard_id: input.hazardId,
          control_id: input.controlId,
          equipment_id: input.equipmentId,
          worker_id: input.workerId,
          publish: true,
        }),
      });

      if (!res.ok) {
        logger.warn('corrective action create failed', { status: res.status });
        return { created: false };
      }

      const body = (await res.json()) as { id?: string };
      return { id: body.id, created: true };
    } catch (err) {
      logger.warn('corrective action service unavailable', {
        error: err instanceof Error ? err.message : String(err),
      });
      return { created: false };
    }
  },

  async getHazard(input: {
    hazardId: string;
    companyId: string;
    token: string;
  }): Promise<{ active?: boolean; severity?: string } | null> {
    if (!env.hazardControlServiceUrl) return null;

    try {
      const res = await fetch(
        `${env.hazardControlServiceUrl}/hazard/${input.hazardId}?company_id=${input.companyId}`,
        { headers: { Authorization: `Bearer ${input.token}` } },
      );
      if (!res.ok) return null;
      const body = (await res.json()) as { status?: string; severity?: string };
      return {
        active: body.status !== 'closed' && body.status !== 'mitigated',
        severity: body.severity,
      };
    } catch (err) {
      logger.warn('hazard control service unavailable', {
        error: err instanceof Error ? err.message : String(err),
      });
      return null;
    }
  },

  async getControl(input: {
    controlId: string;
    companyId: string;
    token: string;
  }): Promise<{ effective?: boolean } | null> {
    if (!env.hazardControlServiceUrl) return null;

    try {
      const res = await fetch(
        `${env.hazardControlServiceUrl}/control/${input.controlId}?company_id=${input.companyId}`,
        { headers: { Authorization: `Bearer ${input.token}` } },
      );
      if (!res.ok) return null;
      const body = (await res.json()) as { status?: string; effectiveness?: string };
      return {
        effective: body.status === 'active' || body.effectiveness === 'effective',
      };
    } catch (err) {
      logger.warn('hazard control service unavailable', {
        error: err instanceof Error ? err.message : String(err),
      });
      return null;
    }
  },

  async getEquipmentSafety(input: {
    equipmentId: string;
    companyId: string;
    token: string;
  }): Promise<{ safe: boolean; score?: number; lockoutActive?: boolean } | null> {
    if (!env.equipmentSafetyServiceUrl) return null;

    try {
      const res = await fetch(
        `${env.equipmentSafetyServiceUrl}/${input.equipmentId}/score?company_id=${input.companyId}`,
        { headers: { Authorization: `Bearer ${input.token}` } },
      );
      if (!res.ok) return null;
      const body = (await res.json()) as {
        score?: number;
        safetyStatus?: string;
        lockoutStatus?: string;
      };
      const safe = body.safetyStatus !== 'UNSAFE' && body.lockoutStatus !== 'LOCKED';
      return { safe, score: body.score, lockoutActive: body.lockoutStatus === 'LOCKED' };
    } catch (err) {
      logger.warn('equipment safety service unavailable', {
        error: err instanceof Error ? err.message : String(err),
      });
      return null;
    }
  },
};
