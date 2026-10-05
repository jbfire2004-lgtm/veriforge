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
exports.BboController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
const roles_guard_1 = require("../../auth/roles.guard");
const roles_decorator_1 = require("../../auth/roles.decorator");
const routes_1 = require("../../config/routes");
const cail_scope_service_1 = require("../cail/cail-scope.service");
const bbo_service_1 = require("./bbo.service");
const create_bbo_dto_1 = require("../dto/create-bbo.dto");
const PM_ROLES = [
    client_1.UserRole.WORKER,
    client_1.UserRole.SUPERVISOR,
    client_1.UserRole.ADMIN,
    client_1.UserRole.SUPER_ADMIN,
    client_1.UserRole.COMPANY_ADMIN,
    client_1.UserRole.PROJECT_MANAGER,
];
let BboController = class BboController {
    constructor(bbo, scope) {
        this.bbo = bbo;
        this.scope = scope;
    }
    async list(req, projectId, polarity, behaviorCategory) {
        const actor = await this.scope.resolveActor(req.user.id, req.user.role);
        return this.bbo.list(actor, {
            projectId: projectId ? parseInt(projectId, 10) : undefined,
            polarity,
            behaviorCategory,
        });
    }
    async metrics(projectId) {
        return this.bbo.getMetrics(parseInt(projectId, 10));
    }
    async create(dto, req) {
        const actor = await this.scope.resolveActor(req.user.id, req.user.role);
        return this.bbo.create(dto, actor);
    }
};
exports.BboController = BboController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('projectId')),
    __param(2, (0, common_1.Query)('polarity')),
    __param(3, (0, common_1.Query)('behaviorCategory')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], BboController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('metrics'),
    __param(0, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BboController.prototype, "metrics", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_bbo_dto_1.CreateBboDto, Object]),
    __metadata("design:returntype", Promise)
], BboController.prototype, "create", null);
exports.BboController = BboController = __decorate([
    (0, common_1.Controller)(`${routes_1.API_V1_PREFIX}/pm/safety-intelligence/bbo`),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...PM_ROLES),
    __metadata("design:paramtypes", [bbo_service_1.BboService,
        cail_scope_service_1.CailScopeService])
], BboController);
//# sourceMappingURL=bbo.controller.js.map