import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { OrientationRequirementService } from './orientation-requirement.service';
import { OrientationCompletionService } from './orientation-completion.service';
import type { WorkerOrientationGatingStatus } from './orientation.types';
import { isNearExpiry } from './orientation-validation';

@Injectable()
export class WorkerOrientationProfileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly requirements: OrientationRequirementService,
    private readonly completions: OrientationCompletionService,
  ) {}

  async getProfile(
    workerId: number,
    opts?: {
      companyId?: number;
      projectId?: number;
      siteId?: number;
      tradeId?: string;
      unionDispatchType?: string;
    },
  ) {
    const worker = await this.prisma.worker.findUnique({
      where: { id: workerId },
      include: {
        projectAssignments: {
          where: { status: 'ACTIVE' },
          take: 10,
          orderBy: { assignedAt: 'desc' },
        },
      },
    });
    if (!worker) throw new NotFoundException('Worker not found');

    const companyId = opts?.companyId ?? worker.companyId;
    if (!companyId) {
      return {
        workerId,
        requiredOrientations: [],
        completedOrientations: [],
        missingOrientations: [],
        gatingStatus: 'warning' as WorkerOrientationGatingStatus,
        reason: 'Worker has no company context',
      };
    }

    const projectId =
      opts?.projectId ?? worker.projectAssignments[0]?.projectId;
    const tradeId =
      opts?.tradeId ?? worker.projectAssignments[0]?.role ?? undefined;

    const required = await this.requirements.resolveForWorker({
      workerId,
      companyId,
      projectId,
      siteId: opts?.siteId,
      tradeId,
      unionDispatchType: opts?.unionDispatchType,
    });

    const completionRows = await this.completions.list({ workerId });
    const now = Date.now();

    // Treat past-expires completed rows as expired for gating (cron may lag).
    const activeCompletions = completionRows.filter((c) => {
      if (
        c.status === 'completed' &&
        c.expiresOn &&
        c.expiresOn.getTime() < now
      ) {
        return false;
      }
      return c.status === 'completed';
    });

    const completedIds = new Set(activeCompletions.map((c) => c.orientationId));
    const missing = required.filter((r) => !completedIds.has(r.orientationId));

    const expiredRequired = required.filter((r) => {
      const row = completionRows.find(
        (c) =>
          c.orientationId === r.orientationId &&
          (c.status === 'expired' ||
            (c.status === 'completed' &&
              c.expiresOn != null &&
              c.expiresOn.getTime() < now)),
      );
      return Boolean(row) && !completedIds.has(r.orientationId);
    });

    const arrivalBlocked = missing.some(
      (m) => m.mustCompleteBefore === 'arrival',
    );
    const dispatchBlocked = missing.some(
      (m) => m.mustCompleteBefore === 'dispatch',
    );
    const assignmentMissing = missing.some(
      (m) => m.mustCompleteBefore === 'assignment',
    );

    let gatingStatus: WorkerOrientationGatingStatus = 'allowed';
    if (
      arrivalBlocked ||
      dispatchBlocked ||
      expiredRequired.some((r) =>
        ['arrival', 'dispatch'].includes(r.mustCompleteBefore),
      )
    ) {
      gatingStatus = 'blocked';
    } else if (assignmentMissing || missing.length > 0) {
      gatingStatus = 'warning';
    } else if (
      activeCompletions.some((c) => isNearExpiry(c.expiresOn, new Date(now)))
    ) {
      gatingStatus = 'warning';
    }

    return {
      workerId,
      companyId,
      projectId: projectId ?? null,
      requiredOrientations: required.map((r) => ({
        requirementId: r.id,
        orientationId: r.orientationId,
        title: r.orientation.title,
        type: r.orientation.type,
        mustCompleteBefore: r.mustCompleteBefore,
        version: r.orientation.version,
      })),
      completedOrientations: activeCompletions.map((c) => ({
        completionId: c.id,
        orientationId: c.orientationId,
        title: c.orientation?.title,
        completedOn: c.completedOn,
        expiresOn: c.expiresOn,
        score: c.score,
        status: c.status,
      })),
      missingOrientations: missing.map((m) => ({
        requirementId: m.id,
        orientationId: m.orientationId,
        title: m.orientation.title,
        mustCompleteBefore: m.mustCompleteBefore,
      })),
      gatingStatus,
    };
  }
}
