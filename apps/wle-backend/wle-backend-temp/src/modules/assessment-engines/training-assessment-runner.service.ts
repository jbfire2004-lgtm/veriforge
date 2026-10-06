import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { evaluateTrainingAssessment } from '../training-assessment/training-assessment.engine';
import type {
  TaeAssessmentInput,
  TaeAssessmentResult,
  TaeRequirementInput,
  TaeTrainingRecord,
} from '../training-assessment/training-assessment.types';
import {
  courseCodeFromName,
  inferCompetencyLevel,
} from './assessment-engines.utils';
import { AuditLogService } from '../../audit/audit-log.service';
import { AuditAction, AuditEntityType } from '../../audit/audit-actions';

@Injectable()
export class TrainingAssessmentRunnerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
  ) {}

  async buildInput(
    workerId: number,
    options?: { projectId?: number; dateNow?: string },
  ): Promise<TaeAssessmentInput> {
    const worker = await this.prisma.worker.findUnique({
      where: { id: workerId },
      include: {
        company: {
          include: { trainingRequirements: true },
        },
        trainingRecords: {
          include: {
            certification: true,
            trainingProvider: true,
          },
          orderBy: { issuedAt: 'desc' },
        },
        projectAssignments: {
          where: { status: 'ACTIVE' },
          take: 1,
        },
      },
    });
    if (!worker) throw new NotFoundException('Worker not found');

    const companyId = worker.companyId;
    const hiringClientRequirements: TaeRequirementInput[] = (
      worker.company?.trainingRequirements ?? []
    ).map((req, i) => ({
      id: `HCR-${req.id ?? i + 1}`,
      name: req.courseName,
      code: courseCodeFromName(req.courseName),
      minLevel: 'Awareness' as const,
      validityDays: req.expiresInDays,
      approvedProviders: [],
      evidenceTypes: ['ticket', 'lms'],
    }));

    let projectRequirements: TaeRequirementInput[] = [];
    const projectId = options?.projectId;
    const resolvedProjectId =
      projectId ?? worker.projectAssignments[0]?.projectId;
    if (resolvedProjectId) {
      const profile = await this.prisma.pmProjectSafetyProfile.findFirst({
        where: { projectId: resolvedProjectId, deletedAt: null },
      });
      const codes = Array.isArray(profile?.requiredTraining)
        ? (profile!.requiredTraining as string[])
        : [];
      projectRequirements = codes.map((code, i) => ({
        id: `PR-${i + 1}`,
        name: code,
        code: courseCodeFromName(code),
        minLevel: 'Awareness' as const,
        validityDays: 365,
        approvedProviders: [],
        evidenceTypes: ['lms', 'signoff'],
      }));
    }

    const legislativeRequirements: TaeRequirementInput[] =
      hiringClientRequirements.slice(0, 3).map((r, i) => ({
        ...r,
        id: `LEG-${i + 1}`,
        jurisdiction: worker.company?.province ?? undefined,
      }));

    const trainingRecords: TaeTrainingRecord[] = worker.trainingRecords.map(
      (r) => ({
        id: String(r.id),
        workerId: String(workerId),
        courseCode:
          r.certification.code ?? courseCodeFromName(r.certification.name),
        courseName: r.certification.name,
        provider: r.trainingProvider?.name ?? null,
        level: inferCompetencyLevel(undefined),
        completedAt: (r.completedAt ?? r.issuedAt)?.toISOString() ?? null,
        expiresAt: r.expiresAt?.toISOString() ?? null,
        evidenceFiles:
          r.certificateUrl || r.certificateNumber
            ? [
                {
                  fileId: String(r.id),
                  fileName: r.certificateNumber ?? 'certificate',
                },
              ]
            : [],
        verificationStatus: r.certificateSignedAt
          ? 'Verified'
          : r.completedAt
          ? 'Pending'
          : undefined,
      }),
    );

    return {
      context: {
        jurisdiction: worker.company?.province ?? undefined,
        dateNow: options?.dateNow ?? new Date().toISOString(),
      },
      hiringClientRequirements,
      projectRequirements,
      legislativeRequirements,
      worker: {
        id: String(workerId),
        name: `${worker.firstName} ${worker.lastName}`,
        role: undefined,
        companyId: companyId ? String(companyId) : undefined,
      },
      trainingRecords,
    };
  }

  async evaluateAndPersist(
    workerId: number,
    createdByUserId?: number,
    options?: { projectId?: number },
  ): Promise<{ runId: string; result: TaeAssessmentResult }> {
    const input = await this.buildInput(workerId, options);
    const result = evaluateTrainingAssessment(input);

    const worker = await this.prisma.worker.findUnique({
      where: { id: workerId },
      select: {
        companyId: true,
        projectAssignments: {
          where: { status: 'ACTIVE' },
          take: 1,
          select: { projectId: true },
        },
      },
    });
    const resolvedProjectId =
      options?.projectId ?? worker?.projectAssignments[0]?.projectId;

    const run = await this.prisma.veraAssessmentRun.create({
      data: {
        engine: 'TRAINING_ASSESSMENT',
        workerId,
        companyId: worker?.companyId ?? undefined,
        projectId: resolvedProjectId,
        overallScore: result.overallScore,
        overallStatus: result.overallStatus,
        resultJson: result as unknown as Prisma.InputJsonValue,
        createdByUserId,
      },
    });

    await this.auditLog.logAudit(
      { id: createdByUserId ?? null, companyId: worker?.companyId ?? null },
      AuditAction.ASSESSMENT_TAE_RUN,
      {
        type: AuditEntityType.VERA_ASSESSMENT_RUN,
        id: run.id,
        tenantId: worker?.companyId,
      },
      {
        workerId,
        overallScore: result.overallScore,
        overallStatus: result.overallStatus,
      },
    );

    const profile = await this.prisma.pmWorkerSafetyProfile.findUnique({
      where: { workerId },
    });
    if (profile) {
      const meta = (profile.metadataJson as Record<string, unknown>) ?? {};
      await this.prisma.pmWorkerSafetyProfile.update({
        where: { id: profile.id },
        data: {
          metadataJson: {
            ...meta,
            lastTrainingAssessment: {
              runId: run.id,
              overallScore: result.overallScore,
              overallStatus: result.overallStatus,
              evaluatedAt: run.evaluatedAt.toISOString(),
              correctiveActionCount: result.correctiveActions.length,
            },
          } as Prisma.InputJsonValue,
          requiresSupervisorReview:
            result.overallStatus === 'NonCompliant' ||
            result.correctiveActions.some((a) => a.blockingForSiteAccess),
        },
      });
    }

    return { runId: run.id, result };
  }

  async getLatest(workerId: number) {
    return this.prisma.veraAssessmentRun.findFirst({
      where: { engine: 'TRAINING_ASSESSMENT', workerId },
      orderBy: { evaluatedAt: 'desc' },
    });
  }
}
