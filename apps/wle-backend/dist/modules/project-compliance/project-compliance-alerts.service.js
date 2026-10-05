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
exports.ProjectComplianceAlertsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const project_compliance_service_1 = require("./project-compliance.service");
let ProjectComplianceAlertsService = class ProjectComplianceAlertsService {
    constructor(prisma, compliance) {
        this.prisma = prisma;
        this.compliance = compliance;
    }
    async listAlerts(projectId, options) {
        const rows = await this.prisma.projectComplianceAlert.findMany({
            where: Object.assign({ projectId }, ((options === null || options === void 0 ? void 0 : options.includeResolved) ? {} : { resolvedAt: null })),
            include: {
                worker: { select: { firstName: true, lastName: true } },
                rule: {
                    include: {
                        certification: { select: { name: true } },
                    },
                },
            },
            orderBy: [{ resolvedAt: 'asc' }, { createdAt: 'desc' }],
        });
        return rows.map((r) => {
            var _a, _b, _c, _d;
            return ({
                id: r.id,
                projectId: r.projectId,
                workerId: r.workerId,
                workerName: `${r.worker.firstName} ${r.worker.lastName}`.trim(),
                ruleId: r.ruleId,
                credentialId: r.credentialId,
                type: r.type,
                certificationName: (_b = (_a = r.rule) === null || _a === void 0 ? void 0 : _a.certification.name) !== null && _b !== void 0 ? _b : null,
                createdAt: r.createdAt.toISOString(),
                resolvedAt: (_d = (_c = r.resolvedAt) === null || _c === void 0 ? void 0 : _c.toISOString()) !== null && _d !== void 0 ? _d : null,
            });
        });
    }
    async resolveAlert(projectId, alertId) {
        const alert = await this.prisma.projectComplianceAlert.findFirst({
            where: { id: alertId, projectId },
        });
        if (!alert)
            throw new common_1.NotFoundException('Alert not found');
        if (alert.resolvedAt)
            return alert;
        return this.prisma.projectComplianceAlert.update({
            where: { id: alertId },
            data: { resolvedAt: new Date() },
        });
    }
    async onWorkerAssigned(projectId, workerId) {
        await this.syncAlertsForWorker(projectId, workerId);
    }
    async onWorkerCredentialChange(workerId) {
        const assignments = await this.prisma.projectAssignment.findMany({
            where: {
                workerId,
                status: 'ACTIVE',
                endedAt: null,
            },
            select: { projectId: true },
        });
        for (const a of assignments) {
            await this.syncAlertsForWorker(a.projectId, workerId);
        }
    }
    async syncAlertsForProject(projectId) {
        const report = await this.compliance.evaluateProject(projectId);
        const workerIds = [
            ...report.compliantWorkers.map((w) => w.workerId),
            ...report.nonCompliantWorkers.map((w) => w.workerId),
        ];
        for (const workerId of workerIds) {
            await this.syncAlertsForWorker(projectId, workerId, report);
        }
        await this.resolveStaleAlerts(projectId, report);
    }
    async syncAlertsForWorker(projectId, workerId, cachedReport) {
        var _a;
        const report = cachedReport !== null && cachedReport !== void 0 ? cachedReport : (await this.compliance.evaluateProject(projectId));
        const worker = (_a = report.nonCompliantWorkers.find((w) => w.workerId === workerId)) !== null && _a !== void 0 ? _a : report.compliantWorkers.find((w) => w.workerId === workerId);
        if (!worker)
            return;
        const openAlerts = await this.prisma.projectComplianceAlert.findMany({
            where: { projectId, workerId, resolvedAt: null },
        });
        const openKeys = new Set(openAlerts.map((a) => this.alertKey(a.ruleId, a.type, a.credentialId)));
        const desired = [];
        for (const gap of worker.gaps) {
            desired.push({
                ruleId: gap.ruleId,
                credentialId: gap.credentialId,
                type: this.gapToAlertType(gap.status),
            });
        }
        for (const gap of worker.expiringSoon) {
            desired.push({
                ruleId: gap.ruleId,
                credentialId: gap.credentialId,
                type: client_1.ProjectComplianceAlertType.EXPIRING_SOON,
            });
        }
        for (const item of desired) {
            const key = this.alertKey(item.ruleId, item.type, item.credentialId);
            if (openKeys.has(key))
                continue;
            await this.prisma.projectComplianceAlert.create({
                data: {
                    projectId,
                    workerId,
                    ruleId: item.ruleId,
                    credentialId: item.credentialId,
                    type: item.type,
                },
            });
            openKeys.add(key);
        }
    }
    async resolveStaleAlerts(projectId, report) {
        const activeKeys = new Set();
        for (const w of [
            ...report.compliantWorkers,
            ...report.nonCompliantWorkers,
        ]) {
            for (const gap of [...w.gaps, ...w.expiringSoon]) {
                activeKeys.add(this.alertKey(gap.ruleId, gap.status === 'expiring_soon'
                    ? client_1.ProjectComplianceAlertType.EXPIRING_SOON
                    : this.gapToAlertType(gap.status), gap.credentialId));
            }
        }
        const open = await this.prisma.projectComplianceAlert.findMany({
            where: { projectId, resolvedAt: null },
        });
        const toResolve = open.filter((a) => !activeKeys.has(this.alertKey(a.ruleId, a.type, a.credentialId)));
        if (!toResolve.length)
            return;
        await this.prisma.projectComplianceAlert.updateMany({
            where: { id: { in: toResolve.map((a) => a.id) } },
            data: { resolvedAt: new Date() },
        });
    }
    gapToAlertType(status) {
        if (status === 'expired')
            return client_1.ProjectComplianceAlertType.EXPIRED;
        if (status === 'expiring_soon')
            return client_1.ProjectComplianceAlertType.EXPIRING_SOON;
        return client_1.ProjectComplianceAlertType.MISSING;
    }
    alertKey(ruleId, type, credentialId) {
        return `${ruleId !== null && ruleId !== void 0 ? ruleId : 'none'}:${type}:${credentialId !== null && credentialId !== void 0 ? credentialId : 'none'}`;
    }
};
exports.ProjectComplianceAlertsService = ProjectComplianceAlertsService;
exports.ProjectComplianceAlertsService = ProjectComplianceAlertsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        project_compliance_service_1.ProjectComplianceService])
], ProjectComplianceAlertsService);
//# sourceMappingURL=project-compliance-alerts.service.js.map