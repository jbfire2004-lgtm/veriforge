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
exports.EquipmentCoreService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const crypto_1 = require("crypto");
const prisma_service_1 = require("../../prisma/prisma.service");
const equipment_links_service_1 = require("../vera-core/equipment-links.service");
const projects_service_1 = require("../vera-core/projects.service");
const inactivation_service_1 = require("../vera-core/inactivation.service");
const wallets_service_1 = require("../vera-core/wallets.service");
const competency_service_1 = require("../competency/competency.service");
const equipment_compliance_service_1 = require("../equipment-compliance/equipment-compliance.service");
const equipmentInclude = {
    company: true,
    category: true,
    type: true,
    equipmentLinks: {
        orderBy: { startDate: 'desc' },
        include: {
            company: true,
            assignedWorkers: { include: { worker: true } },
        },
    },
    projectAssignments: {
        where: { status: 'ACTIVE' },
        include: { project: true },
    },
    competencyRequirements: { include: { certification: true } },
    trainingRequirements: { include: { certification: true } },
    inspections: { orderBy: { createdAt: 'desc' }, take: 20 },
    maintenanceRecords: { orderBy: { performedAt: 'desc' }, take: 20 },
    calibrations: { orderBy: { calibratedAt: 'desc' }, take: 20 },
    lockoutHistory: { orderBy: { lockedAt: 'desc' }, take: 20 },
    complianceHistory: { orderBy: { assessedAt: 'desc' }, take: 20 },
    attachments: { orderBy: { createdAt: 'desc' } },
};
let EquipmentCoreService = class EquipmentCoreService {
    constructor(prisma, equipmentLinks, projects, inactivation, wallets, competency, compliance) {
        this.prisma = prisma;
        this.equipmentLinks = equipmentLinks;
        this.projects = projects;
        this.inactivation = inactivation;
        this.wallets = wallets;
        this.competency = competency;
        this.compliance = compliance;
    }
    qrToken() {
        return `e-${(0, crypto_1.randomBytes)(8).toString('hex')}`;
    }
    async list(query) {
        var _a, _b;
        const limit = Math.min((_a = query.limit) !== null && _a !== void 0 ? _a : 50, 200);
        const where = {};
        if (query.companyId) {
            if (query.activeOnly !== false) {
                where.equipmentLinks = {
                    some: { companyId: query.companyId, active: true },
                };
            }
            else {
                where.OR = [
                    { companyId: query.companyId },
                    { equipmentLinks: { some: { companyId: query.companyId } } },
                ];
            }
        }
        if ((_b = query.q) === null || _b === void 0 ? void 0 : _b.trim()) {
            const q = query.q.trim();
            where.AND = [
                ...(Array.isArray(where.AND)
                    ? where.AND
                    : where.AND
                        ? [where.AND]
                        : []),
                {
                    OR: [
                        { name: { contains: q, mode: 'insensitive' } },
                        { serialNumber: { contains: q, mode: 'insensitive' } },
                        { assetTag: { contains: q, mode: 'insensitive' } },
                        { qrToken: q },
                    ],
                },
            ];
        }
        if (query.complianceStatus) {
            where.complianceStatus = query.complianceStatus;
        }
        else if (query.compliant === true) {
            where.complianceStatus = client_1.LinkComplianceStatus.COMPLIANT;
        }
        else if (query.compliant === false) {
            where.complianceStatus = {
                in: [
                    client_1.LinkComplianceStatus.NON_COMPLIANT,
                    client_1.LinkComplianceStatus.NEEDS_ATTENTION,
                    client_1.LinkComplianceStatus.LOCKED_OUT,
                ],
            };
        }
        return this.prisma.equipment.findMany({
            where,
            take: limit,
            orderBy: { updatedAt: 'desc' },
            include: {
                company: true,
                category: true,
                type: true,
                equipmentLinks: {
                    where: query.companyId
                        ? { companyId: query.companyId, active: true }
                        : { active: true },
                    take: 1,
                },
            },
        });
    }
    async search(query) {
        var _a, _b;
        const limit = Math.min((_a = query.limit) !== null && _a !== void 0 ? _a : 25, 100);
        const where = { AND: [] };
        const and = where.AND;
        if (query.serial) {
            and.push({
                serialNumber: { contains: query.serial, mode: 'insensitive' },
            });
        }
        if (query.assetTag) {
            and.push({ assetTag: { contains: query.assetTag, mode: 'insensitive' } });
        }
        if (query.qr) {
            and.push({
                OR: [
                    { qrToken: query.qr },
                    { id: Number.isFinite(Number(query.qr)) ? Number(query.qr) : -1 },
                ],
            });
        }
        if ((_b = query.q) === null || _b === void 0 ? void 0 : _b.trim()) {
            const q = query.q.trim();
            and.push({
                OR: [
                    { name: { contains: q, mode: 'insensitive' } },
                    { serialNumber: { contains: q, mode: 'insensitive' } },
                    { assetTag: { contains: q, mode: 'insensitive' } },
                ],
            });
        }
        if (and.length === 0)
            delete where.AND;
        return this.prisma.equipment.findMany({
            where,
            take: limit,
            include: { company: true, category: true, type: true },
        });
    }
    async dashboard(companyId) {
        const compliance = await this.compliance.dashboard(companyId);
        const recent = await this.list({ companyId, limit: 8 });
        return {
            total: compliance.total,
            lockedOut: compliance.lockedOut,
            nonCompliant: compliance.nonCompliant + compliance.needsAttention,
            needsInspection: compliance.overdueInspection,
            compliant: compliance.compliant,
            needsAttention: compliance.needsAttention,
            recent,
            atRisk: compliance.recent,
        };
    }
    async create(dto, userId) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
        const equipment = await this.prisma.equipment.create({
            data: {
                name: dto.name,
                serialNumber: (_a = dto.serialNumber) !== null && _a !== void 0 ? _a : null,
                assetTag: (_b = dto.assetTag) !== null && _b !== void 0 ? _b : null,
                safetyStatus: (_c = dto.safetyStatus) !== null && _c !== void 0 ? _c : client_1.EquipmentSafetyStatus.OK,
                companyId: (_d = dto.companyId) !== null && _d !== void 0 ? _d : null,
                categoryId: (_e = dto.categoryId) !== null && _e !== void 0 ? _e : null,
                typeId: (_f = dto.typeId) !== null && _f !== void 0 ? _f : null,
                photoUrl: (_g = dto.photoUrl) !== null && _g !== void 0 ? _g : null,
                description: (_h = dto.description) !== null && _h !== void 0 ? _h : null,
                manufacturer: (_j = dto.manufacturer) !== null && _j !== void 0 ? _j : null,
                model: (_k = dto.model) !== null && _k !== void 0 ? _k : null,
                yearMade: (_l = dto.yearMade) !== null && _l !== void 0 ? _l : null,
                catalogCategory: (_m = dto.catalogCategory) !== null && _m !== void 0 ? _m : null,
                catalogTypeKey: (_o = dto.catalogTypeKey) !== null && _o !== void 0 ? _o : null,
                meterHours: (_p = dto.meterHours) !== null && _p !== void 0 ? _p : 0,
                qrToken: this.qrToken(),
            },
            include: equipmentInclude,
        });
        if (dto.companyId) {
            await this.equipmentLinks.linkEquipment(equipment.id, dto.companyId, {
                deactivateOtherCompanies: false,
            });
            await this.compliance.recalculate(equipment.id, {
                trigger: 'MANUAL',
                assessedByUserId: userId,
                notes: 'Equipment created and linked',
            });
        }
        return this.findOne(equipment.id);
    }
    async findOne(id) {
        var _a;
        const equipment = await this.prisma.equipment.findUnique({
            where: { id },
            include: equipmentInclude,
        });
        if (!equipment)
            throw new common_1.NotFoundException('Equipment not found');
        const activeLink = equipment.equipmentLinks.find((l) => l.active);
        return Object.assign(Object.assign({}, equipment), { isLockedOut: Boolean(equipment.lockedOutAt), isSafe: equipment.safetyStatus === 'OK' && !equipment.lockedOutAt, activeCompanyLink: activeLink !== null && activeLink !== void 0 ? activeLink : null, assignedOperators: (_a = activeLink === null || activeLink === void 0 ? void 0 : activeLink.assignedWorkers) !== null && _a !== void 0 ? _a : [] });
    }
    async update(id, dto) {
        await this.findOne(id);
        await this.prisma.equipment.update({
            where: { id },
            data: Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, (dto.name !== undefined ? { name: dto.name } : {})), (dto.serialNumber !== undefined
                ? { serialNumber: dto.serialNumber }
                : {})), (dto.assetTag !== undefined ? { assetTag: dto.assetTag } : {})), (dto.safetyStatus !== undefined
                ? { safetyStatus: dto.safetyStatus }
                : {})), (dto.companyId !== undefined ? { companyId: dto.companyId } : {})), (dto.categoryId !== undefined ? { categoryId: dto.categoryId } : {})), (dto.typeId !== undefined ? { typeId: dto.typeId } : {})), (dto.photoUrl !== undefined ? { photoUrl: dto.photoUrl } : {})), (dto.description !== undefined
                ? { description: dto.description }
                : {})), (dto.manufacturer !== undefined
                ? { manufacturer: dto.manufacturer }
                : {})), (dto.model !== undefined ? { model: dto.model } : {})), (dto.yearMade !== undefined ? { yearMade: dto.yearMade } : {})), (dto.meterHours !== undefined ? { meterHours: dto.meterHours } : {})), (dto.catalogCategory !== undefined
                ? { catalogCategory: dto.catalogCategory }
                : {})), (dto.catalogTypeKey !== undefined
                ? { catalogTypeKey: dto.catalogTypeKey }
                : {})),
        });
        return this.findOne(id);
    }
    async scanQr(qrToken, companyId) {
        var _a;
        const link = await this.equipmentLinks.linkByQrToken(qrToken, companyId);
        const wallet = await this.wallets.getEquipmentWallet(link.equipmentId);
        const equipment = await this.prisma.equipment.findUnique({
            where: { id: link.equipmentId },
            select: { name: true },
        });
        return {
            linked: true,
            equipmentId: link.equipmentId,
            companyId: link.companyId,
            linkId: link.id,
            complianceStatus: wallet.complianceStatus,
            equipmentName: (_a = equipment === null || equipment === void 0 ? void 0 : equipment.name) !== null && _a !== void 0 ? _a : null,
            walletUrl: `/equipment/${link.equipmentId}/wallet`,
        };
    }
    async getQr(id) {
        var _a;
        const e = await this.findOne(id);
        const token = (_a = e.qrToken) !== null && _a !== void 0 ? _a : this.qrToken();
        if (!e.qrToken) {
            await this.prisma.equipment.update({
                where: { id },
                data: { qrToken: token },
            });
        }
        const baseUrl = process.env.PUBLIC_BASE_URL || 'https://app.vera.local';
        return {
            equipmentId: id,
            qrToken: token,
            content: JSON.stringify({ type: 'equipment', id, token }),
            url: `${baseUrl}/verify/equipment?id=${id}`,
        };
    }
    async linkToCompany(equipmentId, companyId) {
        const link = await this.equipmentLinks.linkEquipment(equipmentId, companyId);
        await this.compliance.recalculate(equipmentId, {
            trigger: 'MANUAL',
            notes: 'Linked to company',
        });
        return link;
    }
    async endCompanyAssignment(equipmentId, companyId) {
        return this.equipmentLinks.endAssignment(equipmentId, companyId);
    }
    async assignToProject(equipmentId, projectId, assignedBy) {
        return this.projects.assignEquipment(projectId, equipmentId, assignedBy);
    }
    async removeFromProject(equipmentId, projectId) {
        return this.projects.removeEquipment(projectId, equipmentId);
    }
    async assignWorker(equipmentId, workerId, companyId) {
        var _a, _b;
        const equipment = await this.findOne(equipmentId);
        const cid = (_b = companyId !== null && companyId !== void 0 ? companyId : (_a = equipment.activeCompanyLink) === null || _a === void 0 ? void 0 : _a.companyId) !== null && _b !== void 0 ? _b : equipment.companyId;
        if (!cid) {
            throw new common_1.BadRequestException('Equipment must be linked to a company');
        }
        const link = await this.prisma.equipmentLink.findFirst({
            where: { equipmentId, companyId: cid, active: true },
        });
        if (!link) {
            throw new common_1.NotFoundException('No active equipment link for company');
        }
        await this.competency.assertEligible(workerId, equipmentId);
        return this.equipmentLinks.assignWorkerToEquipmentLink(link.id, workerId);
    }
    async removeWorker(equipmentId, workerId, companyId) {
        var _a, _b;
        const equipment = await this.findOne(equipmentId);
        const cid = (_b = companyId !== null && companyId !== void 0 ? companyId : (_a = equipment.activeCompanyLink) === null || _a === void 0 ? void 0 : _a.companyId) !== null && _b !== void 0 ? _b : equipment.companyId;
        if (!cid)
            throw new common_1.BadRequestException('Company context required');
        const link = await this.prisma.equipmentLink.findFirst({
            where: { equipmentId, companyId: cid, active: true },
        });
        if (!link)
            throw new common_1.NotFoundException('Equipment link not found');
        await this.prisma.equipmentLinkWorker.deleteMany({
            where: { equipmentLinkId: link.id, workerId },
        });
        return { equipmentId, workerId, removed: true };
    }
    async lockout(equipmentId, dto, userId) {
        var _a, _b, _c, _d;
        const equipment = await this.findOne(equipmentId);
        const companyId = (_d = (_c = (_a = dto.companyId) !== null && _a !== void 0 ? _a : (_b = equipment.activeCompanyLink) === null || _b === void 0 ? void 0 : _b.companyId) !== null && _c !== void 0 ? _c : equipment.companyId) !== null && _d !== void 0 ? _d : undefined;
        await this.inactivation.lockoutEquipment(equipmentId, dto.reason);
        const lockout = await this.prisma.equipmentLockout.create({
            data: {
                equipmentId,
                companyId: companyId !== null && companyId !== void 0 ? companyId : null,
                reason: dto.reason,
                lockedByUserId: userId !== null && userId !== void 0 ? userId : null,
            },
        });
        if (companyId) {
            await this.compliance.recalculate(equipmentId, {
                trigger: 'LOCKOUT',
                assessedByUserId: userId,
                notes: dto.reason,
                forceStatus: client_1.LinkComplianceStatus.LOCKED_OUT,
            });
        }
        return lockout;
    }
    async unlock(equipmentId, userId, notes) {
        var _a, _b;
        const equipment = await this.findOne(equipmentId);
        await this.prisma.equipment.update({
            where: { id: equipmentId },
            data: {
                lockedOutAt: null,
                lockoutReason: null,
                safetyStatus: client_1.EquipmentSafetyStatus.OK,
            },
        });
        await this.prisma.equipmentLockout.updateMany({
            where: { equipmentId, unlockedAt: null },
            data: { unlockedAt: new Date(), unlockedByUserId: userId !== null && userId !== void 0 ? userId : null },
        });
        const companyId = (_b = (_a = equipment.activeCompanyLink) === null || _a === void 0 ? void 0 : _a.companyId) !== null && _b !== void 0 ? _b : equipment.companyId;
        if (companyId) {
            await this.compliance.recalculate(equipmentId, {
                trigger: 'UNLOCK',
                assessedByUserId: userId,
                notes: notes !== null && notes !== void 0 ? notes : 'Unlocked',
            });
        }
        return { equipmentId, unlocked: true };
    }
    async addMaintenance(equipmentId, dto) {
        await this.findOne(equipmentId);
        const record = await this.prisma.equipmentMaintenance.create({
            data: {
                equipmentId,
                type: dto.type,
                performedAt: dto.performedAt ? new Date(dto.performedAt) : undefined,
                performedBy: dto.performedBy,
                notes: dto.notes,
                nextDueAt: dto.nextDueAt ? new Date(dto.nextDueAt) : null,
                meterHours: dto.meterHours,
            },
        });
        await this.compliance.recalculate(equipmentId, {
            trigger: 'MAINTENANCE',
            assessedByUserId: dto.performedBy,
            notes: `Maintenance (${dto.type})`,
        });
        return record;
    }
    async addCalibration(equipmentId, dto) {
        var _a;
        await this.findOne(equipmentId);
        const record = await this.prisma.equipmentCalibration.create({
            data: {
                equipmentId,
                calibratedAt: dto.calibratedAt ? new Date(dto.calibratedAt) : undefined,
                calibratedBy: dto.calibratedBy,
                certificateNumber: dto.certificateNumber,
                expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
                passed: (_a = dto.passed) !== null && _a !== void 0 ? _a : true,
                notes: dto.notes,
            },
        });
        await this.compliance.recalculate(equipmentId, Object.assign({ trigger: 'CALIBRATION', assessedByUserId: dto.calibratedBy, notes: dto.passed === false ? 'Calibration failed' : 'Calibration recorded' }, (dto.passed === false
            ? { forceStatus: client_1.LinkComplianceStatus.NEEDS_ATTENTION }
            : {})));
        return record;
    }
    async addAttachment(equipmentId, dto) {
        await this.findOne(equipmentId);
        return this.prisma.equipmentAttachment.create({
            data: {
                equipmentId,
                type: dto.type,
                name: dto.name,
                url: dto.url,
                notes: dto.notes,
            },
        });
    }
    async getTimeline(equipmentId) {
        var _a, _b, _c, _d, _e, _f;
        const equipment = await this.findOne(equipmentId);
        const events = [];
        for (const link of equipment.equipmentLinks) {
            events.push({
                at: link.startDate,
                type: 'company_link',
                title: link.active ? 'Linked to company' : 'Company link ended',
                detail: (_a = link.company) === null || _a === void 0 ? void 0 : _a.name,
            });
            if (link.endDate) {
                events.push({
                    at: link.endDate,
                    type: 'company_unlink',
                    title: 'Left company',
                    detail: (_b = link.company) === null || _b === void 0 ? void 0 : _b.name,
                });
            }
        }
        for (const pa of equipment.projectAssignments) {
            events.push({
                at: pa.assignedAt,
                type: 'project',
                title: `Assigned to project`,
                detail: (_c = pa.project) === null || _c === void 0 ? void 0 : _c.name,
            });
        }
        for (const i of equipment.inspections) {
            events.push({
                at: i.createdAt,
                type: 'inspection',
                title: i.passed ? 'Inspection passed' : 'Inspection failed',
                detail: (_d = i.inspectionType) !== null && _d !== void 0 ? _d : i.kind,
            });
        }
        for (const m of equipment.maintenanceRecords) {
            events.push({
                at: m.performedAt,
                type: 'maintenance',
                title: `Maintenance (${m.type})`,
                detail: (_e = m.notes) !== null && _e !== void 0 ? _e : undefined,
            });
        }
        for (const c of equipment.calibrations) {
            events.push({
                at: c.calibratedAt,
                type: 'calibration',
                title: c.passed ? 'Calibration passed' : 'Calibration failed',
            });
        }
        for (const l of equipment.lockoutHistory) {
            events.push({
                at: l.lockedAt,
                type: 'lockout',
                title: 'Locked out',
                detail: l.reason,
            });
            if (l.unlockedAt) {
                events.push({
                    at: l.unlockedAt,
                    type: 'unlock',
                    title: 'Unlocked',
                });
            }
        }
        for (const cs of equipment.complianceHistory) {
            events.push({
                at: cs.assessedAt,
                type: 'compliance',
                title: `Compliance: ${cs.status}`,
                detail: (_f = cs.notes) !== null && _f !== void 0 ? _f : undefined,
            });
        }
        events.sort((a, b) => b.at.getTime() - a.at.getTime());
        return events.map((e) => (Object.assign(Object.assign({}, e), { at: e.at.toISOString() })));
    }
    async getWallet(equipmentId) {
        return this.wallets.getEquipmentWallet(equipmentId);
    }
    async listCategories() {
        return this.prisma.equipmentCategory.findMany({
            include: { types: { orderBy: { name: 'asc' } } },
            orderBy: { name: 'asc' },
        });
    }
};
exports.EquipmentCoreService = EquipmentCoreService;
exports.EquipmentCoreService = EquipmentCoreService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        equipment_links_service_1.EquipmentLinksService,
        projects_service_1.ProjectsService,
        inactivation_service_1.InactivationService,
        wallets_service_1.WalletsService,
        competency_service_1.CompetencyService,
        equipment_compliance_service_1.EquipmentComplianceService])
], EquipmentCoreService);
//# sourceMappingURL=equipment-core.service.js.map