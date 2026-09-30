import { TrainingStatus } from '@prisma/client';
import { trainingRepository } from '../models/training.repository';
import { expiryEngine, competencyEngine } from '../engines/training.engine';
import { certificateEngine } from '../engines/certificate.engine';
import { ForbiddenError, BadRequestError, NotFoundError } from '../utils/errors';
import type { WorkerTrainingSummary } from '../types';
import { logger } from '../utils/logger';

function mapRecord(
  r: Awaited<ReturnType<typeof trainingRepository.findWorkerRecords>>[number],
) {
  const expired = expiryEngine.isExpired(r.expiryDate);
  const expiringSoon = expiryEngine.isExpiringSoon(r.expiryDate);
  return {
    id: r.id,
    workerId: r.workerId,
    courseId: r.courseId,
    courseName: r.course.name,
    category: r.course.category,
    status: expired && r.status !== TrainingStatus.expired ? 'expired' : r.status,
    completionDate: r.completionDate?.toISOString() ?? null,
    expiryDate: r.expiryDate?.toISOString() ?? null,
    competencyLevel: r.competencyLevel,
    competencyScore: r.competencyScore,
    certificatePath: r.certificatePath,
    assignedAt: r.assignedAt.toISOString(),
    verifiedAt: r.verifiedAt?.toISOString() ?? null,
    expired,
    expiringSoon,
  };
}

async function refreshExpiredRecords(records: Awaited<ReturnType<typeof trainingRepository.findWorkerRecords>>) {
  const toExpire = records
    .filter(
      (r) =>
        r.expiryDate &&
        expiryEngine.isExpired(r.expiryDate) &&
        r.status !== TrainingStatus.expired,
    )
    .map((r) => r.id);

  if (toExpire.length > 0) {
    await trainingRepository.markExpired(toExpire);
  }
}

export const trainingService = {
  assertCompanyAccess(tokenCompanyId: string, requestedCompanyId: string) {
    if (tokenCompanyId !== requestedCompanyId) {
      throw new ForbiddenError('Cross-company access denied');
    }
  },

  async createCourse(input: {
    companyId: string;
    name: string;
    category: string;
    provider?: string;
    durationHours?: number;
    expiryDays?: number;
  }) {
    const course = await trainingRepository.createCourse(input);
    logger.info('training course created', { courseId: course.id, companyId: input.companyId });
    return {
      id: course.id,
      companyId: course.companyId,
      name: course.name,
      category: course.category,
      provider: course.provider,
      durationHours: course.durationHours,
      expiryDays: course.expiryDays,
      createdAt: course.createdAt.toISOString(),
    };
  },

  async upsertMatrix(input: {
    companyId: string;
    role: string;
    requiredCourses: string[];
  }) {
    for (const courseId of input.requiredCourses) {
      const course = await trainingRepository.findCourse(courseId, input.companyId);
      if (!course) throw new NotFoundError(`Course not found: ${courseId}`);
    }

    const existing = await trainingRepository.findMatrix(input.companyId, input.role);
    const version = existing ? existing.version + 1 : 1;

    const matrix = await trainingRepository.upsertMatrix({
      companyId: input.companyId,
      role: input.role,
      requiredCourses: input.requiredCourses,
      version,
    });

    return {
      id: matrix.id,
      companyId: matrix.companyId,
      role: matrix.role,
      requiredCourses: matrix.requiredCourses,
      version: matrix.version,
    };
  },

  async assign(input: {
    companyId: string;
    workerId: string;
    courseId: string;
  }) {
    const course = await trainingRepository.findCourse(input.courseId, input.companyId);
    if (!course) throw new NotFoundError('Course not found');

    const row = await trainingRepository.assignTraining(input);
    return mapRecord(row);
  },

  async complete(input: {
    companyId: string;
    trainingId: string;
    completionDate?: string;
    competencyLevel?: string;
    certificatePath?: string;
    certificateDataUrl?: string;
    fileName?: string;
  }) {
    const row = await trainingRepository.findWorkerTraining(input.trainingId, input.companyId);
    if (!row) throw new NotFoundError('Training record not found');

    if (row.status === TrainingStatus.verified) {
      throw new BadRequestError('Training already verified');
    }

    const completionDate = input.completionDate ? new Date(input.completionDate) : new Date();
    const expiryDate = expiryEngine.computeExpiry(completionDate, row.course.expiryDays);
    const competencyLevel = input.competencyLevel ?? 'basic';
    const competencyScore = competencyEngine.scoreFromLevel(competencyLevel);

    const certificatePath = await certificateEngine.register({
      companyId: input.companyId,
      workerId: row.workerId,
      courseId: row.courseId,
      fileName: input.fileName,
      certificatePath: input.certificatePath,
      dataUrl: input.certificateDataUrl,
    });

    await trainingRepository.updateWorkerTraining(input.trainingId, input.companyId, {
      status: TrainingStatus.completed,
      completionDate,
      expiryDate,
      competencyLevel,
      competencyScore,
      certificatePath,
    });

    const updated = await trainingRepository.findWorkerTraining(input.trainingId, input.companyId);
    return mapRecord(updated!);
  },

  async verify(input: {
    companyId: string;
    trainingId: string;
    verifiedBy: string;
    competencyLevel?: string;
  }) {
    const row = await trainingRepository.findWorkerTraining(input.trainingId, input.companyId);
    if (!row) throw new NotFoundError('Training record not found');

    if (row.status !== TrainingStatus.completed && row.status !== TrainingStatus.assigned) {
      throw new BadRequestError(`Cannot verify training in status: ${row.status}`);
    }

    const competencyLevel = input.competencyLevel ?? row.competencyLevel;
    const competencyScore = competencyEngine.scoreFromLevel(competencyLevel);

    await trainingRepository.updateWorkerTraining(input.trainingId, input.companyId, {
      status: TrainingStatus.verified,
      verifiedAt: new Date(),
      verifiedBy: input.verifiedBy,
      competencyLevel,
      competencyScore,
    });

    const updated = await trainingRepository.findWorkerTraining(input.trainingId, input.companyId);
    return mapRecord(updated!);
  },

  async getWorkerTraining(
    workerId: string,
    companyId: string,
    role?: string,
  ): Promise<WorkerTrainingSummary> {
    let records = await trainingRepository.findWorkerRecords(workerId, companyId);
    await refreshExpiredRecords(records);
    records = await trainingRepository.findWorkerRecords(workerId, companyId);

    const mapped = records.map(mapRecord);
    const expiredCount = mapped.filter((r) => r.expired || r.status === 'expired').length;
    const expiringSoonCount = mapped.filter((r) => r.expiringSoon).length;

    let requiredCourses: string[] = [];
    if (role) {
      const matrix = await trainingRepository.findMatrix(companyId, role);
      requiredCourses = (matrix?.requiredCourses as string[]) ?? [];
    }

    const completedCourseIds = new Set(
      mapped
        .filter(
          (r) =>
            (r.status === 'completed' || r.status === 'verified') &&
            !r.expired,
        )
        .map((r) => r.courseId),
    );

    const missingCourses = requiredCourses.filter((id) => !completedCourseIds.has(id));

    return {
      workerId,
      companyId,
      role,
      records: mapped,
      matrixCompliance: {
        requiredCount: requiredCourses.length,
        completedCount: requiredCourses.length - missingCourses.length,
        compliant: requiredCourses.length === 0 || missingCourses.length === 0,
        missingCourses,
      },
      competencyScore: competencyEngine.aggregate(
        records.map((r) => ({ competencyScore: r.competencyScore, status: r.status })),
      ),
      expiredCount,
      expiringSoonCount,
    };
  },
};
