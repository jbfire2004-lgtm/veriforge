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
exports.DashboardApiController = exports.SyncApiController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../../auth/jwt-auth.guard");
const roles_decorator_1 = require("../../../auth/roles.decorator");
const roles_guard_1 = require("../../../auth/roles.guard");
const roles_1 = require("../../vera-core/roles");
const routes_registry_1 = require("../../../config/routes.registry");
const sync_api_service_1 = require("../services/sync-api.service");
const api_success_decorator_1 = require("../decorators/api-success.decorator");
const api_success_interceptor_1 = require("../interceptors/api-success.interceptor");
let SyncApiController = class SyncApiController {
    constructor(sync) {
        this.sync = sync;
    }
    batch(body, req) {
        var _a, _b, _c;
        return this.sync.processBatch((_a = body.actions) !== null && _a !== void 0 ? _a : [], (_c = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id) !== null && _c !== void 0 ? _c : 0, {
            batchId: body.batchId,
            clientId: body.clientId,
        });
    }
};
exports.SyncApiController = SyncApiController;
__decorate([
    (0, common_1.Post)('batch'),
    (0, roles_decorator_1.Roles)(...roles_1.STAFF_ROLES),
    (0, api_success_decorator_1.ApiSuccess)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SyncApiController.prototype, "batch", null);
exports.SyncApiController = SyncApiController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.UseInterceptors)(api_success_interceptor_1.ApiSuccessInterceptor),
    (0, common_1.Controller)(routes_registry_1.V1_ROUTES.sync),
    __metadata("design:paramtypes", [sync_api_service_1.SyncApiService])
], SyncApiController);
let DashboardApiController = class DashboardApiController {
    constructor(sync) {
        this.sync = sync;
    }
    widgets(req, companyId, unionHallId) {
        var _a, _b;
        return this.sync.getDashboardWidgets((_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== null && _b !== void 0 ? _b : '', companyId ? Number(companyId) : undefined, unionHallId ? Number(unionHallId) : undefined);
    }
};
exports.DashboardApiController = DashboardApiController;
__decorate([
    (0, common_1.Get)('widgets'),
    (0, roles_decorator_1.Roles)(...roles_1.STAFF_ROLES),
    (0, api_success_decorator_1.ApiSuccess)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('companyId')),
    __param(2, (0, common_1.Query)('unionHallId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], DashboardApiController.prototype, "widgets", null);
exports.DashboardApiController = DashboardApiController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.UseInterceptors)(api_success_interceptor_1.ApiSuccessInterceptor),
    (0, common_1.Controller)(routes_registry_1.V1_ROUTES.dashboard),
    __metadata("design:paramtypes", [sync_api_service_1.SyncApiService])
], DashboardApiController);
//# sourceMappingURL=sync-api.controller.js.map