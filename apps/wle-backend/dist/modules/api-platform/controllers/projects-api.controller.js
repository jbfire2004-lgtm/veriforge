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
exports.ProjectsApiController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../../auth/jwt-auth.guard");
const roles_decorator_1 = require("../../../auth/roles.decorator");
const roles_guard_1 = require("../../../auth/roles.guard");
const roles_1 = require("../../vera-core/roles");
const routes_registry_1 = require("../../../config/routes.registry");
const project_api_service_1 = require("../services/project-api.service");
const api_success_decorator_1 = require("../decorators/api-success.decorator");
const api_success_interceptor_1 = require("../interceptors/api-success.interceptor");
const project_scope_guard_1 = require("../guards/project-scope.guard");
const scoped_decorator_1 = require("../decorators/scoped.decorator");
let ProjectsApiController = class ProjectsApiController {
    constructor(projects) {
        this.projects = projects;
    }
    create(body) {
        return this.projects.create(body);
    }
    get(id) {
        return this.projects.get(id);
    }
    assignWorker(id, body) {
        return this.projects.assignWorker(id, body.workerId);
    }
    assignEquipment(id, body) {
        return this.projects.assignEquipment(id, body.equipmentId);
    }
    readiness(id) {
        return this.projects.readiness(undefined, id);
    }
    close(id) {
        return this.projects.close(id);
    }
};
exports.ProjectsApiController = ProjectsApiController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(...roles_1.COMPANY_ADMIN_ROLES),
    (0, api_success_decorator_1.ApiSuccess)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ProjectsApiController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(...roles_1.STAFF_ROLES),
    (0, api_success_decorator_1.ApiSuccess)(),
    (0, scoped_decorator_1.ProjectScoped)('id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ProjectsApiController.prototype, "get", null);
__decorate([
    (0, common_1.Post)(':id/assign-worker'),
    (0, roles_decorator_1.Roles)(...roles_1.STAFF_ROLES),
    (0, api_success_decorator_1.ApiSuccess)(),
    (0, scoped_decorator_1.ProjectScoped)('id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], ProjectsApiController.prototype, "assignWorker", null);
__decorate([
    (0, common_1.Post)(':id/assign-equipment'),
    (0, roles_decorator_1.Roles)(...roles_1.STAFF_ROLES),
    (0, api_success_decorator_1.ApiSuccess)(),
    (0, scoped_decorator_1.ProjectScoped)('id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], ProjectsApiController.prototype, "assignEquipment", null);
__decorate([
    (0, common_1.Get)(':id/readiness'),
    (0, roles_decorator_1.Roles)(...roles_1.STAFF_ROLES),
    (0, api_success_decorator_1.ApiSuccess)(),
    (0, scoped_decorator_1.ProjectScoped)('id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ProjectsApiController.prototype, "readiness", null);
__decorate([
    (0, common_1.Post)(':id/close'),
    (0, roles_decorator_1.Roles)(...roles_1.COMPANY_ADMIN_ROLES),
    (0, api_success_decorator_1.ApiSuccess)(),
    (0, scoped_decorator_1.ProjectScoped)('id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ProjectsApiController.prototype, "close", null);
exports.ProjectsApiController = ProjectsApiController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, project_scope_guard_1.ProjectScopeGuard),
    (0, common_1.UseInterceptors)(api_success_interceptor_1.ApiSuccessInterceptor),
    (0, common_1.Controller)(routes_registry_1.V1_ROUTES.projects),
    __metadata("design:paramtypes", [project_api_service_1.ProjectApiService])
], ProjectsApiController);
//# sourceMappingURL=projects-api.controller.js.map