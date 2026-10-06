import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SafetyFormAnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async dashboard(companyId?: number) {
    const where = companyId ? { companyId } : {};
    const [total, byStatus, byDefinition, sifCount, hecaCount, openActions] =
      await Promise.all([
        this.prisma.safetyForm.count({ where }),
        this.prisma.safetyForm.groupBy({
          by: ['status'],
          where,
          _count: true,
        }),
        this.prisma.safetyForm.groupBy({
          by: ['definitionId'],
          where,
          _count: true,
        }),
        this.prisma.safetyForm.count({ where: { ...where, sifFlag: true } }),
        this.prisma.safetyForm.count({ where: { ...where, hecaFlag: true } }),
        this.prisma.safetyFormAction.count({
          where: {
            status: 'OPEN',
            form: companyId ? { companyId } : undefined,
          },
        }),
      ]);

    return {
      total,
      byStatus: Object.fromEntries(byStatus.map((r) => [r.status, r._count])),
      byDefinition: Object.fromEntries(
        byDefinition.map((r) => [r.definitionId, r._count]),
      ),
      sifCount,
      hecaCount,
      openCorrectiveActions: openActions,
    };
  }

  async leadingLagging(companyId?: number) {
    const forms = await this.prisma.safetyForm.findMany({
      where: {
        companyId,
        definitionId: { in: ['leading-indicator', 'lagging-indicator'] },
      },
      select: { definitionId: true, formData: true, submittedAt: true },
      orderBy: { submittedAt: 'desc' },
      take: 100,
    });
    return { indicators: forms };
  }
}
