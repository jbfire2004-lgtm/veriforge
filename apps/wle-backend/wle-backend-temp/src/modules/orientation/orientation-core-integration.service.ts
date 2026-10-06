import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

const ORIENTATION_CERT_CODE = 'ORIENTATION';
const SITE_ORIENTATION_CERT_CODE = 'SITE_ORIENTATION';

@Injectable()
export class OrientationCoreIntegrationService {
  private readonly logger = new Logger(OrientationCoreIntegrationService.name);

  constructor(private readonly prisma: PrismaService) {}

  async ensureCertification(code: string, name: string) {
    const existing = await this.prisma.certification.findFirst({
      where: { code },
    });
    if (existing) return existing;
    return this.prisma.certification.create({
      data: { name, code, description: `${name} (Vera orientation module)` },
    });
  }

  /** Write TrainingRecord + optional site-orientation safety form on completion. */
  async recordCompletion(input: {
    workerId: number;
    packageId: string;
    packageTitle: string;
    companyId: number | null;
    projectId: number | null;
    versionNumber: number;
    certificateId: string;
    quizScore?: number;
    languageCode: string;
  }) {
    const cert = await this.ensureCertification(
      input.projectId ? SITE_ORIENTATION_CERT_CODE : ORIENTATION_CERT_CODE,
      input.projectId ? 'Site orientation' : 'Company orientation',
    );

    const certificateNumber = `ORI-${input.packageId.slice(0, 8)}-v${
      input.versionNumber
    }`;

    const existing = await this.prisma.trainingRecord.findFirst({
      where: {
        workerId: input.workerId,
        certificationId: cert.id,
        companyId: input.companyId ?? undefined,
        projectId: input.projectId ?? undefined,
        certificateNumber,
      },
    });

    const completedAt = new Date();
    let record;
    if (existing) {
      record = await this.prisma.trainingRecord.update({
        where: { id: existing.id },
        data: {
          completedAt,
          certificateUrl: input.certificateId,
        },
      });
    } else {
      record = await this.prisma.trainingRecord.create({
        data: {
          workerId: input.workerId,
          certificationId: cert.id,
          companyId: input.companyId,
          projectId: input.projectId,
          certificateNumber,
          certificateUrl: input.certificateId,
          completedAt,
          issuedAt: completedAt,
        },
      });
    }

    if (input.projectId && input.companyId) {
      await this.syncSiteOrientationForm(input);
    }

    this.logger.log(
      `Core training record ${record.id} for worker ${input.workerId} orientation ${input.packageId}`,
    );
    return record;
  }

  private async syncSiteOrientationForm(input: {
    workerId: number;
    companyId: number;
    projectId: number;
    packageTitle: string;
    quizScore?: number;
    languageCode: string;
  }) {
    const worker = await this.prisma.worker.findUnique({
      where: { id: input.workerId },
      select: { userId: true },
    });
    if (!worker?.userId) return;

    const existing = await this.prisma.safetyForm.findFirst({
      where: {
        companyId: input.companyId,
        projectId: input.projectId,
        definitionId: 'site-orientation',
        createdById: worker.userId,
      },
    });
    if (existing) return;

    const def = await this.prisma.safetyFormDefinition.findUnique({
      where: { id: 'site-orientation' },
    });
    if (!def) return;

    await this.prisma.safetyForm.create({
      data: {
        companyId: input.companyId,
        projectId: input.projectId,
        definitionId: 'site-orientation',
        workerId: input.workerId,
        title: input.packageTitle,
        status: 'SUBMITTED',
        createdById: worker.userId,
        submittedById: worker.userId,
        formData: {
          orientationComplete: true,
          orientationTopics: ['Vera orientation module'],
          quizScore: input.quizScore,
          languageCode: input.languageCode,
        },
        submittedAt: new Date(),
      },
    });
  }

  async complianceSummaryForCompany(companyId: number) {
    const packages = await this.prisma.orientationPackage.findMany({
      where: { companyId, archivedAt: null, isPublished: true },
      include: {
        workerProgress: true,
      },
    });
    return this.summarizePackages(packages);
  }

  async complianceSummaryForProject(projectId: number) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { companyId: true },
    });
    const packages = await this.prisma.orientationPackage.findMany({
      where: {
        archivedAt: null,
        isPublished: true,
        OR: [{ projectId }, { companyId: project?.companyId ?? -1 }],
      },
      include: { workerProgress: true },
    });
    return this.summarizePackages(packages);
  }

  private summarizePackages(
    packages: Array<{
      id: string;
      title: string;
      version: number;
      workerProgress: Array<{
        status: string;
        versionNumber: number;
      }>;
    }>,
  ) {
    let completed = 0;
    let pending = 0;
    let outdated = 0;
    for (const pkg of packages) {
      for (const p of pkg.workerProgress) {
        if (p.status === 'COMPLETED' && p.versionNumber >= pkg.version) {
          completed += 1;
        } else if (p.status === 'REORIENTATION_REQUIRED') {
          outdated += 1;
        } else {
          pending += 1;
        }
      }
    }
    return {
      packageCount: packages.length,
      completed,
      pending,
      outdated,
      packages: packages.map((p) => ({
        id: p.id,
        title: p.title,
        version: p.version,
        progress: p.workerProgress.length,
      })),
    };
  }
}
