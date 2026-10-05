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
exports.PmInspectionAccessService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const roles_1 = require("../modules/vera-core/roles");
const pm_inspection_subcontractor_resolver_service_1 = require("./pm-inspection-subcontractor-resolver.service");
const pm_inspection_sharing_types_1 = require("./pm-inspection-sharing.types");
let PmInspectionAccessService = class PmInspectionAccessService {
    constructor(prisma, subcontractorResolver) {
        this.prisma = prisma;
        this.subcontractorResolver = subcontractorResolver;
    }
    isProjectOwnerRole(role) {
        return ((0, roles_1.isSuperAdmin)(role) ||
            (0, roles_1.isCompanyAdmin)(role) ||
            roles_1.SUPERVISOR_ROLES.includes(role));
    }
    async loadInspectionContext(inspectionId) {
        const row = await this.prisma.pmInspection.findFirst({
            where: { id: inspectionId, deletedAt: null },
            select: {
                id: true,
                companyId: true,
                projectId: true,
                inspectorUserId: true,
                status: true,
                sharingJson: true,
                project: { select: { companyId: true, name: true } },
            },
        });
        if (!row)
            throw new common_1.NotFoundException('Inspection not found');
        return Object.assign(Object.assign({}, row), { sharing: (0, pm_inspection_sharing_types_1.parseInspectionSharing)(row.sharingJson) });
    }
    async actorCompanyOnProject(actor, projectId) {
        if (actor.companyId == null)
            return false;
        const companies = await this.subcontractorResolver.listWithNames(projectId);
        return companies.some((c) => c.id === actor.companyId);
    }
    async actorWorkerOnProject(actor, projectId) {
        if (!actor.id)
            return false;
        const worker = await this.prisma.worker.findFirst({
            where: { userId: actor.id },
            select: { id: true },
        });
        if (!worker)
            return false;
        const assignment = await this.prisma.projectAssignment.findFirst({
            where: {
                projectId,
                workerId: worker.id,
                status: 'ACTIVE',
            },
        });
        return !!assignment;
    }
    async canViewInspectionReport(actor, inspectionId) {
        const ctx = await this.loadInspectionContext(inspectionId);
        if ((0, roles_1.isSuperAdmin)(actor.role))
            return true;
        if (actor.companyId === ctx.companyId)
            return true;
        if (actor.companyId === ctx.project.companyId &&
            this.isProjectOwnerRole(actor.role)) {
            return true;
        }
        if (actor.id === ctx.inspectorUserId)
            return true;
        const submitted = ctx.status !== 'draft' && ctx.status !== 'in_progress';
        if (!submitted)
            return false;
        if (ctx.sharing.shareReportWithContractors && actor.companyId != null) {
            if (await this.actorCompanyOnProject(actor, ctx.projectId))
                return true;
        }
        if (ctx.sharing.shareReportWithWorkers) {
            if (await this.actorWorkerOnProject(actor, ctx.projectId))
                return true;
        }
        return false;
    }
    async assertCanViewInspectionReport(actor, inspectionId) {
        if (!(await this.canViewInspectionReport(actor, inspectionId))) {
            throw new common_1.ForbiddenException('Inspection report access denied');
        }
    }
    async assertCanManageInspectionSharing(actor, inspectionId) {
        const ctx = await this.loadInspectionContext(inspectionId);
        if ((0, roles_1.isSuperAdmin)(actor.role) || (0, roles_1.isCompanyAdmin)(actor.role))
            return;
        if (actor.companyId === ctx.project.companyId &&
            ((0, roles_1.isSupervisor)(actor.role) || actor.role === client_1.UserRole.PROJECT_MANAGER)) {
            return;
        }
        if (actor.companyId === ctx.companyId && (0, roles_1.isSupervisor)(actor.role))
            return;
        throw new common_1.ForbiddenException('Only the project owner can change report sharing');
    }
    async canViewProjectFindingsLog(actor, projectId) {
        if ((0, roles_1.isSuperAdmin)(actor.role))
            return true;
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
            select: { companyId: true },
        });
        if (!project)
            return false;
        if (actor.companyId === project.companyId &&
            this.isProjectOwnerRole(actor.role)) {
            return true;
        }
        if (actor.companyId != null &&
            (await this.actorCompanyOnProject(actor, projectId))) {
            return true;
        }
        if (await this.actorWorkerOnProject(actor, projectId))
            return true;
        return false;
    }
    async assertCanViewProjectFindingsLog(actor, projectId) {
        if (!(await this.canViewProjectFindingsLog(actor, projectId))) {
            throw new common_1.ForbiddenException('Findings log access denied');
        }
    }
};
exports.PmInspectionAccessService = PmInspectionAccessService;
exports.PmInspectionAccessService = PmInspectionAccessService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        pm_inspection_subcontractor_resolver_service_1.PmInspectionSubcontractorResolverService])
], PmInspectionAccessService);
//# sourceMappingURL=pm-inspection-access.service.js.map