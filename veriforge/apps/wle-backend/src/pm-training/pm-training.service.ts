import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  PmCompanyTrainingCategory,
  PmCompanyTrainingRoleType,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PmCompanySafetyContextService } from '../pm-company-safety-context/pm-company-safety-context.service';
import { WorkerTrainingEngine } from '../pm-worker-safety-profile/worker-training.engine';
import { TrainingExpiryEngine } from './training-expiry.engine';
import { TrainingMatrixEngine } from './training-matrix.engine';
import { TrainingAutoAssignmentEngine } from './training-auto-assignment.engine';

@Injectable()
export class PmTrainingService {
  private readonly workerTraining: WorkerTrainingEngine;

  constructor(
    private readonly prisma: PrismaService,
    private readonly companyContext: PmCompanySafetyContextService,
    private readonly expiry: TrainingExpiryEngine,
    private readonly matrixEngine: TrainingMatrixEngine,
    private readonly autoAssign: TrainingAutoAssignmentEngine,
  ) {
    this.workerTraining = new WorkerTrainingEngine(prisma);
  }

  private async audit(
    workerId: number,
    courseId: string,
    eventType: string,
    actorId?: number,
    payload?: Record<string, unknown>,
  ) {
    await this.prisma.pmWorkerSafetyAuditLog.create({
      data: {
        workerId,
        entityType: 'training',
        entityId: courseId,
        eventType,
        actorId,
        payload: payload as Prisma.InputJsonValue | undefined,
      },
    });
  }

  private mapRecord(
    record: Prisma.TrainingRecordGetPayload<{
      include: { certification: true };
    }>,
    expiresInDays = 365,
  ) {
    return {
      id: record.id,
      workerId: record.workerId,
      courseId: record.certificationId,
      courseCode: record.certification.code ?? record.certification.name,
      courseName: record.certification.name,
      completionDate: record.completedAt,
      expiryDate: record.expiresAt,
      competencyLevel: record.completedAt ? 2 : 1,
      certificatePath: record.certificateUrl,
      certificateNumber: record.certificateNumber,
      verifiedBy: record.certificateSignedByInstructorId,
      verifiedAt: record.certificateSignedAt,
      status: this.expiry.deriveStatus(record, expiresInDays),
    };
  }

  async listCourses(companyId: number) {
    const matrix = await this.companyContext.listTrainingMatrix(companyId);
    const certs = await this.prisma.certification.findMany({
      orderBy: { name: 'asc' },
      take: 200,
    });
    const courses = await this.prisma.trainingCourse.findMany({
      where: { active: true },
      include: { provider: { select: { name: true } } },
      take: 200,
    });

    const fromMatrix = matrix.map((m) => ({
      id: m.trainingCode,
      companyId,
      name: m.trainingName,
      category: m.category,
      provider: null,
      durationHours: null,
      expiryDays: m.expiresInDays,
      source: 'matrix' as const,
    }));

    return {
      matrixCourses: fromMatrix,
      certifications: certs.map((c) => ({
        id: c.id,
        companyId,
        name: c.name,
        category: 'certification',
        code: c.code,
        expiryDays: 365,
        source: 'certification' as const,
      })),
      providerCourses: courses.map((c) => ({
        id: c.id,
        companyId,
        name: c.name,
        category: 'provider_course',
        provider: c.provider.name,
        durationHours: c.durationHours,
        expiryDays: c.validityDays ?? 365,
        source: 'training_course' as const,
      })),
    };
  }

  async createCourse(input: {
    companyId: number;
    name: string;
    category?: PmCompanyTrainingCategory;
    trainingCode?: string;
    roleType?: PmCompanyTrainingRoleType;
    provider?: string;
    durationHours?: number;
    expiryDays?: number;
    actorId?: number;
  }) {
    const code =
      input.trainingCode ??
      input.name
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, '_')
        .slice(0, 40);

    let cert = await this.prisma.certification.findFirst({
      where: { OR: [{ code }, { name: input.name }] },
    });
    if (!cert) {
      cert = await this.prisma.certification.create({
        data: { name: input.name, code, description: input.provider ?? null },
      });
    }

    await this.companyContext.upsertTrainingRule(
      input.companyId,
      {
        roleType: input.roleType ?? 'worker',
        category: input.category ?? 'general_safety',
        trainingCode: code,
        trainingName: input.name,
        expiresInDays: input.expiryDays ?? 365,
      },
      input.actorId,
    );

