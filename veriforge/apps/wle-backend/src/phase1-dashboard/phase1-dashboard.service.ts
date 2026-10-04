import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const EXPIRING_WINDOW_DAYS = 30;

export type Phase1RecentUploadDto = {
  kind: 'document' | 'training-ingest';
  id: number;
  label: string;
  sublabel: string | null;
  createdAt: string;
  /** Relative path on the Next app (when known). */
  path: string | null;
};

export type Phase1DashboardSummaryDto = {
  workerCount: number;
  companyCount: number;
  trainingRecordCount: number;
  /** Training records with expiry in the past or within the next 30 days (requires `expiresAt`). */
  trainingAttentionCount: number;
  /** Credentials with expiry in the past or within the next 30 days (requires `expiresAt`). */
  credentialAttentionCount: number;
  equipmentCount: number;
  unsafeEquipmentCount: number;
  recentUploads: Phase1RecentUploadDto[];
};

@Injectable()
export class Phase1DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardSummary(): Promise<Phase1DashboardSummaryDto> {
    const now = new Date();
    const horizon = new Date(now);
    horizon.setDate(horizon.getDate() + EXPIRING_WINDOW_DAYS);

    const [
      workerCount,
      companyCount,
      trainingRecordCount,
      trainingExpiryAttention,
      trainingValidationAttention,
      trainingVerificationAttention,
      credentialAttentionCount,
      equipmentCount,
      unsafeEquipmentCount,
      recentDocs,
      recentIngestions,
    ] = await Promise.all([
      this.prisma.worker.count(),
      this.prisma.company.count(),
      this.prisma.trainingRecord.count(),
      this.prisma.trainingRecord.count({
        where: {
          expiresAt: {
            not: null,
            lte: horizon,
          },
        },
      }),
      this.prisma.trainingValidationResult.count({
        where: {
          outcome: { in: ['PENDING', 'NEEDS_REVIEW'] },
        },
      }),
      this.prisma.trainingRecord.count({
        where: {
          lastVerificationStatus: { in: ['ATTENTION', 'INVALID'] },
        },
      }),
      this.prisma.credential.count({
        where: {
          expiresAt: {
            not: null,
            lte: horizon,
          },
        },
      }),
      this.prisma.equipment.count(),
      this.prisma.equipment.count({
        where: { safetyStatus: 'UNSAFE' },
      }),
      this.prisma.document.findMany({
        where: { deleted: false },
        orderBy: { createdAt: 'desc' },
        take: 12,
        select: {
          id: true,
          name: true,
          type: true,
          createdAt: true,
          workerId: true,
          companyId: true,
        },
      }),
      this.prisma.trainingIngestionRun.findMany({
        orderBy: { createdAt: 'desc' },
        take: 12,
        select: {
          id: true,
          originalFilename: true,
          status: true,
          createdAt: true,
          companyId: true,
        },
      }),
    ]);

    const uploads: Phase1RecentUploadDto[] = [];

    for (const d of recentDocs) {
      uploads.push({
        kind: 'document',
        id: d.id,
        label: d.name,
        sublabel: d.type,
        createdAt: d.createdAt.toISOString(),
        path:
          d.workerId != null
            ? `/workers/${d.workerId}`
            : d.companyId != null
            ? `/companies/${d.companyId}`
            : null,
      });
    }

    for (const r of recentIngestions) {
      uploads.push({
        kind: 'training-ingest',
        id: r.id,
        label: r.originalFilename,
        sublabel: r.status,
        createdAt: r.createdAt.toISOString(),
        path:
          r.companyId != null
            ? `/companies/${r.companyId}`
            : '/core/training-ingest',
      });
    }

    uploads.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    const trainingAttentionCount =
      trainingExpiryAttention +
      trainingValidationAttention +
      trainingVerificationAttention;

    return {
      workerCount,
      companyCount,
      trainingRecordCount,
      trainingAttentionCount,
      credentialAttentionCount,
      equipmentCount,
      unsafeEquipmentCount,
      recentUploads: uploads.slice(0, 12),
    };
  }
}
