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
exports.CailController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
const roles_guard_1 = require("../../auth/roles.guard");
const roles_decorator_1 = require("../../auth/roles.decorator");
const routes_1 = require("../../config/routes");
const cail_service_1 = require("./cail.service");
const cail_scope_service_1 = require("./cail-scope.service");
const create_cail_dto_1 = require("../dto/create-cail.dto");
const update_cail_dto_1 = require("../dto/update-cail.dto");
const resolve_cail_dto_1 = require("../dto/resolve-cail.dto");
const assign_cail_dto_1 = require("../dto/assign-cail.dto");
const PM_ROLES = [
    client_1.UserRole.WORKER,
    client_1.UserRole.SUPERVISOR,
    client_1.UserRole.ADMIN,
    client_1.UserRole.SUPER_ADMIN,
    client_1.UserRole.COMPANY_ADMIN,
    client_1.UserRole.PROJECT_MANAGER,
];
let CailController = class CailController {
    constructor(cail, scope) {
        this.cail = cail;
        this.scope = scope;
    }
    async actor(req) {
        return this.scope.resolveActor(req.user.id, req.user.role);
    }
    async list(req, projectId, status, sourceType, ownerCompanyId) {
        const actor = await this.actor(req);
        return this.cail.list(actor, {
            projectId: projectId ? parseInt(projectId, 10) : undefined,
            status,
            sourceType,
            ownerCompanyId: ownerCompanyId ? parseInt(ownerCompanyId, 10) : undefined,
        });
    }
    getWorkflow() {
        return this.cail.getWorkflowDefinition();
    }
    async getOne(id, req) {
        const actor = await this.actor(req);
        return this.cail.getById(id, actor);
    }
    async create(dto, req) {
        const actor = await this.actor(req);
        return this.cail.create(dto, actor);
    }
    async update(id, dto, req) {
        const actor = await this.actor(req);
        return this.cail.update(id, dto, actor);
    }
    async assign(id, dto, req) {
        const actor = await this.actor(req);
        return this.cail.assign(id, dto, actor);
    }
    async resolve(id, dto, req) {
        const actor = await this.actor(req);
        return this.cail.resolve(id, dto, actor);
    }
    async verify(id, note, req) {
        const actor = await this.actor(req);
        return this.cail.verify(id, actor, note);
    }
    async cancel(id, reason, req) {
        const actor = await this.actor(req);
        return this.cail.cancel(id, actor, reason);
    }
    async analyzeAi(id, req) {
        const actor = await this.actor(req);
        return this.cail.analyzeWithAi(id, actor);
    }
};
exports.CailController = CailController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('projectId')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('sourceType')),
    __param(4, (0, common_1.Query)('ownerCompanyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String]),
    __metadata("design:returntype", Promise)
], CailController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('workflow'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CailController.prototype, "getWorkflow", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CailController.prototype, "getOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_cail_dto_1.CreateCailDto, Object]),
    __metadata("design:returntype", Promise)
], CailController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_cail_dto_1.UpdateCailDto, Object]),
    __metadata("design:returntype", Promise)
], CailController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/assign'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, assign_cail_dto_1.AssignCailDto, Object]),
    __metadata("design:returntype", Promise)
], CailController.prototype, "assign", null);
__decorate([
    (0, common_1.Post)(':id/resolve'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, resolve_cail_dto_1.ResolveCailDto, Object]),
    __metadata("design:returntype", Promise)
], CailController.prototype, "resolve", null);
__decorate([
    (0, common_1.Post)(':id/verify'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('note')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], CailController.prototype, "verify", null);
__decorate([
    (0, common_1.Post)(':id/cancel'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('reason')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], CailController.prototype, "cancel", null);
__decorate([
    (0, common_1.Post)(':id/ai/analyze'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CailController.prototype, "analyzeAi", null);
exports.CailController = CailController = __decorate([
    (0, common_1.Controller)(`${routes_1.API_V1_PREFIX}/pm/safety-intelligence/cail`),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...PM_ROLES),
    __metadata("design:paramtypes", [cail_service_1.CailService,
        cail_scope_service_1.CailScopeService])
], CailController);
//# sourceMappingURL=cail.controller.js.map