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
exports.TrainingWalletIntegrationService = void 0;
const common_1 = require("@nestjs/common");
const training_credential_nft_projection_service_1 = require("../training-credential-nft/training-credential-nft-projection.service");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const company_links_service_1 = require("./company-links.service");
const equipment_compliance_service_1 = require("../equipment-compliance/equipment-compliance.service");
const training_standards_compliance_service_1 = require("../training-standards-compliance/training-standards-compliance.service");
const training_wallet_mapper_1 = require("./training-wallet.mapper");
const company_training_compliance_service_1 = require("../../companies/company-training-compliance.service");
const union_hall_training_service_1 = require("./union-hall-training.service");
let TrainingWalletIntegrationService = class TrainingWalletIntegrationService {
    constructor(prisma, companyLinks, equipmentCompliance, standardsCompliance, companyTraining, unionHallTraining, veraProjection) {
        this.prisma = prisma;
        this.companyLinks = companyLinks;
        this.equipmentCompliance = equipmentCompliance;
        this.standardsCompliance = standardsCompliance;
        this.companyTraining = companyTraining;
        this.unionHallTraining = unionHallTraining;
        this.veraProjection = veraProjection;
    }
    async syncAfterTrainingRecord(trainingRecordId, equipmentId) {
        var _a;
        const record = await this.prisma.trainingRecord.findUnique({
            where: { id: trainingRecordId },
            include: training_wallet_mapper_1.TRAINING_RECORD_WALLET_INCLUDE,
        });
        if (!record) {
            throw new Error(`Training record ${trainingRecordId} not found`);
        }
        if (record.companyId) {
            await this.companyLinks.linkWorker(record.workerId, record.companyId, {
                deactivateOtherCompanies: false,
            });
        }
        await this.syncWorkerWalletItem(record, equipmentId);
        await this.syncProjectCompliance(record);
        await this.syncEquipmentCompetency(record, equipmentId);
        let validationOutcome = null;
        if (this.standardsCompliance) {
            const existing = await this.prisma.trainingValidationResult.findFirst({
                where: { trainingRecordId },
                orderBy: { validatedAt: 'desc' },
            });
            if (!existing) {
                validationOutcome = await this.standardsCompliance.validateTraining(trainingRecordId);
            }
            else {
                validationOutcome = {
                    outcome: existing.outcome,
                    jurisdictionCode: (_a = existing.jurisdictionCode) !== null && _a !== void 0 ? _a : 'ON',
                };
            }
        }
        if (this.unionHallTraining) {
            await this.unionHallTraining
                .ensurePendingReceiptsForRecord(trainingRecordId)
                .catch(() => undefined);
        }
        if (this.companyTraining) {
            await this.companyTraining
                .refreshAfterTrainingRecord(trainingRecordId)
                .catch(() => undefined);
        }
        return (0, training_wallet_mapper_1.mapTrainingRecordForWallet)(record, {
            validationOutcome: validationOutcome === null || validationOutcome === void 0 ? void 0 : validationOutcome.outcome,
            jurisdictionCode: validationOutcome === null || validationOutcome === void 0 ? void 0 : validationOutcome.jurisdictionCode,
        });
    }
    async listWalletTraining(workerId) {
        const records = await this.prisma.trainingRecord.findMany({
            where: { workerId },
            include: training_wallet_mapper_1.TRAINING_RECORD_WALLET_INCLUDE,
            orderBy: { issuedAt: 'desc' },
        });
        const validations = await this.prisma.trainingValidationResult.findMany({
            where: { trainingRecordId: { in: records.map((r) => r.id) } },
            orderBy: { validatedAt: 'desc' },
        });
        const latestByRecord = new Map();
        for (const v of validations) {
            if (v.trainingRecordId && !latestByRecord.has(v.trainingRecordId)) {
                latestByRecord.set(v.trainingRecordId, v);
            }
        }
        const veraProjections = this.veraProjection
            ? await this.veraProjection.getProjectionsForRecords(records.map((r) => r.id))
            : new Map();
        return records.map((r) => {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            const vera = veraProjections.get(r.id);
            return (0, training_wallet_mapper_1.mapTrainingRecordForWallet)(r, {
                validationOutcome: (_a = latestByRecord.get(r.id)) === null || _a === void 0 ? void 0 : _a.outcome,
                jurisdictionCode: (_e = (_c = (_b = vera === null || vera === void 0 ? void 0 : vera.jurisdictionCoverage) === null || _b === void 0 ? void 0 : _b[0]) !== null && _c !== void 0 ? _c : (_d = latestByRecord.get(r.id)) === null || _d === void 0 ? void 0 : _d.jurisdictionCode) !== null && _e !== void 0 ? _e : undefined,
                verifiedByVeraStatus: vera === null || vera === void 0 ? void 0 : vera.verifiedByVeraStatus,
                jurisdictionCoverage: vera === null || vera === void 0 ? void 0 : vera.jurisdictionCoverage,
                regulatorySummary: (_f = vera === null || vera === void 0 ? void 0 : vera.regulatorySummary) !== null && _f !== void 0 ? _f : undefined,
                nftTokenId: (_g = vera === null || vera === void 0 ? void 0 : vera.nftTokenId) !== null && _g !== void 0 ? _g : undefined,
                nftChain: (_h = vera === null || vera === void 0 ? void 0 : vera.nftChain) !== null && _h !== void 0 ? _h : undefined,
            });
        });
    }
    async syncWorkerWalletItem(record, equipmentId) {
        var _a, _b, _c;
        const catalogTypeKey = ((_a = record.course) === null || _a === void 0 ? void 0 : _a.code)
            ? `training:${record.course.code}`
            : `certification:${record.certificationId}`;
        const existing = await this.prisma.workerWalletItem.findFirst({
            where: { trainingRecordId: record.id },
        });
        const notes = JSON.stringify({
            source: 'training_provider',
            certificationName: record.certification.name,
            syncedAt: new Date().toISOString(),
        });
        if (existing) {
            await this.prisma.workerWalletItem.update({
                where: { id: existing.id },
                data: {
                    status: 'ACTIVE',
                    companyId: (_b = record.companyId) !== null && _b !== void 0 ? _b : existing.companyId,
                    equipmentId: equipmentId !== null && equipmentId !== void 0 ? equipmentId : existing.equipmentId,
                    catalogTypeKey,
                    notes,
                    updatedAt: new Date(),
                },
            });
            return;
        }
        await this.prisma.workerWalletItem.create({
            data: {
                workerId: record.workerId,
                trainingRecordId: record.id,
                catalogTypeKey,
                companyId: (_c = record.companyId) !== null && _c !== void 0 ? _c : undefined,
                equipmentId: equipmentId !== null && equipmentId !== void 0 ? equipmentId : undefined,
                status: 'ACTIVE',
                notes,
            },
        });
    }
    async syncProjectCompliance(record) {
        if (!record.projectId || !record.companyId)
            return;
        const existing = await this.prisma.projectAssignment.findFirst({
            where: {
                workerId: record.workerId,
                projectId: record.projectId,
                status: client_1.AssignmentStatus.ACTIVE,
            },
        });
        if (!existing) {
            await this.prisma.projectAssignment.create({
                data: {
                    workerId: record.workerId,
                    projectId: record.projectId,
                    companyId: record.companyId,
                    status: client_1.AssignmentStatus.ACTIVE,
                },
            });
        }
    }
    async syncEquipmentCompetency(record, equipmentId) {
        const equipmentIds = new Set();
        if (equipmentId)
            equipmentIds.add(equipmentId);
        const assignments = await this.prisma.workerAssignment.findMany({
            where: {
                workerId: record.workerId,
                endedAt: null,
                equipmentId: { not: null },
            },
            select: { equipmentId: true },
        });
        for (const a of assignments) {
            if (a.equipmentId)
                equipmentIds.add(a.equipmentId);
        }
        const linkWorkers = await this.prisma.equipmentLinkWorker.findMany({
            where: { workerId: record.workerId },
            include: {
                equipmentLink: {
                    include: {
                        equipment: {
                            include: { trainingRequirements: true },
                        },
                    },
                },
            },
        });
        for (const lw of linkWorkers) {
            const eq = lw.equipmentLink.equipment;
            const requires = eq.trainingRequirements.some((r) => r.certificationId === record.certificationId);
            if (requires)
                equipmentIds.add(eq.id);
        }
        await this.equipmentCompliance.recalculateForCertification(record.certificationId);
        for (const id of equipmentIds) {
            await this.equipmentCompliance.recalculate(id, {
                trigger: 'TRAINING',
                notes: `Training record synced to worker wallet (cert ${record.certificationId})`,
            });
        }
    }
};
exports.TrainingWalletIntegrationService = TrainingWalletIntegrationService;
exports.TrainingWalletIntegrationService = TrainingWalletIntegrationService = __decorate([
    (0, common_1.Injectable)(),
    __param(3, (0, common_1.Optional)()),
    __param(4, (0, common_1.Optional)()),
    __param(4, (0, common_1.Inject)((0, common_1.forwardRef)(() => company_training_compliance_service_1.CompanyTrainingComplianceService))),
    __param(5, (0, common_1.Optional)()),
    __param(5, (0, common_1.Inject)((0, common_1.forwardRef)(() => union_hall_training_service_1.UnionHallTrainingService))),
    __param(6, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        company_links_service_1.CompanyLinksService,
        equipment_compliance_service_1.EquipmentComplianceService,
        training_standards_compliance_service_1.TrainingStandardsComplianceService,
        company_training_compliance_service_1.CompanyTrainingComplianceService,
        union_hall_training_service_1.UnionHallTrainingService,
        training_credential_nft_projection_service_1.TrainingCredentialNftProjectionService])
], TrainingWalletIntegrationService);
//# sourceMappingURL=training-wallet-integration.service.js.map