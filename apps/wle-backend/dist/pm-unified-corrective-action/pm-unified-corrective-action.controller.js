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
exports.PmUnifiedCorrectiveActionController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const routes_1 = require("../config/routes");
const pm_unified_corrective_action_service_1 = require("./pm-unified-corrective-action.service");
const pm_unified_corrective_action_cail_service_1 = require("./pm-unified-corrective-action-cail.service");
const pm_corrective_actions_service_1 = require("../pm-corrective-actions/pm-corrective-actions.service");
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
let PmUnifiedCorrectiveActionController = class PmUnifiedCorrectiveActionController {
    constructor(unified, cail, capa) {
        this.unified = unified;
        this.cail = cail;
        this.capa = capa;
    }
    dashboard(companyId, projectId) {
        return this.unified.getDashboard({
            companyId: parseInt(companyId, 10),
            projectId: projectId ? parseInt(projectId, 10) : undefined,
        });
    }
    analytics(companyId, projectId) {
        return this.unified.getAnalytics({
            companyId: parseInt(companyId, 10),
            projectId: projectId ? parseInt(projectId, 10) : undefined,
        });
    }
    analyticsTrends(companyId, projectId) {
        return this.unified.getAnalyticsTrends({
            companyId: parseInt(companyId, 10),
            projectId: projectId ? parseInt(projectId, 10) : undefined,
        });
    }
    workerActions(workerId, projectId) {
        return this.unified.workerCapaList(parseInt(workerId, 10), projectId ? parseInt(projectId, 10) : undefined);
    }
    equipmentActions(equipmentId, projectId) {
        return this.unified.equipmentCapaList(parseInt(equipmentId, 10), projectId ? parseInt(projectId, 10) : undefined);
    }
    jhaApprovalGate(jhaId) {
        return this.unified.jhaApprovalGate(jhaId);
    }
    taskStartGate(projectId, workerId) {
        return this.unified.pmTaskStartGate(parseInt(projectId, 10), workerId ? parseInt(workerId, 10) : undefined);
    }
    list(companyId, projectId, overdueOnly) {
        return this.capa.list({
            companyId: companyId ? parseInt(companyId, 10) : undefined,
            projectId: projectId ? parseInt(projectId, 10) : undefined,
            overdueOnly: overdueOnly === 'true',
        });
    }
    offlineBundle(companyId, projectId) {
        return this.unified.buildOfflineBundle({
            companyId: parseInt(companyId, 10),
            projectId: projectId ? parseInt(projectId, 10) : undefined,
        });
    }
    cailInsights(companyId, projectId) {
        return this.cail.insights({
            companyId: parseInt(companyId, 10),
            projectId: projectId ? parseInt(projectId, 10) : undefined,
        });
    }
    cailBundle(companyId, projectId) {
        return this.unified.getCailBundle({
            companyId: parseInt(companyId, 10),
            projectId: projectId ? parseInt(projectId, 10) : undefined,
        });
    }
    applyOfflineSync(body, req) {
        return this.unified.applyOfflineSync(body.companyId, body.projectId, { actions: body.actions, clientSyncId: body.clientSyncId }, req.user.id);
    }
    revokeExpiredOverrides() {
        return this.unified.revokeExpiredOverrides();
    }
    get(id) {
        return this.capa.get(id);
    }
    update(id, body, req) {
        return this.unified.updateUnified(id, body, req.user.id);
    }
    create(body, req) {
        var _a;
        return this.unified.createUnified(Object.assign(Object.assign({}, body), { createdByUserId: (_a = body.createdByUserId) !== null && _a !== void 0 ? _a : req.user.id }), req.user.id);
    }
    publish(id, req) {
        return this.unified.publishAction(id, req.user.id);
    }
    autoAssign(id, req) {
        return this.unified.autoAssign(id, req.user.id);
    }
    submit(id, req) {
        return this.unified.submitForVerification(id, req.user.id);
    }
    inProgress(id, req) {
        return this.unified.markInProgress(id, req.user.id);
    }
    signature(id, body, req) {
        return this.unified.addSignature(id, body, req.user.id);
    }
    assign(id, body, req) {
        return this.unified.assign(id, body, req.user.id);
    }
    async verify(id, body, req) {
        const result = await this.unified.verify(id, body, req.user.id);
        if (body.outcome === 'approve') {
            await this.unified.closeDeficiencyOnVerify(id);
        }
        return result;
    }
    addLink(id, body) {
        return this.unified.addLink(id, body.linkType, body.linkedId);
    }
    generateBatch(body, req) {
        return this.unified.generateFromAllModules(body.projectId, req.user.id);
    }
    generateSource(body, req) {
        return this.unified.generateFromSource(body.source, body.sourceId, req.user.id, body);
    }
    escalationSweep(body) {
        return this.unified.runEscalationSweep(body.projectId);
    }
    enforcement(body) {
        return this.unified.unifiedEnforcement(body);
    }
    createOverride(body, req) {
        return this.unified.createOverride(body, req.user.id);
    }
    addAttachment(body, req) {
        return this.capa.addAttachment(body.actionId, body, req.user.id);
    }
};
exports.PmUnifiedCorrectiveActionController = PmUnifiedCorrectiveActionController;
__decorate([
    (0, common_1.Get)('dashboard'),
    __param(0, (0, common_1.Query)('companyId')),
    __param(1, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PmUnifiedCorrectiveActionController.prototype, "dashboard", null);
__decorate([
    (0, common_1.Get)('analytics'),
    __param(0, (0, common_1.Query)('companyId')),
    __param(1, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PmUnifiedCorrectiveActionController.prototype, "analytics", null);
__decorate([
    (0, common_1.Get)('analytics/trends'),
    __param(0, (0, common_1.Query)('companyId')),
    __param(1, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PmUnifiedCorrectiveActionController.prototype, "analyticsTrends", null);
__decorate([
    (0, common_1.Get)('workers/:workerId/actions'),
    __param(0, (0, common_1.Param)('workerId')),
    __param(1, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PmUnifiedCorrectiveActionController.prototype, "workerActions", null);
__decorate([
    (0, common_1.Get)('equipment/:equipmentId/actions'),
    __param(0, (0, common_1.Param)('equipmentId')),
    __param(1, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PmUnifiedCorrectiveActionController.prototype, "equipmentActions", null);
__decorate([
    (0, common_1.Get)('jha/:jhaId/approval-gate'),
    __param(0, (0, common_1.Param)('jhaId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PmUnifiedCorrectiveActionController.prototype, "jhaApprovalGate", null);
__decorate([
    (0, common_1.Get)('projects/:projectId/task-gate'),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Query)('workerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PmUnifiedCorrectiveActionController.prototype, "taskStartGate", null);
__decorate([
    (0, common_1.Get)('list'),
    __param(0, (0, common_1.Query)('companyId')),
    __param(1, (0, common_1.Query)('projectId')),
    __param(2, (0, common_1.Query)('overdueOnly')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], PmUnifiedCorrectiveActionController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('sync/bundle'),
    __param(0, (0, common_1.Query)('companyId')),
    __param(1, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PmUnifiedCorrectiveActionController.prototype, "offlineBundle", null);
__decorate([
    (0, common_1.Get)('cail/insights'),
    __param(0, (0, common_1.Query)('companyId')),
    __param(1, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PmUnifiedCorrectiveActionController.prototype, "cailInsights", null);
__decorate([
    (0, common_1.Get)('cail/bundle'),
    __param(0, (0, common_1.Query)('companyId')),
    __param(1, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PmUnifiedCorrectiveActionController.prototype, "cailBundle", null);
__decorate([
    (0, common_1.Post)('sync/apply'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PmUnifiedCorrectiveActionController.prototype, "applyOfflineSync", null);
__decorate([
    (0, common_1.Post)('overrides/revoke-expired'),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PmUnifiedCorrectiveActionController.prototype, "revokeExpiredOverrides", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PmUnifiedCorrectiveActionController.prototype, "get", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], PmUnifiedCorrectiveActionController.prototype, "update", null);
__decorate([
    (0, common_1.Post)('create'),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PmUnifiedCorrectiveActionController.prototype, "create", null);
__decorate([
    (0, common_1.Post)(':id/publish'),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PmUnifiedCorrectiveActionController.prototype, "publish", null);
__decorate([
    (0, common_1.Post)(':id/auto-assign'),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PmUnifiedCorrectiveActionController.prototype, "autoAssign", null);
__decorate([
    (0, common_1.Post)(':id/submit'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PmUnifiedCorrectiveActionController.prototype, "submit", null);
__decorate([
    (0, common_1.Post)(':id/in-progress'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PmUnifiedCorrectiveActionController.prototype, "inProgress", null);
__decorate([
    (0, common_1.Post)(':id/signature'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], PmUnifiedCorrectiveActionController.prototype, "signature", null);
__decorate([
    (0, common_1.Put)(':id/assign'),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], PmUnifiedCorrectiveActionController.prototype, "assign", null);
__decorate([
    (0, common_1.Post)(':id/verify'),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], PmUnifiedCorrectiveActionController.prototype, "verify", null);
__decorate([
    (0, common_1.Post)(':id/links'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PmUnifiedCorrectiveActionController.prototype, "addLink", null);
__decorate([
    (0, common_1.Post)('generate/batch'),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PmUnifiedCorrectiveActionController.prototype, "generateBatch", null);
__decorate([
    (0, common_1.Post)('generate/source'),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PmUnifiedCorrectiveActionController.prototype, "generateSource", null);
__decorate([
    (0, common_1.Post)('escalation/sweep'),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PmUnifiedCorrectiveActionController.prototype, "escalationSweep", null);
__decorate([
    (0, common_1.Post)('enforcement/evaluate'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PmUnifiedCorrectiveActionController.prototype, "enforcement", null);
__decorate([
    (0, common_1.Post)('overrides'),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PmUnifiedCorrectiveActionController.prototype, "createOverride", null);
__decorate([
    (0, common_1.Post)('attachments'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PmUnifiedCorrectiveActionController.prototype, "addAttachment", null);
exports.PmUnifiedCorrectiveActionController = PmUnifiedCorrectiveActionController = __decorate([
    (0, common_1.Controller)(`${routes_1.API_V1_PREFIX}/pm/unified-corrective-action`),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...PM_ROLES),
    __metadata("design:paramtypes", [pm_unified_corrective_action_service_1.PmUnifiedCorrectiveActionService,
        pm_unified_corrective_action_cail_service_1.PmUnifiedCorrectiveActionCailService,
        pm_corrective_actions_service_1.PmCorrectiveActionsService])
], PmUnifiedCorrectiveActionController);
//# sourceMappingURL=pm-unified-corrective-action.controller.js.map