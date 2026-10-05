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
exports.EquipmentApiController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../../auth/jwt-auth.guard");
const roles_decorator_1 = require("../../../auth/roles.decorator");
const roles_guard_1 = require("../../../auth/roles.guard");
const roles_1 = require("../../vera-core/roles");
const routes_registry_1 = require("../../../config/routes.registry");
const equipment_api_service_1 = require("../services/equipment-api.service");
const api_success_decorator_1 = require("../decorators/api-success.decorator");
const api_success_interceptor_1 = require("../interceptors/api-success.interceptor");
const api_response_1 = require("../responses/api-response");
let EquipmentApiController = class EquipmentApiController {
    constructor(equipment) {
        this.equipment = equipment;
    }
    async list(companyId, page, pageSize) {
        const result = await this.equipment.list(companyId ? Number(companyId) : undefined, page ? Number(page) : 1, pageSize ? Number(pageSize) : 25);
        return (0, api_response_1.apiPaginated)(result.items, {
            page: result.page,
            pageSize: result.pageSize,
            total: result.total,
            totalPages: Math.ceil(result.total / result.pageSize) || 1,
        });
    }
    get(id) {
        return this.equipment.getEquipment(id);
    }
    create(body) {
        return this.equipment.create(body);
    }
    update(id, body) {
        return this.equipment.update(id, body);
    }
    linkCompany(id, body) {
        return this.equipment.linkCompany(id, body.companyId);
    }
    assignProject(id, body) {
        return this.equipment.assignProject(id, body.projectId);
    }
    lockout(id, body) {
        return this.equipment.lockout(id, body.reason);
    }
    unlock(id, body) {
        return this.equipment.unlock(id, body.notes);
    }
};
exports.EquipmentApiController = EquipmentApiController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(...roles_1.STAFF_ROLES),
    (0, api_success_decorator_1.ApiSuccess)(),
    __param(0, (0, common_1.Query)('companyId')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('pageSize')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], EquipmentApiController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(...roles_1.STAFF_ROLES),
    (0, api_success_decorator_1.ApiSuccess)(),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], EquipmentApiController.prototype, "get", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(...roles_1.STAFF_ROLES),
    (0, api_success_decorator_1.ApiSuccess)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], EquipmentApiController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(...roles_1.STAFF_ROLES),
    (0, api_success_decorator_1.ApiSuccess)(),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], EquipmentApiController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/link-company'),
    (0, roles_decorator_1.Roles)(...roles_1.STAFF_ROLES),
    (0, api_success_decorator_1.ApiSuccess)(),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], EquipmentApiController.prototype, "linkCompany", null);
__decorate([
    (0, common_1.Post)(':id/assign-project'),
    (0, roles_decorator_1.Roles)(...roles_1.STAFF_ROLES),
    (0, api_success_decorator_1.ApiSuccess)(),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], EquipmentApiController.prototype, "assignProject", null);
__decorate([
    (0, common_1.Post)(':id/lockout'),
    (0, roles_decorator_1.Roles)(...roles_1.STAFF_ROLES),
    (0, api_success_decorator_1.ApiSuccess)(),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], EquipmentApiController.prototype, "lockout", null);
__decorate([
    (0, common_1.Post)(':id/unlock'),
    (0, roles_decorator_1.Roles)(...roles_1.STAFF_ROLES),
    (0, api_success_decorator_1.ApiSuccess)(),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], EquipmentApiController.prototype, "unlock", null);
exports.EquipmentApiController = EquipmentApiController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.UseInterceptors)(api_success_interceptor_1.ApiSuccessInterceptor),
    (0, common_1.Controller)(routes_registry_1.V1_ROUTES.equipment),
    __metadata("design:paramtypes", [equipment_api_service_1.EquipmentApiService])
], EquipmentApiController);
//# sourceMappingURL=equipment-api.controller.js.map