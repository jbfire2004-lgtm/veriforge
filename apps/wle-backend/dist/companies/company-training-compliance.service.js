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
exports.CompanyTrainingComplianceService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const EXPIRING_SOON_DAYS = 30;
let CompanyTrainingComplianceService = class CompanyTrainingComplianceService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async refreshAfterTrainingRecord(trainingRecordId) {
        var _a, _b;
        const record = await this.prisma.trainingRecord.findUnique({
            where: { id: trainingRecordId },
            select: {
                companyId: true,
                projectId: true,
                workerId: true,
                worker: { select: { companyId: true } },
            },
        });
        if (!record)
            return;
        const companyId = (_b = (_a = record.companyId) !== null && _a !== void 0 ? _a : record.worker.companyId) !== null && _b !== void 0 ? _b : undefined;
        if (companyId) {
            await this.refreshCompanyWorkerFlags(companyId);
        }
    }
    async getCompanyDashboard(companyId, actor) {
        await this.assertCompanyAccess(companyId, actor);
        const company = await this.prisma.company.findUnique({
            where: { id: companyId },
            select: { id: true, name: true },
        });
        if (!company)
            throw new common_1.NotFoundException('Company not found');
        const records = await this.loadCompanyTrainingRecords(companyId);
        const validationByRecord = await this.latestValidationsByRecord(records.map((r) => r.id));
        const buckets = this.bucketRecords(records, validationByRecord);
        const flaggedWorkers = await this.buildFlaggedWorkers(companyId, records, validationByRecord);
        const projects = await this.buildProjectSummaries(companyId, records, validationByRecord);
        const hasBlocking = buckets.rejected.length > 0 ||
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
    async getProjectDashboard(companyId, projectId, actor) {
        await this.assertCompanyAccess(companyId, actor);
        const project = await this.prisma.project.findFirst({
            where: { id: projectId, companyId },
            select: { id: true, name: true, companyId: true },
        });
        if (!project)
            throw new common_1.NotFoundException('Project not found');
        const allRecords = await this.loadCompanyTrainingRecords(companyId);
        const records = allRecords.filter((r) => r.projectId === projectId);
        const validationByRecord = await this.latestValidationsByRecord(records.map((r) => r.id));
        const buckets = this.bucketRecords(records, validationByRecord);
        const flaggedWorkers = await this.buildFlaggedWorkers(companyId, records, validationByRecord);
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
    async refreshCompanyWorkerFlags(companyId) {
        var _a;
        const records = await this.loadCompanyTrainingRecords(companyId);
        const validationByRecord = await this.latestValidationsByRecord(records.map((r) => r.id));
        const flagged = await this.buildFlaggedWorkers(companyId, records, validationByRecord);
        const flagByWorker = new Map(flagged.map((f) => [f.workerId, f.flags]));
        const links = await this.prisma.companyLink.findMany({
            where: { companyId, active: true },
        });
        for (const link of links) {
            const flags = (_a = flagByWorker.get(link.workerId)) !== null && _a !== void 0 ? _a : [];
            const existing = link.visibilityRules != null &&
                typeof link.visibilityRules === 'object' &&
                !Array.isArray(link.visibilityRules)
                ? link.visibilityRules
                : {};
            await this.prisma.companyLink.update({
                where: { id: link.id },
                data: {
                    visibilityRules: Object.assign(Object.assign({}, existing), { complianceFlags: {
                            nonCompliant: flags.includes('NON_COMPLIANT'),
                            expiringTraining: flags.includes('EXPIRING_TRAINING'),
                            invalidTraining: flags.includes('INVALID_TRAINING'),
                            flags,
                            updatedAt: new Date().toISOString(),
                        } }),
                },
            });
        }
    }
    async loadCompanyTrainingRecords(companyId) {
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
    async latestValidationsByRecord(recordIds) {
        if (recordIds.length === 0)
            return new Map();
        const validations = await this.prisma.trainingValidationResult.findMany({
            where: { trainingRecordId: { in: recordIds } },
            orderBy: { validatedAt: 'desc' },
            select: { trainingRecordId: true, outcome: true },
        });
        const map = new Map();
        for (const v of validations) {
            if (v.trainingRecordId && !map.has(v.trainingRecordId)) {
                map.set(v.trainingRecordId, { outcome: v.outcome });
            }
        }
        return map;
    }
    bucketRecords(records, validationByRecord) {
        var _a, _b, _c, _d;
        const buckets = {
            verified: [],
            pending: [],
            rejected: [],
            expiring: [],
        };
        const now = new Date();
        const soon = new Date();
        soon.setDate(now.getDate() + EXPIRING_SOON_DAYS);
        for (const record of records) {
            const row = this.toRow(record, (_b = (_a = validationByRecord.get(record.id)) === null || _a === void 0 ? void 0 : _a.outcome) !== null && _b !== void 0 ? _b : null);
            const outcome = (_d = (_c = validationByRecord.get(record.id)) === null || _c === void 0 ? void 0 : _c.outcome) !== null && _d !== void 0 ? _d : null;
            const expired = Boolean(record.expiresAt && record.expiresAt <= now);
            const expiringSoon = Boolean(record.expiresAt && record.expiresAt > now && record.expiresAt <= soon);
            const verificationInvalid = record.lastVerificationStatus === 'INVALID';
            const verificationAttention = record.lastVerificationStatus === 'ATTENTION';
            if (outcome === client_1.TrainingValidationOutcome.REJECTED ||
                expired ||
                verificationInvalid) {
                buckets.rejected.push(row);
                continue;
            }
            if (outcome === client_1.TrainingValidationOutcome.PENDING ||
                outcome === client_1.TrainingValidationOutcome.NEEDS_REVIEW ||
                verificationAttention ||
                !outcome) {
                buckets.pending.push(row);
            }
            else if (outcome === client_1.TrainingValidationOutcome.APPROVED ||
                record.lastVerificationStatus === 'VERIFIED') {
                buckets.verified.push(row);
            }
            if (expiringSoon) {
                buckets.expiring.push(row);
            }
        }
        return buckets;
    }
    async buildFlaggedWorkers(companyId, records, validationByRecord) {
        var _a, _b, _c, _d;
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
        const recordsByWorker = new Map();
        for (const r of records) {
            const list = (_a = recordsByWorker.get(r.workerId)) !== null && _a !== void 0 ? _a : [];
            list.push(r);
            recordsByWorker.set(r.workerId, list);
        }
        const flagged = [];
        for (const worker of workers) {
            const flags = new Set();
            const workerRecords = (_b = recordsByWorker.get(worker.id)) !== null && _b !== void 0 ? _b : [];
            for (const record of workerRecords) {
                const outcome = (_d = (_c = validationByRecord.get(record.id)) === null || _c === void 0 ? void 0 : _c.outcome) !== null && _d !== void 0 ? _d : null;
                if (outcome === client_1.TrainingValidationOutcome.REJECTED ||
                    record.lastVerificationStatus === 'INVALID') {
                    flags.add('INVALID_TRAINING');
                }
                if (record.expiresAt && record.expiresAt <= now) {
                    flags.add('NON_COMPLIANT');
                }
                else if (record.expiresAt &&
                    record.expiresAt > now &&
                    record.expiresAt <= soon) {
                    flags.add('EXPIRING_TRAINING');
                }
            }
            for (const req of requirements) {
                const match = workerRecords.find((r) => r.certification.name.toLowerCase() === req.courseName.toLowerCase());
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
    async buildProjectSummaries(companyId, records, validationByRecord) {
        const projects = await this.prisma.project.findMany({
            where: { companyId, status: 'ACTIVE' },
            select: { id: true, name: true },
        });
        return Promise.all(projects.map(async (project) => {
            const projectRecords = records.filter((r) => r.projectId === project.id);
            const buckets = this.bucketRecords(projectRecords, validationByRecord);
            const projectFlagged = await this.buildFlaggedWorkers(companyId, projectRecords, validationByRecord);
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
        }));
    }
    toRow(record, validationOutcome) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        return {
            trainingRecordId: record.id,
            workerId: record.workerId,
            workerName: `${record.worker.firstName} ${record.worker.lastName}`.trim(),
            courseName: (_c = (_b = (_a = record.course) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : record.certification.name) !== null && _c !== void 0 ? _c : 'Training',
            providerName: (_e = (_d = record.trainingProvider) === null || _d === void 0 ? void 0 : _d.name) !== null && _e !== void 0 ? _e : null,
            issuedAt: record.issuedAt.toISOString(),
            expiresAt: (_g = (_f = record.expiresAt) === null || _f === void 0 ? void 0 : _f.toISOString()) !== null && _g !== void 0 ? _g : null,
            validationOutcome,
            projectId: record.projectId,
            projectName: (_j = (_h = record.project) === null || _h === void 0 ? void 0 : _h.name) !== null && _j !== void 0 ? _j : null,
        };
    }
    async assertCompanyAccess(companyId, actor) {
        if ((actor === null || actor === void 0 ? void 0 : actor.role) === client_1.UserRole.WORKER) {
            const worker = await this.prisma.worker.findFirst({
                where: { userId: actor.id },
                select: { companyId: true },
            });
            if (!(worker === null || worker === void 0 ? void 0 : worker.companyId) || worker.companyId !== companyId) {
                throw new common_1.ForbiddenException('You may only view compliance for your employer organization.');
            }
        }
    }
};
exports.CompanyTrainingComplianceService = CompanyTrainingComplianceService;
exports.CompanyTrainingComplianceService = CompanyTrainingComplianceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CompanyTrainingComplianceService);
//# sourceMappingURL=company-training-compliance.service.js.map