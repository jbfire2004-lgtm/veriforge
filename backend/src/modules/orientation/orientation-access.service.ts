import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrientationWorkerProgressStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

export type OrientationAccessResult = {
  allowed: boolean;
  blockingPackages: Array<{
    packageId: string;
    title: string;
    status: string;
    requiredVersion: number;
  }>;
};

@Injectable()
export class OrientationAccessService {
  constructor(private readonly prisma: PrismaService) {}

  async assertWorkerCanAccessProject(
    workerId: number,
    projectId: number,
  ): Promise<OrientationAccessResult> {
    const result = await this.evaluateWorker(workerId, { projectId });
    if (!result.allowed) {
      throw new BadRequestException({
        message:
          'Orientation incomplete — complete required orientation before project access',
        blockingPackages: result.blockingPackages,
      });
    }
    return result;
  }

  async assertWorkerCanBeAssigned(
    workerId: number,
    projectId: number,
  ): Promise<void> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { companyId: true },
    });
    if (!project) throw new NotFoundException('Project not found');

    const companyPackages = await this.pendingForWorker(workerId, {
      companyId: project.companyId,
    });
    if (companyPackages.length > 0) {
      throw new BadRequestException({
        message: 'Complete company orientation before project assignment',
        blockingPackages: companyPackages,
      });
    }
  }

  async evaluateWorker(
    workerId: number,
    scope: { companyId?: number; projectId?: number },
  ): Promise<OrientationAccessResult> {
    const blocking = await this.pendingForWorker(workerId, scope);
    return {
      allowed: blocking.length === 0,
      blockingPackages: blocking,
    };
  }

  async resolveWorkerIdForUser(userId: number): Promise<number | null> {
    const worker = await this.prisma.worker.findFirst({
      where: { userId },
      select: { id: true },
    });
    return worker?.id ?? null;
  }

  private async pendingForWorker(
    workerId: number,
    scope: { companyId?: number; projectId?: number },
  ) {
    const progress = await this.prisma.orientationWorkerProgress.findMany({
      where: {
        workerId,
        status: {
          in: [
            OrientationWorkerProgressStatus.NOT_STARTED,
            OrientationWorkerProgressStatus.IN_PROGRESS,
            OrientationWorkerProgressStatus.REORIENTATION_REQUIRED,
          ],
        },
        package: {
          isPublished: true,
          archivedAt: null,
          ...(scope.projectId
            ? {
                OR: [
                  { projectId: scope.projectId },
                  scope.companyId ? { companyId: scope.companyId } : {},
                ],
              }
            : scope.companyId
            ? { companyId: scope.companyId }
            : {}),
        },
      },
      include: { package: true },
    });

    return progress.map((p) => ({
      packageId: p.packageId,
      title: p.package.title,
      status: this.publicStatus(p.status),
      requiredVersion: p.package.version,
    }));
  }

  private publicStatus(status: OrientationWorkerProgressStatus): string {
    if (status === OrientationWorkerProgressStatus.REORIENTATION_REQUIRED) {
      return 'outdated';
    }
    if (status === OrientationWorkerProgressStatus.COMPLETED) {
      return 'completed';
    }
    if (status === OrientationWorkerProgressStatus.IN_PROGRESS) {
      return 'in_progress';
    }
    return 'pending';
  }
}
