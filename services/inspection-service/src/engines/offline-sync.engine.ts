import { Prisma } from '@prisma/client';
import type { OfflineSyncAction, OfflineSyncResult } from '../types';
import { inspectionService } from '../services/inspection.service';
import { inspectionRepository } from '../models/inspection.repository';
import { logger } from '../utils/logger';

export class OfflineSyncEngine {
  async processAction(input: {
    deviceId: string;
    companyId: string;
    userId: string;
    token: string;
    action: OfflineSyncAction;
  }): Promise<OfflineSyncResult> {
    const { action, deviceId, companyId, userId, token } = input;
    const { clientSyncId } = action;

    const existing = await inspectionRepository.findOfflineSync(deviceId, clientSyncId);
    if (existing?.status === 'synced') {
      const result = existing.result as Record<string, unknown> | null;
      return {
        clientSyncId,
        ok: true,
        action: action.action,
        inspectionId: result?.inspectionId as string | undefined,
        duplicate: true,
      };
    }

    try {
      let result: OfflineSyncResult;

      switch (action.action) {
        case 'create':
          result = await this.handleCreate(companyId, userId, action);
          break;
        case 'update':
          result = await this.handleUpdate(companyId, action);
          break;
        case 'submit_findings':
          result = await this.handleSubmitFindings(companyId, userId, token, action);
          break;
        case 'complete':
          result = await this.handleComplete(companyId, userId, token, action);
          break;
        case 'safety_gate':
          result = await this.handleSafetyGate(companyId, token, action);
          break;
        default:
          result = {
            clientSyncId,
            ok: false,
            action: action.action,
            error: `Unknown action: ${action.action}`,
          };
      }

      await inspectionRepository.upsertOfflineSync({
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

      await inspectionRepository.upsertOfflineSync({
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

  private async handleCreate(
    companyId: string,
    userId: string,
    action: OfflineSyncAction,
  ): Promise<OfflineSyncResult> {
    const p = action.payload;
    const inspection = await inspectionService.create({
      companyId,
      projectId: p.project_id as string,
      checklistType: (p.checklist_type as string) ?? 'general',
      title: p.title as string,
      description: p.description as string | undefined,
      checklistItems: p.checklist_items as Parameters<typeof inspectionService.create>[0]['checklistItems'],
      equipmentId: p.equipment_id as string | undefined,
      workerId: p.worker_id as string | undefined,
      inspectorId: p.inspector_id as string | undefined,
      location: p.location as string | undefined,
      scheduledAt: p.scheduled_at as string | undefined,
      createdBy: userId,
      schedule: p.schedule === true,
    });
    return {
      clientSyncId: action.clientSyncId,
      ok: true,
      action: action.action,
      inspectionId: inspection.id,
    };
  }

  private async handleUpdate(
    companyId: string,
    action: OfflineSyncAction,
  ): Promise<OfflineSyncResult> {
    const p = action.payload;
    const inspection = await inspectionService.update({
      id: p.inspection_id as string,
      companyId,
      title: p.title as string | undefined,
      description: p.description as string | undefined,
      checklistItems: p.checklist_items as Parameters<typeof inspectionService.update>[0]['checklistItems'],
      equipmentId: p.equipment_id as string | undefined,
      workerId: p.worker_id as string | undefined,
      inspectorId: p.inspector_id as string | undefined,
      location: p.location as string | undefined,
      scheduledAt: p.scheduled_at as string | undefined,
    });
    return {
      clientSyncId: action.clientSyncId,
      ok: true,
      action: action.action,
      inspectionId: inspection.id,
    };
  }

  private async handleSubmitFindings(
    companyId: string,
    userId: string,
    token: string,
    action: OfflineSyncAction,
  ): Promise<OfflineSyncResult> {
    const p = action.payload;
    const inspection = await inspectionService.submitFindings({
      id: p.inspection_id as string,
      companyId,
      userId,
      token,
      findings: p.findings as Parameters<typeof inspectionService.submitFindings>[0]['findings'],
      autoCreateCapa: p.auto_create_capa !== false,
    });
    return {
      clientSyncId: action.clientSyncId,
      ok: true,
      action: action.action,
      inspectionId: inspection.id,
    };
  }

  private async handleComplete(
    companyId: string,
    userId: string,
    token: string,
    action: OfflineSyncAction,
  ): Promise<OfflineSyncResult> {
    const p = action.payload;
    const inspection = await inspectionService.complete({
      id: p.inspection_id as string,
      companyId,
      userId,
      token,
    });
    return {
      clientSyncId: action.clientSyncId,
      ok: true,
      action: action.action,
      inspectionId: inspection.id,
    };
  }

  private async handleSafetyGate(
    companyId: string,
    token: string,
    action: OfflineSyncAction,
  ): Promise<OfflineSyncResult> {
    const p = action.payload;
    const result = await inspectionService.safetyGateCheck({
      id: p.inspection_id as string,
      companyId,
      token,
    });
    return {
      clientSyncId: action.clientSyncId,
      ok: true,
      action: action.action,
      inspectionId: result.inspectionId,
    };
  }
}

export const offlineSyncEngine = new OfflineSyncEngine();
