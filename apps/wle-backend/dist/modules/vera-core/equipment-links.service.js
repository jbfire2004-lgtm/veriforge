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
exports.EquipmentLinksService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const inactivation_service_1 = require("./inactivation.service");
const crypto_1 = require("crypto");
const competency_service_1 = require("../competency/competency.service");
const equipment_compliance_service_1 = require("../equipment-compliance/equipment-compliance.service");
let EquipmentLinksService = class EquipmentLinksService {
    constructor(prisma, inactivation, competency, compliance) {
        this.prisma = prisma;
        this.inactivation = inactivation;
        this.competency = competency;
        this.compliance = compliance;
    }
    async listByCompany(companyId, activeOnly = true) {
        return this.prisma.equipmentLink.findMany({
            where: Object.assign({ companyId }, (activeOnly ? { active: true } : {})),
            include: {
                equipment: true,
                assignedWorkers: { include: { worker: true } },
            },
            orderBy: { startDate: 'desc' },
        });
    }
    async linkEquipment(equipmentId, companyId, opts) {
        const equipment = await this.prisma.equipment.findUnique({
            where: { id: equipmentId },
        });
        if (!equipment)
            throw new common_1.NotFoundException('Equipment not found');
        if (equipment.lockedOutAt) {
            throw new common_1.NotFoundException('Equipment is locked out');
        }
        if ((opts === null || opts === void 0 ? void 0 : opts.deactivateOtherCompanies) !== false) {
            const otherLinks = await this.prisma.equipmentLink.findMany({
                where: { equipmentId, active: true, companyId: { not: companyId } },
            });
            for (const link of otherLinks) {
                await this.inactivation.deactivateEquipmentAtCompany(equipmentId, link.companyId, 'NEW_COMPANY_LINK');
            }
        }
        const existing = await this.prisma.equipmentLink.findFirst({
            where: { equipmentId, companyId, active: true },
        });
        if (existing) {
            return this.prisma.equipmentLink.findUniqueOrThrow({
                where: { id: existing.id },
                include: { equipment: true, company: true },
            });
        }
        const link = await this.prisma.equipmentLink.create({
            data: {
                equipmentId,
                companyId,
                active: true,
                complianceStatus: client_1.LinkComplianceStatus.COMPLIANT,
            },
            include: { equipment: true, company: true },
        });
        await this.prisma.equipment.update({
            where: { id: equipmentId },
            data: { companyId },
        });
        if (!equipment.qrToken) {
            await this.prisma.equipment.update({
                where: { id: equipmentId },
                data: { qrToken: `e-${(0, crypto_1.randomBytes)(8).toString('hex')}` },
            });
        }
        await this.compliance.recalculate(equipmentId, {
            trigger: 'MANUAL',
            notes: 'Linked to company',
        });
        return link;
    }
    async linkByQrToken(qrToken, companyId) {
        const equipment = await this.prisma.equipment.findFirst({
            where: { qrToken },
        });
        if (!equipment)
            throw new common_1.NotFoundException('Equipment not found for QR');
        return this.linkEquipment(equipment.id, companyId);
    }
    async endAssignment(equipmentId, companyId) {
        return this.inactivation.deactivateEquipmentAtCompany(equipmentId, companyId, 'END_ASSIGNMENT');
    }
    async assignWorkerToEquipmentLink(equipmentLinkId, workerId) {
        const link = await this.prisma.equipmentLink.findUnique({
            where: { id: equipmentLinkId },
        });
        if (!(link === null || link === void 0 ? void 0 : link.active))
            throw new common_1.NotFoundException('Equipment link not active');
        const companyLink = await this.prisma.companyLink.findFirst({
            where: {
                workerId,
                companyId: link.companyId,
                active: true,
            },
        });
        if (!companyLink) {
            throw new common_1.NotFoundException('Worker must be active at company');
        }
        await this.competency.assertEligible(workerId, link.equipmentId);
        return this.prisma.equipmentLinkWorker.upsert({
            where: {
                equipmentLinkId_workerId: { equipmentLinkId, workerId },
            },
            create: { equipmentLinkId, workerId },
            update: {},
            include: { worker: true },
        });
    }
};
exports.EquipmentLinksService = EquipmentLinksService;
exports.EquipmentLinksService = EquipmentLinksService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        inactivation_service_1.InactivationService,
        competency_service_1.CompetencyService,
        equipment_compliance_service_1.EquipmentComplianceService])
], EquipmentLinksService);
//# sourceMappingURL=equipment-links.service.js.map