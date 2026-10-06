import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TrainingValidationOutcome, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { CompanyActor } from './companies.service';

const EXPIRING_SOON_DAYS = 30;

export type TrainingComplianceBucket =
  | 'verified'
  | 'pending'
  | 'rejected'
  | 'expiring';

export type WorkerComplianceFlag =
  | 'NON_COMPLIANT'
  | 'EXPIRING_TRAINING'
  | 'INVALID_TRAINING';

export type TrainingComplianceRow = {
  trainingRecordId: number;
  workerId: number;
  workerName: string;
  courseName: string;
  providerName: string | null;
  issuedAt: string | null;
  expiresAt: string | null;
  validationOutcome: TrainingValidationOutcome | null;
  projectId: number | null;
  projectName: string | null;
};

export type FlaggedWorkerRow = {
  workerId: number;
  firstName: string;
  lastName: string;
  flags: WorkerComplianceFlag[];
};

export type TrainingComplianceCounts = {
  verified: number;
  pending: number;
  rejected: number;
  expiring: number;
};

export type ProjectTrainingComplianceSummary = {
  projectId: number;
  projectName: string;
  counts: TrainingComplianceCounts;
  flaggedWorkerCount: number;
};

export type CompanyTrainingComplianceDashboard = {
  companyId: number;
  companyName: string;
  updatedAt: string;
  counts: TrainingComplianceCounts;
  records: Record<TrainingComplianceBucket, TrainingComplianceRow[]>;
  flaggedWorkers: FlaggedWorkerRow[];
  projects: ProjectTrainingComplianceSummary[];
  status: 'COMPLIANT' | 'NON_COMPLIANT';
};

type RecordWithRelations = {
  id: number;
  workerId: number;
  issuedAt: Date;
  expiresAt: Date | null;
  completedAt: Date | null;
  lastVerificationStatus: string | null;
  companyId: number | null;
  projectId: number | null;
  certification: { name: string };
  trainingProvider: { name: string } | null;
  course: { name: string } | null;
  project: { name: string } | null;
  worker: { firstName: string; lastName: string; companyId: number | null };
};

@Injectable()
export class CompanyTrainingComplianceService {
  constructor(private readonly prisma: PrismaService) {}

  async refreshAfterTrainingRecord(trainingRecordId: number): Promise<void> {
    const record = await this.prisma.trainingRecord.findUnique({
      where: { id: trainingRecordId },
      select: {
        companyId: true,
        projectId: true,
        workerId: true,
        worker: { select: { companyId: true } },
      },
    });
    if (!record) return;

    const companyId = record.companyId ?? record.worker.companyId ?? undefined;
    if (companyId) {
      await this.refreshCompanyWorkerFlags(companyId);
    }
  }

