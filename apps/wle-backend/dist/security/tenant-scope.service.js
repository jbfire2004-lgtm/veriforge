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
exports.TenantScopeService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const roles_1 = require("../modules/vera-core/roles");
let TenantScopeService = class TenantScopeService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    bypassesTenant(actor) {
        return (0, roles_1.isSuperAdmin)(actor.role);
    }
    resolveCompanyId(actor, requestedCompanyId) {
        var _a;
        if (requestedCompanyId != null && Number.isFinite(requestedCompanyId)) {
            return requestedCompanyId;
        }
        return (_a = actor.companyId) !== null && _a !== void 0 ? _a : null;
    }
    assertCompanyAccess(actor, companyId) {
        if (this.bypassesTenant(actor))
            return;
        if (actor.companyId == null) {
            throw new common_1.ForbiddenException('User is not linked to a company tenant');
        }
        if (actor.companyId !== companyId) {
            throw new common_1.ForbiddenException('Cross-tenant company access denied');
        }
    }
    effectiveCompanyId(actor, requestedCompanyId) {
        if (this.bypassesTenant(actor)) {
            if (requestedCompanyId != null &&
                Number.isFinite(requestedCompanyId) &&
                requestedCompanyId > 0) {
                return requestedCompanyId;
            }
            if (actor.companyId != null)
                return actor.companyId;
            throw new common_1.ForbiddenException('Tenant company context required');
        }
        if (actor.companyId == null) {
            throw new common_1.ForbiddenException('User is not linked to a company tenant');
        }
        return actor.companyId;
    }
    async assertWorkerInTenant(actor, workerId) {
        const worker = await this.prisma.worker.findUnique({
            where: { id: workerId },
            select: { companyId: true },
        });
        if (!worker)
            throw new common_1.NotFoundException('Worker not found');
        if (worker.companyId == null) {
            if (!this.bypassesTenant(actor)) {
                throw new common_1.ForbiddenException('Worker has no company tenant');
            }
            return;
        }
        this.assertCompanyAccess(actor, worker.companyId);
    }
    async assertInspectionInTenant(actor, inspectionId) {
        const inspection = await this.prisma.pmInspection.findFirst({
            where: { id: inspectionId, deletedAt: null },
            select: { companyId: true },
        });
        if (!inspection)
            throw new common_1.NotFoundException('Inspection not found');
        this.assertCompanyAccess(actor, inspection.companyId);
    }
    async assertEquipmentInTenant(actor, equipmentId) {
        const equipment = await this.prisma.equipment.findUnique({
            where: { id: equipmentId },
            select: { companyId: true },
        });
        if (!equipment)
            throw new common_1.NotFoundException('Equipment not found');
        if (equipment.companyId == null) {
            if (!this.bypassesTenant(actor)) {
                throw new common_1.ForbiddenException('Equipment has no company tenant');
            }
            return;
        }
        this.assertCompanyAccess(actor, equipment.companyId);
    }
    companyWhere(actor, requestedCompanyId) {
        const companyId = this.resolveCompanyId(actor, requestedCompanyId);
        if (companyId != null) {
            this.assertCompanyAccess(actor, companyId);
            return companyId;
        }
        if (this.bypassesTenant(actor))
            return undefined;
        if (actor.companyId != null)
            return actor.companyId;
        throw new common_1.ForbiddenException('Tenant company context required');
    }
};
exports.TenantScopeService = TenantScopeService;
exports.TenantScopeService = TenantScopeService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TenantScopeService);
//# sourceMappingURL=tenant-scope.service.js.map