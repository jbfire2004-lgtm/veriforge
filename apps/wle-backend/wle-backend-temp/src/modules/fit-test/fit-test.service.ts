import { Injectable, NotFoundException } from '@nestjs/common';
import { FitTestResult, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { buildTextPdfBuffer } from '../../common/pdf/build-text-pdf';
import {
  evaluateFitTest,
  fitTestReadinessScore,
  FIT_TEST_DEFAULT_VALIDITY_YEARS,
  resolveFitTestValidityYears,
  type FitTestEvaluateInput,
} from './fit-test.engine';
import { AuditLogService } from '../../audit/audit-log.service';
import { AuditAction, AuditEntityType } from '../../audit/audit-actions';

export type FitTestRunDto = {
  id: number;
  workerId: number;
  tenantId: number | null;
  testType: string | null;
  testMethod: string | null;
  result: FitTestResult;
  performedAt: string;
  expiresAt: string | null;
  notes: string | null;
  evidenceFilesJson: unknown;
  createdById: number | null;
};

type FitTestRunRow = {
  id: number;
  workerId: number;
  tenantId: number | null;
  testType: string | null;
  testMethod: string | null;
  result: FitTestResult;
  performedAt: Date;
  expiresAt: Date | null;
  notes: string | null;
  evidenceFilesJson: Prisma.JsonValue | null;
  createdById: number | null;
};

@Injectable()
export class FitTestService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
  ) {}

  evaluate(input: {
    result: FitTestResult;
    performedAt?: Date | string;
    expiresAt?: Date | string | null;
    validityYears?: number;
  }) {
    const performedAt =
      input.performedAt instanceof Date
        ? input.performedAt
        : input.performedAt
        ? new Date(input.performedAt)
        : new Date();
    const expiresAt =
      input.expiresAt === null
        ? null
        : input.expiresAt
        ? input.expiresAt instanceof Date
          ? input.expiresAt
          : new Date(input.expiresAt)
        : undefined;
    const validityYears = resolveFitTestValidityYears(input.validityYears);

    const evaluation = evaluateFitTest({
      result: input.result,
      performedAt,
      expiresAt,
      validityYears,
    } satisfies FitTestEvaluateInput);

    return {
      evaluation: {
        ...evaluation,
        expiresAt: evaluation.expiresAt?.toISOString() ?? null,
      },
      validityYears,
    };
  }

  async listHistory(workerId: number): Promise<FitTestRunDto[]> {
    const rows = await this.prisma.fitTestRun.findMany({
      where: { workerId },
      orderBy: { performedAt: 'desc' },
      take: 50,
    });
    return rows.map((row) => this.toDto(row));
  }

  /** @deprecated use listHistory */
  async listForWorker(workerId: number): Promise<FitTestRunDto[]> {
    return this.listHistory(workerId);
  }

  async getLatest(workerId: number) {
    return this.prisma.fitTestRun.findFirst({
      where: { workerId },
      orderBy: { performedAt: 'desc' },
    });
  }

  async run(
    workerId: number,
    data: {
      tenantId?: number;
      testType?: string;
      testMethod?: string;
      result: FitTestResult;
      performedAt?: Date;
      expiresAt?: Date | null;
      notes?: string;
      evidenceFilesJson?: Prisma.InputJsonValue;
      validityYears?: number;
      createdById?: number;
    },
  ) {
    const worker = await this.prisma.worker.findUnique({
      where: { id: workerId },
      select: { id: true, companyId: true, firstName: true, lastName: true },
    });
    if (!worker) throw new NotFoundException('Worker not found');

    const performedAt = data.performedAt ?? new Date();
    const validityYears = resolveFitTestValidityYears(data.validityYears);
    const evaluation = evaluateFitTest({
      result: data.result,
      performedAt,
      expiresAt: data.expiresAt,
      validityYears,
    });

    const tenantId = data.tenantId ?? worker.companyId ?? null;
    const row = await this.prisma.fitTestRun.create({
      data: {
        workerId,
        tenantId: tenantId ?? undefined,
        testType: data.testType,
        testMethod: data.testMethod,
        result: data.result,
        performedAt,
        expiresAt: evaluation.expiresAt,
        notes: data.notes,
        evidenceFilesJson: data.evidenceFilesJson,
        createdById: data.createdById,
      },
    });

    await this.auditLog.logAudit(
      { id: data.createdById ?? null, companyId: tenantId },
      AuditAction.ASSESSMENT_FIT_TEST_RECORD,
      {
        type: AuditEntityType.FIT_TEST_RUN,
        id: row.id,
        tenantId,
      },
      {
        workerId,
        result: data.result,
        performedAt: performedAt.toISOString(),
      },
    );

    return {
      run: this.toDto(row),
      evaluation: {
        ...evaluation,
        expiresAt: evaluation.expiresAt?.toISOString() ?? null,
      },
    };
  }

  /** @deprecated use run */
  async record(
    workerId: number,
    data: {
      companyId?: number;
      tenantId?: number;
      respiratorType?: string;
      testType?: string;
      testMethod?: string;
      outcome?: FitTestResult;
      result?: FitTestResult;
      testedAt?: Date;
      performedAt?: Date;
      nextDueAt?: Date | null;
      expiresAt?: Date | null;
      evidenceNotes?: string;
      notes?: string;
      evidenceFilesJson?: Prisma.InputJsonValue;
      validityYears?: number;
      createdByUserId?: number;
      createdById?: number;
    },
  ) {
    const out = await this.run(workerId, {
      tenantId: data.tenantId ?? data.companyId,
      testType: data.testType ?? data.respiratorType,
      testMethod: data.testMethod,
      result: data.result ?? data.outcome ?? 'CONDITIONAL',
      performedAt: data.performedAt ?? data.testedAt,
      expiresAt: data.expiresAt ?? data.nextDueAt,
      notes: data.notes ?? data.evidenceNotes,
      evidenceFilesJson: data.evidenceFilesJson,
      validityYears: data.validityYears,
      createdById: data.createdById ?? data.createdByUserId,
    });
    return {
      record: out.run,
      evaluation: out.evaluation,
    };
  }

  async summary(workerId: number) {
    const latest = await this.getLatest(workerId);
    if (!latest) return null;
    const evaluation = evaluateFitTest({
      result: latest.result,
      performedAt: latest.performedAt,
      expiresAt: latest.expiresAt,
    });
    return {
      latest: this.toDto(latest),
      evaluation: {
        ...evaluation,
        expiresAt: evaluation.expiresAt?.toISOString() ?? null,
      },
      readinessScore: fitTestReadinessScore({ hasRun: true, evaluation }),
    };
  }

  async companySummary(companyId: number) {
    const links = await this.prisma.companyLink.findMany({
      where: { companyId, active: true },
      select: { workerId: true },
    });
    const workerIds = links.map((l) => l.workerId);
    const totalWorkers = workerIds.length;

    if (!totalWorkers) {
      return {
        totalWorkers: 0,
        current: 0,
        expired: 0,
        expiring30: 0,
        missing: 0,
        failed: 0,
        complianceRate: 100,
      };
    }

    const runs = await this.prisma.fitTestRun.findMany({
      where: { workerId: { in: workerIds } },
      orderBy: { performedAt: 'desc' },
    });

    const latestByWorker = new Map<number, (typeof runs)[0]>();
    for (const run of runs) {
      if (!latestByWorker.has(run.workerId)) {
        latestByWorker.set(run.workerId, run);
      }
    }

    let current = 0;
    let expired = 0;
    let expiring30 = 0;
    let failed = 0;
    let missing = 0;

    for (const workerId of workerIds) {
      const latest = latestByWorker.get(workerId);
      if (!latest) {
        missing += 1;
        continue;
      }
      const evaluation = evaluateFitTest({
        result: latest.result,
        performedAt: latest.performedAt,
        expiresAt: latest.expiresAt,
      });
      if (evaluation.pass) {
        current += 1;
        if (evaluation.expiringSoon) expiring30 += 1;
      } else if (evaluation.expired) {
        expired += 1;
      } else if (latest.result === 'FAIL') {
        failed += 1;
      } else {
        missing += 1;
      }
    }

    const complianceRate =
      totalWorkers > 0 ? Math.round((current / totalWorkers) * 100) : 100;

    return {
      totalWorkers,
      current,
      expired,
      expiring30,
      missing,
      failed,
      complianceRate,
    };
  }

  async exportPdf(workerId: number): Promise<Buffer> {
    const summary = await this.summary(workerId);
    if (!summary) throw new NotFoundException('No fit test on file');

    const worker = await this.prisma.worker.findUnique({
      where: { id: workerId },
      select: { firstName: true, lastName: true, companyId: true },
    });
    const history = await this.listHistory(workerId);

    const lines = [
      `Worker: ${worker ? `${worker.firstName} ${worker.lastName}` : workerId}`,
      `Status: ${summary.evaluation.statusLabel}`,
      `Performed: ${summary.latest.performedAt}`,
      `Expires: ${summary.latest.expiresAt ?? '—'}`,
      `Test type: ${summary.latest.testType ?? '—'}`,
      `Method: ${summary.latest.testMethod ?? '—'}`,
      '',
      'Recent runs:',
      ...history
        .slice(0, 10)
        .map(
          (row) =>
            `- ${row.performedAt.slice(0, 10)} · ${row.result} · ${
              row.testType ?? '—'
            }`,
        ),
    ];

    return buildTextPdfBuffer({
      title: 'VERA Respirator Fit Test Record',
      subtitle: `Worker ${workerId}`,
      lines,
    });
  }

  private toDto(row: FitTestRunRow): FitTestRunDto {
    return {
      id: row.id,
      workerId: row.workerId,
      tenantId: row.tenantId,
      testType: row.testType,
      testMethod: row.testMethod,
      result: row.result,
      performedAt: row.performedAt.toISOString(),
      expiresAt: row.expiresAt?.toISOString() ?? null,
      notes: row.notes,
      evidenceFilesJson: row.evidenceFilesJson,
      createdById: row.createdById,
    };
  }
}

export { FIT_TEST_DEFAULT_VALIDITY_YEARS };
