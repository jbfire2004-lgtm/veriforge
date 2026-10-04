import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  FieldSyncBatchProcessor,
  type BatchActionInput,
} from './field-sync-batch.processor';
import { FieldSyncDeltaService } from './field-sync-delta.service';
import { FieldOfflineBundleService } from './field-offline-bundle.service';
import { coreOfflineSyncBatchDelegate } from './field-sync.prisma';

@Injectable()
export class FieldSyncService {
  private readonly logger = new Logger(FieldSyncService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly processor: FieldSyncBatchProcessor,
    private readonly delta: FieldSyncDeltaService,
    private readonly offlineBundle: FieldOfflineBundleService,
  ) {}

  async registerOfflineScan(
    body: Record<string, unknown>,
    actorUserId?: number,
  ) {
    const deviceId = String(body.deviceId ?? body.clientId ?? 'unknown');
    const companyId =
      typeof body.companyId === 'number' ? body.companyId : undefined;
    const workerId =
      typeof body.workerId === 'number' ? body.workerId : undefined;

    const batch = await coreOfflineSyncBatchDelegate(this.prisma).create({
      data: {
        deviceId,
        companyId: companyId ?? null,
        workerId: workerId ?? null,
        moduleType: String(body.moduleType ?? 'field_scan'),
        status: 'PENDING',
        itemCount: 1,
        payload: body as object,
        submittedById: actorUserId ?? null,
      },
    });

    this.logger.log(
      JSON.stringify({
        type: 'field.offline_registry',
        batchId: batch.id,
        deviceId,
      }),
    );

    return {
      accepted: true,
      batchId: batch.id,
      tempId: body.tempId ?? null,
      receivedAt: new Date().toISOString(),
    };
  }

  async processBatch(
    actions: BatchActionInput[],
    actorUserId = 0,
    meta?: { batchId?: string; clientId?: string },
  ) {
    const deviceId = meta?.clientId ?? 'field-client';
    const batchRow = await coreOfflineSyncBatchDelegate(this.prisma).create({
      data: {
        deviceId,
        moduleType: 'field_sync',
        status: 'PROCESSING',
        itemCount: actions.length,
        payload: { actions: actions.map((a) => a.type) },
        submittedById: actorUserId || null,
      },
    });

    const results = [];
    for (const action of actions) {
      const result = await this.processor.processOne(action, actorUserId);
      results.push(result);
    }

    const failed = results.filter((r) => !r.ok).length;
    await coreOfflineSyncBatchDelegate(this.prisma).update({
      where: { id: batchRow.id },
      data: {
        status: failed > 0 ? 'CONFLICT' : 'COMPLETED',
        processedAt: new Date(),
        errorMessage: failed > 0 ? `${failed} action(s) failed` : null,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        actorId: actorUserId || null,
        action: 'field.sync.batch',
        entityType: 'FieldSyncBatch',
        metadataJson: {
          batchId: meta?.batchId,
          clientId: meta?.clientId,
          total: actions.length,
          failed,
          types: actions.map((a) => a.type),
        },
      },
    });

    return {
      processed: results.length,
      failed,
      results,
      syncedAt: new Date().toISOString(),
    };
  }

  fetchDelta(params: { companyId?: number; since?: string }) {
    const since = params.since ? new Date(params.since) : undefined;
    return this.delta.fetchDelta({ companyId: params.companyId, since });
  }

  fetchOfflineBundle(params: { companyId?: number; workerId?: number }) {
    return this.offlineBundle.fetchBundle(params);
  }
}
