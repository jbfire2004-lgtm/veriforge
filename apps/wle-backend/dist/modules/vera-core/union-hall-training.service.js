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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnionHallTrainingService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const training_standards_compliance_service_1 = require("../training-standards-compliance/training-standards-compliance.service");
const training_wallet_integration_service_1 = require("./training-wallet-integration.service");
const training_wallet_mapper_1 = require("./training-wallet.mapper");
const event_bus_service_1 = require("../api-platform/events/event-bus.service");
const domain_events_1 = require("../api-platform/events/domain-events");
const vera_event_publishers_1 = require("../vera-event-bus/publishers/vera-event-publishers");
const RECEIPT_INCLUDE = {
    trainingRecord: {
        include: Object.assign(Object.assign({}, training_wallet_mapper_1.TRAINING_RECORD_WALLET_INCLUDE), { worker: { select: { id: true, firstName: true, lastName: true } }, instructor: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    qualificationStatus: true,
                    qualificationExpiresAt: true,
                },
            }, trainingProvider: { select: { id: true, name: true } }, validationResults: { orderBy: { validatedAt: 'desc' }, take: 1 } }),
    },
};
let UnionHallTrainingService = class UnionHallTrainingService {
    constructor(prisma, walletIntegration, standardsCompliance, events) {
        this.prisma = prisma;
        this.walletIntegration = walletIntegration;
        this.standardsCompliance = standardsCompliance;
        this.events = events;
    }
    async ensurePendingReceiptsForRecord(trainingRecordId) {
        var _a, _b;
        const record = await this.prisma.trainingRecord.findUnique({
            where: { id: trainingRecordId },
            select: {
                id: true,
                trainingProviderId: true,
                providerId: true,
                workerId: true,
            },
        });
        let trainingProviderId = (_a = record === null || record === void 0 ? void 0 : record.trainingProviderId) !== null && _a !== void 0 ? _a : null;
        if (!trainingProviderId && (record === null || record === void 0 ? void 0 : record.providerId)) {
            const legacy = await this.prisma.provider.findUnique({
                where: { id: record.providerId },
                select: { name: true },
            });
            if (legacy === null || legacy === void 0 ? void 0 : legacy.name) {
                const mapped = await this.prisma.trainingProvider.findFirst({
                    where: { name: { equals: legacy.name, mode: 'insensitive' } },
                    select: { id: true },
                });
                trainingProviderId = (_b = mapped === null || mapped === void 0 ? void 0 : mapped.id) !== null && _b !== void 0 ? _b : null;
            }
        }
        if (!record || !trainingProviderId)
            return;
        const memberships = await this.prisma.unionMembership.findMany({
            where: { workerId: record.workerId, status: 'ACTIVE' },
            select: { unionHallId: true },
        });
        for (const m of memberships) {
            await this.prisma.unionHallProviderLink.upsert({
                where: {
                    unionHallId_trainingProviderId: {
                        unionHallId: m.unionHallId,
                        trainingProviderId,
                    },
                },
                create: {
                    unionHallId: m.unionHallId,
                    trainingProviderId,
                    active: true,
                },
                update: { active: true },
            });
            await this.prisma.unionHallTrainingReceipt.upsert({
                where: {
                    unionHallId_trainingRecordId: {
                        unionHallId: m.unionHallId,
                        trainingRecordId: record.id,
                    },
                },
                create: {
                    unionHallId: m.unionHallId,
                    trainingRecordId: record.id,
                    status: client_1.UnionHallTrainingStatus.PENDING,
                },
                update: {},
            });
        }
    }
    async getDashboard(unionHallId, actor) {
        var _a, _b;
        await this.assertHallAccess(unionHallId, actor);
        const hall = await this.prisma.unionHall.findUnique({
            where: { id: unionHallId },
        });
        if (!hall)
            throw new common_1.NotFoundException('Union hall not found');
        const receipts = await this.prisma.unionHallTrainingReceipt.findMany({
            where: { unionHallId },
            include: RECEIPT_INCLUDE,
            orderBy: { createdAt: 'desc' },
            take: 100,
        });
        const providerIds = [
            ...new Set(receipts
                .map((r) => r.trainingRecord.trainingProviderId)
                .filter((id) => id != null)),
        ];
        const providers = (await Promise.all(providerIds.map((id) => this.providerSummary(id)))).filter((p) => p != null);
        const instructorMap = new Map();
        const linkedProviders = await this.prisma.unionHallProviderLink.findMany({
            where: { unionHallId, active: true },
            include: {
                trainingProvider: {
                    include: {
                        instructors: {
                            where: { active: true },
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                qualificationStatus: true,
                                qualificationExpiresAt: true,
                            },
                        },
                    },
                },
            },
        });
        for (const link of linkedProviders) {
            for (const inst of link.trainingProvider.instructors) {
                instructorMap.set(inst.id, {
                    instructorId: inst.id,
                    firstName: inst.firstName,
                    lastName: inst.lastName,
                    providerId: link.trainingProviderId,
                    providerName: link.trainingProvider.name,
                    qualificationStatus: inst.qualificationStatus,
                    qualificationExpiresAt: (_b = (_a = inst.qualificationExpiresAt) === null || _a === void 0 ? void 0 : _a.toISOString()) !== null && _b !== void 0 ? _b : null,
                });
            }
        }
        const pending = receipts.filter((r) => r.status === client_1.UnionHallTrainingStatus.PENDING);
        const accepted = receipts.filter((r) => r.status === client_1.UnionHallTrainingStatus.ACCEPTED);
        return {
            unionHallId,
            unionHallName: hall.name,
            counts: {
                pending: pending.length,
                accepted: accepted.length,
                pushed: receipts.filter((r) => r.status === client_1.UnionHallTrainingStatus.PUSHED).length,
                rejected: receipts.filter((r) => r.status === client_1.UnionHallTrainingStatus.REJECTED).length,
            },
            providerTrainingHistory: receipts.map((r) => this.mapReceipt(r)),
            providers,
            instructors: [...instructorMap.values()],
        };
    }
    async listPending(unionHallId, actor) {
        await this.assertHallAccess(unionHallId, actor);
        const rows = await this.prisma.unionHallTrainingReceipt.findMany({
            where: {
                unionHallId,
                status: client_1.UnionHallTrainingStatus.PENDING,
            },
            include: RECEIPT_INCLUDE,
            orderBy: { createdAt: 'desc' },
        });
        return rows.map((r) => this.mapReceipt(r));
    }
    async linkProvider(unionHallId, trainingProviderId, actor) {
        await this.assertHallAccess(unionHallId, actor);
        const provider = await this.prisma.trainingProvider.findUnique({
            where: { id: trainingProviderId },
        });
        if (!provider)
            throw new common_1.NotFoundException('Training provider not found');
        return this.prisma.unionHallProviderLink.upsert({
            where: {
                unionHallId_trainingProviderId: { unionHallId, trainingProviderId },
            },
            create: { unionHallId, trainingProviderId, active: true },
            update: { active: true },
            include: { trainingProvider: true },
        });
    }
    async acceptTraining(unionHallId, trainingRecordId, actor, notes) {
        const receipt = await this.requireReceipt(unionHallId, trainingRecordId, actor);
        if (receipt.status !== client_1.UnionHallTrainingStatus.PENDING) {
            throw new common_1.BadRequestException('Training is not pending acceptance');
        }
        return this.prisma.unionHallTrainingReceipt.update({
            where: { id: receipt.id },
            data: {
                status: client_1.UnionHallTrainingStatus.ACCEPTED,
                acceptedAt: new Date(),
                acceptedByUserId: actor.id,
                notes: notes !== null && notes !== void 0 ? notes : receipt.notes,
            },
            include: RECEIPT_INCLUDE,
        });
    }
    async rejectTraining(unionHallId, trainingRecordId, actor, notes) {
        const receipt = await this.requireReceipt(unionHallId, trainingRecordId, actor);
        return this.prisma.unionHallTrainingReceipt.update({
            where: { id: receipt.id },
            data: {
                status: client_1.UnionHallTrainingStatus.REJECTED,
                notes: notes !== null && notes !== void 0 ? notes : receipt.notes,
            },
            include: RECEIPT_INCLUDE,
        });
    }
    async validateTraining(unionHallId, trainingRecordId, actor) {
        var _a, _b;
        const receipt = await this.requireReceipt(unionHallId, trainingRecordId, actor);
        if (receipt.status !== client_1.UnionHallTrainingStatus.ACCEPTED &&
            receipt.status !== client_1.UnionHallTrainingStatus.PENDING) {
            throw new common_1.BadRequestException('Training must be pending or accepted to validate');
        }
        if (!this.standardsCompliance) {
            throw new common_1.BadRequestException('Standards compliance engine unavailable');
        }
        const validation = await this.standardsCompliance.validateTraining(trainingRecordId);
        await this.prisma.unionHallTrainingReceipt.update({
            where: { id: receipt.id },
            data: {
                validatedAt: new Date(),
                status: receipt.status === client_1.UnionHallTrainingStatus.PENDING
                    ? client_1.UnionHallTrainingStatus.ACCEPTED
                    : receipt.status,
                acceptedAt: (_a = receipt.acceptedAt) !== null && _a !== void 0 ? _a : new Date(),
                acceptedByUserId: (_b = receipt.acceptedByUserId) !== null && _b !== void 0 ? _b : actor.id,
            },
        });
        return { validation, receiptId: receipt.id };
    }
    async pushTraining(unionHallId, trainingRecordId, actor, targets) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        const receipt = await this.requireReceipt(unionHallId, trainingRecordId, actor);
        if (receipt.status === client_1.UnionHallTrainingStatus.REJECTED) {
            throw new common_1.BadRequestException('Cannot push rejected training');
        }
        const companyId = (_b = (_a = targets === null || targets === void 0 ? void 0 : targets.companyId) !== null && _a !== void 0 ? _a : receipt.pushedCompanyId) !== null && _b !== void 0 ? _b : undefined;
        const projectId = (_d = (_c = targets === null || targets === void 0 ? void 0 : targets.projectId) !== null && _c !== void 0 ? _c : receipt.pushedProjectId) !== null && _d !== void 0 ? _d : undefined;
        await this.prisma.trainingRecord.update({
            where: { id: trainingRecordId },
            data: Object.assign(Object.assign({}, (companyId != null ? { companyId } : {})), (projectId != null ? { projectId } : {})),
        });
        const wallet = await this.walletIntegration.syncAfterTrainingRecord(trainingRecordId, targets === null || targets === void 0 ? void 0 : targets.equipmentId);
        const updated = await this.prisma.unionHallTrainingReceipt.update({
            where: { id: receipt.id },
            data: {
                status: client_1.UnionHallTrainingStatus.PUSHED,
                pushedAt: new Date(),
                pushedCompanyId: companyId !== null && companyId !== void 0 ? companyId : null,
                pushedProjectId: projectId !== null && projectId !== void 0 ? projectId : null,
                acceptedAt: (_e = receipt.acceptedAt) !== null && _e !== void 0 ? _e : new Date(),
                acceptedByUserId: (_f = receipt.acceptedByUserId) !== null && _f !== void 0 ? _f : actor.id,
                validatedAt: (_g = receipt.validatedAt) !== null && _g !== void 0 ? _g : new Date(),
            },
            include: RECEIPT_INCLUDE,
        });
        (_h = this.events) === null || _h === void 0 ? void 0 : _h.emit({
            name: domain_events_1.DomainEvent.UNION_TRAINING_PUSHED,
            occurredAt: new Date().toISOString(),
            companyId: companyId !== null && companyId !== void 0 ? companyId : undefined,
            projectId: projectId !== null && projectId !== void 0 ? projectId : undefined,
            entityType: 'union_hall_training_receipt',
            entityId: updated.id,
            data: { trainingRecordId, unionHallId },
        });
        (_j = this.events) === null || _j === void 0 ? void 0 : _j.emit((0, vera_event_publishers_1.unionHallRosterUpdateEvent)({
            unionHallId,
            workerId: (_k = updated.trainingRecord) === null || _k === void 0 ? void 0 : _k.workerId,
            trainingRecordId,
            action: 'training_pushed',
        }));
        return { receipt: this.mapReceipt(updated), wallet };
    }
    async providerSummary(providerId) {
        var _a, _b, _c, _d, _e;
        const provider = await this.prisma.trainingProvider.findUnique({
            where: { id: providerId },
            select: {
                id: true,
                name: true,
                code: true,
                approvalStatus: true,
                active: true,
            },
        });
        if (!provider)
            return null;
        const latest = await this.prisma.providerComplianceStatus.findFirst({
            where: { providerId },
            orderBy: { assessedAt: 'desc' },
        });
        return {
            providerId: provider.id,
            name: provider.name,
            code: provider.code,
            approvalStatus: provider.approvalStatus,
            active: provider.active,
            complianceStatus: (_a = latest === null || latest === void 0 ? void 0 : latest.status) !== null && _a !== void 0 ? _a : null,
            complianceScore: (_b = latest === null || latest === void 0 ? void 0 : latest.score) !== null && _b !== void 0 ? _b : null,
            complianceAssessedAt: (_d = (_c = latest === null || latest === void 0 ? void 0 : latest.assessedAt) === null || _c === void 0 ? void 0 : _c.toISOString()) !== null && _d !== void 0 ? _d : null,
            gaps: (_e = latest === null || latest === void 0 ? void 0 : latest.gaps) !== null && _e !== void 0 ? _e : null,
        };
    }
    mapReceipt(r) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t;
        const tr = r.trainingRecord;
        return {
            receiptId: r.id,
            status: r.status,
            acceptedAt: (_b = (_a = r.acceptedAt) === null || _a === void 0 ? void 0 : _a.toISOString()) !== null && _b !== void 0 ? _b : null,
            validatedAt: (_d = (_c = r.validatedAt) === null || _c === void 0 ? void 0 : _c.toISOString()) !== null && _d !== void 0 ? _d : null,
            pushedAt: (_f = (_e = r.pushedAt) === null || _e === void 0 ? void 0 : _e.toISOString()) !== null && _f !== void 0 ? _f : null,
            trainingRecordId: tr.id,
            workerId: tr.worker.id,
            workerName: `${tr.worker.firstName} ${tr.worker.lastName}`.trim(),
            courseName: (_h = (_g = tr.course) === null || _g === void 0 ? void 0 : _g.name) !== null && _h !== void 0 ? _h : tr.certification.name,
            providerName: (_k = (_j = tr.trainingProvider) === null || _j === void 0 ? void 0 : _j.name) !== null && _k !== void 0 ? _k : null,
            providerId: (_m = (_l = tr.trainingProvider) === null || _l === void 0 ? void 0 : _l.id) !== null && _m !== void 0 ? _m : null,
            instructorName: tr.instructor
                ? `${tr.instructor.firstName} ${tr.instructor.lastName}`.trim()
                : null,
            instructorQualificationStatus: (_p = (_o = tr.instructor) === null || _o === void 0 ? void 0 : _o.qualificationStatus) !== null && _p !== void 0 ? _p : null,
            issuedAt: tr.issuedAt.toISOString(),
            expiresAt: (_r = (_q = tr.expiresAt) === null || _q === void 0 ? void 0 : _q.toISOString()) !== null && _r !== void 0 ? _r : null,
            validationOutcome: (_t = (_s = tr.validationResults[0]) === null || _s === void 0 ? void 0 : _s.outcome) !== null && _t !== void 0 ? _t : null,
            certificateQrToken: tr.certificateQrToken,
        };
    }
    async requireReceipt(unionHallId, trainingRecordId, actor) {
        await this.assertHallAccess(unionHallId, actor);
        const receipt = await this.prisma.unionHallTrainingReceipt.findFirst({
            where: { unionHallId, trainingRecordId },
        });
        if (!receipt) {
            throw new common_1.NotFoundException('Training receipt not found for this hall');
        }
        return receipt;
    }
    async assertHallAccess(unionHallId, actor) {
        var _a;
        if (actor.role === client_1.UserRole.UNION_HALL_ADMIN) {
            const user = await this.prisma.user.findUnique({
                where: { id: actor.id },
                select: { unionHallId: true },
            });
            const hallId = (_a = actor.unionHallId) !== null && _a !== void 0 ? _a : user === null || user === void 0 ? void 0 : user.unionHallId;
            if (hallId != null && hallId !== unionHallId) {
                throw new common_1.ForbiddenException('You may only manage your assigned union hall');
            }
        }
    }
};
exports.UnionHallTrainingService = UnionHallTrainingService;
exports.UnionHallTrainingService = UnionHallTrainingService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => training_wallet_integration_service_1.TrainingWalletIntegrationService))),
    __param(2, (0, common_1.Optional)()),
    __param(3, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        training_wallet_integration_service_1.TrainingWalletIntegrationService,
        training_standards_compliance_service_1.TrainingStandardsComplianceService,
        event_bus_service_1.EventBusService])
], UnionHallTrainingService);
//# sourceMappingURL=union-hall-training.service.js.map