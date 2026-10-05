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
exports.PmInspectionDashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let PmInspectionDashboardService = class PmInspectionDashboardService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async correctiveActionBoard(projectId) {
        const now = new Date();
        const actions = await this.prisma.pmCorrectiveAction.findMany({
            where: {
                projectId,
                deletedAt: null,
                sourceModule: 'inspection',
                status: { notIn: ['closed', 'cancelled'] },
            },
            include: {
                assignees: {
                    include: { user: { select: { id: true, username: true } } },
                },
                contractorDispatches: { orderBy: { createdAt: 'desc' }, take: 1 },
            },
            orderBy: [{ dueAt: 'asc' }, { priorityScore: 'desc' }],
            take: 100,
        });
        const columns = {
            open: [],
            in_progress: [],
            verification_pending: [],
            overdue: [],
        };
        for (const a of actions) {
            const isOverdue = a.dueAt && a.dueAt < now && !['verified', 'closed'].includes(a.status);
            if (isOverdue)
                columns.overdue.push(a);
            else if (a.status === 'verification_pending')
                columns.verification_pending.push(a);
            else if (['assigned', 'in_progress'].includes(a.status))
                columns.in_progress.push(a);
            else
                columns.open.push(a);
        }
        return {
            projectId,
            generatedAt: now.toISOString(),
            totals: {
                open: columns.open.length,
                inProgress: columns.in_progress.length,
                verification: columns.verification_pending.length,
                overdue: columns.overdue.length,
            },
            columns,
        };
    }
    async overdueAlerts(projectId) {
        const now = new Date();
        const [capa, dispatches] = await Promise.all([
            this.prisma.pmCorrectiveAction.findMany({
                where: {
                    projectId,
                    deletedAt: null,
                    dueAt: { lt: now },
                    status: { notIn: ['closed', 'verified', 'cancelled'] },
                },
                select: {
                    id: true,
                    title: true,
                    severityLevel: true,
                    dueAt: true,
                    subcontractorCompanyId: true,
                },
                take: 50,
            }),
            this.prisma.pmInspectionContractorDispatch.findMany({
                where: {
                    status: 'overdue',
                    correctiveAction: { projectId },
                },
                include: {
                    subcontractorCompany: { select: { name: true } },
                    correctiveAction: { select: { title: true, dueAt: true } },
                },
                take: 50,
            }),
        ]);
        return {
            correctiveActions: capa,
            contractorDispatches: dispatches,
            alertCount: capa.length + dispatches.length,
        };
    }
    async contractorPerformance(projectId) {
        var _a;
        const dispatches = await this.prisma.pmInspectionContractorDispatch.findMany({
            where: { correctiveAction: { projectId } },
            include: {
                subcontractorCompany: { select: { id: true, name: true } },
                correctiveAction: { select: { dueAt: true, severityLevel: true } },
            },
            orderBy: { createdAt: 'desc' },
            take: 500,
        });
        const byContractor = new Map();
        for (const d of dispatches) {
            const cid = d.subcontractorCompanyId;
            const entry = (_a = byContractor.get(cid)) !== null && _a !== void 0 ? _a : {
                companyId: cid,
                name: d.subcontractorCompany.name,
                total: 0,
                completed: 0,
                overdue: 0,
                onTime: 0,
                avgAckHours: null,
            };
            entry.total += 1;
            if (d.status === 'completed') {
                entry.completed += 1;
                if (d.completedAt &&
                    d.correctiveAction.dueAt &&
                    d.completedAt <= d.correctiveAction.dueAt) {
                    entry.onTime += 1;
                }
            }
            if (d.status === 'overdue')
                entry.overdue += 1;
            byContractor.set(cid, entry);
        }
        const scores = [...byContractor.values()].map((c) => (Object.assign(Object.assign({}, c), { score: c.total
                ? Math.round(((c.onTime + c.completed * 0.5) / c.total) * 100)
                : 100, completionRate: c.total ? Math.round((c.completed / c.total) * 100) : 0 })));
        return { projectId, contractors: scores.sort((a, b) => b.score - a.score) };
    }
    async photoFindingsSummary(inspectionId) {
        const rows = await this.prisma.pmInspectionPhotoFinding.findMany({
            where: { inspectionId },
            include: {
                attachment: {
                    select: {
                        id: true,
                        fileName: true,
                        mimeType: true,
                        analysisStatus: true,
                        coreFileId: true,
                        annotationJson: true,
                    },
                },
                correctiveAction: {
                    select: { id: true, title: true, status: true, dueAt: true },
                },
            },
            orderBy: { createdAt: 'desc' },
            take: 200,
        });
        return rows.map((row) => {
            var _a, _b;
            const annotation = (_a = row.attachment) === null || _a === void 0 ? void 0 : _a.annotationJson;
            return Object.assign(Object.assign({}, row), { checklistItemId: (_b = annotation === null || annotation === void 0 ? void 0 : annotation.checklistItemId) !== null && _b !== void 0 ? _b : null, energyTypes: Array.isArray(row.energyTypesJson)
                    ? row.energyTypesJson
                    : [] });
        });
    }
};
exports.PmInspectionDashboardService = PmInspectionDashboardService;
exports.PmInspectionDashboardService = PmInspectionDashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PmInspectionDashboardService);
//# sourceMappingURL=pm-inspection-dashboard.service.js.map