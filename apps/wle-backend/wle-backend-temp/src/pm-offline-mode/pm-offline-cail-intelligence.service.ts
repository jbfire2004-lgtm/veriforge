import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PmOfflineCailIntelligenceService {
  constructor(private readonly prisma: PrismaService) {}

  async deviceScores(deviceId: string, projectId?: number) {
    const since = new Date(Date.now() - 7 * 86400000);
    const where = { deviceId, createdAt: { gte: since } };

    const [pending, conflicts, failed, total] = await Promise.all([
      this.prisma.pmOfflineCache.count({
        where: {
          deviceId,
          syncStatus: { in: ['pending_sync', 'syncing'] },
        },
      }),
      this.prisma.pmOfflineConflict.count({
        where: { deviceId, resolvedAt: null },
      }),
      this.prisma.pmOfflineCache.count({
        where: {
          deviceId,
          syncStatus: 'conflict',
          ...(projectId ? { projectId } : {}),
        },
      }),
      this.prisma.pmOfflineAuditLog.count({ where }),
    ]);

    const syncAttempts = await this.prisma.pmOfflineAuditLog.count({
      where: { ...where, eventType: 'sync_batch' },
    });
    const syncSuccess = await this.prisma.pmOfflineAuditLog.count({
      where: { ...where, eventType: 'sync_batch_complete' },
    });

    const offlineRiskScore = Math.min(
      100,
      pending * 8 + conflicts * 15 + failed * 12,
    );
    const queuePressure =
      pending > 10 ? 'high' : pending > 3 ? 'medium' : 'low';

    return {
      offlineRiskScore,
      queuePressure,
      pendingSyncCount: pending,
      openConflictCount: conflicts,
      conflictCacheCount: failed,
      syncSuccessRate: syncAttempts > 0 ? syncSuccess / syncAttempts : 1,
      offlineHazardScore: Math.min(100, conflicts * 20 + failed * 10),
      offlineEquipmentScore: Math.min(
        100,
        (await this.moduleActionCount(deviceId, 'pmEquipment.sync')) * 12,
      ),
      offlineAccessScore: Math.min(
        100,
        (await this.moduleActionCount(deviceId, 'pmSiteAccess.sync')) * 10,
      ),
      auditEvents7d: total,
    };
  }

  private async moduleActionCount(deviceId: string, moduleType: string) {
    return this.prisma.pmOfflineCache.count({
      where: { deviceId, moduleType, syncStatus: 'conflict' },
    });
  }
}
