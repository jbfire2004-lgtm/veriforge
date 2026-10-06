import { Injectable, NotFoundException, Optional } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PmProjectSafetyContextService } from '../../pm-project-safety-context/pm-project-safety-context.service';

@Injectable()
export class ProjectSafetyContextService {
  constructor(
    private readonly prisma: PrismaService,
    @Optional() private readonly pmContext?: PmProjectSafetyContextService,
  ) {}

  async getContext(projectId: number) {
    if (this.pmContext) {
      return this.pmContext.getProjectContext(projectId);
    }

    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: { site: true, company: { select: { id: true, name: true } } },
    });
    if (!project) throw new NotFoundException('Project not found');

    const [
      openCail,
      overdueCail,
      sifOpen,
      lastInspection,
      lastFlha,
      riskSnapshot,
      rules,
      plan,
    ] = await Promise.all([
      this.prisma.cailEntry.count({
        where: {
          projectId,
          status: { in: ['open', 'in_progress', 'overdue'] },
        },
      }),
      this.prisma.cailEntry.count({
        where: { projectId, status: 'overdue' },
      }),
      this.prisma.cailEntry.count({
        where: {
          projectId,
          status: { in: ['open', 'in_progress', 'overdue'] },
          OR: [{ severity: 'critical' }, { sourceType: 'sif' }],
        },
      }),
      this.prisma.safetyInspection.findFirst({
        where: { projectId, status: 'completed' },
        orderBy: { completedAt: 'desc' },
        select: { completedAt: true },
      }),
      this.prisma.safetyForm.findFirst({
        where: {
          projectId,
          definitionId: 'daily-flha',
          submittedAt: { not: null },
        },
        orderBy: { submittedAt: 'desc' },
        select: { submittedAt: true },
      }),
      this.prisma.projectSafetyRiskSnapshot.findFirst({
        where: { projectId },
        orderBy: { computedAt: 'desc' },
      }),
      this.prisma.siteAccessRule.findMany({
        where: { projectId, active: true },
      }),
      this.prisma.projectSafetyPlan.findUnique({ where: { projectId } }),
    ]);

    const requiredForms = Array.isArray(plan?.requiredDefinitionIds)
      ? (plan.requiredDefinitionIds as string[])
      : ['daily-flha'];

    return {
      projectId,
      ownerCompanyId: project.companyId,
      siteIds: project.siteId ? [project.siteId] : [],
      siteName: project.site?.name ?? null,
      companyName: project.company.name,
      activeWorkerCount: await this.prisma.projectAssignment.count({
        where: { projectId, status: 'ACTIVE' },
      }),
      openCailCount: openCail,
      overdueCailCount: overdueCail,
      sifOpenCount: sifOpen,
      lastInspectionAt: lastInspection?.completedAt?.toISOString() ?? null,
      lastFlhaAt: lastFlha?.submittedAt?.toISOString() ?? null,
      riskSnapshot: riskSnapshot
        ? {
            score: riskSnapshot.score,
            band: riskSnapshot.predictedLevel,
            computedAt: riskSnapshot.computedAt.toISOString(),
          }
        : null,
      requiredForms,
      zoneRules: rules,
    };
  }
}
