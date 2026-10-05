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
exports.EquipmentWalletService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const crypto_1 = require("crypto");
const competency_service_1 = require("../competency/competency.service");
const maintenance_calibration_core_service_1 = require("../maintenance-calibration-core/maintenance-calibration-core.service");
const wallet_routes_1 = require("../../common/wallet-routes");
let EquipmentWalletService = class EquipmentWalletService {
    constructor(prisma, competency, maintenanceCalibration) {
        this.prisma = prisma;
        this.competency = competency;
        this.maintenanceCalibration = maintenanceCalibration;
    }
    async getQr(equipmentId) {
        const equipment = await this.prisma.equipment.findUnique({
            where: { id: equipmentId },
            select: { id: true, name: true, serialNumber: true, assetTag: true },
        });
        if (!equipment)
            throw new common_1.NotFoundException('Equipment not found');
        const qrToken = await this.ensureEquipmentQrToken(equipmentId);
        const baseUrl = process.env.PUBLIC_BASE_URL || 'https://app.vera.local';
        return {
            equipmentId,
            equipmentName: equipment.name,
            serialNumber: equipment.serialNumber,
            assetTag: equipment.assetTag,
            qrToken,
            qrContent: JSON.stringify({
                type: 'equipment',
                id: equipmentId,
                token: qrToken,
            }),
            scanUrl: (0, wallet_routes_1.equipmentScanAliasUrl)(equipmentId, baseUrl),
            verifyUrl: (0, wallet_routes_1.equipmentVerifyUrl)(equipmentId, baseUrl),
            walletUrl: `${baseUrl}${(0, wallet_routes_1.equipmentStaffWalletPath)(equipmentId)}`,
        };
    }
    async getInspectionHistory(equipmentId) {
        await this.assertExists(equipmentId);
        const rows = await this.prisma.inspection.findMany({
            where: { equipmentId },
            orderBy: { createdAt: 'desc' },
            take: 100,
            include: {
                worker: { select: { id: true, firstName: true, lastName: true } },
                supervisor: { select: { id: true, email: true, username: true } },
                checklistTemplate: {
                    select: { id: true, name: true, inspectionType: true },
                },
            },
        });
        return rows.map((row) => {
            var _a;
            return ({
                id: row.id,
                inspectionType: row.inspectionType,
                kind: row.kind,
                passed: row.passed,
                status: row.status,
                lockoutTriggered: row.lockoutTriggered,
                completedAt: row.completedAt,
                nextInspectionDate: row.nextInspectionDate,
                createdAt: row.createdAt,
                worker: row.worker,
                inspectorId: row.supervisorId,
                inspector: row.supervisor,
                checklistName: (_a = row.checklistTemplate) === null || _a === void 0 ? void 0 : _a.name,
            });
        });
    }
    async getCompetencyRequirements(equipmentId) {
        var _a;
        await this.assertExists(equipmentId);
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
        const rules = await this.competency.resolveRules(equipmentId);
        const assetReq = equipment.competencyRequirements[0];
        const assetRequirement = assetReq
            ? {
                source: 'equipment',
                minPassingScore: assetReq.minPassingScore,
                expiryDays: assetReq.expiryDays,
                requireEvaluation: assetReq.requireEvaluation,
                certification: assetReq.certification,
            }
            : null;
        const typeRequirement = ((_a = equipment.type) === null || _a === void 0 ? void 0 : _a.competencyRequirement)
            ? {
                source: 'type',
                equipmentTypeId: equipment.typeId,
                equipmentTypeName: equipment.type.name,
                minPassingScore: equipment.type.competencyRequirement.minPassingScore,
                expiryDays: equipment.type.competencyRequirement.expiryDays,
                requireEvaluation: equipment.type.competencyRequirement.requireEvaluation,
                certification: equipment.type.competencyRequirement.certification,
            }
            : null;
        const recentEvaluations = await this.prisma.competencyEvaluation.findMany({
            where: { equipmentId },
            orderBy: { evaluationDate: 'desc' },
            take: 20,
            include: {
                worker: { select: { id: true, firstName: true, lastName: true } },
                evaluator: { select: { id: true, email: true, username: true } },
            },
        });
        return {
            equipmentId,
            competencyRequired: equipment.competencyRequired,
            resolvedRules: rules,
            assetRequirement,
            typeRequirement,
            recentEvaluations,
        };
    }
    async getAssignedWorkers(equipmentId) {
        await this.assertExists(equipmentId);
        const links = await this.prisma.equipmentLink.findMany({
            where: { equipmentId, active: true },
            include: {
                company: { select: { id: true, name: true } },
                assignedWorkers: {
                    include: {
                        worker: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true,
                                phone: true,
                            },
                        },
                    },
                },
            },
        });
        return links.flatMap((link) => link.assignedWorkers.map((aw) => ({
            equipmentLinkId: link.id,
            companyId: link.companyId,
            companyName: link.company.name,
            worker: aw.worker,
            assignedAt: aw.assignedAt,
        })));
    }
    async getAssignedProjects(equipmentId) {
        await this.assertExists(equipmentId);
        const assignments = await this.prisma.equipmentProjectAssignment.findMany({
            where: { equipmentId },
            orderBy: { assignedAt: 'desc' },
            include: {
                project: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                        status: true,
                        companyId: true,
                        company: { select: { id: true, name: true } },
                    },
                },
            },
        });
        return assignments.map((a) => ({
            id: a.id,
            equipmentId: a.equipmentId,
            projectId: a.projectId,
            status: a.status,
            assignedAt: a.assignedAt,
            endedAt: a.endedAt,
            project: a.project,
        }));
    }
    async getComplianceStatus(equipmentId) {
        var _a, _b;
        const equipment = await this.prisma.equipment.findUnique({
            where: { id: equipmentId },
            include: {
                equipmentLinks: {
                    where: { active: true },
                    select: {
                        id: true,
                        companyId: true,
                        complianceStatus: true,
                        company: { select: { id: true, name: true } },
                    },
                },
                complianceHistory: {
                    orderBy: { assessedAt: 'desc' },
                    take: 15,
                },
            },
        });
        if (!equipment)
            throw new common_1.NotFoundException('Equipment not found');
        const lockedOut = Boolean(equipment.lockedOutAt);
        const activeLink = equipment.equipmentLinks[0];
        return {
            equipmentId,
            complianceStatus: equipment.complianceStatus,
            linkComplianceStatus: (_a = activeLink === null || activeLink === void 0 ? void 0 : activeLink.complianceStatus) !== null && _a !== void 0 ? _a : null,
            lastInspectionAt: equipment.lastInspectionAt,
            nextInspectionAt: equipment.nextInspectionAt,
            lockoutStatus: equipment.lockoutStatus,
            lockedOut,
            lockoutReason: equipment.lockoutReason,
            safetyStatus: equipment.safetyStatus,
            competencyRequired: equipment.competencyRequired,
            trainingRequired: equipment.trainingRequired,
            complianceUpdatedAt: equipment.complianceUpdatedAt,
            activeCompany: (_b = activeLink === null || activeLink === void 0 ? void 0 : activeLink.company) !== null && _b !== void 0 ? _b : null,
            history: equipment.complianceHistory,
        };
    }
    async getFullWallet(equipmentId) {
        const [qr, inspections, competency, workers, projects, compliance, equipment,] = await Promise.all([
            this.getQr(equipmentId),
            this.getInspectionHistory(equipmentId),
            this.getCompetencyRequirements(equipmentId),
            this.getAssignedWorkers(equipmentId),
            this.getAssignedProjects(equipmentId),
            this.getComplianceStatus(equipmentId),
            this.prisma.equipment.findUnique({
                where: { id: equipmentId },
                select: {
                    id: true,
                    name: true,
                    serialNumber: true,
                    assetTag: true,
                    catalogTypeKey: true,
                    photoUrl: true,
                },
            }),
        ]);
        if (!equipment)
            throw new common_1.NotFoundException('Equipment not found');
        const [trainingRequirements, maintenanceCalibration] = await Promise.all([
            this.prisma.equipmentTrainingRequirement.findMany({
                where: { equipmentId },
                include: { certification: true },
            }),
            this.maintenanceCalibration.getEquipmentSummary(equipmentId),
        ]);
        return {
            type: 'equipment',
            equipment,
            qr,
            inspections,
            competency,
            assignedWorkers: workers,
            assignedProjects: projects,
            compliance,
            trainingRequirements,
            maintenance: maintenanceCalibration,
        };
    }
    async getMaintenanceCalibration(equipmentId) {
        return this.maintenanceCalibration.getEquipmentSummary(equipmentId);
    }
    async assertExists(equipmentId) {
        const count = await this.prisma.equipment.count({
            where: { id: equipmentId },
        });
        if (!count)
            throw new common_1.NotFoundException('Equipment not found');
    }
    async ensureEquipmentQrToken(equipmentId) {
        const e = await this.prisma.equipment.findUnique({
            where: { id: equipmentId },
        });
        if (!e)
            throw new common_1.NotFoundException('Equipment not found');
        if (e.qrToken)
            return e.qrToken;
        const qrToken = `e-${(0, crypto_1.randomBytes)(8).toString('hex')}`;
        await this.prisma.equipment.update({
            where: { id: equipmentId },
            data: { qrToken },
        });
        return qrToken;
    }
};
exports.EquipmentWalletService = EquipmentWalletService;
exports.EquipmentWalletService = EquipmentWalletService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        competency_service_1.CompetencyService,
        maintenance_calibration_core_service_1.MaintenanceCalibrationCoreService])
], EquipmentWalletService);
//# sourceMappingURL=equipment-wallet.service.js.map