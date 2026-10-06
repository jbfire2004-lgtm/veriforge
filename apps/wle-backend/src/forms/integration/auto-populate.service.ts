import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export type AutoPopulateContext = {
  workerId?: number;
  projectId?: number;
  companyId?: number;
  equipmentId?: number;
  userId?: number;
};

@Injectable()
export class AutoPopulateService {
  constructor(private readonly prisma: PrismaService) {}

  async buildContext(
    ctx: AutoPopulateContext,
  ): Promise<Record<string, unknown>> {
    const out: Record<string, unknown> = {
      workDate: new Date().toISOString().slice(0, 10),
    };

    if (ctx.workerId) {
      const worker = await this.prisma.worker.findUnique({
        where: { id: ctx.workerId },
        include: { company: { select: { id: true, name: true } } },
      });
      if (!worker) return out;
      out.workerId = worker.id;
      out.workerName = `${worker.firstName} ${worker.lastName}`;
      out.companyId = worker.companyId ?? ctx.companyId;
      out.companyName = worker.company?.name;

      const training = await this.prisma.trainingRecord.findMany({
        where: { workerId: worker.id },
        orderBy: { completedAt: 'desc' },
        take: 5,
        select: {
          id: true,
          completedAt: true,
          expiresAt: true,
          certification: { select: { name: true } },
        },
      });
      out.recentTraining = training;

      const competency = await this.prisma.competencyEvaluation.findMany({
        where: { workerId: worker.id },
        orderBy: { evaluationDate: 'desc' },
        take: 5,
        select: { id: true, passed: true, evaluationDate: true, score: true },
      });
      out.recentCompetency = competency;
    }

    if (ctx.projectId) {
      const project = await this.prisma.project.findUnique({
        where: { id: ctx.projectId },
        include: {
          company: { select: { id: true, name: true } },
          site: { select: { id: true, name: true } },
        },
      });
      if (!project) {
        // PM pages often default to projectId=1 before a demo project is seeded.
        return out;
      }
      out.projectId = project.id;
      out.projectName = project.name;
      out.projectCode = project.code;
      out.siteId = project.siteId;
      out.siteName = project.site?.name;
      out.companyId = out.companyId ?? project.companyId;
      out.companyName = out.companyName ?? project.company?.name;
    }

    if (ctx.equipmentId) {
      const equipment = await this.prisma.equipment.findUnique({
        where: { id: ctx.equipmentId },
      });
      if (!equipment) return out;
      out.equipmentId = equipment.id;
      out.equipmentName = equipment.name;
      out.equipmentAssetTag = equipment.assetTag;
      out.equipmentSafetyStatus = equipment.safetyStatus;
      out.equipmentComplianceStatus = equipment.complianceStatus;
    }

    return out;
  }
}
