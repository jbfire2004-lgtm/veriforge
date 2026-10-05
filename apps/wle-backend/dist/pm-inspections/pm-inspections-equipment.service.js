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
exports.PmInspectionsEquipmentService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const inactivation_service_1 = require("../modules/vera-core/inactivation.service");
let PmInspectionsEquipmentService = class PmInspectionsEquipmentService {
    constructor(prisma, inactivation) {
        this.prisma = prisma;
        this.inactivation = inactivation;
    }
    async evaluateEquipmentBlock(inspectionId) {
        const inspection = await this.prisma.pmInspection.findUnique({
            where: { id: inspectionId },
            include: {
                deficiencies: { where: { status: { not: 'closed' } } },
                equipment: true,
            },
        });
        if (!(inspection === null || inspection === void 0 ? void 0 : inspection.equipmentId) || !inspection.equipment) {
            return { blocked: false };
        }
        const critical = inspection.deficiencies.filter((d) => d.severity === 'critical');
        if (critical.length > 0) {
            return {
                blocked: true,
                reason: `${critical.length} critical open deficiency(ies)`,
            };
        }
        if (inspection.passed === false) {
            return { blocked: true, reason: 'Inspection failed' };
        }
        if (inspection.equipment.complianceStatus === 'NON_COMPLIANT' ||
            inspection.equipment.complianceStatus === 'LOCKED_OUT') {
            return { blocked: true, reason: 'Equipment compliance not current' };
        }
        if (inspection.equipment.nextInspectionAt &&
            inspection.equipment.nextInspectionAt < new Date()) {
            return { blocked: true, reason: 'Required inspection overdue' };
        }
        return { blocked: false };
    }
    async applyLockoutIfNeeded(inspectionId, actorUserId) {
        var _a;
        const block = await this.evaluateEquipmentBlock(inspectionId);
        if (!block.blocked)
            return false;
        const inspection = await this.prisma.pmInspection.findUnique({
            where: { id: inspectionId },
            include: { equipment: true },
        });
        if (!(inspection === null || inspection === void 0 ? void 0 : inspection.equipmentId) || !inspection.equipment)
            return false;
        const reason = (_a = block.reason) !== null && _a !== void 0 ? _a : 'PM inspection block';
        await this.inactivation.lockoutEquipment(inspection.equipmentId, reason);
        await this.prisma.equipment.update({
            where: { id: inspection.equipmentId },
            data: {
                safetyStatus: client_1.EquipmentSafetyStatus.UNSAFE,
                lockedOutAt: new Date(),
                lockoutReason: reason,
            },
        });
        await this.prisma.equipmentLockout.create({
            data: {
                equipmentId: inspection.equipmentId,
                companyId: inspection.equipment.companyId,
                reason,
                lockedByUserId: actorUserId,
            },
        });
        return true;
    }
    static severityRequiresLockout(severity) {
        return severity === 'critical';
    }
};
exports.PmInspectionsEquipmentService = PmInspectionsEquipmentService;
exports.PmInspectionsEquipmentService = PmInspectionsEquipmentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        inactivation_service_1.InactivationService])
], PmInspectionsEquipmentService);
//# sourceMappingURL=pm-inspections-equipment.service.js.map