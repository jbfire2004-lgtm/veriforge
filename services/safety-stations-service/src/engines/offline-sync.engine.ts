import { Prisma, AccessLogResult, OfflineSyncStatus } from '@prisma/client';
import type { OfflineSyncAction, OfflineSyncResult } from '../types';
import { stationRepository } from '../models/station.repository';
import { stationService } from '../services/station.service';
import { logger } from '../utils/logger';

export class OfflineSyncEngine {
  async processAction(input: {
    stationId: string;
    companyId: string;
    token: string;
    action: OfflineSyncAction;
  }): Promise<OfflineSyncResult> {
    const { action, stationId, companyId, token } = input;
    const { clientSyncId } = action;

    const existing = await stationRepository.findOfflineSync(stationId, clientSyncId);
    if (existing?.status === OfflineSyncStatus.synced) {
      return {
        clientSyncId,
        ok: true,
        action: action.action,
        duplicate: true,
      };
    }

    try {
      let result: OfflineSyncResult;

      switch (action.action) {
        case 'heartbeat':
          result = await this.handleHeartbeat(companyId, stationId, action);
          break;
        case 'validate_worker':
          result = await this.handleValidateWorker(companyId, stationId, token, action);
          break;
        case 'validate_equipment':
          result = await this.handleValidateEquipment(companyId, stationId, token, action);
          break;
        case 'muster_checkin':
          result = await this.handleMusterCheckin(companyId, stationId, action);
          break;
        case 'access_log':
          result = await this.handleAccessLog(stationId, action);
          break;
        default:
          result = {
            clientSyncId,
            ok: false,
            action: action.action,
            error: `Unknown action: ${action.action}`,
          };
      }

      await stationRepository.upsertOfflineSync({
        stationId,
        companyId,
        clientSyncId,
        action: action.action,
        payload: action.payload as Prisma.InputJsonValue,
        status: result.ok ? OfflineSyncStatus.synced : OfflineSyncStatus.failed,
        result: result as unknown as Prisma.InputJsonValue,
      });

      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error('offline sync failed', { clientSyncId, action: action.action, error: message });

      await stationRepository.upsertOfflineSync({
        stationId,
        companyId,
        clientSyncId,
        action: action.action,
        payload: action.payload as Prisma.InputJsonValue,
        status: OfflineSyncStatus.failed,
        result: { error: message } as Prisma.InputJsonValue,
      });

      return { clientSyncId, ok: false, action: action.action, error: message };
    }
  }

  private async handleHeartbeat(
    companyId: string,
    stationId: string,
    action: OfflineSyncAction,
  ): Promise<OfflineSyncResult> {
    const p = action.payload;
    await stationService.heartbeat({
      companyId,
      stationId,
      firmwareVersion: p.firmware_version as string | undefined,
      recordedAt: p.recorded_at as string | undefined,
    });
    return { clientSyncId: action.clientSyncId, ok: true, action: action.action };
  }

  private async handleValidateWorker(
    companyId: string,
    stationId: string,
    token: string,
    action: OfflineSyncAction,
  ): Promise<OfflineSyncResult> {
    const p = action.payload;
    const result = await stationService.validateWorker({
      companyId,
      stationId,
      workerId: p.worker_id as string,
      requiredJhaIds: p.required_jha_ids as string[] | undefined,
      workerContext: p.worker_context as Record<string, unknown> | undefined,
      recordedAt: p.recorded_at as string | undefined,
    }, token);

    return {
      clientSyncId: action.clientSyncId,
      ok: result.granted,
      action: action.action,
      error: result.granted ? undefined : result.reason,
    };
  }

  private async handleValidateEquipment(
    companyId: string,
    stationId: string,
    token: string,
    action: OfflineSyncAction,
  ): Promise<OfflineSyncResult> {
    const p = action.payload;
    const result = await stationService.validateEquipment({
      companyId,
      stationId,
      equipmentId: p.equipment_id as string,
      equipmentContext: p.equipment_context as Record<string, unknown> | undefined,
      recordedAt: p.recorded_at as string | undefined,
    }, token);

    return {
      clientSyncId: action.clientSyncId,
      ok: result.granted,
      action: action.action,
      error: result.granted ? undefined : result.reason,
    };
  }

  private async handleMusterCheckin(
    companyId: string,
    stationId: string,
    action: OfflineSyncAction,
  ): Promise<OfflineSyncResult> {
    const p = action.payload;
    await stationService.musterCheckin({
      companyId,
      stationId,
      workerId: p.worker_id as string,
      musterPoint: p.muster_point as string,
      notes: p.notes as string | undefined,
      checkedInAt: p.checked_in_at as string | undefined,
    });
    return { clientSyncId: action.clientSyncId, ok: true, action: action.action };
  }

  private async handleAccessLog(
    stationId: string,
    action: OfflineSyncAction,
  ): Promise<OfflineSyncResult> {
    const p = action.payload;
    await stationRepository.createAccessLog({
      stationId,
      workerId: p.worker_id as string | undefined,
      equipmentId: p.equipment_id as string | undefined,
      result: (p.result as string) === 'granted' ? AccessLogResult.granted : AccessLogResult.denied,
      reason: p.reason as string | undefined,
      timestamp: p.timestamp ? new Date(p.timestamp as string) : undefined,
    });
    return { clientSyncId: action.clientSyncId, ok: true, action: action.action };
  }
}

export const offlineSyncEngine = new OfflineSyncEngine();
