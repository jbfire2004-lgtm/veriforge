import type { PrismaService } from '../../prisma/prisma.service';

export type CoreOfflineSyncBatchRow = {
  id: string;
  deviceId: string;
  workerId: number | null;
  companyId: number | null;
  moduleType: string;
  status: string;
  itemCount: number;
  payload: unknown;
  submittedById: number | null;
  submittedAt: Date;
  processedAt: Date | null;
  errorMessage: string | null;
};

type OfflineBatchDelegate = {
  create: (args: {
    data: Record<string, unknown>;
  }) => Promise<CoreOfflineSyncBatchRow>;
  update: (args: {
    where: { id: string };
    data: Record<string, unknown>;
  }) => Promise<CoreOfflineSyncBatchRow>;
};

export function coreOfflineSyncBatchDelegate(
  prisma: PrismaService,
): OfflineBatchDelegate {
  return (prisma as unknown as { coreOfflineSyncBatch: OfflineBatchDelegate })
    .coreOfflineSyncBatch;
}
