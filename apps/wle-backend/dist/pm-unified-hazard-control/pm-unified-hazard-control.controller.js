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
exports.PmUnifiedHazardControlController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const routes_1 = require("../config/routes");
const pm_unified_hazard_control_service_1 = require("./pm-unified-hazard-control.service");
const pm_unified_hazard_control_cail_service_1 = require("./pm-unified-hazard-control-cail.service");
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
let PmUnifiedHazardControlController = class PmUnifiedHazardControlController {
    constructor(hc, cail) {
        this.hc = hc;
        this.cail = cail;
    }
    dashboard(companyId, projectId) {
        return this.hc.getDashboard({
            companyId: parseInt(companyId, 10),
            projectId: projectId ? parseInt(projectId, 10) : undefined,
        });
    }
    analytics(companyId, projectId) {
        return this.hc.getAnalytics({
            companyId: parseInt(companyId, 10),
            projectId: projectId ? parseInt(projectId, 10) : undefined,
        });
    }
    getHazardById(id) {
        return this.hc.getHazard(id);
    }
    getControlById(id) {
        return this.hc.getControl(id);
    }
    listHazards(companyId, projectId, scopeLevel, status) {
        return this.hc.listHazards({
            companyId: parseInt(companyId, 10),
            projectId: projectId ? parseInt(projectId, 10) : undefined,
            scopeLevel,
            status,
        });
    }
    createHazard(companyId, body, req) {
        return this.hc.createHazard(parseInt(companyId, 10), body, req.user.id);
    }
    publishHazard(id, req) {
        return this.hc.publishHazard(id, req.user.id);
    }
    scoreSif(id) {
        return this.hc.scoreHazardSifHeca(id);
    }
    energyWheel(id) {
        return this.hc.getEnergyWheel(id);
    }
    suggestControls(id) {
        return this.hc.suggestControlsForHazard(id);
    }
    applySuggestions(id, req) {
        return this.hc.applySuggestedControls(id, req.user.id);
    }
    listControls(companyId, projectId, controlType) {
        return this.hc.listControls({
            companyId: parseInt(companyId, 10),
            projectId: projectId ? parseInt(projectId, 10) : undefined,
            controlType,
        });
    }
    createControl(companyId, body, req) {
        return this.hc.createControl(parseInt(companyId, 10), body, req.user.id);
    }
    publishControl(id, req) {
        return this.hc.publishControl(id, req.user.id);
    }
    linkMapping(body, req) {
        return this.hc.linkHazardControl(body.hazardId, body.controlId, body.effectivenessScore, req.user.id);
    }
    ingest(companyId, source, projectId, req) {
        return this.hc.ingestBatch(parseInt(companyId, 10), source, projectId ? parseInt(projectId, 10) : undefined, req.user.id);
    }
    syncInheritance(body, req) {
        return this.hc.syncCompanyToProject(body.companyId, body.projectId, req.user.id);
    }
    enforcement(body) {
        return this.hc.enforcementGate(body);
    }
    recordExposure(workerId, hazardId, projectId) {
        return this.hc.recordWorkerExposure(parseInt(workerId, 10), hazardId, projectId ? parseInt(projectId, 10) : undefined);
    }
    addAttachment(body) {
        return this.hc.addAttachment(body);
    }
    offlineBundle(companyId, projectId) {
        return this.hc.buildOfflineBundle({
            companyId: parseInt(companyId, 10),
            projectId: projectId ? parseInt(projectId, 10) : undefined,
        });
    }
    offlineSyncUpload(companyId, projectId, body, req) {
        return this.hc.applyOfflineSync({
            companyId: parseInt(companyId, 10),
            projectId: projectId ? parseInt(projectId, 10) : undefined,
        }, body, req.user.id);
    }
    cailBundle(companyId, projectId) {
        return this.hc.getCailBundle({
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
};
exports.PmUnifiedHazardControlController = PmUnifiedHazardControlController;
__decorate([
    (0, common_1.Get)('dashboard'),
    __param(0, (0, common_1.Query)('companyId')),
    __param(1, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PmUnifiedHazardControlController.prototype, "dashboard", null);
__decorate([
    (0, common_1.Get)('analytics'),
    __param(0, (0, common_1.Query)('companyId')),
    __param(1, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PmUnifiedHazardControlController.prototype, "analytics", null);
__decorate([
    (0, common_1.Get)('hazards/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PmUnifiedHazardControlController.prototype, "getHazardById", null);
__decorate([
    (0, common_1.Get)('controls/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PmUnifiedHazardControlController.prototype, "getControlById", null);
__decorate([
    (0, common_1.Get)('hazards'),
    __param(0, (0, common_1.Query)('companyId')),
    __param(1, (0, common_1.Query)('projectId')),
    __param(2, (0, common_1.Query)('scopeLevel')),
    __param(3, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], PmUnifiedHazardControlController.prototype, "listHazards", null);
__decorate([
    (0, common_1.Post)('hazards'),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    __param(0, (0, common_1.Query)('companyId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], PmUnifiedHazardControlController.prototype, "createHazard", null);
__decorate([
    (0, common_1.Post)('hazards/:id/publish'),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PmUnifiedHazardControlController.prototype, "publishHazard", null);
__decorate([
    (0, common_1.Post)('hazards/:id/sif-heca'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PmUnifiedHazardControlController.prototype, "scoreSif", null);
__decorate([
    (0, common_1.Get)('hazards/:id/energy-wheel'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PmUnifiedHazardControlController.prototype, "energyWheel", null);
__decorate([
    (0, common_1.Get)('hazards/:id/suggest-controls'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PmUnifiedHazardControlController.prototype, "suggestControls", null);
__decorate([
    (0, common_1.Post)('hazards/:id/apply-suggestions'),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PmUnifiedHazardControlController.prototype, "applySuggestions", null);
__decorate([
    (0, common_1.Get)('controls'),
    __param(0, (0, common_1.Query)('companyId')),
    __param(1, (0, common_1.Query)('projectId')),
    __param(2, (0, common_1.Query)('controlType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], PmUnifiedHazardControlController.prototype, "listControls", null);
__decorate([
    (0, common_1.Post)('controls'),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    __param(0, (0, common_1.Query)('companyId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], PmUnifiedHazardControlController.prototype, "createControl", null);
__decorate([
    (0, common_1.Post)('controls/:id/publish'),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PmUnifiedHazardControlController.prototype, "publishControl", null);
__decorate([
    (0, common_1.Post)('mapping'),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PmUnifiedHazardControlController.prototype, "linkMapping", null);
__decorate([
    (0, common_1.Post)('ingest'),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    __param(0, (0, common_1.Query)('companyId')),
    __param(1, (0, common_1.Query)('source')),
    __param(2, (0, common_1.Query)('projectId')),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", void 0)
], PmUnifiedHazardControlController.prototype, "ingest", null);
__decorate([
    (0, common_1.Post)('sync/company-to-project'),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PmUnifiedHazardControlController.prototype, "syncInheritance", null);
__decorate([
    (0, common_1.Post)('enforcement/evaluate'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PmUnifiedHazardControlController.prototype, "enforcement", null);
__decorate([
    (0, common_1.Post)('workers/:workerId/exposure/:hazardId'),
    __param(0, (0, common_1.Param)('workerId')),
    __param(1, (0, common_1.Param)('hazardId')),
    __param(2, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], PmUnifiedHazardControlController.prototype, "recordExposure", null);
__decorate([
    (0, common_1.Post)('attachments'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PmUnifiedHazardControlController.prototype, "addAttachment", null);
__decorate([
    (0, common_1.Get)('sync'),
    __param(0, (0, common_1.Query)('companyId')),
    __param(1, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PmUnifiedHazardControlController.prototype, "offlineBundle", null);
__decorate([
    (0, common_1.Post)('sync'),
    __param(0, (0, common_1.Query)('companyId')),
    __param(1, (0, common_1.Query)('projectId')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", void 0)
], PmUnifiedHazardControlController.prototype, "offlineSyncUpload", null);
__decorate([
    (0, common_1.Get)('cail/bundle'),
    __param(0, (0, common_1.Query)('companyId')),
    __param(1, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PmUnifiedHazardControlController.prototype, "cailBundle", null);
__decorate([
    (0, common_1.Get)('cail/insights'),
    __param(0, (0, common_1.Query)('companyId')),
    __param(1, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PmUnifiedHazardControlController.prototype, "cailInsights", null);
exports.PmUnifiedHazardControlController = PmUnifiedHazardControlController = __decorate([
    (0, common_1.Controller)(`${routes_1.API_V1_PREFIX}/pm/unified-hazard-control`),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...PM_ROLES),
    __metadata("design:paramtypes", [pm_unified_hazard_control_service_1.PmUnifiedHazardControlService,
        pm_unified_hazard_control_cail_service_1.PmUnifiedHazardControlCailService])
], PmUnifiedHazardControlController);
//# sourceMappingURL=pm-unified-hazard-control.controller.js.map