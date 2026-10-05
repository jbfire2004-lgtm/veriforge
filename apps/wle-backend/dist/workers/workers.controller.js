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
exports.WorkersController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const roles_guard_1 = require("../auth/roles.guard");
const workers_service_1 = require("./workers.service");
const assign_workers_company_dto_1 = require("./dto/assign-workers-company.dto");
const create_worker_dto_1 = require("./dto/create-worker.dto");
const update_worker_expiry_rules_dto_1 = require("./dto/update-worker-expiry-rules.dto");
const update_worker_dto_1 = require("./dto/update-worker.dto");
const actor_util_1 = require("../security/actor.util");
const tenant_scoped_decorator_1 = require("../security/decorators/tenant-scoped.decorator");
const permission_service_1 = require("../security/permission.service");
const worker_expiry_rules_store_1 = require("./worker-expiry-rules.store");
let WorkersController = class WorkersController {
    constructor(workersService, permissions, expiryRulesStore) {
        this.workersService = workersService;
        this.permissions = permissions;
        this.expiryRulesStore = expiryRulesStore;
    }
    findAll() {
        return this.workersService.findAll();
    }
    findByCompany(companyId) {
        return this.workersService.findByCompany(companyId);
    }
    getExpiryRules(companyId) {
        return this.expiryRulesStore.getRules(companyId);
    }
    updateExpiryRules(companyId, dto) {
        return this.expiryRulesStore.saveRules(companyId, dto);
    }
    heartbeat(id) {
        return this.workersService.registerHeartbeat(id);
    }
    assignCompany(dto) {
        if (dto.unassign) {
            return this.workersService.assignCompanyBatch(dto.workerIds, null);
        }
        if (dto.companyId == null || !Number.isFinite(dto.companyId)) {
            throw new common_1.BadRequestException('companyId is required unless unassign is true');
        }
        return this.workersService.assignCompanyBatch(dto.workerIds, dto.companyId);
    }
    async findOne(id, req) {
        await this.assertWorkerSelfOrElevated(req, id);
        return this.workersService.findOne(id);
    }
    create(body) {
        return this.workersService.create(body);
    }
    update(id, body) {
        return this.workersService.update(id, body);
    }
    remove(id) {
        return this.workersService.remove(id);
    }
    async profile(id, req) {
        await this.assertWorkerSelfOrElevated(req, id);
        return this.workersService.getProfile(id);
    }
    async compliance(id, req) {
        await this.assertWorkerSelfOrElevated(req, id);
        return this.workersService.getCompliance(id);
    }
    async assertWorkerSelfOrElevated(req, workerId) {
        const u = req.user;
        if (!u)
            throw new common_1.ForbiddenException();
        if (u.role === client_1.UserRole.WORKER) {
            const own = await this.workersService.findWorkerIdByUserId(u.id);
            if (own !== workerId) {
                throw new common_1.ForbiddenException('Workers may only access their own profile');
            }
            return;
        }
        await this.permissions.assertCanViewWorker((0, actor_util_1.toSecurityActor)(u), workerId);
    }
};
exports.WorkersController = WorkersController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], WorkersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('company/:companyId'),
    (0, tenant_scoped_decorator_1.TenantScoped)('companyId'),
    __param(0, (0, common_1.Param)('companyId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], WorkersController.prototype, "findByCompany", null);
__decorate([
    (0, common_1.Get)('expiry-rules'),
    (0, tenant_scoped_decorator_1.TenantScoped)('companyId'),
    __param(0, (0, common_1.Query)('companyId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], WorkersController.prototype, "getExpiryRules", null);
__decorate([
    (0, common_1.Patch)('expiry-rules'),
    (0, tenant_scoped_decorator_1.TenantScoped)('companyId'),
    __param(0, (0, common_1.Query)('companyId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_worker_expiry_rules_dto_1.UpdateWorkerExpiryRulesDto]),
    __metadata("design:returntype", void 0)
], WorkersController.prototype, "updateExpiryRules", null);
__decorate([
    (0, common_1.Post)(':id/heartbeat'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], WorkersController.prototype, "heartbeat", null);
__decorate([
    (0, common_1.Post)('assign-company'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [assign_workers_company_dto_1.AssignWorkersCompanyDto]),
    __metadata("design:returntype", void 0)
], WorkersController.prototype, "assignCompany", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPERVISOR, client_1.UserRole.PROJECT_MANAGER, client_1.UserRole.WORKER),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], WorkersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_worker_dto_1.CreateWorkerDto]),
    __metadata("design:returntype", void 0)
], WorkersController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_worker_dto_1.UpdateWorkerDto]),
    __metadata("design:returntype", void 0)
], WorkersController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], WorkersController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)(':id/profile'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPERVISOR, client_1.UserRole.PROJECT_MANAGER, client_1.UserRole.WORKER),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], WorkersController.prototype, "profile", null);
__decorate([
    (0, common_1.Get)(':id/compliance'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPERVISOR, client_1.UserRole.PROJECT_MANAGER, client_1.UserRole.WORKER),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], WorkersController.prototype, "compliance", null);
exports.WorkersController = WorkersController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPERVISOR, client_1.UserRole.PROJECT_MANAGER),
    (0, common_1.Controller)('workers'),
    __metadata("design:paramtypes", [workers_service_1.WorkersService,
        permission_service_1.PermissionService,
        worker_expiry_rules_store_1.WorkerExpiryRulesStore])
], WorkersController);
//# sourceMappingURL=workers.controller.js.map