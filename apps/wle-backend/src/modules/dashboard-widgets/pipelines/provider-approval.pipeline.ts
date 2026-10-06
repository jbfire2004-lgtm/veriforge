import { Injectable } from '@nestjs/common';
import { ProviderApprovalStatus } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import type { ProviderApprovalWidgetData } from '../dashboard-widgets.types';

@Injectable()
export class ProviderApprovalPipeline {
  constructor(private readonly prisma: PrismaService) {}

  async run(): Promise<ProviderApprovalWidgetData> {
    const now = new Date();
    const expiringCutoff = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const [approved, pending, rejected, expiringApprovals] = await Promise.all([
      this.prisma.trainingProvider.count({
        where: { approvalStatus: ProviderApprovalStatus.APPROVED },
      }),
      this.prisma.trainingProvider.count({
        where: { approvalStatus: ProviderApprovalStatus.PENDING },
      }),
      this.prisma.trainingProvider.count({
        where: { approvalStatus: ProviderApprovalStatus.REJECTED },
      }),
      this.prisma.trainingInstructor.count({
        where: {
          active: true,
          qualificationExpiresAt: { lte: expiringCutoff, gt: now },
        },
      }),
    ]);

    return { approved, pending, rejected, expiringApprovals };
  }
}
