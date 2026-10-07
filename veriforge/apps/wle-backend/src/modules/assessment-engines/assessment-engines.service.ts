import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, VeraAssessmentEngine } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { evaluateSafetyProgramCompliance } from '../safety-program-compliance/safety-program-compliance.engine';
import type {
  SpceAssessmentInput,
  SpceAssessmentResult,
  SpceCompanySubmission,
  SpceProgramRequirement,
} from '../safety-program-compliance/safety-program-compliance.types';
import { evaluateSmartGapAnalysis } from '../smart-gap-analysis/smart-gap-analysis.engine';
import type { SgaeAssessmentResult } from '../smart-gap-analysis/smart-gap-analysis.types';
import { TrainingAssessmentRunnerService } from './training-assessment-runner.service';
import { courseCodeFromName } from './assessment-engines.utils';
import { AuditLogService } from '../../audit/audit-log.service';
import { AuditAction, AuditEntityType } from '../../audit/audit-actions';

@Injectable()
export class AssessmentEnginesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly trainingRunner: TrainingAssessmentRunnerService,
    private readonly auditLog: AuditLogService,
  ) {}

  async runTrainingAssessment(
    workerId: number,
    createdByUserId?: number,
    projectId?: number,
  ) {
    return this.trainingRunner.evaluateAndPersist(
      workerId,
      createdByUserId,
      projectId ? { projectId } : undefined,
    );
  }

  async getLatestTrainingAssessment(workerId: number) {
    const run = await this.trainingRunner.getLatest(workerId);
    if (!run) return null;
    return {
      runId: run.id,
      evaluatedAt: run.evaluatedAt,
      overallScore: run.overallScore,
      overallStatus: run.overallStatus,
      result: run.resultJson,
    };
  }

  async buildSpceInput(
    companyId: number,
    overrides?: Partial<SpceAssessmentInput>,
  ): Promise<SpceAssessmentInput> {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      include: { trainingRequirements: true },
    });
    if (!company) throw new NotFoundException('Company not found');

    const hiringClientProgramRequirements: SpceProgramRequirement[] =
      company.trainingRequirements.map((req, i) => ({
        id: `SPCE-TR-${req.id ?? i + 1}`,
        category: 'Training',
        type: 'TrainingConfig',
        description: `Maintain valid training for ${req.courseName}`,
        weight: 10,
        linkedLegislation: [],
      }));

    if (hiringClientProgramRequirements.length === 0) {
      hiringClientProgramRequirements.push({
        id: 'SPCE-POL-1',
        category: 'Policy',
        type: 'Policy',
        description: 'Documented health and safety policy',
        requiredSections: ['scope', 'responsibilities', 'review'],
        weight: 25,
      });
      hiringClientProgramRequirements.push({
        id: 'SPCE-REC-1',
        category: 'Records',
        type: 'Recordkeeping',
        description: 'Training and competency records retained',
        weight: 15,
      });
    }

    const policyDocs = await this.prisma.policyDocument.findMany({
      where: { companyId },
      take: 20,
      orderBy: { updatedAt: 'desc' },
    });

    const companySubmissions: SpceCompanySubmission[] = policyDocs.map(
      (doc, i) => ({
        id: `SUB-POL-${doc.id}`,
        companyId: String(companyId),
        requirementId: 'SPCE-POL-1',
        documents: [
          {
            fileId: String(doc.id),
            fileName: doc.title ?? 'policy',
            revisionDate: doc.updatedAt.toISOString(),
            effectiveDate: doc.publishedAt?.toISOString(),
            parsedSections: ['scope', 'responsibilities'],
            legislationRefs: [],
          },
        ],
      }),
    );

    for (const req of company.trainingRequirements) {
      companySubmissions.push({
        id: `SUB-TR-${req.id}`,
        companyId: String(companyId),
        requirementId: `SPCE-TR-${req.id}`,
        linkedTrainingConfigs: [
          {
            trainingCode: courseCodeFromName(req.courseName),
            validityDays: req.expiresInDays,
          },
        ],
      });
    }

    return {
      context: {
        jurisdiction: company.province ?? undefined,
        dateNow: new Date().toISOString(),
      },
      hiringClientProgramRequirements,
      companySubmissions,
      ...overrides,
    };
  }

  async runSafetyProgramCompliance(
    companyId: number,
    createdByUserId?: number,
    inputOverride?: Partial<SpceAssessmentInput>,
  ): Promise<{ runId: string; result: SpceAssessmentResult }> {
    const input = await this.buildSpceInput(companyId, inputOverride);
    const result = evaluateSafetyProgramCompliance(input);

    const run = await this.prisma.veraAssessmentRun.create({
      data: {
        engine: VeraAssessmentEngine.SAFETY_PROGRAM_COMPLIANCE,
        companyId,
        overallScore: result.overallScore,
        overallStatus: result.overallStatus,
        resultJson: result as unknown as Prisma.InputJsonValue,
        createdByUserId,
      },
    });

    await this.auditLog.logAudit(
      { id: createdByUserId ?? null, companyId },
      AuditAction.ASSESSMENT_SPCE_RUN,
      {
        type: AuditEntityType.VERA_ASSESSMENT_RUN,
        id: run.id,
        tenantId: companyId,
      },
      {
        overallScore: result.overallScore,
        overallStatus: result.overallStatus,
      },
    );

    return { runId: run.id, result };
  }

  async runSmartGapAnalysis(
    companyId: number,
    hiringClientId: number,
    createdByUserId?: number,
    projectId?: number,
  ): Promise<{ runId: string; result: SgaeAssessmentResult }> {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });
    if (!company) throw new NotFoundException('Company not found');

    const spceInput = await this.buildSpceInput(companyId);
    const spce = evaluateSafetyProgramCompliance(spceInput);
    await this.prisma.veraAssessmentRun.create({
      data: {
        engine: VeraAssessmentEngine.SAFETY_PROGRAM_COMPLIANCE,
        companyId,
        overallScore: spce.overallScore,
        overallStatus: spce.overallStatus,
        resultJson: spce as unknown as Prisma.InputJsonValue,
        createdByUserId,
      },
    });

    const workerIds = await this.resolveWorkerIds(companyId, projectId);
    const taeResults = [];
    for (const wid of workerIds.slice(0, 50)) {
      const { result } = await this.trainingRunner.evaluateAndPersist(
        wid,
        createdByUserId,
        projectId ? { projectId } : undefined,
      );
      taeResults.push(result);
    }

    const fieldDataSummary = await this.buildFieldDataSummary(
      companyId,
      projectId,
    );

    const sgaResult = evaluateSmartGapAnalysis({
      context: {
        jurisdiction: company.province ?? undefined,
        dateNow: new Date().toISOString(),
      },
      company: { id: String(companyId), name: company.name },
      hiringClient: { id: String(hiringClientId), name: company.name },
      spceResults: spce,
      taeResults,
      fieldDataSummary,
    });

    const run = await this.prisma.veraAssessmentRun.create({
      data: {
        engine: VeraAssessmentEngine.SMART_GAP_ANALYSIS,
        companyId,
        projectId,
        hiringClientId,
        overallScore: sgaResult.overallGapScore,
        overallStatus: sgaResult.overallStatus,
        resultJson: sgaResult as unknown as Prisma.InputJsonValue,
        createdByUserId,
      },
    });

    await this.auditLog.logAudit(
      { id: createdByUserId ?? null, companyId },
      AuditAction.ASSESSMENT_SGAE_RUN,
      {
        type: AuditEntityType.VERA_ASSESSMENT_RUN,
        id: run.id,
        tenantId: companyId,
      },
      {
        projectId,
        hiringClientId,
        overallScore: sgaResult.overallGapScore,
        overallStatus: sgaResult.overallStatus,
      },
    );

    return { runId: run.id, result: sgaResult };
  }

  async getLatestByEngine(
    engine: VeraAssessmentEngine,
    filters: { companyId?: number; workerId?: number; projectId?: number },
  ) {
    return this.prisma.veraAssessmentRun.findFirst({
      where: {
        engine,
        ...(filters.companyId ? { companyId: filters.companyId } : {}),
        ...(filters.workerId ? { workerId: filters.workerId } : {}),
        ...(filters.projectId ? { projectId: filters.projectId } : {}),
      },
      orderBy: { evaluatedAt: 'desc' },
    });
  }

  async listHistoryByEngine(
    engine: VeraAssessmentEngine,
    filters: { companyId: number; projectId?: number },
    limit = 6,
  ) {
    const rows = await this.prisma.veraAssessmentRun.findMany({
      where: {
        engine,
        companyId: filters.companyId,
        ...(filters.projectId ? { projectId: filters.projectId } : {}),
      },
      orderBy: { evaluatedAt: 'desc' },
      take: Math.min(Math.max(limit, 2), 24),
      select: {
        id: true,
        overallScore: true,
        overallStatus: true,
        evaluatedAt: true,
      },
    });
    return rows.reverse();
  }

  private async resolveWorkerIds(companyId: number, projectId?: number) {
    if (projectId) {
      const rows = await this.prisma.projectAssignment.findMany({
        where: { projectId, companyId, status: 'ACTIVE' },
        select: { workerId: true },
      });
      return rows.map((r) => r.workerId);
    }
    const links = await this.prisma.companyLink.findMany({
      where: { companyId, active: true },
      select: { workerId: true },
    });
    return links.map((l) => l.workerId);
  }

  private async buildFieldDataSummary(companyId: number, projectId?: number) {
    const since90 = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const since12mo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);

    const projectFilter = projectId ? { projectId } : { companyId };

    const [
      jhaCount,
      flhaCount,
      inspectionCount,
      incidentCount,
      highSeverity,
      openCapa,
      overdueCapa,
      workerCount,
    ] = await Promise.all([
      this.prisma.jhaFlha.count({
        where: { ...projectFilter, kind: 'JHA', createdAt: { gte: since90 } },
      }),
      this.prisma.jhaFlha.count({
        where: { ...projectFilter, kind: 'FLHA', createdAt: { gte: since90 } },
      }),
      this.prisma.pmInspection.count({
        where: {
          ...projectFilter,
          deletedAt: null,
          createdAt: { gte: since90 },
        },
      }),
      this.prisma.pmSafetyEvent.count({
        where: {
          ...projectFilter,
          deletedAt: null,
          occurredAt: { gte: since90 },
        },
      }),
      this.prisma.pmSafetyEvent.count({
        where: {
          ...projectFilter,
          deletedAt: null,
          occurredAt: { gte: since12mo },
          severity: { in: ['high', 'critical'] },
        },
      }),
      this.prisma.pmCorrectiveAction.count({
        where: {
          ...projectFilter,
          deletedAt: null,
          status: { in: ['open', 'assigned', 'in_progress'] },
        },
      }),
      this.prisma.pmCorrectiveAction.count({
        where: {
          ...projectFilter,
          deletedAt: null,
          status: { in: ['open', 'assigned', 'in_progress'] },
          dueAt: { lt: new Date() },
        },
      }),
      projectId
        ? this.prisma.projectAssignment.count({
            where: { projectId, status: 'ACTIVE' },
          })
        : this.prisma.companyLink.count({
            where: { companyId, active: true },
          }),
    ]);

    return {
      jhaCountLast90Days: jhaCount,
      flhaCountLast90Days: flhaCount,
      inspectionCountLast90Days: inspectionCount,
      incidentCountLast90Days: incidentCount,
      highSeverityIncidentsLast12Months: highSeverity,
      openCorrectiveActions: openCapa,
      overdueCorrectiveActions: overdueCapa,
      workerCount,
    };
  }
}
