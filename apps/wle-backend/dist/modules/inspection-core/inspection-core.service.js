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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InspectionCoreService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const inactivation_service_1 = require("../vera-core/inactivation.service");
const equipment_compliance_service_1 = require("../equipment-compliance/equipment-compliance.service");
const equipment_bridge_service_1 = require("../../safety-intelligence/equipment-bridge/equipment-bridge.service");
const inspectionInclude = {
    equipment: {
        select: { id: true, name: true, companyId: true, catalogTypeKey: true },
    },
    worker: { select: { id: true, firstName: true, lastName: true } },
    supervisor: { select: { id: true, email: true, username: true } },
    checklistTemplate: true,
};
const DEFAULT_INTERVAL_DAYS = {
    PRE_USE: 1,
    SCHEDULED: 7,
    PME: 30,
    CRANE_LIFT: 30,
    LIFTING_GEAR: 90,
    VEHICLE: 1,
    TOOL: 90,
    HYDRAULIC_PNEUMATIC: 30,
};
function toInspectionResponse(row) {
    const { supervisor, supervisorId } = row, rest = __rest(row, ["supervisor", "supervisorId"]);
    return Object.assign(Object.assign({}, rest), { inspectorId: supervisorId, inspector: supervisor, supervisorId,
        supervisor });
}
let InspectionCoreService = class InspectionCoreService {
    constructor(prisma, inactivation, compliance, equipmentCailBridge) {
        this.prisma = prisma;
        this.inactivation = inactivation;
        this.compliance = compliance;
        this.equipmentCailBridge = equipmentCailBridge;
    }
    async dashboard(companyId) {
        const equipmentWhere = companyId
            ? { companyId }
            : {};
        const [total, passed, failed, lockedOut, dueSoon, recent] = await Promise.all([
            this.prisma.inspection.count({
                where: companyId ? { equipment: { companyId } } : undefined,
            }),
            this.prisma.inspection.count({
                where: Object.assign({ passed: true }, (companyId ? { equipment: { companyId } } : {})),
            }),
            this.prisma.inspection.count({
                where: Object.assign({ passed: false }, (companyId ? { equipment: { companyId } } : {})),
            }),
            this.prisma.equipment.count({
                where: Object.assign(Object.assign({}, equipmentWhere), { lockedOutAt: { not: null } }),
            }),
            this.prisma.inspection.count({
                where: Object.assign({ passed: true, nextInspectionDate: {
                        lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                        gte: new Date(),
                    } }, (companyId ? { equipment: { companyId } } : {})),
            }),
            this.prisma.inspection.findMany({
                where: companyId ? { equipment: { companyId } } : undefined,
                orderBy: { createdAt: 'desc' },
                take: 25,
                include: inspectionInclude,
            }),
        ]);
        return {
            totalInspections: total,
            passed,
            failed,
            lockedOutEquipment: lockedOut,
            dueWithin7Days: dueSoon,
            recent: recent.map(toInspectionResponse),
        };
    }
    async listChecklists(filters) {
        return this.prisma.inspectionChecklist.findMany({
            where: {
                inspectionType: filters === null || filters === void 0 ? void 0 : filters.inspectionType,
                category: filters === null || filters === void 0 ? void 0 : filters.category,
                active: (filters === null || filters === void 0 ? void 0 : filters.activeOnly) === false ? undefined : true,
            },
            orderBy: [{ inspectionType: 'asc' }, { name: 'asc' }],
        });
    }
    async getChecklist(id) {
        const row = await this.prisma.inspectionChecklist.findUnique({
            where: { id },
        });
        if (!row)
            throw new common_1.NotFoundException('Checklist not found');
        return row;
    }
    async createChecklist(dto) {
        var _a;
        return this.prisma.inspectionChecklist.create({
            data: {
                name: dto.name,
                category: dto.category,
                inspectionType: dto.inspectionType,
                items: dto.items,
                intervalDays: dto.intervalDays,
                intervalHours: dto.intervalHours,
                active: (_a = dto.active) !== null && _a !== void 0 ? _a : true,
            },
        });
    }
    async updateChecklist(id, dto) {
        await this.getChecklist(id);
        return this.prisma.inspectionChecklist.update({
            where: { id },
            data: {
                name: dto.name,
                category: dto.category,
                inspectionType: dto.inspectionType,
                items: dto.items,
                intervalDays: dto.intervalDays,
                intervalHours: dto.intervalHours,
                active: dto.active,
            },
        });
    }
    async submitInspection(dto, inspectorUserId) {
        var _a, _b, _c, _d, _e;
        const equipment = await this.prisma.equipment.findUnique({
            where: { id: dto.equipmentId },
        });
        if (!equipment)
            throw new common_1.NotFoundException('Equipment not found');
        const checklistTemplate = dto.checklistId
            ? await this.getChecklist(dto.checklistId)
            : null;
        const inspectionType = (_b = (_a = dto.inspectionType) !== null && _a !== void 0 ? _a : checklistTemplate === null || checklistTemplate === void 0 ? void 0 : checklistTemplate.inspectionType) !== null && _b !== void 0 ? _b : client_1.InspectionType.PRE_USE;
        const kind = (_c = dto.kind) !== null && _c !== void 0 ? _c : (inspectionType === client_1.InspectionType.PRE_USE
            ? client_1.InspectionKind.PRE_USE
            : client_1.InspectionKind.FORMAL);
        const nextInspectionDate = dto.passed
            ? this.computeNextInspectionDate(equipment.meterHours, dto.meterReading, inspectionType, checklistTemplate)
            : null;
        const inspection = await this.prisma.inspection.create({
            data: {
                equipmentId: dto.equipmentId,
                workerId: dto.workerId,
                siteId: dto.siteId,
                supervisorId: inspectorUserId,
                checklistId: dto.checklistId,
                kind,
                inspectionType,
                checklist: dto.checklist,
                passed: dto.passed,
                status: dto.passed ? 'PASSED' : 'FAILED',
                notes: dto.notes,
                correctiveActions: dto.correctiveActions,
                photos: dto.photos,
                completedAt: new Date(),
                signature: dto.signature,
                meterReading: dto.meterReading,
                nextInspectionDate,
                lockoutTriggered: false,
            },
            include: inspectionInclude,
        });
        let lockoutTriggered = false;
        if (!dto.passed) {
            lockoutTriggered = true;
            const lockReason = (_d = dto.correctiveActions) !== null && _d !== void 0 ? _d : 'Failed inspection';
            await this.inactivation.lockoutEquipment(dto.equipmentId, lockReason);
            await this.prisma.equipmentLockout.create({
                data: {
                    equipmentId: dto.equipmentId,
                    companyId: equipment.companyId,
                    reason: lockReason,
                    lockedByUserId: inspectorUserId,
                },
            });
            if (equipment.companyId) {
                await this.inactivation.deactivateEquipmentAtCompany(dto.equipmentId, equipment.companyId, 'INSPECTION_FAILED');
                await this.compliance.recalculate(dto.equipmentId, {
                    trigger: 'INSPECTION',
                    assessedByUserId: inspectorUserId,
                    notes: (_e = dto.correctiveActions) !== null && _e !== void 0 ? _e : 'Inspection failed',
                    inspectionId: inspection.id,
                    forceStatus: client_1.LinkComplianceStatus.LOCKED_OUT,
                });
            }
            await this.prisma.inspection.update({
                where: { id: inspection.id },
                data: { lockoutTriggered: true },
            });
            try {
                await this.equipmentCailBridge.emitFromInspection(inspection.id, inspectorUserId);
            }
            catch (_f) {
            }
            await this.notifyInspectionFailed(equipment.companyId, inspection, dto.correctiveActions);
        }
        else {
            if (equipment.safetyStatus === client_1.EquipmentSafetyStatus.UNSAFE) {
                await this.prisma.equipment.update({
                    where: { id: dto.equipmentId },
                    data: {
                        safetyStatus: client_1.EquipmentSafetyStatus.OK,
                        lockedOutAt: null,
                        lockoutReason: null,
                    },
                });
            }
            if (equipment.companyId) {
                await this.compliance.recalculate(dto.equipmentId, {
                    trigger: 'INSPECTION',
                    assessedByUserId: inspectorUserId,
                    notes: `Inspection passed (${inspectionType})`,
                    inspectionId: inspection.id,
                });
            }
            await this.prisma.equipment.update({
                where: { id: dto.equipmentId },
                data: { safetyStatus: client_1.EquipmentSafetyStatus.OK },
            });
        }
        if (dto.meterReading != null) {
            await this.prisma.equipment.update({
                where: { id: dto.equipmentId },
                data: { meterHours: dto.meterReading },
            });
        }
        if (dto.workerId) {
            await this.syncWorkerWallet(dto.workerId, dto.equipmentId, dto.passed, inspectionType);
        }
        return Object.assign(Object.assign({}, toInspectionResponse(inspection)), { lockoutTriggered });
    }
    async unlockEquipment(equipmentId, userId, notes) {
        const equipment = await this.prisma.equipment.findUnique({
            where: { id: equipmentId },
        });
        if (!equipment)
            throw new common_1.NotFoundException('Equipment not found');
        if (!equipment.lockedOutAt) {
            throw new common_1.BadRequestException('Equipment is not locked out');
        }
        await this.prisma.equipment.update({
            where: { id: equipmentId },
            data: {
                safetyStatus: client_1.EquipmentSafetyStatus.OK,
                lockedOutAt: null,
                lockoutReason: null,
            },
        });
        await this.prisma.equipmentLockout.updateMany({
            where: { equipmentId, unlockedAt: null },
            data: { unlockedAt: new Date(), unlockedByUserId: userId },
        });
        if (equipment.companyId) {
            await this.compliance.recalculate(equipmentId, {
                trigger: 'UNLOCK',
                assessedByUserId: userId,
                notes: notes !== null && notes !== void 0 ? notes : 'Manual unlock after corrective action',
            });
        }
        return { equipmentId, unlocked: true };
    }
    async listForEquipment(equipmentId) {
        const rows = await this.prisma.inspection.findMany({
            where: { equipmentId },
            orderBy: { createdAt: 'desc' },
            include: inspectionInclude,
        });
        return rows.map(toInspectionResponse);
    }
    async getInspection(id) {
        const row = await this.prisma.inspection.findUnique({
            where: { id },
            include: inspectionInclude,
        });
        if (!row)
            throw new common_1.NotFoundException('Inspection not found');
        return toInspectionResponse(row);
    }
    async listDue(companyId, withinDays = 7) {
        const until = new Date();
        until.setDate(until.getDate() + withinDays);
        const rows = await this.prisma.inspection.findMany({
            where: Object.assign({ passed: true, nextInspectionDate: { lte: until, gte: new Date() } }, (companyId ? { equipment: { companyId } } : {})),
            orderBy: { nextInspectionDate: 'asc' },
            include: inspectionInclude,
        });
        return rows.map(toInspectionResponse);
    }
    async notifyDueInspections(companyId, withinDays = 7) {
        var _a, _b, _c;
        const due = await this.listDue(companyId, withinDays);
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        let created = 0;
        const seenEquipment = new Set();
        for (const row of due) {
            const eqId = row.equipmentId;
            if (eqId == null || seenEquipment.has(eqId))
                continue;
            seenEquipment.add(eqId);
            const eqCompanyId = (_a = row.equipment) === null || _a === void 0 ? void 0 : _a.companyId;
            if (!eqCompanyId)
                continue;
            const already = await this.prisma.notification.findFirst({
                where: {
                    type: 'INSPECTION_DUE',
                    createdAt: { gte: startOfDay },
                    payload: { path: ['equipmentId'], equals: eqId },
                },
            });
            if (already)
                continue;
            const admins = await this.prisma.user.findMany({
                where: {
                    companyId: eqCompanyId,
                    role: { in: ['COMPANY_ADMIN', 'SUPERVISOR', 'ADMIN', 'SUPER_ADMIN'] },
                },
                select: { id: true },
                take: 20,
            });
            const payload = {
                equipmentId: eqId,
                equipmentName: (_b = row.equipment) === null || _b === void 0 ? void 0 : _b.name,
                inspectionType: row.inspectionType,
                nextInspectionDate: (_c = row.nextInspectionDate) === null || _c === void 0 ? void 0 : _c.toISOString(),
            };
            const dedupeKey = `INSPECTION_DUE:${eqId}:${startOfDay
                .toISOString()
                .slice(0, 10)}`;
            await this.prisma.notification.createMany({
                data: admins.map((u) => {
                    var _a, _b;
                    return ({
                        userId: u.id,
                        channel: client_1.NotificationChannel.IN_APP,
                        type: 'INSPECTION_DUE',
                        title: `Inspection due: ${(_b = (_a = row.equipment) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : 'Equipment'}`,
                        body: `${row.inspectionType} inspection due ${row.nextInspectionDate
                            ? new Date(row.nextInspectionDate).toLocaleDateString()
                            : 'soon'}`,
                        payload,
                        status: client_1.NotificationStatus.PENDING,
                        dedupeKey: `${dedupeKey}:u${u.id}`,
                    });
                }),
            });
            created += admins.length;
        }
        return { notified: created, equipmentCount: seenEquipment.size };
    }
    computeNextInspectionDate(currentMeterHours, meterReading, inspectionType, checklist) {
        var _a, _b;
        const hoursInterval = checklist === null || checklist === void 0 ? void 0 : checklist.intervalHours;
        if (hoursInterval && meterReading != null) {
            const hoursUntilNext = hoursInterval;
            const hoursPerDay = 8;
            const daysEstimate = Math.ceil(hoursUntilNext / hoursPerDay);
            const d = new Date();
            d.setDate(d.getDate() + daysEstimate);
            return d;
        }
        const days = (_b = (_a = checklist === null || checklist === void 0 ? void 0 : checklist.intervalDays) !== null && _a !== void 0 ? _a : DEFAULT_INTERVAL_DAYS[inspectionType]) !== null && _b !== void 0 ? _b : 7;
        const d = new Date();
        d.setDate(d.getDate() + days);
        return d;
    }
    async syncWorkerWallet(workerId, equipmentId, passed, inspectionType) {
        var _a;
        const equipment = await this.prisma.equipment.findUnique({
            where: { id: equipmentId },
        });
        if (!equipment)
            return;
        const companyLink = await this.prisma.companyLink.findFirst({
            where: { workerId, active: true },
        });
        const catalogKey = (_a = equipment.catalogTypeKey) !== null && _a !== void 0 ? _a : equipment.name;
        const note = passed
            ? `${inspectionType} inspection passed`
            : `${inspectionType} inspection failed`;
        const existing = await this.prisma.workerWalletItem.findFirst({
            where: { workerId, equipmentId },
        });
        if (existing) {
            await this.prisma.workerWalletItem.update({
                where: { id: existing.id },
                data: {
                    status: passed ? 'ACTIVE' : 'FAILED',
                    notes: note,
                    updatedAt: new Date(),
                },
            });
        }
        else if (passed) {
            await this.prisma.workerWalletItem.create({
                data: {
                    workerId,
                    catalogTypeKey: catalogKey,
                    equipmentId,
                    companyId: companyLink === null || companyLink === void 0 ? void 0 : companyLink.companyId,
                    status: 'ACTIVE',
                    notes: note,
                },
            });
        }
    }
    async notifyInspectionFailed(companyId, inspection, reason) {
        if (!companyId)
            return;
        const admins = await this.prisma.user.findMany({
            where: {
                companyId,
                role: { in: ['COMPANY_ADMIN', 'SUPERVISOR', 'ADMIN', 'SUPER_ADMIN'] },
            },
            select: { id: true },
            take: 20,
        });
        const payload = {
            inspectionId: inspection.id,
            equipmentId: inspection.equipmentId,
            reason: reason !== null && reason !== void 0 ? reason : 'Inspection failed',
        };
        await this.prisma.notification.createMany({
            data: admins.map((u) => ({
                userId: u.id,
                channel: 'IN_APP',
                type: 'INSPECTION_FAILED',
                payload,
                status: 'PENDING',
            })),
        });
    }
};
exports.InspectionCoreService = InspectionCoreService;
exports.InspectionCoreService = InspectionCoreService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        inactivation_service_1.InactivationService,
        equipment_compliance_service_1.EquipmentComplianceService,
        equipment_bridge_service_1.EquipmentBridgeService])
], InspectionCoreService);
//# sourceMappingURL=inspection-core.service.js.map