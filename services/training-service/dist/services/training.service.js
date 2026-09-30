"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trainingService = void 0;
const client_1 = require("@prisma/client");
const training_repository_1 = require("../models/training.repository");
const training_engine_1 = require("../engines/training.engine");
const certificate_engine_1 = require("../engines/certificate.engine");
const errors_1 = require("../utils/errors");
const logger_1 = require("../utils/logger");
function mapRecord(r) {
    const expired = training_engine_1.expiryEngine.isExpired(r.expiryDate);
    const expiringSoon = training_engine_1.expiryEngine.isExpiringSoon(r.expiryDate);
    return {
        id: r.id,
        workerId: r.workerId,
        courseId: r.courseId,
        courseName: r.course.name,
        category: r.course.category,
        status: expired && r.status !== client_1.TrainingStatus.expired ? 'expired' : r.status,
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
async function refreshExpiredRecords(records) {
    const toExpire = records
        .filter((r) => r.expiryDate &&
        training_engine_1.expiryEngine.isExpired(r.expiryDate) &&
        r.status !== client_1.TrainingStatus.expired)
        .map((r) => r.id);
    if (toExpire.length > 0) {
        await training_repository_1.trainingRepository.markExpired(toExpire);
    }
}
exports.trainingService = {
    assertCompanyAccess(tokenCompanyId, requestedCompanyId) {
        if (tokenCompanyId !== requestedCompanyId) {
            throw new errors_1.ForbiddenError('Cross-company access denied');
        }
    },
    async createCourse(input) {
        const course = await training_repository_1.trainingRepository.createCourse(input);
        logger_1.logger.info('training course created', { courseId: course.id, companyId: input.companyId });
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
    async upsertMatrix(input) {
        for (const courseId of input.requiredCourses) {
            const course = await training_repository_1.trainingRepository.findCourse(courseId, input.companyId);
            if (!course)
                throw new errors_1.NotFoundError(`Course not found: ${courseId}`);
        }
        const existing = await training_repository_1.trainingRepository.findMatrix(input.companyId, input.role);
        const version = existing ? existing.version + 1 : 1;
        const matrix = await training_repository_1.trainingRepository.upsertMatrix({
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
    async assign(input) {
        const course = await training_repository_1.trainingRepository.findCourse(input.courseId, input.companyId);
        if (!course)
            throw new errors_1.NotFoundError('Course not found');
        const row = await training_repository_1.trainingRepository.assignTraining(input);
        return mapRecord(row);
    },
    async complete(input) {
        const row = await training_repository_1.trainingRepository.findWorkerTraining(input.trainingId, input.companyId);
        if (!row)
            throw new errors_1.NotFoundError('Training record not found');
        if (row.status === client_1.TrainingStatus.verified) {
            throw new errors_1.BadRequestError('Training already verified');
        }
        const completionDate = input.completionDate ? new Date(input.completionDate) : new Date();
        const expiryDate = training_engine_1.expiryEngine.computeExpiry(completionDate, row.course.expiryDays);
        const competencyLevel = input.competencyLevel ?? 'basic';
        const competencyScore = training_engine_1.competencyEngine.scoreFromLevel(competencyLevel);
        const certificatePath = await certificate_engine_1.certificateEngine.register({
            companyId: input.companyId,
            workerId: row.workerId,
            courseId: row.courseId,
            fileName: input.fileName,
            certificatePath: input.certificatePath,
            dataUrl: input.certificateDataUrl,
        });
        await training_repository_1.trainingRepository.updateWorkerTraining(input.trainingId, input.companyId, {
            status: client_1.TrainingStatus.completed,
            completionDate,
            expiryDate,
            competencyLevel,
            competencyScore,
            certificatePath,
        });
        const updated = await training_repository_1.trainingRepository.findWorkerTraining(input.trainingId, input.companyId);
        return mapRecord(updated);
    },
    async verify(input) {
        const row = await training_repository_1.trainingRepository.findWorkerTraining(input.trainingId, input.companyId);
        if (!row)
            throw new errors_1.NotFoundError('Training record not found');
        if (row.status !== client_1.TrainingStatus.completed && row.status !== client_1.TrainingStatus.assigned) {
            throw new errors_1.BadRequestError(`Cannot verify training in status: ${row.status}`);
        }
        const competencyLevel = input.competencyLevel ?? row.competencyLevel;
        const competencyScore = training_engine_1.competencyEngine.scoreFromLevel(competencyLevel);
        await training_repository_1.trainingRepository.updateWorkerTraining(input.trainingId, input.companyId, {
            status: client_1.TrainingStatus.verified,
            verifiedAt: new Date(),
            verifiedBy: input.verifiedBy,
            competencyLevel,
            competencyScore,
        });
        const updated = await training_repository_1.trainingRepository.findWorkerTraining(input.trainingId, input.companyId);
        return mapRecord(updated);
    },
    async getWorkerTraining(workerId, companyId, role) {
        let records = await training_repository_1.trainingRepository.findWorkerRecords(workerId, companyId);
        await refreshExpiredRecords(records);
        records = await training_repository_1.trainingRepository.findWorkerRecords(workerId, companyId);
        const mapped = records.map(mapRecord);
        const expiredCount = mapped.filter((r) => r.expired || r.status === 'expired').length;
        const expiringSoonCount = mapped.filter((r) => r.expiringSoon).length;
        let requiredCourses = [];
        if (role) {
            const matrix = await training_repository_1.trainingRepository.findMatrix(companyId, role);
            requiredCourses = matrix?.requiredCourses ?? [];
        }
        const completedCourseIds = new Set(mapped
            .filter((r) => (r.status === 'completed' || r.status === 'verified') &&
            !r.expired)
            .map((r) => r.courseId));
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
            competencyScore: training_engine_1.competencyEngine.aggregate(records.map((r) => ({ competencyScore: r.competencyScore, status: r.status }))),
            expiredCount,
            expiringSoonCount,
        };
    },
};
