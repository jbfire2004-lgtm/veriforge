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
exports.OrientationCompletionController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("../../../auth/jwt-auth.guard");
const roles_guard_1 = require("../../../auth/roles.guard");
const roles_decorator_1 = require("../../../auth/roles.decorator");
const routes_1 = require("../../../config/routes");
const roles_1 = require("../../vera-core/roles");
const tenant_scope_service_1 = require("../../../security/tenant-scope.service");
const orientation_completion_service_1 = require("./orientation-completion.service");
let OrientationCompletionController = class OrientationCompletionController {
    constructor(completions, tenant) {
        this.completions = completions;
        this.tenant = tenant;
    }
    create(req, body) {
        const companyId = this.tenant.effectiveCompanyId(req.user, body.companyId);
        return this.completions.create({
            workerId: body.workerId,
            orientationId: body.orientationId,
            companyId,
            projectId: body.projectId,
            score: body.score,
            status: body.status,
            clientSyncId: body.clientSyncId,
            actorId: req.user.id,
        });
    }
    list(workerIdRaw, orientationId) {
        return this.completions.list({
            workerId: workerIdRaw ? parseInt(workerIdRaw, 10) : undefined,
            orientationId,
        });
    }
};
exports.OrientationCompletionController = OrientationCompletionController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, roles_decorator_1.Roles)(...roles_1.SUPERVISOR_ROLES, client_1.UserRole.WORKER, client_1.UserRole.CONTRACTOR_USER),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], OrientationCompletionController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(...roles_1.SUPERVISOR_ROLES, client_1.UserRole.WORKER, client_1.UserRole.CONTRACTOR_USER),
    __param(0, (0, common_1.Query)('workerId')),
    __param(1, (0, common_1.Query)('orientationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], OrientationCompletionController.prototype, "list", null);
exports.OrientationCompletionController = OrientationCompletionController = __decorate([
    (0, common_1.Controller)(`${routes_1.API_V1_PREFIX}/orientation-completions`),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [orientation_completion_service_1.OrientationCompletionService,
        tenant_scope_service_1.TenantScopeService])
], OrientationCompletionController);
//# sourceMappingURL=orientation-completion.controller.js.map