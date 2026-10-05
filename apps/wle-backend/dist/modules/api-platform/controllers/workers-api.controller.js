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
exports.WorkersApiController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../../auth/jwt-auth.guard");
const roles_decorator_1 = require("../../../auth/roles.decorator");
const roles_guard_1 = require("../../../auth/roles.guard");
const roles_1 = require("../../vera-core/roles");
const routes_registry_1 = require("../../../config/routes.registry");
const worker_api_service_1 = require("../services/worker-api.service");
const create_worker_dto_1 = require("../../../workers/dto/create-worker.dto");
const update_worker_dto_1 = require("../../../workers/dto/update-worker.dto");
const api_success_decorator_1 = require("../decorators/api-success.decorator");
const api_success_interceptor_1 = require("../interceptors/api-success.interceptor");
const scoped_decorator_1 = require("../decorators/scoped.decorator");
const company_scope_guard_1 = require("../guards/company-scope.guard");
const api_response_1 = require("../responses/api-response");
const actor_util_1 = require("../../../security/actor.util");
const permission_service_1 = require("../../../security/permission.service");
let WorkersApiController = class WorkersApiController {
    constructor(workers, permissions) {
        this.workers = workers;
        this.permissions = permissions;
    }
    async search(q, companyId, page, pageSize) {
        const result = await this.workers.searchWorkers({
            q,
            companyId: companyId ? Number(companyId) : undefined,
            page: page ? Number(page) : 1,
            pageSize: pageSize ? Number(pageSize) : 25,
        });
        return (0, api_response_1.apiPaginated)(result.items, {
            page: result.page,
            pageSize: result.pageSize,
            total: result.total,
            totalPages: Math.ceil(result.total / result.pageSize) || 1,
        });
    }
    async getProjectReadiness(id, req, projectId) {
        await this.permissions.assertCanViewWorker((0, actor_util_1.toSecurityActor)(req.user), id);
        return this.workers.getWorkerProjectReadiness(id, projectId);
    }
    async getTraining(id, req, requiredTraining, roleType, projectId) {
        await this.permissions.assertCanViewWorker((0, actor_util_1.toSecurityActor)(req.user), id);
        const requiredCodes = requiredTraining
            ? requiredTraining
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean)
            : undefined;
        return this.workers.getWorkerTraining(id, {
            roleType,
            requiredCodes,
            projectId: projectId ? Number(projectId) : undefined,
        });
    }
    async get(id, req) {
        await this.permissions.assertCanViewWorker((0, actor_util_1.toSecurityActor)(req.user), id);
        return this.workers.getWorker(id);
    }
    create(body) {
        return this.workers.createWorker(body);
    }
    update(id, body) {
        return this.workers.updateWorker(id, body);
    }
    linkCompany(id, body) {
        return this.workers.linkCompany(id, body.companyId, body.role, body.trade);
    }
    unlinkCompany(id, body) {
        return this.workers.unlinkCompany(id, body.companyId);
    }
    assignProject(id, body) {
        return this.workers.assignProject(id, body.projectId);
    }
    uploadTraining(id, body) {
        return this.workers.uploadTraining(Object.assign(Object.assign({}, body), { workerId: id }));
    }
};
exports.WorkersApiController = WorkersApiController;
__decorate([
    (0, common_1.Get)('search'),
    (0, roles_decorator_1.Roles)(...roles_1.STAFF_ROLES),
    (0, api_success_decorator_1.ApiSuccess)(),
    (0, scoped_decorator_1.CompanyScoped)('companyId'),
    __param(0, (0, common_1.Query)('q')),
    __param(1, (0, common_1.Query)('companyId')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('pageSize')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], WorkersApiController.prototype, "search", null);
__decorate([
    (0, common_1.Get)(':id/project-readiness'),
    (0, roles_decorator_1.Roles)(...roles_1.STAFF_ROLES),
    (0, api_success_decorator_1.ApiSuccess)(),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Query)('projectId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Number]),
    __metadata("design:returntype", Promise)
], WorkersApiController.prototype, "getProjectReadiness", null);
__decorate([
    (0, common_1.Get)(':id/training'),
    (0, roles_decorator_1.Roles)(...roles_1.STAFF_ROLES),
    (0, api_success_decorator_1.ApiSuccess)(),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Query)('requiredTraining')),
    __param(3, (0, common_1.Query)('roleType')),
    __param(4, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, String, String, String]),
    __metadata("design:returntype", Promise)
], WorkersApiController.prototype, "getTraining", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(...roles_1.STAFF_ROLES),
    (0, api_success_decorator_1.ApiSuccess)(),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], WorkersApiController.prototype, "get", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(...roles_1.STAFF_ROLES),
    (0, api_success_decorator_1.ApiSuccess)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_worker_dto_1.CreateWorkerDto]),
    __metadata("design:returntype", void 0)
], WorkersApiController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(...roles_1.STAFF_ROLES),
    (0, api_success_decorator_1.ApiSuccess)(),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_worker_dto_1.UpdateWorkerDto]),
    __metadata("design:returntype", void 0)
], WorkersApiController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/link-company'),
    (0, roles_decorator_1.Roles)(...roles_1.STAFF_ROLES),
    (0, api_success_decorator_1.ApiSuccess)(),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], WorkersApiController.prototype, "linkCompany", null);
__decorate([
    (0, common_1.Post)(':id/unlink-company'),
    (0, roles_decorator_1.Roles)(...roles_1.STAFF_ROLES),
    (0, api_success_decorator_1.ApiSuccess)(),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], WorkersApiController.prototype, "unlinkCompany", null);
__decorate([
    (0, common_1.Post)(':id/assign-project'),
    (0, roles_decorator_1.Roles)(...roles_1.STAFF_ROLES),
    (0, api_success_decorator_1.ApiSuccess)(),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], WorkersApiController.prototype, "assignProject", null);
__decorate([
    (0, common_1.Post)(':id/training'),
    (0, roles_decorator_1.Roles)(...roles_1.STAFF_ROLES),
    (0, api_success_decorator_1.ApiSuccess)(),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], WorkersApiController.prototype, "uploadTraining", null);
exports.WorkersApiController = WorkersApiController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, company_scope_guard_1.CompanyScopeGuard),
    (0, common_1.UseInterceptors)(api_success_interceptor_1.ApiSuccessInterceptor),
    (0, common_1.Controller)(routes_registry_1.V1_ROUTES.workers),
    __metadata("design:paramtypes", [worker_api_service_1.WorkerApiService,
        permission_service_1.PermissionService])
], WorkersApiController);
//# sourceMappingURL=workers-api.controller.js.map