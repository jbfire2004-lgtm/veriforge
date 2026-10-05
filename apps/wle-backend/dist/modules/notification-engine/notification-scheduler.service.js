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
var NotificationSchedulerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationSchedulerService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const notifications_service_1 = require("../../notifications/notifications.service");
const notification_types_1 = require("../../notifications/notification-types");
const inspection_core_service_1 = require("../inspection-core/inspection-core.service");
const maintenance_calibration_core_service_1 = require("../maintenance-calibration-core/maintenance-calibration-core.service");
const tools_ppe_core_service_1 = require("../tools-ppe-core/tools-ppe-core.service");
const event_bus_service_1 = require("../api-platform/events/event-bus.service");
const domain_events_1 = require("../api-platform/events/domain-events");
const vera_event_publishers_1 = require("../vera-event-bus/publishers/vera-event-publishers");
const equipment_compliance_service_1 = require("../equipment-compliance/equipment-compliance.service");
let NotificationSchedulerService = NotificationSchedulerService_1 = class NotificationSchedulerService {
    constructor(prisma, notifications, inspections, maintenanceCalibration, toolsPpe, eventBus, equipmentCompliance) {
        this.prisma = prisma;
        this.notifications = notifications;
        this.inspections = inspections;
        this.maintenanceCalibration = maintenanceCalibration;
        this.toolsPpe = toolsPpe;
        this.eventBus = eventBus;
        this.equipmentCompliance = equipmentCompliance;
        this.logger = new common_1.Logger(NotificationSchedulerService_1.name);
    }
    async runAll(companyId) {
        const results = {
            inspections: await this.runInspections(companyId),
            training: await this.runTrainingExpiry(companyId),
            competency: await this.runCompetencyExpiry(companyId),
            equipmentCerts: await this.runEquipmentCertExpiry(companyId),
            fitTests: await this.runFitTestExpiry(companyId),
            ppe: await this.runPpeExpiry(companyId),
            maintenance: await this.runMaintenance(companyId),
            calibration: await this.runCalibration(companyId),
            workerAssignments: await this.runWorkerAssignments(companyId),
            equipmentAssignments: await this.runEquipmentAssignments(companyId),
        };
        this.logger.log(`Notification scheduler completed: ${JSON.stringify(results)}`);
        return results;
    }
    async runInspections(companyId) {
        return this.inspections.notifyDueInspections(companyId, 7);
    }
    async runMaintenance(companyId) {
        const res = await this.maintenanceCalibration.notifyDue(companyId, 14);
        return res;
    }
    async runCalibration(companyId) {
        return this.maintenanceCalibration.notifyDue(companyId, 14);
    }
    async runTrainingExpiry(companyId, withinDays = 30) {
        var _a, _b, _c, _d, _e, _f;
        const now = new Date();
        const until = new Date();
        until.setDate(until.getDate() + withinDays);
        const startOfDay = this.startOfDay();
        const records = await this.prisma.trainingRecord.findMany({
            where: Object.assign({ expiresAt: { not: null, lte: until } }, (companyId ? { companyId } : {})),
            include: {
                worker: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        companyId: true,
                    },
                },
                certification: { select: { name: true } },
            },
            take: 500,
        });
        const metrics = {
            scanned: records.length,
            processed: 0,
            notified: 0,
            skipped: 0,
            readinessRecalc: 0,
            errors: 0,
        };
        const seen = new Set();
        for (const rec of records) {
            const company = (_a = rec.companyId) !== null && _a !== void 0 ? _a : rec.worker.companyId;
            if (!company)
                continue;
            const expired = rec.expiresAt < now;
            const type = expired
                ? notification_types_1.NOTIFICATION_TYPES.TRAINING_EXPIRED
                : notification_types_1.NOTIFICATION_TYPES.TRAINING_EXPIRING;
            const key = `${type}:tr${rec.id}:${startOfDay
                .toISOString()
                .slice(0, 10)}`;
            if (seen.has(key))
                continue;
            seen.add(key);
            metrics.processed++;
            try {
                const courseName = (_c = (_b = rec.certification) === null || _b === void 0 ? void 0 : _b.name) !== null && _c !== void 0 ? _c : 'Training';
                const title = expired
                    ? `Training expired: ${courseName}`
                    : `Training expiring: ${courseName}`;
                const body = `${rec.worker.firstName} ${rec.worker.lastName}`;
                const res = await this.notifications.notifyCompanySupervisors(company, {
                    type,
                    title,
                    body,
                    dedupeKey: key,
                    payload: {
                        trainingRecordId: rec.id,
                        workerId: rec.worker.id,
                        expiresAt: (_d = rec.expiresAt) === null || _d === void 0 ? void 0 : _d.toISOString(),
                    },
                    companyId: company,
                });
                metrics.notified += res.created;
                metrics.skipped += res.skipped;
                const workerUser = await this.prisma.user.findFirst({
                    where: { worker: { id: rec.worker.id } },
                    select: { id: true },
                });
                if (workerUser) {
                    const workerRes = await this.notifications.notifyUsers({
                        userIds: [workerUser.id],
                        type,
                        title: expired
                            ? 'Your training has expired'
                            : 'Your training is expiring soon',
                        body: courseName,
                        dedupeKey: `${key}:w${rec.worker.id}`,
                        payload: { trainingRecordId: rec.id, workerId: rec.worker.id },
                    });
                    metrics.notified += workerRes.created;
                    metrics.skipped += workerRes.skipped;
                }
                if (this.emitTrainingReadinessRecalc(rec.id, company, rec.worker.id)) {
                    metrics.readinessRecalc++;
                }
                const expiryPayload = {
                    trainingRecordId: rec.id,
                    workerId: rec.worker.id,
                    companyId: company,
                    expiresAt: rec.expiresAt.toISOString(),
                    courseName,
                };
                if (expired) {
                    (_e = this.eventBus) === null || _e === void 0 ? void 0 : _e.emit((0, vera_event_publishers_1.expiryPassedEvent)(expiryPayload));
                }
                else {
                    (_f = this.eventBus) === null || _f === void 0 ? void 0 : _f.emit((0, vera_event_publishers_1.expiryApproachingEvent)(expiryPayload));
                }
            }
            catch (err) {
                metrics.errors++;
                this.logger.warn(`Training expiry notification failed for record ${rec.id}: ${err instanceof Error ? err.message : err}`);
            }
        }
        this.logger.log(`Training expiry scan: ${JSON.stringify(metrics)}`);
        return metrics;
    }
    async runEquipmentCertExpiry(companyId, withinDays = 30) {
        var _a, _b;
        const now = new Date();
        const until = new Date();
        until.setDate(until.getDate() + withinDays);
        const startOfDay = this.startOfDay();
        const certs = await this.prisma.pmEquipmentCertification.findMany({
            where: Object.assign(Object.assign({}, (companyId ? { companyId } : {})), { deletedAt: null, expiresAt: { not: null, lte: until }, status: 'approved' }),
            include: {
                equipment: { select: { id: true, name: true, companyId: true } },
            },
            take: 300,
        });
        const metrics = {
            scanned: certs.length,
            processed: 0,
            notified: 0,
            skipped: 0,
            readinessRecalc: 0,
            errors: 0,
        };
        const seen = new Set();
        const equipmentRecalc = new Set();
        for (const cert of certs) {
            if (!cert.equipment.companyId)
                continue;
            const expired = cert.expiresAt < now;
            const type = expired
                ? notification_types_1.NOTIFICATION_TYPES.EQUIPMENT_CERT_EXPIRED
                : notification_types_1.NOTIFICATION_TYPES.EQUIPMENT_CERT_EXPIRING;
            const key = `${type}:ec${cert.id}:${startOfDay
                .toISOString()
                .slice(0, 10)}`;
            if (seen.has(key))
                continue;
            seen.add(key);
            metrics.processed++;
            try {
                const res = await this.notifications.notifyCompanySupervisors(cert.equipment.companyId, {
                    type,
                    title: expired
                        ? `Equipment certification expired: ${cert.equipment.name}`
                        : `Equipment certification expiring: ${cert.equipment.name}`,
                    body: (_a = cert.certificationType) !== null && _a !== void 0 ? _a : 'Certification',
                    dedupeKey: key,
                    payload: {
                        certificationId: cert.id,
                        equipmentId: cert.equipment.id,
                        expiresAt: (_b = cert.expiresAt) === null || _b === void 0 ? void 0 : _b.toISOString(),
                    },
                    companyId: cert.equipment.companyId,
                });
                metrics.notified += res.created;
                metrics.skipped += res.skipped;
                if (!equipmentRecalc.has(cert.equipment.id)) {
                    if (await this.recalcEquipmentReadiness(cert.equipment.id, cert.equipment.companyId)) {
                        equipmentRecalc.add(cert.equipment.id);
                        metrics.readinessRecalc++;
                    }
                }
            }
            catch (err) {
                metrics.errors++;
                this.logger.warn(`Equipment cert expiry notification failed for cert ${cert.id}: ${err instanceof Error ? err.message : err}`);
            }
        }
        this.logger.log(`Equipment cert expiry scan: ${JSON.stringify(metrics)}`);
        return metrics;
    }
    async runFitTestExpiry(companyId, withinDays = 30) {
        var _a, _b, _c;
        const now = new Date();
        const until = new Date();
        until.setDate(until.getDate() + withinDays);
        const startOfDay = this.startOfDay();
        const tests = await this.prisma.fitTestRun.findMany({
            where: Object.assign({ result: 'PASS', expiresAt: { not: null, lte: until } }, (companyId ? { tenantId: companyId } : {})),
            include: {
                worker: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        companyId: true,
                    },
                },
            },
            take: 300,
        });
        let notified = 0;
        for (const test of tests) {
            const cid = (_a = test.tenantId) !== null && _a !== void 0 ? _a : test.worker.companyId;
            if (!cid)
                continue;
            const expired = test.expiresAt < now;
            const type = expired
                ? notification_types_1.NOTIFICATION_TYPES.FIT_TEST_EXPIRED
                : notification_types_1.NOTIFICATION_TYPES.FIT_TEST_EXPIRING;
            const key = `${type}:ft${test.id}:${startOfDay
                .toISOString()
                .slice(0, 10)}`;
            const res = await this.notifications.notifyCompanySupervisors(cid, {
                type,
                title: expired
                    ? `Fit test expired: ${test.worker.firstName} ${test.worker.lastName}`
                    : `Fit test due soon: ${test.worker.firstName} ${test.worker.lastName}`,
                body: (_b = test.testType) !== null && _b !== void 0 ? _b : 'Respirator fit test',
                dedupeKey: key,
                payload: {
                    fitTestId: test.id,
                    workerId: test.workerId,
                    expiresAt: (_c = test.expiresAt) === null || _c === void 0 ? void 0 : _c.toISOString(),
                },
                companyId: cid,
            });
            notified += res.created;
        }
        return { notified, tests: tests.length };
    }
    async runCompetencyExpiry(companyId, withinDays = 30) {
        var _a, _b;
        const now = new Date();
        const until = new Date();
        until.setDate(until.getDate() + withinDays);
        const startOfDay = this.startOfDay();
        const evaluations = await this.prisma.competencyEvaluation.findMany({
            where: Object.assign({ passed: true, expiresAt: { not: null, lte: until } }, (companyId
                ? {
                    equipment: {
                        OR: [
                            { companyId },
                            { equipmentLinks: { some: { companyId, active: true } } },
                        ],
                    },
                }
                : {})),
            include: {
                worker: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        companyId: true,
                    },
                },
                equipment: { select: { id: true, name: true, companyId: true } },
            },
            take: 500,
        });
        let notified = 0;
        const seen = new Set();
        for (const ev of evaluations) {
            const company = (_a = ev.equipment.companyId) !== null && _a !== void 0 ? _a : ev.worker.companyId;
            if (!company)
                continue;
            const expired = ev.expiresAt < now;
            const type = expired
                ? notification_types_1.NOTIFICATION_TYPES.COMPETENCY_EXPIRED
                : notification_types_1.NOTIFICATION_TYPES.COMPETENCY_EXPIRING;
            const key = `${type}:${ev.id}:${startOfDay.toISOString().slice(0, 10)}`;
            if (seen.has(key))
                continue;
            seen.add(key);
            const title = expired
                ? `Competency expired: ${ev.equipment.name}`
                : `Competency expiring: ${ev.equipment.name}`;
            const body = `${ev.worker.firstName} ${ev.worker.lastName} — ${ev.equipment.name}`;
            const res = await this.notifications.notifyCompanySupervisors(company, {
                type,
                title,
                body,
                dedupeKey: key,
                payload: {
                    evaluationId: ev.id,
                    workerId: ev.worker.id,
                    equipmentId: ev.equipment.id,
                    expiresAt: (_b = ev.expiresAt) === null || _b === void 0 ? void 0 : _b.toISOString(),
                },
                companyId: company,
            });
            notified += res.created;
        }
        return { notified, evaluations: evaluations.length };
    }
    async runPpeExpiry(companyId, withinDays = 14) {
        var _a, _b, _c;
        await this.toolsPpe.processPpeExpiry(companyId);
        const now = new Date();
        const until = new Date();
        until.setDate(until.getDate() + withinDays);
        const startOfDay = this.startOfDay();
        const ppeItems = await this.prisma.pPE.findMany({
            where: Object.assign(Object.assign({}, (companyId ? { companyId } : {})), { status: client_1.PpeStatus.ACTIVE, expiresAt: { not: null, lte: until } }),
            include: { company: { select: { id: true, name: true } } },
            take: 300,
        });
        let notified = 0;
        for (const ppe of ppeItems) {
            if (!ppe.companyId)
                continue;
            const expired = ppe.expiresAt < now;
            const type = expired
                ? notification_types_1.NOTIFICATION_TYPES.PPE_EXPIRED
                : notification_types_1.NOTIFICATION_TYPES.PPE_EXPIRING;
            const key = `${type}:ppe${ppe.id}:${startOfDay
                .toISOString()
                .slice(0, 10)}`;
            const res = await this.notifications.notifyCompanySupervisors(ppe.companyId, {
                type,
                title: expired
                    ? `PPE expired: ${ppe.name}`
                    : `PPE expiring: ${ppe.name}`,
                body: `${ppe.name} (${ppe.ppeType}) — ${(_b = (_a = ppe.company) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : 'Company'}`,
                dedupeKey: key,
                payload: {
                    ppeId: ppe.id,
                    expiresAt: (_c = ppe.expiresAt) === null || _c === void 0 ? void 0 : _c.toISOString(),
                },
                companyId: ppe.companyId,
            });
            notified += res.created;
            const assignments = await this.prisma.pPEAssignment.findMany({
                where: { ppeId: ppe.id, status: 'ACTIVE' },
                select: { workerId: true },
            });
            for (const a of assignments) {
                const workerUser = await this.prisma.user.findFirst({
                    where: { worker: { id: a.workerId } },
                    select: { id: true },
                });
                if (!workerUser)
                    continue;
                await this.notifications.notifyUsers({
                    userIds: [workerUser.id],
                    type,
                    title: expired ? `Your PPE has expired` : `Your PPE is expiring soon`,
                    body: ppe.name,
                    dedupeKey: `${key}:w${a.workerId}`,
                    payload: { ppeId: ppe.id },
                });
            }
        }
        return { notified, ppeCount: ppeItems.length };
    }
    async runWorkerAssignments(companyId) {
        var _a, _b;
        const now = new Date();
        const in1h = new Date(now.getTime() + 60 * 60 * 1000);
        const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        const since24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const dayKey = this.startOfDay().toISOString().slice(0, 10);
        let notified = 0;
        const starting = await this.prisma.workerAssignment.findMany({
            where: Object.assign({ startAt: { gte: now, lte: in1h }, autoStarted: false, endedAt: null }, (companyId ? { companyId } : {})),
            include: { worker: true },
        });
        for (const a of starting) {
            const user = await this.prisma.user.findFirst({
                where: { worker: { id: a.workerId } },
                select: { id: true },
            });
            if (!user)
                continue;
            const res = await this.notifications.notifyUsers({
                userIds: [user.id],
                type: notification_types_1.NOTIFICATION_TYPES.WORKER_ASSIGNMENT_STARTING,
                title: 'Assignment starting soon',
                body: `Scheduled assignment begins at ${a.startAt.toLocaleString()}`,
                dedupeKey: `assign-start:${a.id}:${dayKey}`,
                payload: { assignmentId: a.id, workerId: a.workerId },
            });
            notified += res.created;
        }
        const ending = await this.prisma.workerAssignment.findMany({
            where: Object.assign({ endAt: { gte: now, lte: in24h }, endedAt: null }, (companyId ? { companyId } : {})),
            include: { worker: true },
        });
        for (const a of ending) {
            const user = await this.prisma.user.findFirst({
                where: { worker: { id: a.workerId } },
                select: { id: true },
            });
            if (!user)
                continue;
            const res = await this.notifications.notifyUsers({
                userIds: [user.id],
                type: notification_types_1.NOTIFICATION_TYPES.WORKER_ASSIGNMENT_ENDING,
                title: 'Assignment ending soon',
                body: `Assignment ends at ${(_a = a.endAt) === null || _a === void 0 ? void 0 : _a.toLocaleString()}`,
                dedupeKey: `assign-end:${a.id}:${dayKey}`,
                payload: { assignmentId: a.id },
            });
            notified += res.created;
        }
        const newProjectWorkers = await this.prisma.projectAssignment.findMany({
            where: Object.assign({ status: client_1.AssignmentStatus.ACTIVE, assignedAt: { gte: since24h } }, (companyId ? { companyId } : {})),
            include: {
                worker: true,
                project: true,
            },
        });
        const byCompany = new Map();
        for (const row of newProjectWorkers) {
            const list = (_b = byCompany.get(row.companyId)) !== null && _b !== void 0 ? _b : [];
            list.push(row);
            byCompany.set(row.companyId, list);
        }
        for (const [cid, rows] of byCompany) {
            const res = await this.notifications.notifyCompanySupervisors(cid, {
                type: notification_types_1.NOTIFICATION_TYPES.PROJECT_WORKER_ASSIGNED,
                title: `${rows.length} new project assignment(s)`,
                body: rows
                    .map((r) => `${r.worker.firstName} ${r.worker.lastName} → ${r.project.name}`)
                    .join('; '),
                dedupeKey: `proj-assign:${cid}:${dayKey}`,
                payload: { count: rows.length },
                companyId: cid,
            });
            notified += res.created;
        }
        return { notified, starting: starting.length, ending: ending.length };
    }
    async runEquipmentAssignments(companyId) {
        var _a;
        const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const dayKey = this.startOfDay().toISOString().slice(0, 10);
        let notified = 0;
        const equipProjects = await this.prisma.equipmentProjectAssignment.findMany({
            where: Object.assign({ status: client_1.AssignmentStatus.ACTIVE, assignedAt: { gte: since24h } }, (companyId ? { companyId } : {})),
            include: { equipment: true, project: true },
        });
        const byCompany = new Map();
        for (const row of equipProjects) {
            const list = (_a = byCompany.get(row.companyId)) !== null && _a !== void 0 ? _a : [];
            list.push(row);
            byCompany.set(row.companyId, list);
        }
        for (const [cid, rows] of byCompany) {
            const res = await this.notifications.notifyCompanySupervisors(cid, {
                type: notification_types_1.NOTIFICATION_TYPES.EQUIPMENT_PROJECT_ASSIGNED,
                title: `${rows.length} equipment project assignment(s)`,
                body: rows
                    .map((r) => `${r.equipment.name} → ${r.project.name}`)
                    .slice(0, 5)
                    .join('; '),
                dedupeKey: `eq-proj:${cid}:${dayKey}`,
                payload: { count: rows.length },
                companyId: cid,
            });
            notified += res.created;
        }
        const operatorLinks = await this.prisma.equipmentLinkWorker.findMany({
            where: Object.assign({ assignedAt: { gte: since24h } }, (companyId ? { equipmentLink: { companyId, active: true } } : {})),
            include: {
                worker: true,
                equipmentLink: { include: { equipment: true, company: true } },
            },
        });
        for (const link of operatorLinks) {
            const cid = link.equipmentLink.companyId;
            const res = await this.notifications.notifyCompanySupervisors(cid, {
                type: notification_types_1.NOTIFICATION_TYPES.EQUIPMENT_OPERATOR_ASSIGNED,
                title: 'Equipment operator assigned',
                body: `${link.worker.firstName} ${link.worker.lastName} → ${link.equipmentLink.equipment.name}`,
                dedupeKey: `eq-op:${link.equipmentLinkId}:${link.workerId}:${dayKey}`,
                payload: {
                    equipmentId: link.equipmentLink.equipmentId,
                    workerId: link.workerId,
                },
                companyId: cid,
            });
            notified += res.created;
        }
        return {
            notified,
            equipmentProjects: equipProjects.length,
            operators: operatorLinks.length,
        };
    }
    startOfDay() {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
    }
    emitTrainingReadinessRecalc(trainingRecordId, companyId, workerId) {
        if (!this.eventBus)
            return false;
        this.eventBus.emit({
            name: domain_events_1.DomainEvent.COMPLIANCE_RECALC,
            occurredAt: new Date().toISOString(),
            companyId,
            entityType: 'training',
            entityId: trainingRecordId,
            data: { workerId, source: 'training_expiry_scan' },
        });
        return true;
    }
    async recalcEquipmentReadiness(equipmentId, companyId) {
        var _a;
        if (!this.equipmentCompliance)
            return false;
        await this.equipmentCompliance.recalculate(equipmentId, {
            trigger: 'SCHEDULED',
            notes: 'Daily equipment certification expiry scan',
        });
        (_a = this.eventBus) === null || _a === void 0 ? void 0 : _a.emit({
            name: domain_events_1.DomainEvent.COMPLIANCE_RECALC,
            occurredAt: new Date().toISOString(),
            companyId,
            entityType: 'equipment',
            entityId: equipmentId,
            data: { source: 'equipment_cert_expiry_scan' },
        });
        return true;
    }
};
exports.NotificationSchedulerService = NotificationSchedulerService;
exports.NotificationSchedulerService = NotificationSchedulerService = NotificationSchedulerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(5, (0, common_1.Optional)()),
    __param(6, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService,
        inspection_core_service_1.InspectionCoreService,
        maintenance_calibration_core_service_1.MaintenanceCalibrationCoreService,
        tools_ppe_core_service_1.ToolsPpeCoreService,
        event_bus_service_1.EventBusService,
        equipment_compliance_service_1.EquipmentComplianceService])
], NotificationSchedulerService);
//# sourceMappingURL=notification-scheduler.service.js.map