  async getCompanyDashboard(
    companyId: number,
    actor?: CompanyActor,
  ): Promise<CompanyTrainingComplianceDashboard> {
    await this.assertCompanyAccess(companyId, actor);

    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      select: { id: true, name: true },
    });
    if (!company) throw new NotFoundException('Company not found');

    const records = await this.loadCompanyTrainingRecords(companyId);
    const validationByRecord = await this.latestValidationsByRecord(
      records.map((r) => r.id),
    );

    const buckets = this.bucketRecords(records, validationByRecord);
    const flaggedWorkers = await this.buildFlaggedWorkers(
      companyId,
      records,
      validationByRecord,
    );

    const projects = await this.buildProjectSummaries(
      companyId,
      records,
      validationByRecord,
    );

    const hasBlocking =
      buckets.rejected.length > 0 ||
      flaggedWorkers.some((w) => w.flags.includes('NON_COMPLIANT'));

    return {
      companyId: company.id,
      companyName: company.name,
      updatedAt: new Date().toISOString(),
      counts: {
        verified: buckets.verified.length,
        pending: buckets.pending.length,
        rejected: buckets.rejected.length,
        expiring: buckets.expiring.length,
      },
      records: buckets,
      flaggedWorkers,
      projects,
      status: hasBlocking ? 'NON_COMPLIANT' : 'COMPLIANT',
    };
  }

  async getProjectDashboard(
    companyId: number,
    projectId: number,
    actor?: CompanyActor,
  ): Promise<{
    projectId: number;
    projectName: string;
    companyId: number;
    updatedAt: string;
    counts: TrainingComplianceCounts;
    records: Record<TrainingComplianceBucket, TrainingComplianceRow[]>;
    flaggedWorkers: FlaggedWorkerRow[];
  }> {
    await this.assertCompanyAccess(companyId, actor);

    const project = await this.prisma.project.findFirst({
      where: { id: projectId, companyId },
      select: { id: true, name: true, companyId: true },
    });
    if (!project) throw new NotFoundException('Project not found');

    const allRecords = await this.loadCompanyTrainingRecords(companyId);
    const records = allRecords.filter((r) => r.projectId === projectId);
    const validationByRecord = await this.latestValidationsByRecord(
      records.map((r) => r.id),
    );
    const buckets = this.bucketRecords(records, validationByRecord);
    const flaggedWorkers = await this.buildFlaggedWorkers(
      companyId,
      records,
      validationByRecord,
    );

    return {
      projectId: project.id,
      projectName: project.name,
      companyId: project.companyId,
      updatedAt: new Date().toISOString(),
      counts: {
        verified: buckets.verified.length,
        pending: buckets.pending.length,
        rejected: buckets.rejected.length,
        expiring: buckets.expiring.length,
      },
      records: buckets,
      flaggedWorkers,
    };
  }

  private async refreshCompanyWorkerFlags(companyId: number): Promise<void> {
    const records = await this.loadCompanyTrainingRecords(companyId);
    const validationByRecord = await this.latestValidationsByRecord(
      records.map((r) => r.id),
    );
    const flagged = await this.buildFlaggedWorkers(
      companyId,
      records,
      validationByRecord,
    );
    const flagByWorker = new Map(flagged.map((f) => [f.workerId, f.flags]));

    const links = await this.prisma.companyLink.findMany({
      where: { companyId, active: true },
    });

    for (const link of links) {
      const flags = flagByWorker.get(link.workerId) ?? [];
      const existing =
        link.visibilityRules != null &&
        typeof link.visibilityRules === 'object' &&
        !Array.isArray(link.visibilityRules)
          ? (link.visibilityRules as Record<string, unknown>)
          : {};

      await this.prisma.companyLink.update({
        where: { id: link.id },
        data: {
          visibilityRules: {
            ...existing,
            complianceFlags: {
              nonCompliant: flags.includes('NON_COMPLIANT'),
              expiringTraining: flags.includes('EXPIRING_TRAINING'),
              invalidTraining: flags.includes('INVALID_TRAINING'),
              flags,
              updatedAt: new Date().toISOString(),
            },
          },
        },
      });
    }
  }

  private async loadCompanyTrainingRecords(
    companyId: number,
  ): Promise<RecordWithRelations[]> {
    const workers = await this.prisma.worker.findMany({
      where: { companyId },
      select: { id: true },
    });
    const workerIds = workers.map((w) => w.id);

    return this.prisma.trainingRecord.findMany({
      where: {
        OR: [{ companyId }, { workerId: { in: workerIds } }],
      },
      include: {
        certification: true,
        trainingProvider: true,
        course: true,
        project: true,
        worker: {
          select: { firstName: true, lastName: true, companyId: true },
        },
      },
      orderBy: { issuedAt: 'desc' },
    });
  }

  private async latestValidationsByRecord(
    recordIds: number[],
  ): Promise<Map<number, { outcome: TrainingValidationOutcome }>> {
    if (recordIds.length === 0) return new Map();

    const validations = await this.prisma.trainingValidationResult.findMany({
      where: { trainingRecordId: { in: recordIds } },
      orderBy: { validatedAt: 'desc' },
      select: { trainingRecordId: true, outcome: true },
    });

    const map = new Map<number, { outcome: TrainingValidationOutcome }>();
    for (const v of validations) {
      if (v.trainingRecordId && !map.has(v.trainingRecordId)) {
        map.set(v.trainingRecordId, { outcome: v.outcome });
      }
    }
    return map;
  }

  private bucketRecords(
    records: RecordWithRelations[],
    validationByRecord: Map<number, { outcome: TrainingValidationOutcome }>,
  ): Record<TrainingComplianceBucket, TrainingComplianceRow[]> {
    const buckets: Record<TrainingComplianceBucket, TrainingComplianceRow[]> = {
      verified: [],
      pending: [],
      rejected: [],
      expiring: [],
    };

    const now = new Date();
    const soon = new Date();
    soon.setDate(now.getDate() + EXPIRING_SOON_DAYS);

    for (const record of records) {
      const row = this.toRow(
        record,
        validationByRecord.get(record.id)?.outcome ?? null,
      );
      const outcome = validationByRecord.get(record.id)?.outcome ?? null;
      const expired = Boolean(record.expiresAt && record.expiresAt <= now);
      const expiringSoon = Boolean(
        record.expiresAt && record.expiresAt > now && record.expiresAt <= soon,
      );

      const verificationInvalid = record.lastVerificationStatus === 'INVALID';
      const verificationAttention =
        record.lastVerificationStatus === 'ATTENTION';

      if (
        outcome === TrainingValidationOutcome.REJECTED ||
        expired ||
        verificationInvalid
      ) {
        buckets.rejected.push(row);
        continue;
      }

      if (
        outcome === TrainingValidationOutcome.PENDING ||
        outcome === TrainingValidationOutcome.NEEDS_REVIEW ||
        verificationAttention ||
        !outcome
      ) {
        buckets.pending.push(row);
      } else if (
        outcome === TrainingValidationOutcome.APPROVED ||
        record.lastVerificationStatus === 'VERIFIED'
      ) {
        buckets.verified.push(row);
      }

      if (expiringSoon) {
        buckets.expiring.push(row);
      }
    }

    return buckets;
  }

  private async buildFlaggedWorkers(
    companyId: number,
    records: RecordWithRelations[],
    validationByRecord: Map<number, { outcome: TrainingValidationOutcome }>,
  ): Promise<FlaggedWorkerRow[]> {
    const now = new Date();
    const soon = new Date();
    soon.setDate(now.getDate() + EXPIRING_SOON_DAYS);

    const requirements = await this.prisma.trainingRequirement.findMany({
      where: { companyId },
    });

    const workers = await this.prisma.worker.findMany({
      where: { companyId },
      select: { id: true, firstName: true, lastName: true },
    });

    const recordsByWorker = new Map<number, RecordWithRelations[]>();
    for (const r of records) {
      const list = recordsByWorker.get(r.workerId) ?? [];
      list.push(r);
      recordsByWorker.set(r.workerId, list);
    }

    const flagged: FlaggedWorkerRow[] = [];

    for (const worker of workers) {
      const flags = new Set<WorkerComplianceFlag>();
      const workerRecords = recordsByWorker.get(worker.id) ?? [];

      for (const record of workerRecords) {
        const outcome = validationByRecord.get(record.id)?.outcome ?? null;
        if (
          outcome === TrainingValidationOutcome.REJECTED ||
          record.lastVerificationStatus === 'INVALID'
        ) {
          flags.add('INVALID_TRAINING');
        }
        if (record.expiresAt && record.expiresAt <= now) {
          flags.add('NON_COMPLIANT');
        } else if (
          record.expiresAt &&
          record.expiresAt > now &&
          record.expiresAt <= soon
        ) {
          flags.add('EXPIRING_TRAINING');
        }
      }

      for (const req of requirements) {
        const match = workerRecords.find(
          (r) =>
            r.certification.name.toLowerCase() === req.courseName.toLowerCase(),
        );
        if (!match) {
          flags.add('NON_COMPLIANT');
          continue;
        }
        if (match.expiresAt && match.expiresAt <= now) {
          flags.add('NON_COMPLIANT');
        }
      }

      if (flags.size > 0) {
        flagged.push({
          workerId: worker.id,
          firstName: worker.firstName,
          lastName: worker.lastName,
          flags: [...flags],
        });
      }
    }

    return flagged;
  }

  private async buildProjectSummaries(
    companyId: number,
    records: RecordWithRelations[],
    validationByRecord: Map<number, { outcome: TrainingValidationOutcome }>,
  ): Promise<ProjectTrainingComplianceSummary[]> {
    const projects = await this.prisma.project.findMany({
      where: { companyId, status: 'ACTIVE' },
      select: { id: true, name: true },
    });

    return Promise.all(
      projects.map(async (project) => {
        const projectRecords = records.filter(
          (r) => r.projectId === project.id,
        );
        const buckets = this.bucketRecords(projectRecords, validationByRecord);
        const projectFlagged = await this.buildFlaggedWorkers(
          companyId,
          projectRecords,
          validationByRecord,
        );

        return {
          projectId: project.id,
          projectName: project.name,
          counts: {
            verified: buckets.verified.length,
            pending: buckets.pending.length,
            rejected: buckets.rejected.length,
            expiring: buckets.expiring.length,
          },
          flaggedWorkerCount: projectFlagged.length,
        };
      }),
    );
  }

  private toRow(
    record: RecordWithRelations,
    validationOutcome: TrainingValidationOutcome | null,
  ): TrainingComplianceRow {
    return {
      trainingRecordId: record.id,
      workerId: record.workerId,
      workerName: `${record.worker.firstName} ${record.worker.lastName}`.trim(),
      courseName:
        record.course?.name ?? record.certification.name ?? 'Training',
      providerName: record.trainingProvider?.name ?? null,
      issuedAt: record.issuedAt.toISOString(),
      expiresAt: record.expiresAt?.toISOString() ?? null,
      validationOutcome,
      projectId: record.projectId,
      projectName: record.project?.name ?? null,
    };
  }

  private async assertCompanyAccess(
    companyId: number,
    actor?: CompanyActor,
  ): Promise<void> {
    if (actor?.role === UserRole.WORKER) {
      const worker = await this.prisma.worker.findFirst({
        where: { userId: actor.id },
        select: { companyId: true },
      });
      if (!worker?.companyId || worker.companyId !== companyId) {
        throw new ForbiddenException(
          'You may only view compliance for your employer organization.',
        );
      }
    }
  }
}
