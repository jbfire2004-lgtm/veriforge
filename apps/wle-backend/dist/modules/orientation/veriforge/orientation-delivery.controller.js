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
exports.OrientationDeliveryController = void 0;
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("../../../auth/jwt-auth.guard");
const roles_guard_1 = require("../../../auth/roles.guard");
const roles_decorator_1 = require("../../../auth/roles.decorator");
const routes_1 = require("../../../config/routes");
const roles_1 = require("../../vera-core/roles");
const tenant_scope_service_1 = require("../../../security/tenant-scope.service");
const orientation_delivery_service_1 = require("./orientation-delivery.service");
let OrientationDeliveryController = class OrientationDeliveryController {
    constructor(delivery, tenant) {
        this.delivery = delivery;
        this.tenant = tenant;
    }
    assign(req, body) {
        const companyId = this.tenant.effectiveCompanyId(req.user, body.companyId);
        return this.delivery.assign({
            workerId: body.workerId,
            orientationId: body.orientationId,
            companyId,
            assignedById: req.user.id,
        });
    }
    links(workerIdRaw) {
        const workerId = parseInt(workerIdRaw, 10);
        return this.delivery.listLinks(workerId);
    }
};
exports.OrientationDeliveryController = OrientationDeliveryController;
__decorate([
    (0, common_1.Post)('assign'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, roles_decorator_1.Roles)(...roles_1.SUPERVISOR_ROLES),
    (0, throttler_1.Throttle)(30, 60),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], OrientationDeliveryController.prototype, "assign", null);
__decorate([
    (0, common_1.Get)('links'),
    (0, roles_decorator_1.Roles)(...roles_1.SUPERVISOR_ROLES, client_1.UserRole.WORKER, client_1.UserRole.CONTRACTOR_USER),
    __param(0, (0, common_1.Query)('workerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], OrientationDeliveryController.prototype, "links", null);
exports.OrientationDeliveryController = OrientationDeliveryController = __decorate([
    (0, common_1.Controller)(`${routes_1.API_V1_PREFIX}/delivery/orientation`),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [orientation_delivery_service_1.OrientationDeliveryService,
        tenant_scope_service_1.TenantScopeService])
], OrientationDeliveryController);
//# sourceMappingURL=orientation-delivery.controller.js.map