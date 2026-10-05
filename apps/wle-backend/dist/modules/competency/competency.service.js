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
exports.CompetencyService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const equipment_compliance_service_1 = require("../equipment-compliance/equipment-compliance.service");
const audit_log_service_1 = require("../../audit/audit-log.service");
const audit_actions_1 = require("../../audit/audit-actions");
let CompetencyService = class CompetencyService {
    constructor(prisma, compliance, auditLog) {
        this.prisma = prisma;
        this.compliance = compliance;
        this.auditLog = auditLog;
    }
    async resolveRules(equipmentId) {
        var _a;
        const equipment = await this.prisma.equipment.findUnique({
            where: { id: equipmentId },
            include: {
                competencyRequirements: true,
                type: { include: { competencyRequirement: true } },
            },
        });
        if (!equipment)
            throw new common_1.NotFoundException('Equipment not found');
        const assetReq = equipment.competencyRequirements[0];
        if (assetReq) {
            const r = assetReq;
            return {
                minPassingScore: r.minPassingScore,
                expiryDays: r.expiryDays,
                requireEvaluation: r.requireEvaluation,
                source: 'equipment',
                certificationId: r.certificationId,
            };
        }
        if ((_a = equipment.type) === null || _a === void 0 ? void 0 : _a.competencyRequirement) {
            const r = equipment.type.competencyRequirement;
            return {
                minPassingScore: r.minPassingScore,
                expiryDays: r.expiryDays,
                requireEvaluation: r.requireEvaluation,
                source: 'type',
                certificationId: r.certificationId,
            };
        }
        return {
            minPassingScore: 70,
            expiryDays: 365,
            requireEvaluation: true,
            source: 'default',
            certificationId: null,
        };
    }
    isExpired(expiresAt) {
        if (!expiresAt)
            return false;
        return expiresAt.getTime() < Date.now();
    }
    async expireStaleForWorker(workerId) {
        const now = new Date();
        const expired = await this.prisma.competencyEvaluation.findMany({
            where: {
                workerId,
                passed: true,
                expiresAt: { lt: now },
            },
            select: { equipmentId: true, id: true },
        });
        for (const ev of expired) {
            await this.prisma.workerWalletItem.updateMany({
                where: {
                    workerId,
                    equipmentId: ev.equipmentId,
                    status: 'ACTIVE',
                },
                data: { status: 'EXPIRED', updatedAt: now },
            });
        }
        return expired.length;
    }
    async checkWorkerEquipment(workerId, equipmentId) {
        await this.expireStaleForWorker(workerId);
        const rules = await this.resolveRules(equipmentId);
        const trainingEvidence = await this.resolveTrainingEvidence(workerId, rules.certificationId);
        if (!rules.requireEvaluation) {
            const certOk = !rules.certificationId || (trainingEvidence === null || trainingEvidence === void 0 ? void 0 : trainingEvidence.eligible);
            return {
                eligible: Boolean(certOk),
                reason: certOk
                    ? undefined
                    : 'Required training certification missing or expired',
                requireEvaluation: false,
                minPassingScore: rules.minPassingScore,
                trainingEvidence,
                rules,
            };
        }
        const latest = await this.prisma.competencyEvaluation.findFirst({
            where: { workerId, equipmentId, passed: true },
            orderBy: { evaluationDate: 'desc' },
        });
        if (!latest) {
            if (trainingEvidence === null || trainingEvidence === void 0 ? void 0 : trainingEvidence.eligible) {
                return {
                    eligible: true,
                    reason: 'Eligible via verified training evidence (evaluation still recommended)',
                    requireEvaluation: true,
                    minPassingScore: rules.minPassingScore,
                    trainingEvidence,
                    rules,
                };
            }
            return {
                eligible: false,
                reason: 'No passing competency evaluation on file',
                requireEvaluation: true,
                minPassingScore: rules.minPassingScore,
                trainingEvidence,
                rules,
            };
        }
        const expired = this.isExpired(latest.expiresAt);
        const scoreOk = latest.score >= rules.minPassingScore;
        const latestEvaluation = {
            id: latest.id,
            passed: latest.passed,
            score: latest.score,
            evaluationDate: latest.evaluationDate,
            expiresAt: latest.expiresAt,
            expired,
        };
        if (expired) {
            if (trainingEvidence === null || trainingEvidence === void 0 ? void 0 : trainingEvidence.eligible) {
                return {
                    eligible: true,
                    reason: 'Evaluation expired — eligible via verified training evidence pending re-evaluation',
                    requireEvaluation: true,
                    minPassingScore: rules.minPassingScore,
                    latestEvaluation,
                    trainingEvidence,
                    rules,
                };
            }
            return {
                eligible: false,
                reason: 'Competency evaluation has expired',
                requireEvaluation: true,
                minPassingScore: rules.minPassingScore,
                latestEvaluation,
                trainingEvidence,
                rules,
            };
        }
        if (!scoreOk) {
            return {
                eligible: false,
                reason: `Score below minimum (${rules.minPassingScore})`,
                requireEvaluation: true,
                minPassingScore: rules.minPassingScore,
                latestEvaluation,
                trainingEvidence,
                rules,
            };
        }
        return {
            eligible: true,
            requireEvaluation: true,
            minPassingScore: rules.minPassingScore,
            latestEvaluation,
            trainingEvidence,
            rules,
        };
    }
    async resolveTrainingEvidence(workerId, certificationId) {
        if (certificationId == null)
            return null;
        const rec = await this.prisma.trainingRecord.findFirst({
            where: { workerId, certificationId },
            orderBy: [{ expiresAt: 'desc' }, { issuedAt: 'desc' }],
            include: {
                validationResults: {
                    where: { outcome: 'APPROVED' },
                    take: 1,
                    orderBy: { id: 'desc' },
                },
            },
        });
        if (!rec) {
            return null;
        }
        const expired = this.isExpired(rec.expiresAt);
        const verified = rec.lastVerificationStatus === 'VERIFIED' ||
            rec.validationResults.length > 0;
        const eligible = verified && !expired;
        return {
            trainingRecordId: rec.id,
            certificationId,
            expiresAt: rec.expiresAt,
            expired,
            verificationStatus: rec.lastVerificationStatus,
            eligible,
            href: `/core/training-competency?workerId=${workerId}&trainingRecordId=${rec.id}`,
        };
    }
    async assertEligible(workerId, equipmentId) {
        var _a;
        const check = await this.checkWorkerEquipment(workerId, equipmentId);
        if (!check.eligible) {
            throw new common_1.ForbiddenException((_a = check.reason) !== null && _a !== void 0 ? _a : 'Worker is not competent for this equipment');
        }
        return check;
    }
    async evaluate(data) {
        var _a, _b, _c, _d, _e, _f;
        const equipment = await this.prisma.equipment.findUnique({
            where: { id: data.equipmentId },
        });
        if (!equipment)
            throw new common_1.BadRequestException('Equipment not found');
        const rules = await this.resolveRules(data.equipmentId);
        const passed = data.passed && data.score >= rules.minPassingScore;
        const evaluationDate = (_a = data.evaluationDate) !== null && _a !== void 0 ? _a : new Date();
        let expiresAt = null;
        if (passed && rules.expiryDays != null && rules.expiryDays > 0) {
            expiresAt = new Date(evaluationDate);
            expiresAt.setDate(expiresAt.getDate() + rules.expiryDays);
        }
        const evaluation = await this.prisma.competencyEvaluation.create({
            data: {
                workerId: data.workerId,
                equipmentId: data.equipmentId,
                evaluatorUserId: data.evaluatorUserId,
                equipmentTypeKey: (_b = equipment.catalogTypeKey) !== null && _b !== void 0 ? _b : equipment.name,
                score: data.score,
                passed,
                evaluationDate,
                expiresAt,
                notes: (_c = data.notes) !== null && _c !== void 0 ? _c : data.evidenceNotes,
                evidenceNotes: data.evidenceNotes,
                evidencePhotos: data.evidencePhotos,
                workerSignature: data.workerSignature,
                evaluatorSignature: data.evaluatorSignature,
            },
            include: { worker: true, equipment: true, evaluator: true },
        });
        await this.auditLog.logAudit({ id: (_d = data.evaluatorUserId) !== null && _d !== void 0 ? _d : null, companyId: equipment.companyId }, audit_actions_1.AuditAction.ASSESSMENT_EQUIPMENT_COMPETENCY, {
            type: audit_actions_1.AuditEntityType.COMPETENCY_EVALUATION,
            id: evaluation.id,
            tenantId: equipment.companyId,
        }, {
            workerId: data.workerId,
            equipmentId: data.equipmentId,
            score: data.score,
            passed,
        });
        if (passed) {
            const companyLink = await this.prisma.companyLink.findFirst({
                where: { workerId: data.workerId, active: true },
            });
            const catalogKey = (_e = equipment.catalogTypeKey) !== null && _e !== void 0 ? _e : equipment.name;
            const existing = await this.prisma.workerWalletItem.findFirst({
                where: {
                    workerId: data.workerId,
                    equipmentId: data.equipmentId,
                },
            });
            if (existing) {
                await this.prisma.workerWalletItem.update({
                    where: { id: existing.id },
                    data: {
                        status: 'ACTIVE',
                        notes: `Competency valid until ${(_f = expiresAt === null || expiresAt === void 0 ? void 0 : expiresAt.toISOString()) !== null && _f !== void 0 ? _f : 'no expiry'}`,
                        updatedAt: new Date(),
                    },
                });
            }
            else {
                await this.prisma.workerWalletItem.create({
                    data: {
                        workerId: data.workerId,
                        catalogTypeKey: catalogKey,
                        equipmentId: data.equipmentId,
                        companyId: companyLink === null || companyLink === void 0 ? void 0 : companyLink.companyId,
                        status: 'ACTIVE',
                        notes: 'Competency evaluation passed',
                    },
                });
            }
        }
        else {
            await this.prisma.workerWalletItem.updateMany({
                where: {
                    workerId: data.workerId,
                    equipmentId: data.equipmentId,
                },
                data: { status: 'FAILED', updatedAt: new Date() },
            });
        }
        await this.compliance.recalculate(data.equipmentId, {
            trigger: 'COMPETENCY',
            assessedByUserId: data.evaluatorUserId,
            notes: passed
                ? 'Competency evaluation passed'
                : 'Competency evaluation failed',
        });
        return evaluation;
    }
    async listForWorker(workerId) {
        await this.expireStaleForWorker(workerId);
        return this.prisma.competencyEvaluation.findMany({
            where: { workerId },
            include: { equipment: true, evaluator: true },
            orderBy: { evaluationDate: 'desc' },
        });
    }
    async listForEquipment(equipmentId) {
        return this.prisma.competencyEvaluation.findMany({
            where: { equipmentId },
            include: { worker: true, evaluator: true },
            orderBy: { evaluationDate: 'desc' },
        });
    }
    async getEquipmentRequirements(equipmentId) {
        var _a, _b;
        const equipment = await this.prisma.equipment.findUnique({
            where: { id: equipmentId },
            include: {
                competencyRequirements: { include: { certification: true } },
                type: {
                    include: {
                        competencyRequirement: { include: { certification: true } },
                    },
                },
            },
        });
        if (!equipment)
            throw new common_1.NotFoundException('Equipment not found');
        const resolved = await this.resolveRules(equipmentId);
        return {
            equipmentId,
            assetRequirement: equipment.competencyRequirements,
            typeRequirement: (_b = (_a = equipment.type) === null || _a === void 0 ? void 0 : _a.competencyRequirement) !== null && _b !== void 0 ? _b : null,
            resolved,
        };
    }
    async upsertEquipmentRequirement(equipmentId, data) {
        var _a, _b, _c, _d;
        await this.prisma.equipment.findUniqueOrThrow({
            where: { id: equipmentId },
        });
        return this.prisma.equipmentCompetencyRequirement.upsert({
            where: { equipmentId },
            create: {
                equipmentId,
                minPassingScore: (_a = data.minPassingScore) !== null && _a !== void 0 ? _a : 70,
                expiryDays: (_b = data.expiryDays) !== null && _b !== void 0 ? _b : 365,
                requireEvaluation: (_c = data.requireEvaluation) !== null && _c !== void 0 ? _c : true,
                certificationId: (_d = data.certificationId) !== null && _d !== void 0 ? _d : null,
            },
            update: Object.assign(Object.assign(Object.assign(Object.assign({}, (data.minPassingScore !== undefined
                ? { minPassingScore: data.minPassingScore }
                : {})), (data.expiryDays !== undefined
                ? { expiryDays: data.expiryDays }
                : {})), (data.requireEvaluation !== undefined
                ? { requireEvaluation: data.requireEvaluation }
                : {})), (data.certificationId !== undefined
                ? { certificationId: data.certificationId }
                : {})),
            include: { certification: true },
        });
    }
    async upsertTypeRequirement(equipmentTypeId, data) {
        var _a, _b, _c, _d;
        await this.prisma.equipmentType.findUniqueOrThrow({
            where: { id: equipmentTypeId },
        });
        return this.prisma.equipmentTypeCompetencyRequirement.upsert({
            where: { equipmentTypeId },
            create: {
                equipmentTypeId,
                minPassingScore: (_a = data.minPassingScore) !== null && _a !== void 0 ? _a : 70,
                expiryDays: (_b = data.expiryDays) !== null && _b !== void 0 ? _b : 365,
                requireEvaluation: (_c = data.requireEvaluation) !== null && _c !== void 0 ? _c : true,
                certificationId: (_d = data.certificationId) !== null && _d !== void 0 ? _d : null,
            },
            update: Object.assign(Object.assign(Object.assign(Object.assign({}, (data.minPassingScore !== undefined
                ? { minPassingScore: data.minPassingScore }
                : {})), (data.expiryDays !== undefined
                ? { expiryDays: data.expiryDays }
                : {})), (data.requireEvaluation !== undefined
                ? { requireEvaluation: data.requireEvaluation }
                : {})), (data.certificationId !== undefined
                ? { certificationId: data.certificationId }
                : {})),
            include: { certification: true },
        });
    }
    async dashboard(companyId) {
        const now = new Date();
        const in30 = new Date(now);
        in30.setDate(in30.getDate() + 30);
        const companyFilter = companyId
            ? {
                equipment: {
                    equipmentLinks: { some: { companyId, active: true } },
                },
            }
            : {};
        const [totalEvaluations, passing, expiringSoon, expired, operatorLinks] = await Promise.all([
            this.prisma.competencyEvaluation.count({ where: companyFilter }),
            this.prisma.competencyEvaluation.count({
                where: Object.assign({ passed: true, OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] }, companyFilter),
            }),
            this.prisma.competencyEvaluation.count({
                where: Object.assign({ passed: true, expiresAt: { gt: now, lte: in30 } }, companyFilter),
            }),
            this.prisma.competencyEvaluation.count({
                where: Object.assign({ passed: true, expiresAt: { lt: now } }, companyFilter),
            }),
            this.prisma.equipmentLinkWorker.count({
                where: companyId
                    ? { equipmentLink: { companyId, active: true } }
                    : {},
            }),
        ]);
        const recent = await this.prisma.competencyEvaluation.findMany({
            where: companyFilter,
            take: 10,
            orderBy: { evaluationDate: 'desc' },
            include: {
                worker: true,
                equipment: true,
                evaluator: true,
            },
        });
        return {
            totalEvaluations,
            passing,
            expiringSoon,
            expired,
            operatorLinks,
            recent,
        };
    }
};
exports.CompetencyService = CompetencyService;
exports.CompetencyService = CompetencyService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        equipment_compliance_service_1.EquipmentComplianceService,
        audit_log_service_1.AuditLogService])
], CompetencyService);
//# sourceMappingURL=competency.service.js.map