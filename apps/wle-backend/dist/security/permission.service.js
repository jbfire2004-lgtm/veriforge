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
exports.PermissionService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const roles_1 = require("../modules/vera-core/roles");
const security_types_1 = require("./security.types");
const tenant_scope_service_1 = require("./tenant-scope.service");
let PermissionService = class PermissionService {
    constructor(prisma, tenant) {
        this.prisma = prisma;
        this.tenant = tenant;
    }
    hasPermission(actor, permission) {
        const role = actor.role;
        switch (permission) {
            case security_types_1.Permission.ADMIN_ACCESS:
                return (0, roles_1.isSuperAdmin)(role) || (0, roles_1.isCompanyAdmin)(role);
            case security_types_1.Permission.PM_ACCESS:
                return ((0, roles_1.isSupervisor)(role) ||
                    role === client_1.UserRole.WORKER ||
                    isContractorRole(role));
            case security_types_1.Permission.CORE_ACCESS:
                return roles_1.STAFF_ROLES.includes(role);
            case security_types_1.Permission.CONTRACTOR_PORTAL_ACCESS:
                return roles_1.CONTRACTOR_ROLES.includes(role) || (0, roles_1.isSupervisor)(role);
            case security_types_1.Permission.COMPANY_READINESS_VIEW:
                return roles_1.SUPERVISOR_ROLES.includes(role);
            case security_types_1.Permission.WORKER_VIEW:
                return roles_1.STAFF_ROLES.includes(role) || roles_1.CONTRACTOR_ROLES.includes(role);
            case security_types_1.Permission.WORKER_EDIT:
                return roles_1.SUPERVISOR_ROLES.includes(role);
            case security_types_1.Permission.INSPECTION_VIEW:
                return roles_1.STAFF_ROLES.includes(role) || roles_1.CONTRACTOR_ROLES.includes(role);
            case security_types_1.Permission.INSPECTION_EDIT:
            case security_types_1.Permission.INSPECTION_SUBMIT:
                return roles_1.SUPERVISOR_ROLES.includes(role) || role === client_1.UserRole.WORKER;
            case security_types_1.Permission.TEMPLATE_MANAGE:
                return roles_1.SUPERVISOR_ROLES.includes(role);
            default:
                return false;
        }
    }
    assertPermission(actor, permission) {
        if (!this.hasPermission(actor, permission)) {
            throw new common_1.ForbiddenException(`Missing permission: ${permission}`);
        }
    }
    async canViewWorker(actor, workerId) {
        if (!this.hasPermission(actor, security_types_1.Permission.WORKER_VIEW))
            return false;
        try {
            await this.tenant.assertWorkerInTenant(actor, workerId);
            return true;
        }
        catch (_a) {
            return false;
        }
    }
    async assertCanViewWorker(actor, workerId) {
        this.assertPermission(actor, security_types_1.Permission.WORKER_VIEW);
        await this.tenant.assertWorkerInTenant(actor, workerId);
    }
    async assertCanEditWorker(actor, workerId) {
        this.assertPermission(actor, security_types_1.Permission.WORKER_EDIT);
        await this.tenant.assertWorkerInTenant(actor, workerId);
    }
    async canViewInspection(actor, inspectionId) {
        if (!this.hasPermission(actor, security_types_1.Permission.INSPECTION_VIEW))
            return false;
        try {
            await this.tenant.assertInspectionInTenant(actor, inspectionId);
            return true;
        }
        catch (_a) {
            return false;
        }
    }
    async assertCanViewInspection(actor, inspectionId) {
        this.assertPermission(actor, security_types_1.Permission.INSPECTION_VIEW);
        await this.tenant.assertInspectionInTenant(actor, inspectionId);
    }
    async assertCanEditInspection(actor, inspectionId) {
        this.assertPermission(actor, security_types_1.Permission.INSPECTION_EDIT);
        await this.tenant.assertInspectionInTenant(actor, inspectionId);
    }
    async assertCanSubmitInspection(actor, inspectionId) {
        this.assertPermission(actor, security_types_1.Permission.INSPECTION_SUBMIT);
        await this.tenant.assertInspectionInTenant(actor, inspectionId);
    }
    async assertCanViewCompanyReadiness(actor, companyId) {
        this.assertPermission(actor, security_types_1.Permission.COMPANY_READINESS_VIEW);
        const resolved = this.tenant.resolveCompanyId(actor, companyId);
        if (resolved != null) {
            this.tenant.assertCompanyAccess(actor, resolved);
        }
    }
    async assertPmModuleAccess(actor) {
        this.assertPermission(actor, security_types_1.Permission.PM_ACCESS);
    }
    async loadWorkerCompanyId(workerId) {
        const worker = await this.prisma.worker.findUnique({
            where: { id: workerId },
            select: { companyId: true },
        });
        if (!worker)
            throw new common_1.NotFoundException('Worker not found');
        return worker.companyId;
    }
    async loadInspectionCompanyId(inspectionId) {
        const row = await this.prisma.pmInspection.findFirst({
            where: { id: inspectionId, deletedAt: null },
            select: { companyId: true },
        });
        if (!row)
            throw new common_1.NotFoundException('Inspection not found');
        return row.companyId;
    }
};
exports.PermissionService = PermissionService;
exports.PermissionService = PermissionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        tenant_scope_service_1.TenantScopeService])
], PermissionService);
function isContractorRole(role) {
    return roles_1.CONTRACTOR_ROLES.includes(role);
}
//# sourceMappingURL=permission.service.js.map