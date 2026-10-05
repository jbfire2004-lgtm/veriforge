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
exports.VsiDashboardsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const cail_scope_service_1 = require("../cail/cail-scope.service");
const predictive_risk_service_1 = require("../predictive/predictive-risk.service");
const vsi_dashboard_revision_service_1 = require("../events/vsi-dashboard-revision.service");
let VsiDashboardsService = class VsiDashboardsService {
    constructor(prisma, scope, predictive, revisions) {
        this.prisma = prisma;
        this.scope = scope;
        this.predictive = predictive;
        this.revisions = revisions;
        this.cache = new Map();
    }
    getRevision(projectId) {
        return { projectId, revision: this.revisions.getRevision(projectId) };
    }
    async projectDashboard(projectId, actor) {
        const revision = this.revisions.getRevision(projectId);
        const cached = this.cache.get(projectId);
        if (cached && cached.revision === revision) {
            return Object.assign(Object.assign({}, cached.payload), { dashboardRevision: revision });
        }
        const payload = await this.computeProjectDashboard(projectId, actor);
        this.cache.set(projectId, { revision, payload });
        return Object.assign(Object.assign({}, payload), { dashboardRevision: revision });
    }
    async computeProjectDashboard(projectId, actor) {
        var _a, _b, _c, _d, _e, _f;
        const baseWhere = this.scope.buildListWhere(actor, { projectId });
        const where = Object.assign(Object.assign({}, baseWhere), { projectId });
        const [total, byStatus, bySeverity, bySource, overdue, recent, lessonsRecent, bboTotal, bboSafe, mttr,] = await Promise.all([
            this.prisma.cailEntry.count({ where }),
            this.prisma.cailEntry.groupBy({
                by: ['status'],
                where,
                _count: true,
            }),
            this.prisma.cailEntry.groupBy({
                by: ['severity'],
                where,
                _count: true,
            }),
            this.prisma.cailEntry.groupBy({
                by: ['sourceType'],
                where,
                _count: true,
            }),
            this.prisma.cailEntry.count({
                where: Object.assign(Object.assign({}, where), { status: {
                        in: [client_1.CailStatus.open, client_1.CailStatus.in_progress, client_1.CailStatus.overdue],
                    }, dueDate: { lt: new Date() } }),
            }),
            this.prisma.cailEntry.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                take: 10,
                select: {
                    id: true,
                    title: true,
                    status: true,
                    severity: true,
                    sourceType: true,
                    createdAt: true,
                    dueDate: true,
                },
            }),
            this.prisma.lessonsLearnedEntry.findMany({
                where: { projectId },
                orderBy: { publishedAt: 'desc' },
                take: 5,
                select: { id: true, title: true, sourceType: true, publishedAt: true },
            }),
            this.prisma.bboObservation.count({ where: { projectId } }),
            this.prisma.bboObservation.count({
                where: { projectId, polarity: 'safe' },
            }),
            this.prisma.cailEntry.aggregate({
                where: Object.assign(Object.assign({}, where), { timeToResolveHours: { not: null } }),
                _avg: { timeToResolveHours: true },
            }),
        ]);
        const statusMap = Object.fromEntries(byStatus.map((r) => [r.status, r._count]));
        const severityMap = Object.fromEntries(bySeverity.map((r) => [r.severity, r._count]));
        const sourceMix = Object.fromEntries(bySource.map((r) => [r.sourceType, r._count]));
        const resolved = (_a = statusMap[client_1.CailStatus.resolved]) !== null && _a !== void 0 ? _a : 0;
        const verified = (_b = statusMap[client_1.CailStatus.verified]) !== null && _b !== void 0 ? _b : 0;
        const open = ((_c = statusMap[client_1.CailStatus.open]) !== null && _c !== void 0 ? _c : 0) +
            ((_d = statusMap[client_1.CailStatus.in_progress]) !== null && _d !== void 0 ? _d : 0) +
            ((_e = statusMap[client_1.CailStatus.overdue]) !== null && _e !== void 0 ? _e : 0);
        const predictiveRisk = await this.predictive.latestSnapshot(projectId);
        return {
            projectId,
            total,
            open,
            resolved,
            verified,
            overdue,
            closureRate: total > 0 ? (resolved + verified) / total : 0,
            byStatus: statusMap,
            bySeverity: severityMap,
            bySource: sourceMix,
            recent,
            lessonsRecent,
            bbo: {
                total: bboTotal,
                safe: bboSafe,
                positiveRatio: bboTotal > 0 ? bboSafe / bboTotal : 0,
            },
            meanTimeToResolveHours: (_f = mttr._avg.timeToResolveHours) !== null && _f !== void 0 ? _f : null,
            predictiveRisk,
        };
    }
    async companyDashboard(ownerCompanyId, actor) {
        const where = this.scope.buildListWhere(actor, { ownerCompanyId });
        const [total, byProject, overdue] = await Promise.all([
            this.prisma.cailEntry.count({ where }),
            this.prisma.cailEntry.groupBy({
                by: ['projectId'],
                where,
                _count: true,
            }),
            this.prisma.cailEntry.count({
                where: Object.assign(Object.assign({}, where), { status: {
                        in: [client_1.CailStatus.open, client_1.CailStatus.in_progress, client_1.CailStatus.overdue],
                    }, dueDate: { lt: new Date() } }),
            }),
        ]);
        return {
            ownerCompanyId,
            total,
            overdue,
            byProject: byProject.map((r) => ({
                projectId: r.projectId,
                count: r._count,
            })),
        };
    }
};
exports.VsiDashboardsService = VsiDashboardsService;
exports.VsiDashboardsService = VsiDashboardsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        cail_scope_service_1.CailScopeService,
        predictive_risk_service_1.PredictiveRiskService,
        vsi_dashboard_revision_service_1.VsiDashboardRevisionService])
], VsiDashboardsService);
//# sourceMappingURL=dashboards.service.js.map