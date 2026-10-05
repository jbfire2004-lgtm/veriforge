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
exports.PmCorrectiveActionSpecController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const routes_1 = require("../config/routes");
const pm_unified_corrective_action_service_1 = require("./pm-unified-corrective-action.service");
const PM_ROLES = [
    client_1.UserRole.WORKER,
    client_1.UserRole.SUPERVISOR,
    client_1.UserRole.ADMIN,
    client_1.UserRole.SUPER_ADMIN,
    client_1.UserRole.COMPANY_ADMIN,
    client_1.UserRole.PROJECT_MANAGER,
];
const SUPERVISOR_ROLES = [
    client_1.UserRole.SUPERVISOR,
    client_1.UserRole.ADMIN,
    client_1.UserRole.SUPER_ADMIN,
    client_1.UserRole.COMPANY_ADMIN,
    client_1.UserRole.PROJECT_MANAGER,
];
let PmCorrectiveActionSpecController = class PmCorrectiveActionSpecController {
    constructor(unified) {
        this.unified = unified;
    }
    create(body, req) {
        var _a;
        return this.unified.createUnified(Object.assign(Object.assign({}, body), { createdByUserId: (_a = body.createdByUserId) !== null && _a !== void 0 ? _a : req.user.id }), req.user.id);
    }
    assign(body, req) {
        return this.unified.assign(body.actionId, { userId: body.userId, workerId: body.workerId, role: body.role }, req.user.id);
    }
    escalate(body) {
        return this.unified.runEscalationSweep(body.projectId);
    }
    async verify(body, req) {
        const result = await this.unified.verify(body.actionId, { outcome: body.outcome, role: body.role, notes: body.notes }, req.user.id);
        if (body.outcome === 'approve') {
            await this.unified.closeDeficiencyOnVerify(body.actionId);
        }
        return result;
    }
    offlineSync(body, req) {
        return this.unified.applyOfflineSync(body.companyId, body.projectId, {
            actions: body.actions,
            verifications: body.verifications,
            attachments: body.attachments,
        }, req.user.id);
    }
    get(id) {
        return this.unified.getAction(id);
    }
};
exports.PmCorrectiveActionSpecController = PmCorrectiveActionSpecController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PmCorrectiveActionSpecController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('assign'),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PmCorrectiveActionSpecController.prototype, "assign", null);
__decorate([
    (0, common_1.Post)('escalate'),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PmCorrectiveActionSpecController.prototype, "escalate", null);
__decorate([
    (0, common_1.Post)('verify'),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PmCorrectiveActionSpecController.prototype, "verify", null);
__decorate([
    (0, common_1.Post)('offline/sync'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PmCorrectiveActionSpecController.prototype, "offlineSync", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PmCorrectiveActionSpecController.prototype, "get", null);
exports.PmCorrectiveActionSpecController = PmCorrectiveActionSpecController = __decorate([
    (0, common_1.Controller)(`${routes_1.API_V1_PREFIX}/pm/corrective-action`),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...PM_ROLES),
    __metadata("design:paramtypes", [pm_unified_corrective_action_service_1.PmUnifiedCorrectiveActionService])
], PmCorrectiveActionSpecController);
//# sourceMappingURL=pm-corrective-action.controller.js.map