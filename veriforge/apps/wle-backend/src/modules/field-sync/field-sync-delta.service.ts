import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export type FieldDeltaTombstone = {
  type: 'task' | 'workPackage';
  id: string;
  deletedAt: string;
};

export type WorkerWalletSnapshot = {
  workerId: number;
  verifiedCount: number;
  expiringSoon: number;
  expired: number;
  readinessScore: number | null;
  lastSyncedAt: string;
};

export type FieldDeltaBundle = {
  syncedAt: string;
  since: string | null;
  workers: unknown[];
  equipment: unknown[];
  projects: unknown[];
  trainingRecords: unknown[];
  inspections: unknown[];
  safetyForms: unknown[];
  workPackages: unknown[];
  tasks: unknown[];
  safetyFormDefinitions: unknown[];
  workerWalletSnapshots: WorkerWalletSnapshot[];
  deleted: FieldDeltaTombstone[];
  versions: Record<string, number>;
};

@Injectable()
export class FieldSyncDeltaService {
  constructor(private readonly prisma: PrismaService) {}

  async fetchDelta(params: {
    companyId?: number;
    since?: Date;
  }): Promise<FieldDeltaBundle> {
    const since = params.since ?? null;
    const companyId = params.companyId;
    const timeFilter = since ? { gte: since } : undefined;

    const projectIds = companyId
      ? (
          await this.prisma.project.findMany({
            where: { companyId },
            select: { id: true },
            take: 500,
          })
        ).map((p) => p.id)
      : [];

    const [
      workers,
      equipmentLinks,
      projects,
      trainingRecords,
      inspections,
      safetyForms,
      workPackages,
      tasks,
      safetyFormDefinitions,
      deletedWorkPackages,
      deletedTasks,
    ] = await Promise.all([
      this.fetchWorkers(companyId, since),
      companyId
        ? this.prisma.equipmentLink.findMany({
            where: {
              companyId,
              ...(timeFilter ? { startDate: timeFilter } : {}),
            },
            include: {
              equipment: {
                select: {
                  id: true,
                  name: true,
                  qrToken: true,
                  safetyStatus: true,
                },
              },
            },
            take: 500,
          })
        : Promise.resolve([]),
      companyId
        ? this.prisma.project.findMany({
            where: {
              companyId,
              ...(timeFilter ? { createdAt: timeFilter } : {}),
            },
            select: {
              id: true,
              name: true,
              status: true,
              companyId: true,
              code: true,
              startDate: true,
              endDate: true,
              createdAt: true,
            },
            take: 200,
          })
        : Promise.resolve([]),
      companyId
        ? this.prisma.trainingRecord.findMany({
            where: {
              companyId,
              ...(timeFilter ? { issuedAt: timeFilter } : {}),
            },
            include: {
              certification: { select: { id: true, name: true, code: true } },
              worker: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  qrToken: true,
                },
              },
            },
            orderBy: { issuedAt: 'desc' },
            take: 300,
          })
        : Promise.resolve([]),
      companyId
        ? this.prisma.inspection.findMany({
            where: {
              ...(timeFilter ? { createdAt: timeFilter } : {}),
              OR: [
                { worker: { companyId } },
                { equipment: { equipmentLinks: { some: { companyId } } } },
              ],
            },
            orderBy: { createdAt: 'desc' },
            take: 200,
          })
        : Promise.resolve([]),
      companyId
        ? this.prisma.safetyForm.findMany({
            where: {
              OR: [{ companyId }, { project: { companyId } }],
              ...(timeFilter ? { updatedAt: timeFilter } : {}),
            },
            select: {
              id: true,
              definitionId: true,
              formType: true,
              status: true,
              title: true,
              formData: true,
              companyId: true,
              projectId: true,
              workerId: true,
              clientSyncId: true,
              clientVersion: true,
              updatedAt: true,
            },
            orderBy: { updatedAt: 'desc' },
            take: 200,
          })
        : Promise.resolve([]),
      projectIds.length
        ? this.prisma.pmWorkPackage.findMany({
            where: {
              projectId: { in: projectIds },
              deletedAt: null,
              ...(timeFilter ? { updatedAt: timeFilter } : {}),
            },
            select: {
              id: true,
              projectId: true,
              code: true,
              title: true,
              status: true,
              progressPct: true,
              clientSyncId: true,
              updatedAt: true,
            },
            take: 300,
          })
        : Promise.resolve([]),
      projectIds.length
        ? this.prisma.pmPmTask.findMany({
            where: {
              projectId: { in: projectIds },
              deletedAt: null,
              ...(timeFilter ? { updatedAt: timeFilter } : {}),
            },
            select: {
              id: true,
              projectId: true,
              workPackageId: true,
              code: true,
              title: true,
              status: true,
              taskType: true,
              progressPct: true,
              plannedStart: true,
              plannedEnd: true,
              clientSyncId: true,
              updatedAt: true,
            },
            take: 500,
          })
        : Promise.resolve([]),
      companyId
        ? this.prisma.safetyFormDefinition.findMany({
            where: {
              OR: [{ companyId: null }, { companyId }],
              isActive: true,
              ...(timeFilter ? { updatedAt: timeFilter } : {}),
            },
            select: {
              id: true,
              name: true,
              category: true,
              version: true,
              definition: true,
              companyId: true,
              updatedAt: true,
            },
            take: 100,
          })
        : Promise.resolve([]),
      projectIds.length && since
        ? this.prisma.pmWorkPackage.findMany({
            where: {
              projectId: { in: projectIds },
              deletedAt: { gte: since },
            },
            select: { id: true, deletedAt: true },
            take: 100,
          })
        : Promise.resolve([]),
      projectIds.length && since
        ? this.prisma.pmPmTask.findMany({
            where: {
              projectId: { in: projectIds },
              deletedAt: { gte: since },
            },
            select: { id: true, deletedAt: true },
            take: 100,
          })
        : Promise.resolve([]),
    ]);

    const equipment = equipmentLinks.map((l) => ({
      linkId: l.id,
      companyId: l.companyId,
      equipmentId: l.equipmentId,
      complianceStatus: l.complianceStatus,
      equipment: l.equipment,
    }));

    const syncedAtIso = new Date().toISOString();
    const workerWalletSnapshots = this.buildWalletSnapshots(
      trainingRecords as Array<{
        workerId: number;
        expiresAt?: Date | string | null;
        lastVerificationStatus?: string | null;
      }>,
      syncedAtIso,
    );

    const deleted: FieldDeltaTombstone[] = [
      ...deletedWorkPackages
        .filter((r) => r.deletedAt)
        .map((r) => ({
          type: 'workPackage' as const,
          id: r.id,
          deletedAt: r.deletedAt!.toISOString(),
        })),
      ...deletedTasks
        .filter((r) => r.deletedAt)
        .map((r) => ({
          type: 'task' as const,
          id: r.id,
          deletedAt: r.deletedAt!.toISOString(),
        })),
    ];

    return {
      syncedAt: syncedAtIso,
      since: since?.toISOString() ?? null,
      workers,
      equipment,
      projects,
      trainingRecords,
      inspections,
      safetyForms,
      workPackages,
      tasks,
      safetyFormDefinitions,
      workerWalletSnapshots,
      deleted,
      versions: {
        workers: workers.length,
        equipment: equipment.length,
        projects: projects.length,
        trainingRecords: trainingRecords.length,
        inspections: inspections.length,
        safetyForms: safetyForms.length,
        workPackages: workPackages.length,
        tasks: tasks.length,
        safetyFormDefinitions: safetyFormDefinitions.length,
        workerWalletSnapshots: workerWalletSnapshots.length,
        deleted: deleted.length,
      },
    };
  }

  private buildWalletSnapshots(
    records: Array<{
      workerId: number;
      expiresAt?: Date | string | null;
      lastVerificationStatus?: string | null;
    }>,
    syncedAt: string,
  ): WorkerWalletSnapshot[] {
    const now = Date.now();
    const soonMs = 30 * 86_400_000;
    const byWorker = new Map<
      number,
      { verified: number; expiringSoon: number; expired: number }
    >();

    for (const r of records) {
      if (!r.workerId) continue;
      const bucket = byWorker.get(r.workerId) ?? {
        verified: 0,
        expiringSoon: 0,
        expired: 0,
      };
      if (r.lastVerificationStatus === 'VERIFIED') bucket.verified += 1;
      const exp =
        r.expiresAt instanceof Date
          ? r.expiresAt.getTime()
          : r.expiresAt
          ? Date.parse(String(r.expiresAt))
          : NaN;
      if (!Number.isNaN(exp)) {
        if (exp <= now) bucket.expired += 1;
        else if (exp - now <= soonMs) bucket.expiringSoon += 1;
      }
      byWorker.set(r.workerId, bucket);
    }

    return [...byWorker.entries()].map(([workerId, stats]) => {
      const total = stats.verified + stats.expired;
      const readinessScore =
        total > 0
          ? Math.round(((stats.verified - stats.expired) / total) * 100)
          : null;
      return {
        workerId,
        verifiedCount: stats.verified,
        expiringSoon: stats.expiringSoon,
        expired: stats.expired,
        readinessScore,
        lastSyncedAt: syncedAt,
      };
    });
  }

  private async fetchWorkers(companyId?: number, since?: Date | null) {
    if (!companyId) return [];

    if (!since) {
      return this.prisma.worker.findMany({
        where: { companyId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          companyId: true,
          qrToken: true,
          status: true,
          email: true,
          phone: true,
        },
        take: 500,
      });
    }

    const [fromTraining, fromLinks] = await Promise.all([
      this.prisma.trainingRecord.findMany({
        where: { companyId, issuedAt: { gte: since } },
        select: { workerId: true },
        distinct: ['workerId'],
        take: 200,
      }),
      this.prisma.companyLink.findMany({
        where: { companyId, startDate: { gte: since } },
        select: { workerId: true },
        distinct: ['workerId'],
        take: 200,
      }),
    ]);

    const workerIds = [
      ...new Set([
        ...fromTraining.map((r) => r.workerId),
        ...fromLinks.map((l) => l.workerId),
      ]),
    ];

    if (workerIds.length === 0) return [];

    return this.prisma.worker.findMany({
      where: { id: { in: workerIds } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        companyId: true,
        qrToken: true,
        status: true,
        email: true,
        phone: true,
      },
    });
  }
}
