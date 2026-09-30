import { Prisma } from '@prisma/client';
import type { OfflineSyncAction, OfflineSyncResult } from '../types';
import { permitService } from '../services/permit.service';
import { permitRepository } from '../models/permit.repository';
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

    const existing = await permitRepository.findOfflineSync(deviceId, clientSyncId);
    if (existing?.status === 'synced') {
      const result = existing.result as Record<string, unknown> | null;
      return {
        clientSyncId,
        ok: true,
        action: action.action,
        permitId: result?.permitId as string | undefined,
        duplicate: true,
      };
    }

    try {
      let result: OfflineSyncResult;

      switch (action.action) {
        case 'create':
          result = await this.handleCreate(companyId, userId, action);
          break;
        case 'request_approval':
          result = await this.handleRequestApproval(companyId, token, action);
          break;
        case 'approve':
          result = await this.handleApprove(companyId, userId, token, action);
          break;
        case 'activate':
          result = await this.handleActivate(companyId, token, action);
          break;
        case 'suspend':
          result = await this.handleSuspend(companyId, action);
          break;
        case 'close':
          result = await this.handleClose(companyId, action);
          break;
        default:
          result = {
            clientSyncId,
            ok: false,
            action: action.action,
            error: `Unknown action: ${action.action}`,
          };
      }

      await permitRepository.upsertOfflineSync({
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

      await permitRepository.upsertOfflineSync({
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
    const permit = await permitService.create({
      companyId,
      projectId: p.project_id as string,
      workPackageId: p.work_package_id as string | undefined,
      pmTaskId: p.pm_task_id as string | undefined,
      permitType: (p.permit_type as string) ?? 'general',
      title: p.title as string,
      description: p.description as string | undefined,
      location: p.location as string | undefined,
      requestedBy: userId,
      workerId: p.worker_id as string | undefined,
      jhaId: p.jha_id as string | undefined,
      hazardId: p.hazard_id as string | undefined,
      controlId: p.control_id as string | undefined,
      equipmentId: p.equipment_id as string | undefined,
      validFrom: p.valid_from as string | undefined,
      validTo: p.valid_to as string | undefined,
    });
    return {
      clientSyncId: action.clientSyncId,
      ok: true,
      action: action.action,
      permitId: permit.id,
    };
  }

  private async handleRequestApproval(
    companyId: string,
    token: string,
    action: OfflineSyncAction,
  ): Promise<OfflineSyncResult> {
    const p = action.payload;
    const permit = await permitService.requestApproval({
      permitId: p.permit_id as string,
      companyId,
      token,
    });
    return {
      clientSyncId: action.clientSyncId,
      ok: true,
      action: action.action,
      permitId: permit.id,
    };
  }

  private async handleApprove(
    companyId: string,
    userId: string,
    token: string,
    action: OfflineSyncAction,
  ): Promise<OfflineSyncResult> {
    const p = action.payload;
    const permit = await permitService.approve({
      permitId: p.permit_id as string,
      companyId,
      approvedBy: userId,
      role: (p.role as string) ?? 'supervisor',
      outcome: (p.outcome as 'approved' | 'rejected') ?? 'approved',
      notes: p.notes as string | undefined,
      token,
      verifierRoles: (p.verifier_roles as string[]) ?? ['supervisor'],
    });
    return {
      clientSyncId: action.clientSyncId,
      ok: true,
      action: action.action,
      permitId: permit.id,
    };
  }

  private async handleActivate(
    companyId: string,
    token: string,
    action: OfflineSyncAction,
  ): Promise<OfflineSyncResult> {
    const p = action.payload;
    const permit = await permitService.activate({
      permitId: p.permit_id as string,
      companyId,
      token,
    });
    return {
      clientSyncId: action.clientSyncId,
      ok: true,
      action: action.action,
      permitId: permit.id,
    };
  }

  private async handleSuspend(
    companyId: string,
    action: OfflineSyncAction,
  ): Promise<OfflineSyncResult> {
    const p = action.payload;
    const permit = await permitService.suspend({
      permitId: p.permit_id as string,
      companyId,
      reason: p.reason as string | undefined,
    });
    return {
      clientSyncId: action.clientSyncId,
      ok: true,
      action: action.action,
      permitId: permit.id,
    };
  }

  private async handleClose(
    companyId: string,
    action: OfflineSyncAction,
  ): Promise<OfflineSyncResult> {
    const p = action.payload;
    const permit = await permitService.close({
      permitId: p.permit_id as string,
      companyId,
      notes: p.notes as string | undefined,
    });
    return {
      clientSyncId: action.clientSyncId,
      ok: true,
      action: action.action,
      permitId: permit.id,
    };
  }
}

export const offlineSyncEngine = new OfflineSyncEngine();
