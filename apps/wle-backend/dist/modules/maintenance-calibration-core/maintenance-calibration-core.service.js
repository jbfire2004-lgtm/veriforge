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
exports.MaintenanceCalibrationCoreService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const equipment_compliance_service_1 = require("../equipment-compliance/equipment-compliance.service");
const DEFAULT_MAINTENANCE_INTERVAL_DAYS = 90;
const DEFAULT_CALIBRATION_INTERVAL_DAYS = 365;
let MaintenanceCalibrationCoreService = class MaintenanceCalibrationCoreService {
    constructor(prisma, compliance) {
        this.prisma = prisma;
        this.compliance = compliance;
    }
    async dashboard(companyId) {
        const eqFilter = companyId ? { companyId } : {};
        const now = new Date();
        const warn = new Date();
        warn.setDate(warn.getDate() + 14);
        const equipmentIds = companyId
            ? (await this.prisma.equipment.findMany({
                where: eqFilter,
                select: { id: true },
            })).map((e) => e.id)
            : undefined;
        const eqIn = (equipmentIds === null || equipmentIds === void 0 ? void 0 : equipmentIds.length)
            ? { equipmentId: { in: equipmentIds } }
            : {};
        const [maintenanceRecordCount, calibrationRecordCount, maintenanceDue, calibrationDue, maintenanceOverdue, calibrationOverdue, recentMaintenance, recentCalibration,] = await Promise.all([
            this.prisma.equipmentMaintenance.count({ where: eqIn }),
            this.prisma.equipmentCalibration.count({ where: eqIn }),
            this.prisma.maintenanceSchedule.count({
                where: Object.assign(Object.assign({}, eqIn), { active: true, nextDueAt: { lte: warn, gte: now } }),
            }),
            this.prisma.calibrationSchedule.count({
                where: Object.assign(Object.assign({}, eqIn), { active: true, nextDueAt: { lte: warn, gte: now } }),
            }),
            this.prisma.maintenanceSchedule.count({
                where: Object.assign(Object.assign({}, eqIn), { active: true, nextDueAt: { lt: now } }),
            }),
            this.prisma.calibrationSchedule.count({
                where: Object.assign(Object.assign({}, eqIn), { active: true, nextDueAt: { lt: now } }),
            }),
            this.prisma.equipmentMaintenance.findMany({
                where: eqIn,
                orderBy: { performedAt: 'desc' },
                take: 10,
                include: {
                    equipment: { select: { id: true, name: true, companyId: true } },
                },
            }),
            this.prisma.equipmentCalibration.findMany({
                where: eqIn,
                orderBy: { calibratedAt: 'desc' },
                take: 10,
                include: {
                    equipment: { select: { id: true, name: true, companyId: true } },
                },
            }),
        ]);
        return {
            maintenanceRecordCount,
            calibrationRecordCount,
            maintenanceDueWithin14Days: maintenanceDue,
            calibrationDueWithin14Days: calibrationDue,
            maintenanceOverdue,
            calibrationOverdue,
            recentMaintenance,
            recentCalibration,
        };
    }
    async listMaintenanceRecords(equipmentId, companyId) {
        return this.prisma.equipmentMaintenance.findMany({
            where: Object.assign({ equipmentId }, (companyId ? { equipment: { companyId } } : {})),
            orderBy: { performedAt: 'desc' },
            take: 200,
            include: {
                equipment: { select: { id: true, name: true, companyId: true } },
            },
        });
    }
    async createMaintenanceRecord(dto, userId) {
        var _a, _b, _c;
        await this.assertEquipment(dto.equipmentId);
        const performedAt = dto.performedAt
            ? new Date(dto.performedAt)
            : new Date();
        const schedule = await this.ensureMaintenanceSchedule(dto.equipmentId, (_a = dto.type) !== null && _a !== void 0 ? _a : client_1.EquipmentMaintenanceType.PREVENTIVE);
        const nextDueAt = dto.nextDueAt != null
            ? new Date(dto.nextDueAt)
            : this.addDays(performedAt, schedule.intervalDays);
        const record = await this.prisma.equipmentMaintenance.create({
            data: {
                equipmentId: dto.equipmentId,
                type: (_b = dto.type) !== null && _b !== void 0 ? _b : schedule.type,
                performedAt,
                performedBy: (_c = dto.performedBy) !== null && _c !== void 0 ? _c : userId,
                notes: dto.notes,
                nextDueAt,
                meterHours: dto.meterHours,
            },
            include: { equipment: true },
        });
        await this.prisma.maintenanceSchedule.update({
            where: { id: schedule.id },
            data: {
                lastPerformedAt: performedAt,
                nextDueAt,
                updatedAt: new Date(),
            },
        });
        if (dto.meterHours != null) {
            await this.prisma.equipment.update({
                where: { id: dto.equipmentId },
                data: { meterHours: dto.meterHours },
            });
        }
        await this.compliance.recalculate(dto.equipmentId, {
            trigger: 'MAINTENANCE',
            assessedByUserId: userId !== null && userId !== void 0 ? userId : dto.performedBy,
            notes: `Maintenance (${record.type})`,
        });
        return record;
    }
    async listMaintenanceSchedules(equipmentId, companyId) {
        return this.prisma.maintenanceSchedule.findMany({
            where: Object.assign({ equipmentId, active: true }, (companyId ? { equipment: { companyId } } : {})),
            include: { equipment: { select: { id: true, name: true } } },
            orderBy: { nextDueAt: 'asc' },
        });
    }
    async createMaintenanceSchedule(dto) {
        var _a, _b, _c;
        await this.assertEquipment(dto.equipmentId);
        const nextDueAt = this.addDays(new Date(), (_a = dto.intervalDays) !== null && _a !== void 0 ? _a : DEFAULT_MAINTENANCE_INTERVAL_DAYS);
        return this.prisma.maintenanceSchedule.create({
            data: {
                equipmentId: dto.equipmentId,
                type: (_b = dto.type) !== null && _b !== void 0 ? _b : client_1.EquipmentMaintenanceType.PREVENTIVE,
                intervalDays: (_c = dto.intervalDays) !== null && _c !== void 0 ? _c : DEFAULT_MAINTENANCE_INTERVAL_DAYS,
                intervalHours: dto.intervalHours,
                nextDueAt,
                notes: dto.notes,
            },
        });
    }
    async listCalibrationRecords(equipmentId, companyId) {
        return this.prisma.equipmentCalibration.findMany({
            where: Object.assign({ equipmentId }, (companyId ? { equipment: { companyId } } : {})),
            orderBy: { calibratedAt: 'desc' },
            take: 200,
            include: {
                equipment: { select: { id: true, name: true, companyId: true } },
            },
        });
    }
    async createCalibrationRecord(dto, userId) {
        var _a, _b;
        await this.assertEquipment(dto.equipmentId);
        const calibratedAt = dto.calibratedAt
            ? new Date(dto.calibratedAt)
            : new Date();
        const passed = (_a = dto.passed) !== null && _a !== void 0 ? _a : true;
        const schedule = await this.ensureCalibrationSchedule(dto.equipmentId);
        const expiresAt = dto.expiresAt != null
            ? new Date(dto.expiresAt)
            : this.addDays(calibratedAt, schedule.intervalDays);
        const record = await this.prisma.equipmentCalibration.create({
            data: {
                equipmentId: dto.equipmentId,
                calibratedAt,
                calibratedBy: (_b = dto.calibratedBy) !== null && _b !== void 0 ? _b : userId,
                certificateNumber: dto.certificateNumber,
                expiresAt: passed ? expiresAt : null,
                passed,
                notes: dto.notes,
            },
            include: { equipment: true },
        });
        await this.prisma.calibrationSchedule.update({
            where: { id: schedule.id },
            data: {
                lastCalibratedAt: calibratedAt,
                nextDueAt: passed ? expiresAt : schedule.nextDueAt,
                updatedAt: new Date(),
            },
        });
        await this.compliance.recalculate(dto.equipmentId, Object.assign({ trigger: 'CALIBRATION', assessedByUserId: userId !== null && userId !== void 0 ? userId : dto.calibratedBy, notes: passed ? 'Calibration passed' : 'Calibration failed' }, (passed ? {} : { forceStatus: client_1.LinkComplianceStatus.NEEDS_ATTENTION })));
        return record;
    }
    async listCalibrationSchedules(equipmentId, companyId) {
        return this.prisma.calibrationSchedule.findMany({
            where: Object.assign({ equipmentId, active: true }, (companyId ? { equipment: { companyId } } : {})),
            include: { equipment: { select: { id: true, name: true } } },
            orderBy: { nextDueAt: 'asc' },
        });
    }
    async createCalibrationSchedule(dto) {
        var _a, _b;
        await this.assertEquipment(dto.equipmentId);
        const nextDueAt = this.addDays(new Date(), (_a = dto.intervalDays) !== null && _a !== void 0 ? _a : DEFAULT_CALIBRATION_INTERVAL_DAYS);
        return this.prisma.calibrationSchedule.create({
            data: {
                equipmentId: dto.equipmentId,
                intervalDays: (_b = dto.intervalDays) !== null && _b !== void 0 ? _b : DEFAULT_CALIBRATION_INTERVAL_DAYS,
                nextDueAt,
                notes: dto.notes,
            },
        });
    }
    async getEquipmentSummary(equipmentId) {
        var _a, _b;
        await this.assertEquipment(equipmentId);
        const [maintenanceSchedules, calibrationSchedules, maintenanceRecords, calibrationRecords,] = await Promise.all([
            this.prisma.maintenanceSchedule.findMany({
                where: { equipmentId, active: true },
            }),
            this.prisma.calibrationSchedule.findMany({
                where: { equipmentId, active: true },
            }),
            this.prisma.equipmentMaintenance.findMany({
                where: { equipmentId },
                orderBy: { performedAt: 'desc' },
                take: 15,
            }),
            this.prisma.equipmentCalibration.findMany({
                where: { equipmentId },
                orderBy: { calibratedAt: 'desc' },
                take: 15,
            }),
        ]);
        const now = new Date();
        return {
            equipmentId,
            maintenanceSchedules,
            calibrationSchedules,
            maintenanceRecords,
            calibrationRecords,
            nextMaintenanceDue: (_a = maintenanceSchedules
                .map((s) => s.nextDueAt)
                .filter((d) => d != null)
                .sort((a, b) => a.getTime() - b.getTime())[0]) !== null && _a !== void 0 ? _a : null,
            nextCalibrationDue: (_b = calibrationSchedules
                .map((s) => s.nextDueAt)
                .filter((d) => d != null)
                .sort((a, b) => a.getTime() - b.getTime())[0]) !== null && _b !== void 0 ? _b : null,
            maintenanceOverdue: maintenanceSchedules.some((s) => s.nextDueAt && s.nextDueAt < now),
            calibrationOverdue: calibrationSchedules.some((s) => s.nextDueAt && s.nextDueAt < now),
        };
    }
    async notifyDue(companyId, withinDays = 14) {
        var _a, _b;
        const until = this.addDays(new Date(), withinDays);
        const now = new Date();
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const maintDue = await this.prisma.maintenanceSchedule.findMany({
            where: Object.assign({ active: true, nextDueAt: { lte: until, gte: now } }, (companyId ? { equipment: { companyId } } : {})),
            include: {
                equipment: { select: { id: true, name: true, companyId: true } },
            },
        });
        const calDue = await this.prisma.calibrationSchedule.findMany({
            where: Object.assign({ active: true, nextDueAt: { lte: until, gte: now } }, (companyId ? { equipment: { companyId } } : {})),
            include: {
                equipment: { select: { id: true, name: true, companyId: true } },
            },
        });
        let notified = 0;
        const seen = new Set();
        for (const row of [...maintDue, ...calDue]) {
            const eqId = row.equipmentId;
            if (seen.has(eqId))
                continue;
            seen.add(eqId);
            const eqCompanyId = row.equipment.companyId;
            if (!eqCompanyId)
                continue;
            const type = maintDue.some((m) => m.equipmentId === eqId) &&
                calDue.some((c) => c.equipmentId === eqId)
                ? 'MAINTENANCE_AND_CALIBRATION_DUE'
                : maintDue.some((m) => m.equipmentId === eqId)
                    ? 'MAINTENANCE_DUE'
                    : 'CALIBRATION_DUE';
            const already = await this.prisma.notification.findFirst({
                where: {
                    type,
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
                equipmentName: row.equipment.name,
                nextMaintenanceDue: (_a = maintDue.find((m) => m.equipmentId === eqId)) === null || _a === void 0 ? void 0 : _a.nextDueAt,
                nextCalibrationDue: (_b = calDue.find((c) => c.equipmentId === eqId)) === null || _b === void 0 ? void 0 : _b.nextDueAt,
            };
            await this.prisma.notification.createMany({
                data: admins.map((u) => ({
                    userId: u.id,
                    channel: 'IN_APP',
                    type,
                    payload,
                    status: 'PENDING',
                })),
            });
            notified += admins.length;
        }
        return { notified, equipmentCount: seen.size };
    }
    async ensureMaintenanceSchedule(equipmentId, type) {
        const existing = await this.prisma.maintenanceSchedule.findFirst({
            where: { equipmentId, active: true, type },
        });
        if (existing)
            return existing;
        return this.prisma.maintenanceSchedule.create({
            data: {
                equipmentId,
                type,
                intervalDays: DEFAULT_MAINTENANCE_INTERVAL_DAYS,
                nextDueAt: this.addDays(new Date(), DEFAULT_MAINTENANCE_INTERVAL_DAYS),
            },
        });
    }
    async ensureCalibrationSchedule(equipmentId) {
        const existing = await this.prisma.calibrationSchedule.findFirst({
            where: { equipmentId, active: true },
        });
        if (existing)
            return existing;
        return this.prisma.calibrationSchedule.create({
            data: {
                equipmentId,
                intervalDays: DEFAULT_CALIBRATION_INTERVAL_DAYS,
                nextDueAt: this.addDays(new Date(), DEFAULT_CALIBRATION_INTERVAL_DAYS),
            },
        });
    }
    addDays(from, days) {
        const d = new Date(from);
        d.setDate(d.getDate() + days);
        return d;
    }
    async assertEquipment(equipmentId) {
        const e = await this.prisma.equipment.findUnique({
            where: { id: equipmentId },
        });
        if (!e)
            throw new common_1.NotFoundException('Equipment not found');
        return e;
    }
};
exports.MaintenanceCalibrationCoreService = MaintenanceCalibrationCoreService;
exports.MaintenanceCalibrationCoreService = MaintenanceCalibrationCoreService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        equipment_compliance_service_1.EquipmentComplianceService])
], MaintenanceCalibrationCoreService);
//# sourceMappingURL=maintenance-calibration-core.service.js.map