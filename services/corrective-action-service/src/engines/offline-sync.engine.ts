import { Prisma } from '@prisma/client';
import type { OfflineSyncAction, OfflineSyncResult } from '../types';
import { correctiveActionService } from '../services/corrective-action.service';
import { capaRepository } from '../models/capa.repository';
import { logger } from '../utils/logger';

export class OfflineSyncEngine {
  async processAction(input: {
    deviceId: string;
    companyId: string;
    userId: string;
    action: OfflineSyncAction;
  }): Promise<OfflineSyncResult> {
    const { action, deviceId, companyId, userId } = input;
    const { clientSyncId } = action;

    const existing = await capaRepository.findOfflineSync(deviceId, clientSyncId);
    if (existing?.status === 'synced') {
      const result = existing.result as Record<string, unknown> | null;
      return {
        clientSyncId,
        ok: true,
        action: action.action,
        correctiveActionId: result?.correctiveActionId as string | undefined,
        duplicate: true,
      };
    }

    try {
      let result: OfflineSyncResult;

      switch (action.action) {
        case 'create':
          result = await this.handleCreate(companyId, userId, action);
          break;
        case 'assign':
          result = await this.handleAssign(companyId, userId, action);
          break;
        case 'escalate':
          result = await this.handleEscalate(companyId, action);
          break;
        case 'verify':
          result = await this.handleVerify(companyId, userId, action);
          break;
        case 'add_attachment':
          result = await this.handleAttachment(companyId, action);
          break;
        default:
          result = {
            clientSyncId,
            ok: false,
            action: action.action,
            error: `Unknown action: ${action.action}`,
          };
      }

      await capaRepository.upsertOfflineSync({
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

      await capaRepository.upsertOfflineSync({
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
    const capa = await correctiveActionService.create({
      companyId,
      projectId: p.project_id as string,
      sourceType: p.source_type as string,
      sourceId: p.source_id as string,
      actionType: (p.action_type as string) ?? 'permanent',
      title: p.title as string,
      description: p.description as string | undefined,
      severity: (p.severity as string) ?? 'medium',
      createdBy: userId,
      hazardId: p.hazard_id as string | undefined,
      controlId: p.control_id as string | undefined,
      equipmentId: p.equipment_id as string | undefined,
      workerId: p.worker_id as string | undefined,
      moduleLinks: p.module_links as Parameters<typeof correctiveActionService.create>[0]['moduleLinks'],
      attachments: p.attachments as Parameters<typeof correctiveActionService.create>[0]['attachments'],
      publish: p.publish !== false,
    });
    return {
      clientSyncId: action.clientSyncId,
      ok: true,
      action: action.action,
      correctiveActionId: capa.id,
    };
  }

  private async handleAssign(
    companyId: string,
    userId: string,
    action: OfflineSyncAction,
  ): Promise<OfflineSyncResult> {
    const p = action.payload;
    const capa = await correctiveActionService.assign({
      correctiveActionId: p.corrective_action_id as string,
      companyId,
      assigneeId: p.assignee_id as string,
      assignedBy: userId,
    });
    return {
      clientSyncId: action.clientSyncId,
      ok: true,
      action: action.action,
      correctiveActionId: capa.id,
    };
  }

  private async handleEscalate(
    companyId: string,
    action: OfflineSyncAction,
  ): Promise<OfflineSyncResult> {
    const p = action.payload;
    const capa = await correctiveActionService.escalate({
      correctiveActionId: p.corrective_action_id as string,
      companyId,
      reason: p.reason as string | undefined,
      level: p.level as number | undefined,
    });
    return {
      clientSyncId: action.clientSyncId,
      ok: true,
      action: action.action,
      correctiveActionId: capa.id,
    };
  }

  private async handleVerify(
    companyId: string,
    userId: string,
    action: OfflineSyncAction,
  ): Promise<OfflineSyncResult> {
    const p = action.payload;
    const capa = await correctiveActionService.verify({
      correctiveActionId: p.corrective_action_id as string,
      companyId,
      verifiedBy: userId,
      notes: p.notes as string | undefined,
      outcome: (p.outcome as 'approved' | 'rejected') ?? 'approved',
      verifierRoles: (p.verifier_roles as string[]) ?? ['supervisor'],
    });
    return {
      clientSyncId: action.clientSyncId,
      ok: true,
      action: action.action,
      correctiveActionId: capa.id,
    };
  }

  private async handleAttachment(
    companyId: string,
    action: OfflineSyncAction,
  ): Promise<OfflineSyncResult> {
    const p = action.payload;
    const capa = await correctiveActionService.addAttachment({
      correctiveActionId: p.corrective_action_id as string,
      companyId,
      attachment: {
        fileName: p.file_name as string | undefined,
        mimeType: p.mime_type as string | undefined,
        storageKey: p.storage_key as string | undefined,
        dataUrl: p.data_url as string | undefined,
        phase: (p.phase as string) ?? 'evidence',
      },
    });
    return {
      clientSyncId: action.clientSyncId,
      ok: true,
      action: action.action,
      correctiveActionId: capa.id,
    };
  }
}

export const offlineSyncEngine = new OfflineSyncEngine();
