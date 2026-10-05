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
exports.PmCorrectiveActionsController = void 0;
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const routes_1 = require("../config/routes");
const pm_corrective_actions_service_1 = require("./pm-corrective-actions.service");
const pm_capa_auto_generate_service_1 = require("./pm-capa-auto-generate.service");
const pm_capa_intelligence_service_1 = require("./pm-capa-intelligence.service");
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
let PmCorrectiveActionsController = class PmCorrectiveActionsController {
    constructor(capa, auto, intelligence) {
        this.capa = capa;
        this.auto = auto;
        this.intelligence = intelligence;
    }
    list(projectId, companyId, status, overdueOnly) {
        return this.capa.list({
            projectId: projectId ? parseInt(projectId, 10) : undefined,
            companyId: companyId ? parseInt(companyId, 10) : undefined,
            status,
            overdueOnly: overdueOnly === 'true',
        });
    }
    analytics(projectId) {
        return this.capa.analytics(parseInt(projectId, 10));
    }
    forecast(projectId) {
        return this.intelligence.projectForecast(parseInt(projectId, 10));
    }
    workerAccess(workerId, projectId) {
        return this.capa.workerAccessCheck(parseInt(workerId, 10), parseInt(projectId, 10));
    }
    sync(req, body) {
        var _a, _b;
        return this.capa.syncOffline(Object.assign(Object.assign({}, body), { createdByUserId: (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) !== null && _b !== void 0 ? _b : 0 }));
    }
    runEscalations(projectId) {
        return this.capa.runEscalations(parseInt(projectId, 10));
    }
    autoSync(projectId, req) {
        var _a, _b;
        return this.auto.syncOpenFromModules(parseInt(projectId, 10), (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) !== null && _b !== void 0 ? _b : 0);
    }
    autoJha(id, req) {
        var _a, _b;
        return this.auto.fromJhaFlha(id, (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) !== null && _b !== void 0 ? _b : 0);
    }
    autoDeficiency(id, req) {
        var _a, _b;
        return this.auto.fromInspectionDeficiency(id, (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) !== null && _b !== void 0 ? _b : 0);
    }
    autoSif(id, req) {
        var _a, _b;
        return this.auto.fromSifHecaEvent(id, (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) !== null && _b !== void 0 ? _b : 0);
    }
    get(id) {
        return this.capa.get(id);
    }
    create(req, body) {
        var _a, _b;
        return this.capa.create(Object.assign(Object.assign({}, body), { createdByUserId: (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) !== null && _b !== void 0 ? _b : 0 }));
    }
    assign(id, req, body) {
        var _a;
        return this.capa.assign(id, body, (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId);
    }
    delegate(id, req, body) {
        var _a, _b;
        return this.capa.delegate(id, body.toUserId, (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) !== null && _b !== void 0 ? _b : 0);
    }
    inProgress(id, req) {
        var _a;
        return this.capa.markInProgress(id, (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId);
    }
    submitVerification(id, req) {
        var _a, _b;
        return this.capa.submitForVerification(id, (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) !== null && _b !== void 0 ? _b : 0);
    }
    addAttachment(id, req, body) {
        var _a;
        return this.capa.addAttachment(id, body, (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId);
    }
    addSignature(id, req, body) {
        var _a;
        return this.capa.addSignature(id, body, (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId);
    }
    verify(id, req, body) {
        var _a, _b;
        return this.capa.verify(id, body, (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) !== null && _b !== void 0 ? _b : 0);
    }
};
exports.PmCorrectiveActionsController = PmCorrectiveActionsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('projectId')),
    __param(1, (0, common_1.Query)('companyId')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('overdueOnly')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], PmCorrectiveActionsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('analytics/project/:projectId'),
    __param(0, (0, common_1.Param)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PmCorrectiveActionsController.prototype, "analytics", null);
__decorate([
    (0, common_1.Get)('intelligence/project/:projectId'),
    __param(0, (0, common_1.Param)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PmCorrectiveActionsController.prototype, "forecast", null);
__decorate([
    (0, common_1.Get)('access/worker'),
    __param(0, (0, common_1.Query)('workerId')),
    __param(1, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PmCorrectiveActionsController.prototype, "workerAccess", null);
__decorate([
    (0, common_1.Post)('sync'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, throttler_1.Throttle)(30, 60),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PmCorrectiveActionsController.prototype, "sync", null);
__decorate([
    (0, common_1.Post)('escalations/run'),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    __param(0, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PmCorrectiveActionsController.prototype, "runEscalations", null);
__decorate([
    (0, common_1.Post)('auto/sync-project'),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    __param(0, (0, common_1.Query)('projectId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PmCorrectiveActionsController.prototype, "autoSync", null);
__decorate([
    (0, common_1.Post)('auto/jha-flha/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PmCorrectiveActionsController.prototype, "autoJha", null);
__decorate([
    (0, common_1.Post)('auto/inspection-deficiency/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PmCorrectiveActionsController.prototype, "autoDeficiency", null);
__decorate([
    (0, common_1.Post)('auto/sif-heca/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PmCorrectiveActionsController.prototype, "autoSif", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PmCorrectiveActionsController.prototype, "get", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PmCorrectiveActionsController.prototype, "create", null);
__decorate([
    (0, common_1.Post)(':id/assign'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], PmCorrectiveActionsController.prototype, "assign", null);
__decorate([
    (0, common_1.Post)(':id/delegate'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], PmCorrectiveActionsController.prototype, "delegate", null);
__decorate([
    (0, common_1.Put)(':id/in-progress'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PmCorrectiveActionsController.prototype, "inProgress", null);
__decorate([
    (0, common_1.Post)(':id/submit-verification'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PmCorrectiveActionsController.prototype, "submitVerification", null);
__decorate([
    (0, common_1.Post)(':id/attachments'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], PmCorrectiveActionsController.prototype, "addAttachment", null);
__decorate([
    (0, common_1.Post)(':id/signatures'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], PmCorrectiveActionsController.prototype, "addSignature", null);
__decorate([
    (0, common_1.Post)(':id/verify'),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], PmCorrectiveActionsController.prototype, "verify", null);
exports.PmCorrectiveActionsController = PmCorrectiveActionsController = __decorate([
    (0, common_1.Controller)(`${routes_1.API_V1_PREFIX}/pm/corrective-actions`),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...PM_ROLES),
    __metadata("design:paramtypes", [pm_corrective_actions_service_1.PmCorrectiveActionsService,
        pm_capa_auto_generate_service_1.PmCapaAutoGenerateService,
        pm_capa_intelligence_service_1.PmCapaIntelligenceService])
], PmCorrectiveActionsController);
//# sourceMappingURL=pm-corrective-actions.controller.js.map