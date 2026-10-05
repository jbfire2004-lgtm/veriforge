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
exports.EquipmentComplianceService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
let EquipmentComplianceService = class EquipmentComplianceService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async recalculate(equipmentId, opts) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
        const equipment = await this.prisma.equipment.findUnique({
            where: { id: equipmentId },
            include: {
                trainingRequirements: { include: { certification: true } },
                competencyRequirements: true,
                equipmentLinks: {
                    where: { active: true },
                    include: {
                        assignedWorkers: {
                            include: {
                                worker: {
                                    include: {
                                        trainingRecords: true,
                                        competencyEvaluations: {
                                            where: { equipmentId },
                                            orderBy: { evaluationDate: 'desc' },
                                            take: 1,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                inspections: {
                    where: { completedAt: { not: null } },
                    orderBy: { completedAt: 'desc' },
                    take: 1,
                },
                calibrations: { orderBy: { calibratedAt: 'desc' }, take: 1 },
                maintenanceRecords: { orderBy: { performedAt: 'desc' }, take: 1 },
                maintenanceSchedules: { where: { active: true } },
                calibrationSchedules: { where: { active: true } },
            },
        });
        if (!equipment)
            throw new common_1.NotFoundException('Equipment not found');
        const trainingRequired = equipment.trainingRequirements.length > 0;
        const competencyRequired = equipment.competencyRequirements != null ||
            (equipment.typeId != null &&
                (await this.prisma.equipmentTypeCompetencyRequirement.findUnique({
                    where: { equipmentTypeId: equipment.typeId },
                })) != null);
        const lastInspection = equipment.inspections[0];
        const lastInspectionAt = (_a = lastInspection === null || lastInspection === void 0 ? void 0 : lastInspection.completedAt) !== null && _a !== void 0 ? _a : null;
        const nextInspectionAt = (_d = (_b = lastInspection === null || lastInspection === void 0 ? void 0 : lastInspection.nextInspectionDate) !== null && _b !== void 0 ? _b : (_c = (await this.prisma.inspection.findFirst({
            where: {
                equipmentId,
                passed: true,
                nextInspectionDate: { not: null },
            },
            orderBy: { nextInspectionDate: 'asc' },
            select: { nextInspectionDate: true },
        }))) === null || _c === void 0 ? void 0 : _c.nextInspectionDate) !== null && _d !== void 0 ? _d : null;
        const lockoutStatus = equipment.lockedOutAt
            ? client_1.EquipmentLockoutStatus.LOCKED_OUT
            : client_1.EquipmentLockoutStatus.CLEAR;
        const status = (_e = opts.forceStatus) !== null && _e !== void 0 ? _e : this.computeStatus({
            equipment,
            trainingCertIds: equipment.trainingRequirements.map((r) => r.certificationId),
            lockoutStatus,
            nextInspectionAt,
            trainingRequired,
            competencyRequired,
        });
        const now = new Date();
        await this.prisma.equipment.update({
            where: { id: equipmentId },
            data: {
                complianceStatus: status,
                lastInspectionAt,
                nextInspectionAt,
                lockoutStatus,
                competencyRequired,
                trainingRequired,
                complianceUpdatedAt: now,
            },
        });
        const companyId = (_h = (_f = equipment.companyId) !== null && _f !== void 0 ? _f : (_g = equipment.equipmentLinks[0]) === null || _g === void 0 ? void 0 : _g.companyId) !== null && _h !== void 0 ? _h : null;
        if (companyId) {
            await this.prisma.equipmentLink.updateMany({
                where: { equipmentId, companyId, active: true },
                data: { complianceStatus: status },
            });
            await this.prisma.equipmentComplianceStatus.create({
                data: {
                    equipmentId,
                    companyId,
                    status,
                    assessedByUserId: (_j = opts.assessedByUserId) !== null && _j !== void 0 ? _j : null,
                    notes: (_k = opts.notes) !== null && _k !== void 0 ? _k : `${opts.trigger}: ${status}`,
                    inspectionId: (_l = opts.inspectionId) !== null && _l !== void 0 ? _l : null,
                },
            });
        }
        return {
            equipmentId,
            complianceStatus: status,
            lockoutStatus,
            lastInspectionAt,
            nextInspectionAt,
            competencyRequired,
            trainingRequired,
            complianceUpdatedAt: now,
            trigger: opts.trigger,
        };
    }
    async recalculateForCertification(certificationId) {
        const equipmentIds = await this.prisma.equipmentTrainingRequirement.findMany({
            where: { certificationId },
            select: { equipmentId: true },
        });
        const ids = [...new Set(equipmentIds.map((r) => r.equipmentId))];
        for (const id of ids) {
            await this.recalculate(id, {
                trigger: 'TRAINING',
                notes: 'Training record ingested',
            });
        }
        return { recalculated: ids.length };
    }
    async dashboard(companyId) {
        const where = companyId
            ? {
                OR: [
                    { companyId },
                    { equipmentLinks: { some: { companyId, active: true } } },
                ],
            }
            : {};
        const [total, compliant, needsAttention, nonCompliant, lockedOut, overdueInspection, recent,] = await Promise.all([
            this.prisma.equipment.count({ where }),
            this.prisma.equipment.count({
                where: Object.assign(Object.assign({}, where), { complianceStatus: client_1.LinkComplianceStatus.COMPLIANT }),
            }),
            this.prisma.equipment.count({
                where: Object.assign(Object.assign({}, where), { complianceStatus: client_1.LinkComplianceStatus.NEEDS_ATTENTION }),
            }),
            this.prisma.equipment.count({
                where: Object.assign(Object.assign({}, where), { complianceStatus: client_1.LinkComplianceStatus.NON_COMPLIANT }),
            }),
            this.prisma.equipment.count({
                where: Object.assign(Object.assign({}, where), { complianceStatus: client_1.LinkComplianceStatus.LOCKED_OUT }),
            }),
            this.prisma.equipment.count({
                where: Object.assign(Object.assign({}, where), { nextInspectionAt: { lt: new Date() }, lockoutStatus: client_1.EquipmentLockoutStatus.CLEAR }),
            }),
            this.prisma.equipment.findMany({
                where: Object.assign(Object.assign({}, where), { complianceStatus: {
                        in: [
                            client_1.LinkComplianceStatus.NON_COMPLIANT,
                            client_1.LinkComplianceStatus.NEEDS_ATTENTION,
                            client_1.LinkComplianceStatus.LOCKED_OUT,
                        ],
                    } }),
                orderBy: { complianceUpdatedAt: 'desc' },
                take: 25,
                select: {
                    id: true,
                    name: true,
                    complianceStatus: true,
                    lockoutStatus: true,
                    lastInspectionAt: true,
                    nextInspectionAt: true,
                    competencyRequired: true,
                    trainingRequired: true,
                    safetyStatus: true,
                    company: { select: { id: true, name: true } },
                },
            }),
        ]);
        return {
            total,
            compliant,
            needsAttention,
            nonCompliant,
            lockedOut,
            overdueInspection,
            recent,
        };
    }
    computeStatus(ctx) {
        var _a, _b, _c;
        const { equipment, trainingCertIds, lockoutStatus, nextInspectionAt, trainingRequired, competencyRequired, } = ctx;
        if (lockoutStatus === client_1.EquipmentLockoutStatus.LOCKED_OUT ||
            equipment.safetyStatus === 'UNSAFE') {
            return client_1.LinkComplianceStatus.LOCKED_OUT;
        }
        const now = new Date();
        if (nextInspectionAt && nextInspectionAt < now) {
            return client_1.LinkComplianceStatus.NON_COMPLIANT;
        }
        if (equipment.safetyStatus === 'NEEDS_INSPECTION') {
            return client_1.LinkComplianceStatus.NEEDS_ATTENTION;
        }
        const latestCal = equipment.calibrations[0];
        if (latestCal) {
            if (!latestCal.passed)
                return client_1.LinkComplianceStatus.NEEDS_ATTENTION;
            if (latestCal.expiresAt && latestCal.expiresAt < now) {
                return client_1.LinkComplianceStatus.NEEDS_ATTENTION;
            }
        }
        const latestMaint = equipment.maintenanceRecords[0];
        if ((latestMaint === null || latestMaint === void 0 ? void 0 : latestMaint.nextDueAt) && latestMaint.nextDueAt < now) {
            return client_1.LinkComplianceStatus.NEEDS_ATTENTION;
        }
        const maintScheduleDue = (_a = equipment.maintenanceSchedules) === null || _a === void 0 ? void 0 : _a.some((s) => s.nextDueAt && s.nextDueAt < now);
        if (maintScheduleDue)
            return client_1.LinkComplianceStatus.NEEDS_ATTENTION;
        const calScheduleDue = (_b = equipment.calibrationSchedules) === null || _b === void 0 ? void 0 : _b.some((s) => s.nextDueAt && s.nextDueAt < now);
        if (calScheduleDue)
            return client_1.LinkComplianceStatus.NEEDS_ATTENTION;
        const activeLink = equipment.equipmentLinks[0];
        const operators = (_c = activeLink === null || activeLink === void 0 ? void 0 : activeLink.assignedWorkers) !== null && _c !== void 0 ? _c : [];
        if (trainingRequired &&
            operators.length > 0 &&
            trainingCertIds.length > 0) {
            const allTrained = operators.every((aw) => {
                const records = aw.worker.trainingRecords;
                return trainingCertIds.every((certId) => records.some((tr) => tr.certificationId === certId &&
                    (!tr.expiresAt || tr.expiresAt > now)));
            });
            if (!allTrained)
                return client_1.LinkComplianceStatus.NON_COMPLIANT;
        }
        if (competencyRequired && operators.length > 0) {
            const allCompetent = operators.every((aw) => {
                const ev = aw.worker.competencyEvaluations[0];
                return (ev === null || ev === void 0 ? void 0 : ev.passed) && (!ev.expiresAt || ev.expiresAt > now);
            });
            if (!allCompetent)
                return client_1.LinkComplianceStatus.NEEDS_ATTENTION;
        }
        return client_1.LinkComplianceStatus.COMPLIANT;
    }
};
exports.EquipmentComplianceService = EquipmentComplianceService;
exports.EquipmentComplianceService = EquipmentComplianceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EquipmentComplianceService);
//# sourceMappingURL=equipment-compliance.service.js.map