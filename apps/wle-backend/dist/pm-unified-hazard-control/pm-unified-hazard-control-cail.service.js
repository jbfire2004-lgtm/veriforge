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
exports.PmUnifiedHazardControlCailService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let PmUnifiedHazardControlCailService = class PmUnifiedHazardControlCailService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    companyHazardScore(metrics) {
        let score = 100;
        score -= metrics.unmappedHazards * 8;
        score -= metrics.sifCount * 5;
        score -= metrics.chronicCount * 10;
        return Math.max(0, Math.min(100, Math.round(score)));
    }
    async insights(filters) {
        const where = Object.assign({ companyId: filters.companyId, deletedAt: null }, (filters.projectId ? { projectId: filters.projectId } : {}));
        const [unmapped, sifHazards, weakLinks, chronic, openCapa] = await Promise.all([
            this.prisma.pmUnifiedHazard.count({
                where: Object.assign(Object.assign({}, where), { status: 'published', controlLinks: { none: {} } }),
            }),
            this.prisma.pmUnifiedHazard.count({
                where: Object.assign(Object.assign({}, where), { sifPotential: true, status: 'published' }),
            }),
            this.prisma.pmUnifiedHazardControlLink.count({
                where: {
                    hazard: Object.assign({}, where),
                    OR: [{ effectivenessScore: { lt: 2 } }, { verified: false }],
                },
            }),
            this.prisma.pmUnifiedHazard.count({
                where: Object.assign(Object.assign({}, where), { sourceType: 'incident', createdAt: { gte: new Date(Date.now() - 90 * 86400000) } }),
            }),
            this.prisma.pmCorrectiveAction.count({
                where: Object.assign(Object.assign({ companyId: filters.companyId }, (filters.projectId ? { projectId: filters.projectId } : {})), { status: { in: ['open', 'assigned', 'in_progress'] } }),
            }),
        ]);
        const insights = [];
        if (unmapped > 0) {
            insights.push({
                id: `hc-unmapped-${filters.companyId}`,
                category: 'control_mapping',
                severity: unmapped >= 5 ? 'high' : 'medium',
                title: 'Published hazards without mapped controls',
                explanation: `${unmapped} published hazard(s) have no linked controls — enforcement may block tasks and zone entry.`,
                inputs: {
                    unmapped,
                    companyId: filters.companyId,
                    projectId: filters.projectId,
                },
                recommendation: 'Run control suggestion engine and publish mapped controls.',
                correlatedModules: [
                    'unified-hazard-control',
                    'jha-flha',
                    'project-management',
                ],
            });
        }
        if (sifHazards > 0) {
            insights.push({
                id: `hc-sif-${filters.companyId}`,
                category: 'sif_heca',
                severity: 'critical',
                title: 'SIF-potential hazards active',
                explanation: `${sifHazards} hazard(s) flagged SIF-potential require supervisor review and strong controls.`,
                inputs: { sifHazards },
                recommendation: 'Complete SIF/HECA review and link engineering + administrative controls.',
                correlatedModules: ['sif-heca', 'jha-flha', 'corrective-actions'],
            });
        }
        if (weakLinks > 0) {
            insights.push({
                id: `hc-weak-${filters.companyId}`,
                category: 'control_effectiveness',
                severity: 'medium',
                title: 'Weak or unverified controls',
                explanation: `${weakLinks} hazard-control link(s) below effectiveness threshold or not verified.`,
                inputs: { weakLinks },
                recommendation: 'Verify controls in field and update effectiveness scores.',
                correlatedModules: ['inspections', 'corrective-actions'],
            });
        }
        if (chronic >= 3) {
            insights.push({
                id: `hc-chronic-${filters.companyId}`,
                category: 'chronic_hazard',
                severity: 'high',
                title: 'Chronic hazard pattern from incidents',
                explanation: `${chronic} incident-sourced hazards in 90 days indicate recurring exposure.`,
                inputs: { chronic },
                recommendation: 'Launch CAPA and update company hazard library with engineered controls.',
                correlatedModules: [
                    'incidents',
                    'corrective-actions',
                    'company-safety-context',
                ],
            });
        }
        if (openCapa > 0) {
            insights.push({
                id: `hc-capa-${filters.companyId}`,
                category: 'corrective_actions',
                severity: openCapa >= 5 ? 'high' : 'low',
                title: 'Open CAPA linked to hazard program',
                explanation: `${openCapa} open corrective action(s) may correlate with weak hazard controls.`,
                inputs: { openCapa },
                recommendation: 'Close high-severity CAPA before publishing new task-level hazards.',
                correlatedModules: ['corrective-actions', 'worker-safety-profile'],
            });
        }
        return insights;
    }
    async predictHazardDetection(filters) {
        const since = new Date(Date.now() - 90 * 86400000);
        const [defs, incidents, existing] = await Promise.all([
            this.prisma.pmInspectionDeficiency.findMany({
                where: {
                    inspection: Object.assign({ companyId: filters.companyId }, (filters.projectId ? { projectId: filters.projectId } : {})),
                    createdAt: { gte: since },
                },
                take: 10,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.pmSafetyEvent.findMany({
                where: Object.assign(Object.assign({ companyId: filters.companyId }, (filters.projectId ? { projectId: filters.projectId } : {})), { occurredAt: { gte: since } }),
                take: 8,
                orderBy: { occurredAt: 'desc' },
            }),
            this.prisma.pmUnifiedHazard.findMany({
                where: Object.assign({ companyId: filters.companyId, deletedAt: null }, (filters.projectId ? { projectId: filters.projectId } : {})),
                select: { title: true },
            }),
        ]);
        const seen = new Set(existing.map((h) => h.title.toLowerCase()));
        const out = [];
        for (const d of defs) {
            if (seen.has(d.title.toLowerCase()))
                continue;
            out.push({ title: d.title, source: 'inspection', confidence: 0.74 });
        }
        for (const e of incidents) {
            if (seen.has(e.title.toLowerCase()))
                continue;
            out.push({ title: e.title, source: 'incident', confidence: 0.7 });
        }
        return out.slice(0, 12);
    }
    async hazardIncidentCorrelation(filters) {
        const hazards = await this.prisma.pmUnifiedHazard.findMany({
            where: Object.assign({ companyId: filters.companyId, sourceType: 'incident', deletedAt: null }, (filters.projectId ? { projectId: filters.projectId } : {})),
            select: { id: true, title: true, sourceId: true },
            take: 50,
        });
        const correlations = [];
        for (const h of hazards) {
            const count = h.sourceId
                ? await this.prisma.pmSafetyEvent.count({
                    where: { id: h.sourceId },
                })
                : 0;
            correlations.push({
                hazardId: h.id,
                title: h.title,
                incidentCount: count || 1,
            });
        }
        return correlations.sort((a, b) => b.incidentCount - a.incidentCount);
    }
    async projectHazardScore(projectId) {
        const [published, unmapped, sif, weak] = await Promise.all([
            this.prisma.pmUnifiedHazard.count({
                where: { projectId, status: 'published', deletedAt: null },
            }),
            this.prisma.pmUnifiedHazard.count({
                where: {
                    projectId,
                    status: 'published',
                    deletedAt: null,
                    controlLinks: { none: {} },
                },
            }),
            this.prisma.pmUnifiedHazard.count({
                where: { projectId, sifPotential: true, deletedAt: null },
            }),
            this.prisma.pmUnifiedHazardControlLink.count({
                where: {
                    hazard: { projectId },
                    OR: [{ effectivenessScore: { lt: 2 } }, { verified: false }],
                },
            }),
        ]);
        return this.companyHazardScore({
            publishedHazards: published,
            unmappedHazards: unmapped,
            sifCount: sif,
            chronicCount: weak,
        });
    }
    async companyHazardScoreFromDb(companyId, projectId) {
        const where = Object.assign({ companyId, deletedAt: null, status: 'published' }, (projectId ? { projectId } : {}));
        const [published, unmapped, sif, chronic] = await Promise.all([
            this.prisma.pmUnifiedHazard.count({ where }),
            this.prisma.pmUnifiedHazard.count({
                where: Object.assign(Object.assign({}, where), { controlLinks: { none: {} } }),
            }),
            this.prisma.pmUnifiedHazard.count({
                where: Object.assign(Object.assign({}, where), { sifPotential: true }),
            }),
            this.prisma.pmUnifiedHazard.count({
                where: Object.assign({ companyId, sourceType: 'incident', createdAt: { gte: new Date(Date.now() - 90 * 86400000) } }, (projectId ? { projectId } : {})),
            }),
        ]);
        return this.companyHazardScore({
            publishedHazards: published,
            unmappedHazards: unmapped,
            sifCount: sif,
            chronicCount: chronic,
        });
    }
    async chronicHazardDetection(filters) {
        var _a;
        const since = new Date(Date.now() - 180 * 86400000);
        const hazards = await this.prisma.pmUnifiedHazard.findMany({
            where: Object.assign({ companyId: filters.companyId, deletedAt: null, createdAt: { gte: since } }, (filters.projectId ? { projectId: filters.projectId } : {})),
            select: { title: true },
        });
        const counts = new Map();
        for (const h of hazards) {
            const key = h.title.toLowerCase().trim();
            counts.set(key, ((_a = counts.get(key)) !== null && _a !== void 0 ? _a : 0) + 1);
        }
        return [...counts.entries()]
            .filter(([, n]) => n >= 2)
            .map(([title, repeatCount]) => ({ title, repeatCount }))
            .sort((a, b) => b.repeatCount - a.repeatCount)
            .slice(0, 10);
    }
};
exports.PmUnifiedHazardControlCailService = PmUnifiedHazardControlCailService;
exports.PmUnifiedHazardControlCailService = PmUnifiedHazardControlCailService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PmUnifiedHazardControlCailService);
//# sourceMappingURL=pm-unified-hazard-control-cail.service.js.map