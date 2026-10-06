import { Injectable, Logger } from '@nestjs/common';
import {
  OrientationAssignmentScope,
  OrientationWorkerProgressStatus,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class OrientationLinkingService {
  private readonly logger = new Logger(OrientationLinkingService.name);

  constructor(private readonly prisma: PrismaService) {}

  async linkWorkersForPackage(packageId: string): Promise<number> {
    const pkg = await this.prisma.orientationPackage.findUnique({
      where: { id: packageId },
      include: { assignments: true },
    });
    if (!pkg || !pkg.isPublished) return 0;

    const workerIds = await this.resolveEligibleWorkerIds(pkg);
    let linked = 0;
    for (const workerId of workerIds) {
      const existing = await this.prisma.orientationWorkerProgress.findUnique({
        where: { packageId_workerId: { packageId, workerId } },
      });
      if (!existing) {
        await this.prisma.orientationWorkerProgress.create({
          data: {
            packageId,
            workerId,
            versionNumber: pkg.version,
            status: OrientationWorkerProgressStatus.NOT_STARTED,
          },
        });
      } else if (
        existing.status === OrientationWorkerProgressStatus.COMPLETED &&
        existing.versionNumber < pkg.version
      ) {
        await this.prisma.orientationWorkerProgress.update({
          where: { id: existing.id },
          data: {
            versionNumber: pkg.version,
            status: OrientationWorkerProgressStatus.REORIENTATION_REQUIRED,
            completedAt: null,
            certificateId: null,
          },
        });
      } else if (existing.versionNumber < pkg.version) {
        await this.prisma.orientationWorkerProgress.update({
          where: { id: existing.id },
          data: { versionNumber: pkg.version },
        });
      }
      linked += 1;
    }
    this.logger.log(`Linked ${linked} workers to orientation ${packageId}`);
    return linked;
  }

  async onCompanyLinkCreated(
    workerId: number,
    companyId: number,
  ): Promise<void> {
    const packages = await this.prisma.orientationPackage.findMany({
      where: {
        companyId,
        isPublished: true,
        archivedAt: null,
        assignments: {
          some: {
            scope: {
              in: [
                OrientationAssignmentScope.COMPANY,
                OrientationAssignmentScope.ONBOARDING,
              ],
            },
          },
        },
      },
    });
    for (const pkg of packages) {
      await this.upsertWorkerProgress(workerId, pkg.id, pkg.version);
    }
  }

  async onProjectAssignment(
    workerId: number,
    projectId: number,
  ): Promise<void> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { companyId: true },
    });
    if (!project) return;

    const packages = await this.prisma.orientationPackage.findMany({
      where: {
        isPublished: true,
        archivedAt: null,
        OR: [
          { projectId },
          {
            companyId: project.companyId,
            assignments: {
              some: { scope: OrientationAssignmentScope.COMPANY },
            },
          },
        ],
      },
    });
    for (const pkg of packages) {
      await this.upsertWorkerProgress(workerId, pkg.id, pkg.version);
    }
  }

  private async upsertWorkerProgress(
    workerId: number,
    packageId: string,
    version: number,
  ): Promise<void> {
    const existing = await this.prisma.orientationWorkerProgress.findUnique({
      where: { packageId_workerId: { packageId, workerId } },
    });
    if (
      existing?.status === OrientationWorkerProgressStatus.COMPLETED &&
      existing.versionNumber >= version
    ) {
      return;
    }
    await this.prisma.orientationWorkerProgress.upsert({
      where: { packageId_workerId: { packageId, workerId } },
      create: {
        packageId,
        workerId,
        versionNumber: version,
        status: OrientationWorkerProgressStatus.NOT_STARTED,
      },
      update: {
        versionNumber: version,
        status:
          existing?.versionNumber === version
            ? existing.status
            : OrientationWorkerProgressStatus.REORIENTATION_REQUIRED,
      },
    });
  }

  private async resolveEligibleWorkerIds(pkg: {
    companyId: number | null;
    projectId: number | null;
  }): Promise<number[]> {
    if (pkg.projectId) {
      const rows = await this.prisma.projectAssignment.findMany({
        where: { projectId: pkg.projectId, status: 'ACTIVE' },
        select: { workerId: true },
      });
      return [...new Set(rows.map((r) => r.workerId))];
    }
    if (pkg.companyId) {
      const links = await this.prisma.companyLink.findMany({
        where: { companyId: pkg.companyId, active: true },
        select: { workerId: true },
      });
      const direct = await this.prisma.worker.findMany({
        where: { companyId: pkg.companyId },
        select: { id: true },
      });
      return [
        ...new Set([
          ...links.map((l) => l.workerId),
          ...direct.map((w) => w.id),
        ]),
      ];
    }
    return [];
  }
}