    return {
      id: cert.id,
      companyId: input.companyId,
      name: input.name,
      category: input.category ?? 'general_safety',
      provider: input.provider ?? null,
      durationHours: input.durationHours ?? null,
      expiryDays: input.expiryDays ?? 365,
      trainingCode: code,
    };
  }

  async getMatrix(companyId: number) {
    const rows = await this.companyContext.listTrainingMatrix(companyId);
    return {
      companyId,
      roles: this.matrixEngine.groupByRole(rows),
      rows,
    };
  }

  async upsertMatrix(input: {
    companyId: number;
    roleType: PmCompanyTrainingRoleType;
    requiredCourses: Array<{
      trainingCode: string;
      trainingName: string;
      category?: PmCompanyTrainingCategory;
      expiresInDays?: number;
    }>;
    actorId?: number;
  }) {
    const results = [];
    for (const course of input.requiredCourses) {
      const row = await this.companyContext.upsertTrainingRule(
        input.companyId,
        {
          roleType: input.roleType,
          category: course.category ?? 'general_safety',
          trainingCode: course.trainingCode,
          trainingName: course.trainingName,
          expiresInDays: course.expiresInDays ?? 365,
        },
        input.actorId,
      );
      results.push(row);
    }
    return {
      companyId: input.companyId,
      roleType: input.roleType,
      rules: results,
    };
  }

  async getWorkerTraining(
    workerId: number,
    roleType: PmCompanyTrainingRoleType = 'worker',
  ) {
    const worker = await this.prisma.worker.findUnique({
      where: { id: workerId },
      include: {
        trainingRecords: { include: { certification: true, provider: true } },
      },
    });
    if (!worker) throw new NotFoundException('Worker not found');

    const matrix = worker.companyId
      ? await this.prisma.pmCompanyTrainingMatrix.findMany({
          where: {
            companyId: worker.companyId,
            roleType,
            active: true,
            status: 'published',
          },
        })
      : [];

    const snapshots = await this.prisma.pmWorkerSafetyTraining.findMany({
      where: { workerId },
      orderBy: { updatedAt: 'desc' },
    });

    const records = worker.trainingRecords.map((r) => {
      const rule = matrix.find((m) =>
        (r.certification.code ?? r.certification.name)
          .toUpperCase()
          .includes(m.trainingCode.toUpperCase()),
      );
      return this.mapRecord(r, rule?.expiresInDays ?? 365);
    });

    const check = worker.companyId
      ? await this.companyContext.workerTrainingCheck(workerId, roleType)
      : { complete: true, missing: [] as string[] };

    const gaps = this.workerTraining.gapsFromMatrix(
      matrix.map((m) => ({
        trainingCode: m.trainingCode,
        trainingName: m.trainingName,
      })),
      snapshots.map((s) => ({
        trainingCode: s.trainingCode,
        status: s.status,
      })),
    );

    return {
      workerId,
      companyId: worker.companyId,
      records,
      snapshots,
      matrixGaps: gaps,
      compliance: check,
      accessBlocked: !check.complete,
    };
  }

  async resolveCertification(courseId: number | string, courseName?: string) {
    if (typeof courseId === 'number') {
      const cert = await this.prisma.certification.findUnique({
        where: { id: courseId },
      });
      if (!cert) throw new NotFoundException('Course/certification not found');
      return cert;
    }
    const code = String(courseId);
    let cert = await this.prisma.certification.findFirst({
      where: {
        OR: [
          { code: { equals: code, mode: 'insensitive' } },
          { name: { contains: code, mode: 'insensitive' } },
        ],
      },
    });
    if (!cert && courseName) {
      cert = await this.prisma.certification.create({
        data: { name: courseName, code },
      });
    }
    if (!cert) throw new NotFoundException(`Course not found: ${code}`);
    return cert;
  }

  async assign(input: {
    workerId: number;
    courseId: number | string;
    courseName?: string;
    companyId?: number;
    projectId?: number;
    expiresInDays?: number;
    actorId?: number;
  }) {
    const worker = await this.prisma.worker.findUnique({
      where: { id: input.workerId },
    });
    if (!worker) throw new NotFoundException('Worker not found');

    const cert = await this.resolveCertification(
      input.courseId,
      input.courseName,
    );
    const days = input.expiresInDays ?? 365;
    const issuedAt = new Date();
    const expiresAt = new Date(issuedAt.getTime() + days * 86400000);

    const record = await this.prisma.trainingRecord.create({
      data: {
        workerId: input.workerId,
        certificationId: cert.id,
        companyId: input.companyId ?? worker.companyId ?? undefined,
        projectId: input.projectId,
        issuedAt,
        expiresAt,
      },
      include: { certification: true },
    });

    await this.audit(
      input.workerId,
      String(cert.id),
      'assigned',
      input.actorId,
      {
        recordId: record.id,
        trainingCode: cert.code ?? cert.name,
      },
    );

    return this.mapRecord(record, days);
  }

  async complete(recordId: number, actorId?: number) {
    const record = await this.prisma.trainingRecord.update({
      where: { id: recordId },
      data: { completedAt: new Date() },
      include: { certification: true },
    });

    await this.workerTraining.syncFromRecords(record.workerId);
    await this.audit(
      record.workerId,
      String(record.certificationId),
      'completed',
      actorId,
      {
        recordId,
      },
    );

    return this.mapRecord(record);
  }

  async verify(
    recordId: number,
    input: {
      certificateUrl?: string;
      certificateNumber?: string;
      verifiedByUserId?: number;
      actorId?: number;
    },
  ) {
    const existing = await this.prisma.trainingRecord.findUnique({
      where: { id: recordId },
    });
    if (!existing) throw new NotFoundException('Training record not found');
    if (!existing.completedAt) {
      throw new BadRequestException(
        'Training must be completed before verification',
      );
    }
    if (
      !input.certificateUrl &&
      !input.certificateNumber &&
      !existing.certificateUrl
    ) {
      throw new BadRequestException('Certificate required for verification');
    }

    const record = await this.prisma.trainingRecord.update({
      where: { id: recordId },
      data: {
        certificateUrl: input.certificateUrl ?? existing.certificateUrl,
        certificateNumber:
          input.certificateNumber ?? existing.certificateNumber,
        certificateSignedAt: new Date(),
        certificateSignedByInstructorId:
          input.verifiedByUserId ?? input.actorId,
      },
      include: { certification: true },
    });

    await this.workerTraining.syncFromRecords(record.workerId);
    await this.audit(
      record.workerId,
      String(record.certificationId),
      'verified',
      input.actorId,
      {
        recordId,
      },
    );

    return this.mapRecord(record);
  }

  async autoAssignForWorker(
    workerId: number,
    roleType: PmCompanyTrainingRoleType = 'worker',
    actorId?: number,
  ) {
    const worker = await this.prisma.worker.findUnique({
      where: { id: workerId },
      include: { trainingRecords: { include: { certification: true } } },
    });
    if (!worker?.companyId)
      return { assigned: [] as ReturnType<typeof this.mapRecord>[] };

    const matrix = await this.prisma.pmCompanyTrainingMatrix.findMany({
      where: {
        companyId: worker.companyId,
        roleType,
        active: true,
        status: 'published',
      },
    });

    const held = worker.trainingRecords.map(
      (r) => r.certification.code ?? r.certification.name,
    );
    const missing = this.autoAssign.missingAssignments(
      matrix.map((m) => ({
        trainingCode: m.trainingCode,
        trainingName: m.trainingName,
        expiresInDays: m.expiresInDays,
      })),
      held,
    );

    const assigned = [];
    for (const rule of missing) {
      assigned.push(
        await this.assign({
          workerId,
          courseId: rule.trainingCode,
          courseName: rule.trainingName,
          expiresInDays: rule.expiresInDays,
          actorId,
        }),
      );
    }
    return { assigned };
  }

  async syncOffline(payload: {
    clientSyncId: string;
    workerId: number;
    courseId: number | string;
    courseName?: string;
    completed?: boolean;
    verified?: boolean;
    certificateUrl?: string;
    certificateNumber?: string;
    completionDate?: string;
    expiryDate?: string;
    actorId?: number;
  }) {
    const cert = await this.resolveCertification(
      payload.courseId,
      payload.courseName,
    );
    const existing = await this.prisma.trainingRecord.findFirst({
      where: {
        workerId: payload.workerId,
        certificationId: cert.id,
      },
      include: { certification: true },
      orderBy: { issuedAt: 'desc' },
    });

    if (existing) {
      if (payload.completed && !existing.completedAt) {
        await this.complete(existing.id, payload.actorId);
      }
      if (payload.verified) {
        return this.verify(existing.id, {
          certificateUrl: payload.certificateUrl,
          certificateNumber: payload.certificateNumber,
          actorId: payload.actorId,
        });
      }
      return this.mapRecord(
        await this.prisma.trainingRecord.findUniqueOrThrow({
          where: { id: existing.id },
          include: { certification: true },
        }),
      );
    }

    const assigned = await this.assign({
      workerId: payload.workerId,
      courseId: payload.courseId,
      courseName: payload.courseName,
      actorId: payload.actorId,
    });

    const record = await this.prisma.trainingRecord.findFirst({
      where: {
        workerId: payload.workerId,
        certificationId: assigned.courseId as number,
      },
      include: { certification: true },
    });
    if (!record) return assigned;

    if (payload.completionDate || payload.expiryDate) {
      await this.prisma.trainingRecord.update({
        where: { id: record.id },
        data: {
          ...(payload.completionDate
            ? { completedAt: new Date(payload.completionDate) }
            : {}),
          ...(payload.expiryDate
            ? { expiresAt: new Date(payload.expiryDate) }
            : {}),
        },
      });
    }

    if (payload.completed) await this.complete(record.id, payload.actorId);
    if (payload.verified) {
      return this.verify(record.id, {
        certificateUrl: payload.certificateUrl,
        certificateNumber: payload.certificateNumber,
        actorId: payload.actorId,
      });
    }

    return this.mapRecord(
      await this.prisma.trainingRecord.findUniqueOrThrow({
        where: { id: record.id },
        include: { certification: true },
      }),
    );
  }
}
