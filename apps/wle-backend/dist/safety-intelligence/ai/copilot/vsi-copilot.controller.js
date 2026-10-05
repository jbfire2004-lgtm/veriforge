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
exports.VsiCopilotController = void 0;
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("../../../auth/jwt-auth.guard");
const roles_guard_1 = require("../../../auth/roles.guard");
const roles_decorator_1 = require("../../../auth/roles.decorator");
const routes_1 = require("../../../config/routes");
const tenant_scoped_decorator_1 = require("../../../security/decorators/tenant-scoped.decorator");
const tenant_scope_service_1 = require("../../../security/tenant-scope.service");
const vsi_copilot_engine_service_1 = require("./vsi-copilot-engine.service");
const PM_ROLES = [
    client_1.UserRole.WORKER,
    client_1.UserRole.SUPERVISOR,
    client_1.UserRole.ADMIN,
    client_1.UserRole.SUPER_ADMIN,
    client_1.UserRole.COMPANY_ADMIN,
    client_1.UserRole.PROJECT_MANAGER,
];
class CopilotRunBodyDto {
}
let VsiCopilotController = class VsiCopilotController {
    constructor(copilot, tenant) {
        this.copilot = copilot;
        this.tenant = tenant;
    }
    run(req, body) {
        var _a;
        const companyId = this.tenant.effectiveCompanyId(req.user, body.companyId);
        return this.copilot.run(Object.assign(Object.assign({}, body), { companyId, actor: {
                userId: req.user.id,
                role: String(req.user.role),
                companyId: (_a = req.user.companyId) !== null && _a !== void 0 ? _a : undefined,
            } }));
    }
};
exports.VsiCopilotController = VsiCopilotController;
__decorate([
    (0, common_1.Post)('run'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, throttler_1.Throttle)(10, 60),
    (0, tenant_scoped_decorator_1.TenantScoped)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, CopilotRunBodyDto]),
    __metadata("design:returntype", void 0)
], VsiCopilotController.prototype, "run", null);
exports.VsiCopilotController = VsiCopilotController = __decorate([
    (0, common_1.Controller)(`${routes_1.API_V1_PREFIX}/pm/safety-intelligence/ai/copilot`),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...PM_ROLES),
    __metadata("design:paramtypes", [vsi_copilot_engine_service_1.VsiCopilotEngineService,
        tenant_scope_service_1.TenantScopeService])
], VsiCopilotController);
//# sourceMappingURL=vsi-copilot.controller.js.map