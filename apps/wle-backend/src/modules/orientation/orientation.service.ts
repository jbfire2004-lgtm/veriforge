import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  OrientationAssignmentScope,
  OrientationPackageType,
  OrientationWorkerProgressStatus,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  OrientationAiService,
  type AiGenerateInput,
} from './orientation-ai.service';
import { OrientationLinkingService } from './orientation-linking.service';
import { OrientationTranslationService } from './orientation-translation.service';
import { DEFAULT_ORIENTATION_SECTIONS_EN } from './orientation.constants';
import { OrientationCoreIntegrationService } from './orientation-core-integration.service';
import { OrientationUploadService } from './orientation-upload.service';

@Injectable()
export class OrientationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ai: OrientationAiService,
    private readonly translate: OrientationTranslationService,
    private readonly linking: OrientationLinkingService,
    private readonly core: OrientationCoreIntegrationService,
    private readonly upload: OrientationUploadService,
  ) {}

  async create(input: {
    companyId?: number;
    projectId?: number;
    type: OrientationPackageType;
    title: string;
    languages?: string[];
    userId?: number;
  }) {
    if (!input.companyId && !input.projectId) {
      throw new BadRequestException('companyId or projectId required');
    }
    if (input.companyId && input.projectId) {
      throw new BadRequestException('Provide only companyId or projectId');
    }

    const languages = input.languages?.length ? input.languages : ['en'];
    const sections = { en: DEFAULT_ORIENTATION_SECTIONS_EN };

    const pkg = await this.prisma.orientationPackage.create({
      data: {
        companyId: input.companyId ?? null,
        projectId: input.projectId ?? null,
        type: input.type,
        title: input.title,
        languages,
        createdById: input.userId,
        updatedById: input.userId,
        versions: {
          create: {
            versionNumber: 1,
            sections: sections as Prisma.InputJsonValue,
            quiz: { en: [] },
            createdById: input.userId,
          },
        },
        assignments: {
          create: [
            {
              scope: input.projectId
                ? OrientationAssignmentScope.PROJECT
                : OrientationAssignmentScope.COMPANY,
              required: true,
            },
            {
              scope: OrientationAssignmentScope.ONBOARDING,
              required: true,
            },
          ],
        },
      },
      include: { versions: true, assignments: true },
    });

    return this.getById(pkg.id);
  }

  async getById(id: string) {
    const pkg = await this.prisma.orientationPackage.findFirst({
      where: { id, archivedAt: null },
      include: {
        versions: { orderBy: { versionNumber: 'desc' } },
        assignments: true,
        _count: { select: { workerProgress: true } },
      },
    });
    if (!pkg) throw new NotFoundException('Orientation package not found');
    const current = pkg.versions.find((v) => v.versionNumber === pkg.version);
    return { ...pkg, currentVersion: current ?? pkg.versions[0] ?? null };
  }

  async listForCompany(companyId: number) {
    return this.prisma.orientationPackage.findMany({
      where: { companyId, archivedAt: null },
      orderBy: { updatedAt: 'desc' },
      include: { _count: { select: { workerProgress: true } } },
    });
  }

  async listForProject(projectId: number) {
    return this.prisma.orientationPackage.findMany({
      where: { projectId, archivedAt: null },
      orderBy: { updatedAt: 'desc' },
      include: { _count: { select: { workerProgress: true } } },
    });
  }

  async update(
    id: string,
    data: { title?: string; languages?: string[]; isPublished?: boolean },
    userId?: number,
  ) {
    const pkg = await this.getById(id);
    const updated = await this.prisma.orientationPackage.update({
      where: { id },
      data: {
        title: data.title ?? pkg.title,
        languages: data.languages ?? pkg.languages,
        isPublished: data.isPublished ?? pkg.isPublished,
        updatedById: userId,
      },
    });
    if (data.isPublished) {
      await this.linking.linkWorkersForPackage(id);
    }
    return this.getById(updated.id);
  }

  async archive(id: string) {
    await this.prisma.orientationPackage.update({
      where: { id },
      data: { archivedAt: new Date() },
    });
    return { ok: true };
  }

  async uploadContent(
    id: string,
    files: Array<{
      originalname: string;
      mimetype: string;
      size: number;
      buffer?: Buffer;
    }>,
    userId?: number,
  ) {
    if (files.length > 0) {
      await this.upload.processUpload(id, files, userId);
      const pkg = await this.getById(id);
      await this.linking.linkWorkersForPackage(id);
      return pkg;
    }
    const pkg = await this.getById(id);
    const nextVersion = pkg.version + 1;
    const sections = this.translate.translateSections(
      (pkg.currentVersion?.sections as Record<string, unknown[]>) ?? {
        en: DEFAULT_ORIENTATION_SECTIONS_EN,
      },
      pkg.languages,
    );
    await this.createVersion(
      id,
      nextVersion,
      sections,
      pkg.currentVersion?.quiz,
      userId,
    );
    await this.linking.linkWorkersForPackage(id);
    return this.getById(id);
  }

  async aiGenerate(id: string, input: AiGenerateInput, userId?: number) {
    const pkg = await this.getById(id);
    const generated = this.ai.generate(input);
    const nextVersion = pkg.version + 1;
    await this.createVersion(
      id,
      nextVersion,
      generated.sections,
      generated.quiz,
      userId,
      generated.aiMetadata,
    );
    await this.prisma.orientationPackage.update({
      where: { id },
      data: { type: OrientationPackageType.AI_GENERATED },
    });
    return this.getById(id);
  }

  async translatePackage(id: string, languages: string[]) {
    const pkg = await this.getById(id);
    const current = pkg.currentVersion;
    if (!current) throw new BadRequestException('No version to translate');
    const sections = this.translate.translateSections(
      current.sections as Record<string, unknown[]>,
      languages,
    );
    await this.prisma.orientationPackage.update({
      where: { id },
      data: { languages: [...new Set([...pkg.languages, ...languages])] },
    });
    await this.prisma.orientationVersion.update({
      where: { id: current.id },
      data: { sections: sections as Prisma.InputJsonValue },
    });
    return this.getById(id);
  }

  async assign(id: string, scope: OrientationAssignmentScope) {
    const existing = await this.prisma.orientationAssignment.findFirst({
      where: { packageId: id, scope },
    });
    if (!existing) {
      await this.prisma.orientationAssignment.create({
        data: { packageId: id, scope, required: true },
      });
    }
    const pkg = await this.getById(id);
    if (pkg.isPublished) {
      await this.linking.linkWorkersForPackage(id);
    }
    return pkg;
  }

  async listWorkers(id: string) {
    return this.prisma.orientationWorkerProgress.findMany({
      where: { packageId: id },
      include: {
        worker: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async listVersions(id: string) {
    return this.prisma.orientationVersion.findMany({
      where: { packageId: id },
      orderBy: { versionNumber: 'desc' },
    });
  }

  async rollback(id: string, versionNumber: number, userId?: number) {
    const version = await this.prisma.orientationVersion.findUnique({
      where: { packageId_versionNumber: { packageId: id, versionNumber } },
    });
    if (!version) throw new NotFoundException('Version not found');
    await this.prisma.orientationPackage.update({
      where: { id },
      data: { version: versionNumber, updatedById: userId },
    });
    await this.linking.linkWorkersForPackage(id);
    return this.getById(id);
  }

  async startProgress(packageId: string, workerId: number) {
    const pkg = await this.getById(packageId);
    return this.prisma.orientationWorkerProgress.upsert({
      where: { packageId_workerId: { packageId, workerId } },
      create: {
        packageId,
        workerId,
        versionNumber: pkg.version,
        status: OrientationWorkerProgressStatus.IN_PROGRESS,
        startedAt: new Date(),
      },
      update: {
        status: OrientationWorkerProgressStatus.IN_PROGRESS,
        startedAt: new Date(),
      },
    });
  }

  async completeProgress(
    packageId: string,
    workerId: number,
    input: { quizScore?: number; languageCode?: string },
  ) {
    const pkg = await this.getById(packageId);
    const certId = `CERT-${packageId.slice(0, 8)}-${workerId}-${Date.now()}`;
    const progress = await this.prisma.orientationWorkerProgress.update({
      where: { packageId_workerId: { packageId, workerId } },
      data: {
        status: OrientationWorkerProgressStatus.COMPLETED,
        completedAt: new Date(),
        versionNumber: pkg.version,
        quizScore: input.quizScore,
        languageCode: input.languageCode ?? 'en',
        certificateId: certId,
      },
    });

    await this.core.recordCompletion({
      workerId,
      packageId,
      packageTitle: pkg.title,
      companyId: pkg.companyId,
      projectId: pkg.projectId,
      versionNumber: pkg.version,
      certificateId: certId,
      quizScore: input.quizScore,
      languageCode: input.languageCode ?? 'en',
    });

    return progress;
  }

  async getComplianceForCompany(companyId: number) {
    return this.core.complianceSummaryForCompany(companyId);
  }

  async getComplianceForProject(projectId: number) {
    return this.core.complianceSummaryForProject(projectId);
  }

  async getStats(packageId: string) {
    const rows = await this.prisma.orientationWorkerProgress.findMany({
      where: { packageId },
    });
    const total = rows.length;
    const completed = rows.filter((r) => r.status === 'COMPLETED').length;
    const outdated = rows.filter(
      (r) => r.status === 'REORIENTATION_REQUIRED',
    ).length;
    const inProgress = rows.filter((r) => r.status === 'IN_PROGRESS').length;
    const pending = total - completed - outdated - inProgress;
    return {
      total,
      completed,
      pending,
      outdated,
      inProgress,
      completionRate: total ? Math.round((completed / total) * 100) : 0,
    };
  }

  async requiredForWorker(workerId: number) {
    const rows = await this.prisma.orientationWorkerProgress.findMany({
      where: {
        workerId,
        status: {
          in: [
            OrientationWorkerProgressStatus.NOT_STARTED,
            OrientationWorkerProgressStatus.IN_PROGRESS,
            OrientationWorkerProgressStatus.REORIENTATION_REQUIRED,
          ],
        },
      },
      include: { package: true },
    });
    return rows;
  }

  private async createVersion(
    packageId: string,
    versionNumber: number,
    sections: Record<string, unknown[]>,
    quiz: unknown,
    userId?: number,
    aiMetadata?: Record<string, unknown>,
  ) {
    await this.prisma.orientationVersion.create({
      data: {
        packageId,
        versionNumber,
        sections: sections as Prisma.InputJsonValue,
        quiz: (quiz ?? { en: [] }) as Prisma.InputJsonValue,
        aiMetadata: aiMetadata as Prisma.InputJsonValue,
        createdById: userId,
      },
    });
    await this.prisma.orientationPackage.update({
      where: { id: packageId },
      data: { version: versionNumber, updatedById: userId },
    });
    await this.linking.linkWorkersForPackage(packageId);
  }
}
