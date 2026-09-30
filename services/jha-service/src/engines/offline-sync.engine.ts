import { Prisma } from '@prisma/client';
import type { OfflineSyncAction, OfflineSyncResult } from '../types';
import { jhaService } from '../services/jha.service';
import { jhaRepository } from '../models/jha.repository';
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

    const existing = await jhaRepository.findOfflineSync(deviceId, clientSyncId);
    if (existing?.status === 'synced') {
      const result = existing.result as Record<string, unknown> | null;
      return {
        clientSyncId,
        ok: true,
        action: action.action,
        jhaId: result?.jhaId as string | undefined,
        duplicate: true,
      };
    }

    try {
      let result: OfflineSyncResult;

      switch (action.action) {
        case 'create_jha':
          result = await this.handleCreateJha(companyId, userId, action);
          break;
        case 'add_hazards':
          result = await this.handleAddHazards(companyId, action);
          break;
        case 'add_controls':
          result = await this.handleAddControls(companyId, action);
          break;
        case 'sign':
          result = await this.handleSign(companyId, userId, action);
          break;
        case 'approve':
          result = await this.handleApprove(companyId, userId, action);
          break;
        default:
          result = {
            clientSyncId,
            ok: false,
            action: action.action,
            error: `Unknown action: ${action.action}`,
          };
      }

      await jhaRepository.upsertOfflineSync({
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

      await jhaRepository.upsertOfflineSync({
        companyId,
        deviceId,
        clientSyncId,
        action: action.action,
        payload: action.payload as Prisma.InputJsonValue,
        status: 'failed',
        result: { error: message } as Prisma.InputJsonValue,
      });

      return {
        clientSyncId,
        ok: false,
        action: action.action,
        error: message,
      };
    }
  }

  private async handleCreateJha(
    companyId: string,
    userId: string,
    action: OfflineSyncAction,
  ): Promise<OfflineSyncResult> {
    const p = action.payload;
    const jha = await jhaService.createJha({
      companyId,
      projectId: p.project_id as string,
      title: p.title as string,
      description: p.description as string | undefined,
      createdBy: userId,
    });
    return {
      clientSyncId: action.clientSyncId,
      ok: true,
      action: action.action,
      jhaId: jha.id,
    };
  }

  private async handleAddHazards(
    companyId: string,
    action: OfflineSyncAction,
  ): Promise<OfflineSyncResult> {
    const p = action.payload;
    const jhaId = p.jha_id as string;
    const hazards = p.hazards as Array<{
      hazard_id: string;
      severity: number;
      likelihood: number;
    }>;
    await jhaService.addHazards({ jhaId, companyId, hazards });
    return { clientSyncId: action.clientSyncId, ok: true, action: action.action, jhaId };
  }

  private async handleAddControls(
    companyId: string,
    action: OfflineSyncAction,
  ): Promise<OfflineSyncResult> {
    const p = action.payload;
    const jhaId = p.jha_id as string;
    const controls = p.controls as Array<{
      control_id: string;
      control_strength: number;
    }>;
    await jhaService.addControls({ jhaId, companyId, controls });
    return { clientSyncId: action.clientSyncId, ok: true, action: action.action, jhaId };
  }

  private async handleSign(
    companyId: string,
    userId: string,
    action: OfflineSyncAction,
  ): Promise<OfflineSyncResult> {
    const p = action.payload;
    const jhaId = p.jha_id as string;
    await jhaService.signJha({
      jhaId,
      companyId,
      workerId: (p.worker_id as string) ?? userId,
      signatureBlob: p.signature_blob as string,
    });
    return { clientSyncId: action.clientSyncId, ok: true, action: action.action, jhaId };
  }

  private async handleApprove(
    companyId: string,
    userId: string,
    action: OfflineSyncAction,
  ): Promise<OfflineSyncResult> {
    const p = action.payload;
    const jhaId = p.jha_id as string;
    await jhaService.approveJha({
      jhaId,
      companyId,
      approvedBy: userId,
      approved: p.approved !== false,
      notes: p.notes as string | undefined,
    });
    return { clientSyncId: action.clientSyncId, ok: true, action: action.action, jhaId };
  }
}

export const offlineSyncEngine = new OfflineSyncEngine();
