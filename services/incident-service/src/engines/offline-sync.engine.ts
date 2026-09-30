import { Prisma } from '@prisma/client';
import type { OfflineSyncAction, OfflineSyncResult } from '../types';
import { incidentService } from '../services/incident.service';
import { incidentRepository } from '../models/incident.repository';
import { logger } from '../utils/logger';

export class OfflineSyncEngine {
  async processAction(input: {
    deviceId: string;
    companyId: string;
    userId: string;
    action: OfflineSyncAction;
    token: string;
  }): Promise<OfflineSyncResult> {
    const { action, deviceId, companyId, userId, token } = input;
    const { clientSyncId } = action;

    const existing = await incidentRepository.findOfflineSync(deviceId, clientSyncId);
    if (existing?.status === 'synced') {
      const result = existing.result as Record<string, unknown> | null;
      return {
        clientSyncId,
        ok: true,
        action: action.action,
        incidentId: result?.incidentId as string | undefined,
        duplicate: true,
      };
    }

    try {
      let result: OfflineSyncResult;

      switch (action.action) {
        case 'report':
          result = await this.handleReport(companyId, userId, action, token);
          break;
        case 'investigate':
          result = await this.handleInvestigate(companyId, userId, action);
          break;
        case 'close':
          result = await this.handleClose(companyId, userId, action);
          break;
        case 'link_corrective_action':
          result = await this.handleLinkCapa(companyId, userId, action, token);
          break;
        case 'add_witness':
          result = await this.handleAddWitness(companyId, userId, action);
          break;
        default:
          result = {
            clientSyncId,
            ok: false,
            action: action.action,
            error: `Unknown action: ${action.action}`,
          };
      }

      await incidentRepository.upsertOfflineSync({
        companyId,
        deviceId,
        clientSyncId,
        action: action.action,
        payload: action.payload as Prisma.InputJsonValue,
        status: result.ok ? 'synced' : 'failed',
        result: result as unknown as Prisma.InputJsonValue,
      });

      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error('offline sync action failed', { clientSyncId, action: action.action, error: message });

      await incidentRepository.upsertOfflineSync({
        companyId,
        deviceId,
        clientSyncId,
        action: action.action,
        payload: action.payload as Prisma.InputJsonValue,
        status: 'failed',
        result: { error: message } as Prisma.InputJsonValue,
      });

      return { clientSyncId, ok: false, action: action.action, error: message };
    }
  }

  private async handleReport(
    companyId: string,
    userId: string,
    action: OfflineSyncAction,
    token: string,
  ): Promise<OfflineSyncResult> {
    const p = action.payload;
    const incident = await incidentService.report({
      companyId,
      projectId: p.project_id as string,
      incidentType: (p.incident_type as string) ?? 'near_miss',
      title: p.title as string,
      description: p.description as string | undefined,
      severity: (p.severity as 'low' | 'medium' | 'high' | 'critical') ?? 'medium',
      location: p.location as string | undefined,
      occurredAt: (p.occurred_at as string) ?? new Date().toISOString(),
      latitude: p.latitude as number | undefined,
      longitude: p.longitude as number | undefined,
      workerId: p.worker_id as string | undefined,
      equipmentId: p.equipment_id as string | undefined,
      likelihoodLevel: p.likelihood_level as number | undefined,
      witnesses: p.witnesses as Parameters<typeof incidentService.report>[0]['witnesses'],
      reportedBy: userId,
      token,
      autoCreateCapa: p.auto_create_capa === true,
    });
    return {
      clientSyncId: action.clientSyncId,
      ok: true,
      action: action.action,
      incidentId: incident.id,
    };
  }

  private async handleInvestigate(
    companyId: string,
    userId: string,
    action: OfflineSyncAction,
  ): Promise<OfflineSyncResult> {
    const p = action.payload;
    const incident = await incidentService.investigate({
      incidentId: p.incident_id as string,
      companyId,
      investigatedBy: userId,
      findings: p.findings as string,
      rootCause: p.root_cause as string | undefined,
      method: p.method as string | undefined,
      recommendations: p.recommendations as string | undefined,
    });
    return {
      clientSyncId: action.clientSyncId,
      ok: true,
      action: action.action,
      incidentId: incident.id,
    };
  }

  private async handleClose(
    companyId: string,
    userId: string,
    action: OfflineSyncAction,
  ): Promise<OfflineSyncResult> {
    const p = action.payload;
    const incident = await incidentService.close({
      incidentId: p.incident_id as string,
      companyId,
      closedBy: userId,
      closeNotes: p.close_notes as string | undefined,
    });
    return {
      clientSyncId: action.clientSyncId,
      ok: true,
      action: action.action,
      incidentId: incident.id,
    };
  }

  private async handleLinkCapa(
    companyId: string,
    userId: string,
    action: OfflineSyncAction,
    token: string,
  ): Promise<OfflineSyncResult> {
    const p = action.payload;
    const incident = await incidentService.linkCorrectiveActions({
      incidentId: p.incident_id as string,
      companyId,
      linkedBy: userId,
      correctiveActionIds: (p.corrective_action_ids as string[]) ?? [],
      token,
      createIfMissing: p.create_if_missing as
        | Parameters<typeof incidentService.linkCorrectiveActions>[0]['createIfMissing']
        | undefined,
    });
    return {
      clientSyncId: action.clientSyncId,
      ok: true,
      action: action.action,
      incidentId: incident.id,
    };
  }

  private async handleAddWitness(
    companyId: string,
    userId: string,
    action: OfflineSyncAction,
  ): Promise<OfflineSyncResult> {
    const p = action.payload;
    const incident = await incidentService.addWitness({
      incidentId: p.incident_id as string,
      companyId,
      createdBy: userId,
      name: p.name as string | undefined,
      contact: p.contact as string | undefined,
      workerId: p.worker_id as string | undefined,
      statement: p.statement as string | undefined,
    });
    return {
      clientSyncId: action.clientSyncId,
      ok: true,
      action: action.action,
      incidentId: incident.id,
    };
  }
}

export const offlineSyncEngine = new OfflineSyncEngine();
