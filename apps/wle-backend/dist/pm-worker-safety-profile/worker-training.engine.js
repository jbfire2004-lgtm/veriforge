"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkerTrainingEngine = void 0;
class WorkerTrainingEngine {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async syncFromRecords(workerId, profileId) {
        var _a, _b, _c, _d;
        const records = await this.prisma.trainingRecord.findMany({
            where: { workerId },
            include: { certification: true },
            orderBy: { issuedAt: 'desc' },
        });
        const now = new Date();
        for (const r of records) {
            const code = (_a = r.certification.code) !== null && _a !== void 0 ? _a : r.certification.name;
            const expiresAt = (_b = r.expiresAt) !== null && _b !== void 0 ? _b : new Date(r.issuedAt.getTime() + 365 * 86400000);
            const status = expiresAt > now ? 'valid' : 'expired';
            const existing = await this.prisma.pmWorkerSafetyTraining.findFirst({
                where: { workerId, trainingCode: code },
            });
            if (existing) {
                await this.prisma.pmWorkerSafetyTraining.update({
                    where: { id: existing.id },
                    data: {
                        courseName: r.certification.name,
                        completedAt: (_c = r.completedAt) !== null && _c !== void 0 ? _c : r.issuedAt,
                        expiresAt,
                        status,
                        legacyRecordId: r.id,
                    },
                });
            }
            else {
                await this.prisma.pmWorkerSafetyTraining.create({
                    data: {
                        workerId,
                        profileId,
                        trainingCode: code,
                        courseName: r.certification.name,
                        completedAt: (_d = r.completedAt) !== null && _d !== void 0 ? _d : r.issuedAt,
                        expiresAt,
                        status,
                        legacyRecordId: r.id,
                        sourceType: 'training_record',
                    },
                });
            }
        }
    }
    gapsFromMatrix(required, held) {
        const gaps = [];
        for (const req of required) {
            const match = held.find((h) => h.trainingCode === req.trainingCode);
            if (!match) {
                gaps.push({
                    trainingCode: req.trainingCode,
                    courseName: req.trainingName,
                    reason: 'Not completed',
                    status: 'missing',
                });
            }
            else if (match.status === 'expired') {
                gaps.push({
                    trainingCode: req.trainingCode,
                    courseName: req.trainingName,
                    reason: 'Expired',
                    status: 'expired',
                });
            }
        }
        return gaps;
    }
}
exports.WorkerTrainingEngine = WorkerTrainingEngine;
//# sourceMappingURL=worker-training.engine.js.map