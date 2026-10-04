import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { BaseRepository } from './base.repository';

@Injectable()
export class ComplianceRepository extends BaseRepository {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async trainingExpiryCounts(companyId?: number) {
    const now = new Date();
    const d30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const workerFilter = companyId ? { worker: { companyId } } : {};

    const [expired, expiring30] = await Promise.all([
      this.prisma.trainingRecord.count({
        where: { expiresAt: { lte: now }, ...workerFilter },
      }),
      this.prisma.trainingRecord.count({
        where: { expiresAt: { gt: now, lte: d30 }, ...workerFilter },
      }),
    ]);

    return { expired, expiring30 };
  }
}
