import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PmCapaIntelligenceService {
  constructor(private readonly prisma: PrismaService) {}

  async projectForecast(projectId: number) {
    const open = await this.prisma.pmCorrectiveAction.findMany({
      where: {
        projectId,
        status: { notIn: ['verified', 'closed', 'cancelled'] },
        deletedAt: null,
      },
      select: { priorityScore: true, dueAt: true, sourceModule: true },
    });

    const overdueRisk = open.filter(
      (a) => a.dueAt && a.dueAt < new Date(),
    ).length;
    const avgPriority =
      open.length > 0
        ? Math.round(
            open.reduce((s, a) => s + a.priorityScore, 0) / open.length,
          )
        : 0;

    const crossForm = await this.prisma.pmCorrectiveAction.groupBy({
      by: ['sourceModule'],
      where: { projectId, deletedAt: null },
      _count: true,
    });

    return {
      openCount: open.length,
      overdueRisk,
      averagePriority: avgPriority,
      predictedEscalations: Math.min(
        open.length,
        overdueRisk * 2 + (avgPriority > 70 ? 3 : 0),
      ),
      crossFormCorrelation: crossForm,
      explainability: [
        {
          rule: 'escalation_forecast',
          detail: `overdue(${overdueRisk}) * 2 + high_priority_boost`,
        },
      ],
    };
  }
}
