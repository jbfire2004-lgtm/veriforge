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
exports.PmUnifiedCorrectiveActionCailService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let PmUnifiedCorrectiveActionCailService = class PmUnifiedCorrectiveActionCailService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    overdueRiskScore(input) {
        let risk = 10;
        risk += input.overdueCount * 15;
        risk += Math.max(0, input.openCount - input.overdueCount) * 3;
        risk += input.escalationLevelMax * 8;
        if (input.avgDaysToDue < 3)
            risk += 10;
        return Math.min(100, risk);
    }
    companyCapaScore(metrics) {
        let score = 100;
        score -= metrics.overdue * 6;
        score -= metrics.criticalOpen * 10;
        score -= Math.max(0, 50 - metrics.closureRate) * 0.4;
        return Math.max(0, Math.min(100, Math.round(score)));
    }
    async insights(filters) {
        const where = Object.assign({ companyId: filters.companyId, deletedAt: null }, (filters.projectId ? { projectId: filters.projectId } : {}));
        const now = new Date();
        const [overdue, critical, repeatInspection, chronicHazard] = await Promise.all([
            this.prisma.pmCorrectiveAction.count({
                where: Object.assign(Object.assign({}, where), { dueAt: { lt: now }, status: { notIn: ['verified', 'closed', 'cancelled'] } }),
            }),
            this.prisma.pmCorrectiveAction.count({
                where: Object.assign(Object.assign({}, where), { severityScore: { gte: 75 }, status: { notIn: ['verified', 'closed', 'cancelled'] } }),
            }),
            this.prisma.pmCorrectiveAction.groupBy({
                by: ['sourceId'],
                where: Object.assign(Object.assign({}, where), { sourceModule: 'inspection' }),
                _count: true,
                having: { sourceId: { _count: { gt: 2 } } },
            }),
            this.prisma.pmCorrectiveAction.count({
                where: Object.assign(Object.assign({}, where), { hazardId: { not: null }, createdAt: { gte: new Date(Date.now() - 60 * 86400000) } }),
            }),
        ]);
        const insights = [];
        if (overdue > 0) {
            insights.push({
                id: `capa-overdue-${filters.companyId}`,
                category: 'overdue',
                severity: overdue >= 5 ? 'critical' : 'high',
                title: 'Overdue corrective actions',
                explanation: `${overdue} action(s) past due — escalation and access blocks may apply.`,
                inputs: { overdue },
                recommendation: 'Run escalation sweep and reassign primary owners.',
                correlatedModules: [
                    'corrective-actions',
                    'worker-safety-profile',
                    'site-access-control',
                ],
            });
        }
        if (critical > 0) {
            insights.push({
                id: `capa-critical-${filters.companyId}`,
                category: 'severity',
                severity: 'critical',
                title: 'Critical open corrective actions',
                explanation: `${critical} critical-severity action(s) block permits, JHA approval, and PM scheduling.`,
                inputs: { critical },
                recommendation: 'Safety officer verification required before closure.',
                correlatedModules: [
                    'sif-heca',
                    'emergency-response',
                    'project-management',
                ],
            });
        }
        if (repeatInspection.length > 0) {
            insights.push({
                id: `capa-repeat-insp-${filters.companyId}`,
                category: 'repeat_deficiency',
                severity: 'medium',
                title: 'Repeat inspection deficiencies',
                explanation: `${repeatInspection.length} inspection source(s) generated multiple CAPA items.`,
                inputs: { repeatCount: repeatInspection.length },
                recommendation: 'Review weak controls in unified hazard & control engine.',
                correlatedModules: ['inspections', 'unified-hazard-control'],
            });
        }
        if (chronicHazard >= 3) {
            insights.push({
                id: `capa-chronic-hazard-${filters.companyId}`,
                category: 'chronic_hazard',
                severity: 'high',
                title: 'Hazard-linked corrective action cluster',
                explanation: `${chronicHazard} hazard-linked actions in 60 days suggest chronic exposure.`,
                inputs: { chronicHazard },
                recommendation: 'Publish permanent engineering controls and verify in field.',
                correlatedModules: ['unified-hazard-control', 'jha-flha'],
            });
        }
        return insights;
    }
    async predictCapaGeneration(filters) {
        const since = new Date(Date.now() - 90 * 86400000);
        const [defs, incidents, existing] = await Promise.all([
            this.prisma.pmInspectionDeficiency.findMany({
                where: {
                    inspection: Object.assign({ companyId: filters.companyId }, (filters.projectId ? { projectId: filters.projectId } : {})),
                    status: 'open',
                    createdAt: { gte: since },
                },
                take: 12,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.pmSafetyEvent.findMany({
                where: Object.assign(Object.assign({ companyId: filters.companyId }, (filters.projectId ? { projectId: filters.projectId } : {})), { occurredAt: { gte: since } }),
                take: 8,
                orderBy: { occurredAt: 'desc' },
            }),
            this.prisma.pmCorrectiveAction.findMany({
                where: Object.assign({ companyId: filters.companyId, deletedAt: null }, (filters.projectId ? { projectId: filters.projectId } : {})),
                select: { title: true },
            }),
        ]);
        const seen = new Set(existing.map((a) => a.title.toLowerCase()));
        const out = [];
        for (const d of defs) {
            if (seen.has(d.title.toLowerCase()))
                continue;
            out.push({ title: d.title, source: 'inspection', confidence: 0.78 });
        }
        for (const e of incidents) {
            if (seen.has(e.title.toLowerCase()))
                continue;
            out.push({ title: e.title, source: 'incident', confidence: 0.72 });
        }
        return out.slice(0, 15);
    }
    async workerRiskScoring(filters) {
        var _a;
        const now = new Date();
        const actions = await this.prisma.pmCorrectiveAction.findMany({
            where: Object.assign({ companyId: filters.companyId, deletedAt: null, workerId: { not: null }, status: { notIn: ['verified', 'closed', 'cancelled'] } }, (filters.projectId ? { projectId: filters.projectId } : {})),
            select: { workerId: true, dueAt: true, severityScore: true },
        });
        const byWorker = new Map();
        for (const a of actions) {
            if (!a.workerId)
                continue;
            const cur = (_a = byWorker.get(a.workerId)) !== null && _a !== void 0 ? _a : {
                open: 0,
                overdue: 0,
                critical: 0,
            };
            cur.open++;
            if (a.dueAt && a.dueAt < now)
                cur.overdue++;
            if (a.severityScore >= 75)
                cur.critical++;
            byWorker.set(a.workerId, cur);
        }
        return [...byWorker.entries()]
            .map(([workerId, m]) => ({
            workerId,
            openCount: m.open,
            overdueCount: m.overdue,
            riskScore: Math.min(100, m.open * 8 + m.overdue * 15 + m.critical * 12),
        }))
            .sort((a, b) => b.riskScore - a.riskScore)
            .slice(0, 20);
    }
    async equipmentRiskScoring(filters) {
        var _a;
        const actions = await this.prisma.pmCorrectiveAction.findMany({
            where: Object.assign({ companyId: filters.companyId, deletedAt: null, equipmentId: { not: null }, status: { notIn: ['verified', 'closed', 'cancelled'] } }, (filters.projectId ? { projectId: filters.projectId } : {})),
            select: { equipmentId: true, severityScore: true },
        });
        const byEquip = new Map();
        for (const a of actions) {
            if (!a.equipmentId)
                continue;
            const cur = (_a = byEquip.get(a.equipmentId)) !== null && _a !== void 0 ? _a : { open: 0, critical: 0 };
            cur.open++;
            if (a.severityScore >= 75)
                cur.critical++;
            byEquip.set(a.equipmentId, cur);
        }
        return [...byEquip.entries()]
            .map(([equipmentId, m]) => ({
            equipmentId,
            openCount: m.open,
            riskScore: Math.min(100, m.open * 10 + m.critical * 15),
        }))
            .sort((a, b) => b.riskScore - a.riskScore)
            .slice(0, 20);
    }
    async chronicDeficiencyDetection(filters) {
        const groups = await this.prisma.pmCorrectiveAction.groupBy({
            by: ['sourceModule', 'sourceId'],
            where: Object.assign(Object.assign({ companyId: filters.companyId, deletedAt: null }, (filters.projectId ? { projectId: filters.projectId } : {})), { createdAt: { gte: new Date(Date.now() - 180 * 86400000) } }),
            _count: true,
            having: { sourceId: { _count: { gt: 2 } } },
        });
        return groups.map((g) => ({
            sourceId: g.sourceId,
            sourceModule: g.sourceModule,
            repeatCount: g._count,
        }));
    }
    async weakControlDetection(filters) {
        const links = await this.prisma.pmUnifiedHazardControlLink.findMany({
            where: {
                hazard: Object.assign({ companyId: filters.companyId, deletedAt: null }, (filters.projectId ? { projectId: filters.projectId } : {})),
                OR: [{ effectivenessScore: { lt: 2 } }, { verified: false }],
            },
            select: { hazardId: true, controlId: true, effectivenessScore: true },
            take: 25,
        });
        return links;
    }
    async projectCapaScore(projectId) {
        const now = new Date();
        const [open, overdue, critical] = await Promise.all([
            this.prisma.pmCorrectiveAction.count({
                where: {
                    projectId,
                    deletedAt: null,
                    status: { notIn: ['verified', 'closed', 'cancelled'] },
                },
            }),
            this.prisma.pmCorrectiveAction.count({
                where: {
                    projectId,
                    deletedAt: null,
                    dueAt: { lt: now },
                    status: { notIn: ['verified', 'closed', 'cancelled'] },
                },
            }),
            this.prisma.pmCorrectiveAction.count({
                where: {
                    projectId,
                    deletedAt: null,
                    severityScore: { gte: 75 },
                    status: { notIn: ['verified', 'closed', 'cancelled'] },
                },
            }),
        ]);
        let score = 100;
        score -= overdue * 8;
        score -= critical * 12;
        score -= open * 2;
        return Math.max(0, Math.min(100, Math.round(score)));
    }
};
exports.PmUnifiedCorrectiveActionCailService = PmUnifiedCorrectiveActionCailService;
exports.PmUnifiedCorrectiveActionCailService = PmUnifiedCorrectiveActionCailService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PmUnifiedCorrectiveActionCailService);
//# sourceMappingURL=pm-unified-corrective-action-cail.service.js.map