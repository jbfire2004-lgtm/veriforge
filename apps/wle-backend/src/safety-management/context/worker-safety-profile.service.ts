import { Injectable, NotFoundException, Optional } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PmWorkerSafetyProfileService } from '../../pm-worker-safety-profile/pm-worker-safety-profile.service';

@Injectable()
export class WorkerSafetyProfileService {
  constructor(
    private readonly prisma: PrismaService,
    @Optional() private readonly pmWorkerProfile?: PmWorkerSafetyProfileService,
  ) {}

  async getProfile(workerId: number, projectId?: number) {
    if (this.pmWorkerProfile) {
      const full = await this.pmWorkerProfile.getFullProfile(
        workerId,
        projectId,
      );
      const p = full.profile;
      return {
        workerId: full.identity.workerId,
        workerName: full.identity.name,
        trainingCompliance: (p?.trainingSnapshots ?? []).map((t) => ({
          courseCode: t.trainingCode,
          courseName: t.courseName,
          status: t.status,
          expiresAt: t.expiresAt?.toISOString(),
        })),
        openCailAssigned: 0,
        incidentInvolvement12mo: full.profile?.incidentHistory?.length ?? 0,
        bboAtRiskCount12mo: 0,
        riskScore: 100 - (p?.safetyScore ?? 100),
        safetyScore: p?.safetyScore ?? null,
        riskLevel: p?.riskLevel ?? null,
        lastFlhaDate: null,
        siteAccessStatus: full.accessEvaluation?.granted
          ? ('granted' as const)
          : ('denied' as const),
        denialReasons: (full.accessEvaluation?.denialReasons as string[]) ?? [],
        cailInsights: full.cailInsights,
      };
    }

    const worker = await this.prisma.worker.findUnique({
      where: { id: workerId },
      select: { id: true, firstName: true, lastName: true },
    });
    if (!worker) throw new NotFoundException('Worker not found');
    return {
      workerId,
      workerName: `${worker.firstName} ${worker.lastName}`,
      trainingCompliance: [],
      openCailAssigned: 0,
      incidentInvolvement12mo: 0,
      bboAtRiskCount12mo: 0,
      riskScore: 0,
      lastFlhaDate: null,
      siteAccessStatus: 'conditional' as const,
      denialReasons: [],
    };
  }
}
