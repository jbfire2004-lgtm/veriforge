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
exports.LessonsLearnedController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
const roles_guard_1 = require("../../auth/roles.guard");
const roles_decorator_1 = require("../../auth/roles.decorator");
const routes_1 = require("../../config/routes");
const cail_scope_service_1 = require("../cail/cail-scope.service");
const lessons_learned_service_1 = require("./lessons-learned.service");
const PM_ROLES = [
    client_1.UserRole.WORKER,
    client_1.UserRole.SUPERVISOR,
    client_1.UserRole.ADMIN,
    client_1.UserRole.SUPER_ADMIN,
    client_1.UserRole.COMPANY_ADMIN,
    client_1.UserRole.PROJECT_MANAGER,
];
let LessonsLearnedController = class LessonsLearnedController {
    constructor(lessons, scope) {
        this.lessons = lessons;
        this.scope = scope;
    }
    async list(req, projectId, companyId) {
        const actor = await this.scope.resolveActor(req.user.id, req.user.role);
        return this.lessons.list(actor, {
            projectId: projectId ? parseInt(projectId, 10) : undefined,
            companyId: companyId ? parseInt(companyId, 10) : undefined,
        });
    }
    async clusters(projectId) {
        return this.lessons.clusters(parseInt(projectId, 10));
    }
    async recluster(projectId, req) {
        const actor = await this.scope.resolveActor(req.user.id, req.user.role);
        return this.lessons.recluster(parseInt(projectId, 10), actor);
    }
    async getOne(id, req) {
        const actor = await this.scope.resolveActor(req.user.id, req.user.role);
        return this.lessons.getById(id, actor);
    }
    async fromCail(cailId) {
        return this.lessons.materializeFromCail(cailId);
    }
};
exports.LessonsLearnedController = LessonsLearnedController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('projectId')),
    __param(2, (0, common_1.Query)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], LessonsLearnedController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('clusters'),
    __param(0, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LessonsLearnedController.prototype, "clusters", null);
__decorate([
    (0, common_1.Post)('recluster'),
    __param(0, (0, common_1.Query)('projectId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LessonsLearnedController.prototype, "recluster", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LessonsLearnedController.prototype, "getOne", null);
__decorate([
    (0, common_1.Post)('from-cail/:cailId'),
    __param(0, (0, common_1.Param)('cailId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LessonsLearnedController.prototype, "fromCail", null);
exports.LessonsLearnedController = LessonsLearnedController = __decorate([
    (0, common_1.Controller)(`${routes_1.API_V1_PREFIX}/pm/safety-intelligence/lessons-learned`),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...PM_ROLES),
    __metadata("design:paramtypes", [lessons_learned_service_1.LessonsLearnedService,
        cail_scope_service_1.CailScopeService])
], LessonsLearnedController);
//# sourceMappingURL=lessons-learned.controller.js.map