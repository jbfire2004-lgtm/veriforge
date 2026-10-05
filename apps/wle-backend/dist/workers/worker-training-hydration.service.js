"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkerTrainingHydrationService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
let WorkerTrainingHydrationService = class WorkerTrainingHydrationService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    matchTrainingCode(cert, requiredCode) {
        var _a;
        const req = requiredCode.trim().toLowerCase();
        if (!req)
            return false;
        const code = ((_a = cert.code) !== null && _a !== void 0 ? _a : '').trim().toLowerCase();
        const name = cert.name.trim().toLowerCase();
        return (code === req ||
            name === req ||
            name.includes(req) ||
            code.includes(req) ||
            req.includes(name));
    }
    recordStatus(record, now) {
        if (!record.expiresAt)
            return 'valid';
        return record.expiresAt > now ? 'valid' : 'expired';
    }
    buildRequirements(requiredCodes, records, now) {
        return requiredCodes.map((code) => {
            var _a, _b, _c;
            const matches = records.filter((r) => this.matchTrainingCode(r.certification, code));
            const valid = matches.find((r) => this.recordStatus(r, now) === 'valid');
            const expired = matches.find((r) => this.recordStatus(r, now) === 'expired');
            const match = valid !== null && valid !== void 0 ? valid : expired;
            return {
                code,
                name: code,
                status: valid ? 'valid' : expired ? 'expired' : 'missing',
                matchedRecordId: (_a = match === null || match === void 0 ? void 0 : match.id) !== null && _a !== void 0 ? _a : null,
                expiresAt: (_c = (_b = match === null || match === void 0 ? void 0 : match.expiresAt) === null || _b === void 0 ? void 0 : _b.toISOString()) !== null && _c !== void 0 ? _c : null,
            };
        });
    }
    async hydrateWorkerTraining(workerId, options = {}) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        const worker = await this.prisma.worker.findUnique({
            where: { id: workerId },
            include: {
                trainingRecords: {
                    where: options.projectId
                        ? { OR: [{ projectId: options.projectId }, { projectId: null }] }
                        : undefined,
                    include: { certification: true },
                    orderBy: { expiresAt: 'asc' },
                },
                competencyEvaluations: {
                    include: {
                        equipment: { select: { name: true, assetTag: true } },
                    },
                    orderBy: { evaluationDate: 'desc' },
                },
                pmWorkerMedicalRestrictions: {
                    where: { active: true },
                    orderBy: { startsAt: 'desc' },
                },
            },
        });
        if (!worker)
            throw new common_1.NotFoundException('Worker not found');
        const now = new Date();
        const records = worker.trainingRecords.map((r) => {
            var _a, _b, _c, _d, _e;
            return ({
                id: r.id,
                certificationId: r.certificationId,
                code: (_a = r.certification.code) !== null && _a !== void 0 ? _a : r.certification.name,
                name: r.certification.name,
                issuedAt: r.issuedAt.toISOString(),
                expiresAt: (_c = (_b = r.expiresAt) === null || _b === void 0 ? void 0 : _b.toISOString()) !== null && _c !== void 0 ? _c : null,
                completedAt: (_e = (_d = r.completedAt) === null || _d === void 0 ? void 0 : _d.toISOString()) !== null && _e !== void 0 ? _e : null,
                status: this.recordStatus(r, now),
                certificateNumber: r.certificateNumber,
                certificateUrl: r.certificateUrl,
                projectId: r.projectId,
                companyId: r.companyId,
            });
        });
        const competencies = worker.competencyEvaluations.map((c) => {
            var _a, _b, _c, _d, _e, _f;
            let status = 'valid';
            if (!c.passed)
                status = 'missing';
            else if (c.expiresAt && c.expiresAt <= now)
                status = 'expired';
            return {
                id: c.id,
                equipmentTypeKey: c.equipmentTypeKey,
                equipmentName: (_d = (_b = (_a = c.equipment) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : (_c = c.equipment) === null || _c === void 0 ? void 0 : _c.assetTag) !== null && _d !== void 0 ? _d : null,
                score: c.score,
                passed: c.passed,
                evaluationDate: c.evaluationDate.toISOString(),
                expiresAt: (_f = (_e = c.expiresAt) === null || _e === void 0 ? void 0 : _e.toISOString()) !== null && _f !== void 0 ? _f : null,
                status,
            };
        });
        const certMap = new Map();
        for (const r of worker.trainingRecords) {
            const status = this.recordStatus(r, now);
            const existing = certMap.get(r.certificationId);
            if (!existing ||
                (status === 'valid' && existing.status !== 'valid') ||
                (status === existing.status &&
                    ((_b = (_a = r.expiresAt) === null || _a === void 0 ? void 0 : _a.getTime()) !== null && _b !== void 0 ? _b : 0) >
                        new Date((_c = existing.expiresAt) !== null && _c !== void 0 ? _c : 0).getTime())) {
                certMap.set(r.certificationId, {
                    id: r.certificationId,
                    code: (_d = r.certification.code) !== null && _d !== void 0 ? _d : r.certification.name,
                    name: r.certification.name,
                    latestRecordId: r.id,
                    expiresAt: (_f = (_e = r.expiresAt) === null || _e === void 0 ? void 0 : _e.toISOString()) !== null && _f !== void 0 ? _f : null,
                    status,
                });
            }
        }
        const certifications = Array.from(certMap.values());
        const restrictions = worker.pmWorkerMedicalRestrictions.map((r) => {
            var _a, _b;
            return ({
                id: r.id,
                type: r.restrictionType,
                description: r.description,
                blocksHighRisk: r.blocksHighRisk,
                blocksConfinedSpace: r.blocksConfinedSpace,
                blocksHotWork: r.blocksHotWork,
                blocksEquipment: r.blocksEquipment,
                startsAt: r.startsAt.toISOString(),
                expiresAt: (_b = (_a = r.expiresAt) === null || _a === void 0 ? void 0 : _a.toISOString()) !== null && _b !== void 0 ? _b : null,
                active: r.active && (!r.expiresAt || r.expiresAt > now),
            });
        });
        const expiries = [
            ...records
                .filter((r) => r.expiresAt)
                .map((r) => ({
                type: 'training',
                key: r.code,
                name: r.name,
                expiresAt: r.expiresAt,
                status: r.status,
            })),
            ...competencies
                .filter((c) => c.expiresAt)
                .map((c) => {
                var _a;
                return ({
                    type: 'competency',
                    key: c.equipmentTypeKey,
                    name: (_a = c.equipmentName) !== null && _a !== void 0 ? _a : c.equipmentTypeKey,
                    expiresAt: c.expiresAt,
                    status: c.status === 'valid' ? 'valid' : 'expired',
                });
            }),
            ...restrictions
                .filter((r) => r.expiresAt)
                .map((r) => ({
                type: 'restriction',
                key: r.type,
                name: r.description,
                expiresAt: r.expiresAt,
                status: (new Date(r.expiresAt) > now ? 'valid' : 'expired'),
            })),
        ].sort((a, b) => new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime());
        let requiredCodes = (_g = options.requiredCodes) !== null && _g !== void 0 ? _g : [];
        if (worker.companyId && requiredCodes.length === 0) {
            const matrix = await this.prisma.pmCompanyTrainingMatrix.findMany({
                where: {
                    companyId: worker.companyId,
                    roleType: (_h = options.roleType) !== null && _h !== void 0 ? _h : client_1.PmCompanyTrainingRoleType.worker,
                    active: true,
                    status: 'published',
                },
            });
            requiredCodes = matrix.map((m) => m.trainingName || m.trainingCode);
        }
        const requirements = this.buildRequirements(requiredCodes, worker.trainingRecords, now);
        const summary = {
            valid: requirements.filter((r) => r.status === 'valid').length,
            expired: requirements.filter((r) => r.status === 'expired').length,
            missing: requirements.filter((r) => r.status === 'missing').length,
            totalRecords: records.length,
            hasBlockingRestrictions: restrictions.some((r) => r.active &&
                (r.blocksHighRisk || r.blocksConfinedSpace || r.blocksHotWork)),
        };
        return {
            workerId,
            companyId: worker.companyId,
            records,
            competencies,
            certifications,
            expiries,
            restrictions,
            requirements,
            summary,
            hydratedAt: new Date().toISOString(),
        };
    }
    async validateRequiredTraining(workerId, requiredCodes) {
        const hydration = await this.hydrateWorkerTraining(workerId, {
            requiredCodes,
        });
        const failures = hydration.requirements.filter((r) => r.status !== 'valid');
        return {
            valid: failures.length === 0,
            requirements: hydration.requirements,
            failures,
            hasBlockingRestrictions: hydration.summary.hasBlockingRestrictions,
            restrictions: hydration.restrictions.filter((r) => r.active),
        };
    }
};
exports.WorkerTrainingHydrationService = WorkerTrainingHydrationService;
exports.WorkerTrainingHydrationService = WorkerTrainingHydrationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WorkerTrainingHydrationService);
//# sourceMappingURL=worker-training-hydration.service.js.map