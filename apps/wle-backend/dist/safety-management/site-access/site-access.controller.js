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
exports.SiteAccessController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
const roles_guard_1 = require("../../auth/roles.guard");
const roles_decorator_1 = require("../../auth/roles.decorator");
const routes_1 = require("../../config/routes");
const site_access_service_1 = require("./site-access.service");
const PM_ROLES = [
    client_1.UserRole.WORKER,
    client_1.UserRole.SUPERVISOR,
    client_1.UserRole.ADMIN,
    client_1.UserRole.SUPER_ADMIN,
    client_1.UserRole.COMPANY_ADMIN,
    client_1.UserRole.PROJECT_MANAGER,
];
let SiteAccessController = class SiteAccessController {
    constructor(siteAccess) {
        this.siteAccess = siteAccess;
    }
    listRules(projectId) {
        return this.siteAccess.listRules(parseInt(projectId, 10));
    }
    upsertRule(body) {
        return this.siteAccess.upsertRule(body);
    }
    evaluate(body) {
        return this.siteAccess.evaluateAccess(body);
    }
    grant(req, body) {
        var _a;
        return this.siteAccess.grantAccess(Object.assign(Object.assign({}, body), { grantedByUserId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId }));
    }
    listGrants(projectId, workerId) {
        return this.siteAccess.listGrants(parseInt(projectId, 10), workerId ? parseInt(workerId, 10) : undefined);
    }
    revoke(id) {
        return this.siteAccess.revokeGrant(id);
    }
};
exports.SiteAccessController = SiteAccessController;
__decorate([
    (0, common_1.Get)('rules'),
    __param(0, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SiteAccessController.prototype, "listRules", null);
__decorate([
    (0, common_1.Post)('rules'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SiteAccessController.prototype, "upsertRule", null);
__decorate([
    (0, common_1.Post)('evaluate'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SiteAccessController.prototype, "evaluate", null);
__decorate([
    (0, common_1.Post)('grant'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SiteAccessController.prototype, "grant", null);
__decorate([
    (0, common_1.Get)('grants'),
    __param(0, (0, common_1.Query)('projectId')),
    __param(1, (0, common_1.Query)('workerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], SiteAccessController.prototype, "listGrants", null);
__decorate([
    (0, common_1.Post)('grants/:id/revoke'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SiteAccessController.prototype, "revoke", null);
exports.SiteAccessController = SiteAccessController = __decorate([
    (0, common_1.Controller)(`${routes_1.API_V1_PREFIX}/pm/safety/site-access`),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...PM_ROLES),
    __metadata("design:paramtypes", [site_access_service_1.SiteAccessService])
], SiteAccessController);
//# sourceMappingURL=site-access.controller.js.map