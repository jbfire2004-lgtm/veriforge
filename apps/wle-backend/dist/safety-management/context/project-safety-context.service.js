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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectSafetyContextService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const pm_project_safety_context_service_1 = require("../../pm-project-safety-context/pm-project-safety-context.service");
let ProjectSafetyContextService = class ProjectSafetyContextService {
    constructor(prisma, pmContext) {
        this.prisma = prisma;
        this.pmContext = pmContext;
    }
    async getContext(projectId) {
        var _a, _b, _c, _d, _e, _f;
        if (this.pmContext) {
            return this.pmContext.getProjectContext(projectId);
        }
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
            include: { site: true, company: { select: { id: true, name: true } } },
        });
        if (!project)
            throw new common_1.NotFoundException('Project not found');
        const [openCail, overdueCail, sifOpen, lastInspection, lastFlha, riskSnapshot, rules, plan,] = await Promise.all([
            this.prisma.cailEntry.count({
                where: {
                    projectId,
                    status: { in: ['open', 'in_progress', 'overdue'] },
                },
            }),
            this.prisma.cailEntry.count({
                where: { projectId, status: 'overdue' },
            }),
            this.prisma.cailEntry.count({
                where: {
                    projectId,
                    status: { in: ['open', 'in_progress', 'overdue'] },
                    OR: [{ severity: 'critical' }, { sourceType: 'sif' }],
                },
            }),
            this.prisma.safetyInspection.findFirst({
                where: { projectId, status: 'completed' },
                orderBy: { completedAt: 'desc' },
                select: { completedAt: true },
            }),
            this.prisma.safetyForm.findFirst({
                where: {
                    projectId,
                    definitionId: 'daily-flha',
                    submittedAt: { not: null },
                },
                orderBy: { submittedAt: 'desc' },
                select: { submittedAt: true },
            }),
            this.prisma.projectSafetyRiskSnapshot.findFirst({
                where: { projectId },
                orderBy: { computedAt: 'desc' },
            }),
            this.prisma.siteAccessRule.findMany({
                where: { projectId, active: true },
            }),
            this.prisma.projectSafetyPlan.findUnique({ where: { projectId } }),
        ]);
        const requiredForms = Array.isArray(plan === null || plan === void 0 ? void 0 : plan.requiredDefinitionIds)
            ? plan.requiredDefinitionIds
            : ['daily-flha'];
        return {
            projectId,
            ownerCompanyId: project.companyId,
            siteIds: project.siteId ? [project.siteId] : [],
            siteName: (_b = (_a = project.site) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : null,
            companyName: project.company.name,
            activeWorkerCount: await this.prisma.projectAssignment.count({
                where: { projectId, status: 'ACTIVE' },
            }),
            openCailCount: openCail,
            overdueCailCount: overdueCail,
            sifOpenCount: sifOpen,
            lastInspectionAt: (_d = (_c = lastInspection === null || lastInspection === void 0 ? void 0 : lastInspection.completedAt) === null || _c === void 0 ? void 0 : _c.toISOString()) !== null && _d !== void 0 ? _d : null,
            lastFlhaAt: (_f = (_e = lastFlha === null || lastFlha === void 0 ? void 0 : lastFlha.submittedAt) === null || _e === void 0 ? void 0 : _e.toISOString()) !== null && _f !== void 0 ? _f : null,
            riskSnapshot: riskSnapshot
                ? {
                    score: riskSnapshot.score,
                    band: riskSnapshot.predictedLevel,
                    computedAt: riskSnapshot.computedAt.toISOString(),
                }
                : null,
            requiredForms,
            zoneRules: rules,
        };
    }
};
exports.ProjectSafetyContextService = ProjectSafetyContextService;
exports.ProjectSafetyContextService = ProjectSafetyContextService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        pm_project_safety_context_service_1.PmProjectSafetyContextService])
], ProjectSafetyContextService);
//# sourceMappingURL=project-safety-context.service.js.map