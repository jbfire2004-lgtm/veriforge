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
    workerId?: string;
    equipmentId?: string;
    sifLinked?: boolean;
    hecaLinked?: boolean;
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
          source_type: 'incident',
          source_id: input.sourceId,
          action_type: 'permanent',
          title: input.title,
          description: input.description,
          severity: input.severity ?? 'high',
          worker_id: input.workerId,
          equipment_id: input.equipmentId,
          sif_linked: input.sifLinked,
          heca_linked: input.hecaLinked,
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

  async getCorrectiveAction(input: {
    correctiveActionId: string;
    companyId: string;
    token: string;
  }): Promise<{ id?: string; status?: string } | null> {
    if (!env.correctiveActionServiceUrl) return null;

    try {
      const res = await fetch(
        `${env.correctiveActionServiceUrl}/${input.correctiveActionId}?company_id=${input.companyId}`,
        { headers: { Authorization: `Bearer ${input.token}` } },
      );
      if (!res.ok) return null;
      return (await res.json()) as { id?: string; status?: string };
    } catch (err) {
      logger.warn('corrective action service unavailable', {
        error: err instanceof Error ? err.message : String(err),
      });
      return null;
    }
  },

  async getWorkerScore(input: {
    workerId: string;
    companyId: string;
    token: string;
  }): Promise<{ score?: number; blocked?: boolean } | null> {
    if (!env.workerSafetyServiceUrl) return null;

    try {
      const res = await fetch(
        `${env.workerSafetyServiceUrl}/${input.workerId}/score?company_id=${input.companyId}`,
        { headers: { Authorization: `Bearer ${input.token}` } },
      );
      if (!res.ok) return null;
      const body = (await res.json()) as { score?: number; blocked?: boolean; accessBlocked?: boolean };
      return {
        score: body.score,
        blocked: body.blocked ?? body.accessBlocked,
      };
    } catch (err) {
      logger.warn('worker safety service unavailable', {
        error: err instanceof Error ? err.message : String(err),
      });
      return null;
    }
  },

  async recordWorkerExposure(input: {
    companyId: string;
    workerId: string;
    hazardId?: string;
    severity: number;
    likelihood: number;
    token: string;
  }): Promise<boolean> {
    if (!env.workerSafetyServiceUrl) return false;

    try {
      const res = await fetch(`${env.workerSafetyServiceUrl}/exposure`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${input.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          company_id: input.companyId,
          worker_id: input.workerId,
          hazard_id: input.hazardId,
          severity: input.severity,
          likelihood: input.likelihood,
        }),
      });
      return res.ok;
    } catch (err) {
      logger.warn('worker exposure record failed', {
        error: err instanceof Error ? err.message : String(err),
      });
      return false;
    }
  },

  async hasActiveEmergency(input: {
    projectId: string;
    companyId: string;
    token: string;
  }): Promise<boolean | null> {
    if (!env.emergencyResponseServiceUrl) return null;

    try {
      const res = await fetch(
        `${env.emergencyResponseServiceUrl}?company_id=${input.companyId}&project_id=${input.projectId}&status=active`,
        { headers: { Authorization: `Bearer ${input.token}` } },
      );
      if (res.status === 404) return false;
      if (!res.ok) return null;
      const body = (await res.json()) as { items?: unknown[]; active?: boolean };
      if (typeof body.active === 'boolean') return body.active;
      if (Array.isArray(body.items)) return body.items.length > 0;
      if (Array.isArray(body)) return body.length > 0;
      return false;
    } catch (err) {
      logger.warn('emergency response service unavailable', {
        error: err instanceof Error ? err.message : String(err),
      });
      return null;
    }
  },

  async declareEmergencyForSif(input: {
    companyId: string;
    projectId: string;
    incidentId: string;
    description?: string;
    token: string;
  }): Promise<{ declared: boolean; emergencyId?: string }> {
    if (!env.emergencyResponseServiceUrl) return { declared: false };

    try {
      const res = await fetch(`${env.emergencyResponseServiceUrl}/declare`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${input.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          company_id: input.companyId,
          project_id: input.projectId,
          type: 'safety_incident',
          severity: 'high',
          description: input.description ?? `SIF-potential incident ${input.incidentId}`,
        }),
      });
      if (!res.ok) {
        logger.warn('emergency declare failed', { status: res.status });
        return { declared: false };
      }
      const body = (await res.json()) as { id?: string };
      return { declared: true, emergencyId: body.id };
    } catch (err) {
      logger.warn('emergency declare unavailable', {
        error: err instanceof Error ? err.message : String(err),
      });
      return { declared: false };
    }
  },
};
