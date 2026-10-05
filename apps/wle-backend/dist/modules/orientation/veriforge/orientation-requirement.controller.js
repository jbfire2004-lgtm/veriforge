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
exports.OrientationRequirementController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("../../../auth/jwt-auth.guard");
const roles_guard_1 = require("../../../auth/roles.guard");
const roles_decorator_1 = require("../../../auth/roles.decorator");
const routes_1 = require("../../../config/routes");
const roles_1 = require("../../vera-core/roles");
const tenant_scope_service_1 = require("../../../security/tenant-scope.service");
const orientation_requirement_service_1 = require("./orientation-requirement.service");
let OrientationRequirementController = class OrientationRequirementController {
    constructor(requirements, tenant) {
        this.requirements = requirements;
        this.tenant = tenant;
    }
    create(req, body) {
        const companyId = this.tenant.effectiveCompanyId(req.user, body.companyId);
        return this.requirements.create({
            orientationId: body.orientationId,
            companyId,
            projectId: body.projectId,
            siteId: body.siteId,
            tradeId: body.tradeId,
            unionDispatchType: body.unionDispatchType,
            mustCompleteBefore: body.mustCompleteBefore,
            isActive: body.isActive,
        }, { id: req.user.id, companyId });
    }
    list(req, companyIdRaw, projectIdRaw, workerIdRaw, isActiveRaw) {
        const companyId = this.tenant.effectiveCompanyId(req.user, companyIdRaw ? parseInt(companyIdRaw, 10) : undefined);
        return this.requirements.list({
            companyId,
            projectId: projectIdRaw ? parseInt(projectIdRaw, 10) : undefined,
            workerId: workerIdRaw ? parseInt(workerIdRaw, 10) : undefined,
            isActive: isActiveRaw === 'true'
                ? true
                : isActiveRaw === 'false'
                    ? false
                    : undefined,
        });
    }
    update(id, req, body) {
        var _a, _b, _c, _d, _e;
        return this.requirements.update(id, {
            projectId: (_a = body.projectId) !== null && _a !== void 0 ? _a : undefined,
            siteId: (_b = body.siteId) !== null && _b !== void 0 ? _b : undefined,
            tradeId: (_c = body.tradeId) !== null && _c !== void 0 ? _c : undefined,
            unionDispatchType: (_d = body.unionDispatchType) !== null && _d !== void 0 ? _d : undefined,
            mustCompleteBefore: body.mustCompleteBefore,
            isActive: body.isActive,
        }, { id: req.user.id, companyId: (_e = req.user.companyId) !== null && _e !== void 0 ? _e : undefined });
    }
};
exports.OrientationRequirementController = OrientationRequirementController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, roles_decorator_1.Roles)(...roles_1.SUPERVISOR_ROLES),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], OrientationRequirementController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(...roles_1.SUPERVISOR_ROLES, client_1.UserRole.WORKER),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('companyId')),
    __param(2, (0, common_1.Query)('projectId')),
    __param(3, (0, common_1.Query)('workerId')),
    __param(4, (0, common_1.Query)('isActive')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String]),
    __metadata("design:returntype", void 0)
], OrientationRequirementController.prototype, "list", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, roles_decorator_1.Roles)(...roles_1.SUPERVISOR_ROLES),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], OrientationRequirementController.prototype, "update", null);
exports.OrientationRequirementController = OrientationRequirementController = __decorate([
    (0, common_1.Controller)(`${routes_1.API_V1_PREFIX}/orientation-requirements`),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [orientation_requirement_service_1.OrientationRequirementService,
        tenant_scope_service_1.TenantScopeService])
], OrientationRequirementController);
//# sourceMappingURL=orientation-requirement.controller.js.map