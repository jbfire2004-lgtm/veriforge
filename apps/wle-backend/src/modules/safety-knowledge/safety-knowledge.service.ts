import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, VeraAssessmentEngine } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { evaluateSafetyKnowledge } from './safety-knowledge.engine';
import type { SkeAssessmentResult } from './safety-knowledge.types';
import { courseCodeFromName } from '../assessment-engines/assessment-engines.utils';
import { buildTextPdfBuffer } from '../../common/pdf/build-text-pdf';
import { AuditLogService } from '../../audit/audit-log.service';
import { AuditAction, AuditEntityType } from '../../audit/audit-actions';

@Injectable()
export class SafetyKnowledgeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
  ) {}

  async buildInput(workerId: number) {
    const worker = await this.prisma.worker.findUnique({
      where: { id: workerId },
      include: {
        company: { include: { trainingRequirements: true } },
        trainingRecords: {
          include: { certification: true },
          orderBy: { issuedAt: 'desc' },
        },
      },
    });
    if (!worker) throw new NotFoundException('Worker not found');

    const since90 = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const companyId = worker.companyId;

    const [
      orientationForms,
      policyRequired,
      policyCompleted,
      flha,
      bbo,
      inspections,
    ] = await Promise.all([
      this.prisma.safetyForm.count({
        where: {
          workerId,
          definitionId: 'site-orientation',
          status: 'SUBMITTED',
        },
      }),
      companyId
        ? this.prisma.policyDocument.count({
            where: { companyId, requiresAck: true, status: 'published' },
          })
        : Promise.resolve(0),
      companyId
        ? this.prisma.policyAcknowledgment.count({
            where: {
              workerId,
              policyDocument: { companyId, requiresAck: true },
            },
          })
        : Promise.resolve(0),
      companyId
        ? this.prisma.jhaFlha.count({
            where: {
              companyId,
              kind: 'FLHA',
              createdAt: { gte: since90 },
              workers: { some: { workerId } },
            },
          })
        : Promise.resolve(0),
      companyId
        ? this.prisma.bboObservation.count({
            where: {
              workerId,
              createdAt: { gte: since90 },
              project: { companyId },
            },
          })
        : Promise.resolve(0),
      companyId
        ? this.prisma.pmInspection.count({
            where: {
              companyId,
              workerId,
              deletedAt: null,
              createdAt: { gte: since90 },
            },
          })
        : Promise.resolve(0),
    ]);

    const now = new Date();
    const soon = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    return {
      context: {
        dateNow: now.toISOString(),
        jurisdiction: worker.company?.province ?? undefined,
      },
      worker: {
        id: String(workerId),
        name: `${worker.firstName} ${worker.lastName}`,
        companyId: worker.companyId ? String(worker.companyId) : undefined,
      },
      requiredCourses: (worker.company?.trainingRequirements ?? []).map(
        (r) => ({
          code: courseCodeFromName(r.courseName),
          name: r.courseName,
        }),
      ),
      trainingRecords: worker.trainingRecords.map((r) => ({
        courseCode:
          r.certification.code ?? courseCodeFromName(r.certification.name),
        verified: !!r.certificateSignedAt,
        expired: !!(r.expiresAt && r.expiresAt <= now),
        expiringSoon: !!(
          r.expiresAt &&
          r.expiresAt > now &&
          r.expiresAt <= soon
        ),
      })),
      orientationComplete: orientationForms > 0,
      policyAcknowledgments: {
        required: policyRequired,
        completed: policyCompleted,
      },
      fieldActivity: {
        flhaCount90d: flha,
        bboCount90d: bbo,
        inspections90d: inspections,
      },
    };
  }

  async evaluateAndPersist(
    workerId: number,
    createdByUserId?: number,
  ): Promise<{ runId: string; result: SkeAssessmentResult }> {
    const input = await this.buildInput(workerId);
    const result = evaluateSafetyKnowledge(input);

    const worker = await this.prisma.worker.findUnique({
      where: { id: workerId },
      select: { companyId: true },
    });

    const run = await this.prisma.veraAssessmentRun.create({
      data: {
        engine: VeraAssessmentEngine.SAFETY_KNOWLEDGE,
        workerId,
        companyId: worker?.companyId ?? undefined,
        overallScore: result.overallScore,
        overallStatus: result.overallStatus,
        resultJson: result as unknown as Prisma.InputJsonValue,
        createdByUserId,
      },
    });

    await this.auditLog.logAudit(
      { id: createdByUserId ?? null, companyId: worker?.companyId ?? null },
      AuditAction.ASSESSMENT_SKE_RUN,
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

    return { runId: run.id, result };
  }

  async getLatest(workerId: number) {
    return this.prisma.veraAssessmentRun.findFirst({
      where: {
        workerId,
        engine: VeraAssessmentEngine.SAFETY_KNOWLEDGE,
      },
      orderBy: { evaluatedAt: 'desc' },
    });
  }

  async listHistory(workerId: number, limit = 10) {
    return this.prisma.veraAssessmentRun.findMany({
      where: {
        workerId,
        engine: VeraAssessmentEngine.SAFETY_KNOWLEDGE,
      },
      orderBy: { evaluatedAt: 'desc' },
      take: Math.min(Math.max(limit, 1), 50),
      select: {
        id: true,
        overallScore: true,
        overallStatus: true,
        evaluatedAt: true,
        createdByUserId: true,
      },
    });
  }

  buildPdf(result: SkeAssessmentResult, workerName: string): Buffer {
    const lines = [
      `Worker: ${workerName}`,
      `Overall: ${result.overallStatus} (${result.overallScore}/100)`,
      '',
      'Domains:',
      ...result.domains.map(
        (d) =>
          `- ${d.domain}: ${d.status} (${d.score})${
            d.gaps[0] ? ` — ${d.gaps[0]}` : ''
          }`,
      ),
      '',
      'Recommendations:',
      ...(result.recommendations.length
        ? result.recommendations.map((r) => `- ${r}`)
        : ['- None']),
    ];
    return buildTextPdfBuffer({
      title: 'VERA Safety Knowledge Assessment',
      subtitle: `Worker ${result.workerId}`,
      lines,
    });
  }
}
