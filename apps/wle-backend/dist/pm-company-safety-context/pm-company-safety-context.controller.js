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
exports.PmCompanySafetyContextController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const routes_1 = require("../config/routes");
const pm_company_safety_context_service_1 = require("./pm-company-safety-context.service");
const pm_company_safety_cail_intelligence_service_1 = require("./pm-company-safety-cail-intelligence.service");
const PM_ROLES = [
    client_1.UserRole.SUPERVISOR,
    client_1.UserRole.ADMIN,
    client_1.UserRole.SUPER_ADMIN,
    client_1.UserRole.COMPANY_ADMIN,
    client_1.UserRole.PROJECT_MANAGER,
];
let PmCompanySafetyContextController = class PmCompanySafetyContextController {
    constructor(company, cail) {
        this.company = company;
        this.cail = cail;
    }
    getContext(companyId) {
        return this.company.getCompanyContext(parseInt(companyId, 10));
    }
    getProfile(companyId) {
        return this.company.getOrCreateProfile(parseInt(companyId, 10));
    }
    autoGenerate(companyId, req) {
        return this.company.autoGenerateProfile(parseInt(companyId, 10), req.user.id);
    }
    publishProfile(companyId, req) {
        return this.company.publishProfile(parseInt(companyId, 10), req.user.id);
    }
    syncProjects(companyId, req) {
        return this.company.syncPublishedAssetsToProjects(parseInt(companyId, 10), req.user.id);
    }
    listHazards(companyId, status) {
        return this.company.listHazards(parseInt(companyId, 10), status);
    }
    createHazard(companyId, body, req) {
        return this.company.createHazard(parseInt(companyId, 10), body, req.user.id);
    }
    publishHazard(hazardId, req) {
        return this.company.publishHazard(hazardId, req.user.id);
    }
    listControls(companyId) {
        return this.company.listControls(parseInt(companyId, 10));
    }
    createControl(companyId, body, req) {
        return this.company.createControl(parseInt(companyId, 10), body, req.user.id);
    }
    publishControl(controlId, req) {
        return this.company.publishControl(controlId, req.user.id);
    }
    listTraining(companyId) {
        return this.company.listTrainingMatrix(parseInt(companyId, 10));
    }
    upsertTraining(companyId, body, req) {
        return this.company.upsertTrainingRule(parseInt(companyId, 10), body, req.user.id);
    }
    listPolicies(companyId) {
        return this.company.listPolicies(parseInt(companyId, 10));
    }
    createPolicy(companyId, body, req) {
        return this.company.createPolicy(parseInt(companyId, 10), body, req.user.id);
    }
    publishPolicy(policyId, req) {
        return this.company.publishPolicy(policyId, req.user.id);
    }
    listSds(companyId) {
        return this.company.listSds(parseInt(companyId, 10));
    }
    importSds(companyId) {
        return this.company.importSdsFromLegacy(parseInt(companyId, 10));
    }
    listEmergency(companyId) {
        return this.company.listEmergencyPlans(parseInt(companyId, 10));
    }
    importEmergency(companyId) {
        return this.company.importEmergencyFromLegacy(parseInt(companyId, 10));
    }
    listEquipmentRules(companyId) {
        return this.company.listEquipmentRules(parseInt(companyId, 10));
    }
    listZones(companyId) {
        return this.company.listZoneTemplates(parseInt(companyId, 10));
    }
    listOverrides(companyId) {
        return this.company.listOverrides(parseInt(companyId, 10));
    }
    createOverride(companyId, body, req) {
        return this.company.createOverride(parseInt(companyId, 10), body, req.user.id);
    }
    evaluateEnforcement(body) {
        return this.company.enforcementGate(body.workerId, body.workerChecks);
    }
    analytics(companyId) {
        return this.company.analytics(parseInt(companyId, 10));
    }
    cailInsights(companyId) {
        return this.cail.companyInsights(parseInt(companyId, 10));
    }
    offlineBundle(companyId) {
        return this.company.buildOfflineBundle(parseInt(companyId, 10));
    }
    offlineSyncUpload(companyId, body, req) {
        return this.company.applyOfflineSync(parseInt(companyId, 10), body, req.user.id);
    }
    safetyScore(companyId) {
        return this.company.getCompanySafetyScore(parseInt(companyId, 10));
    }
    validateReadiness(companyId) {
        return this.company.validatePublishReadiness(parseInt(companyId, 10));
    }
    upsertEquipment(companyId, body, req) {
        return this.company.upsertEquipmentRule(parseInt(companyId, 10), body, req.user.id);
    }
    upsertZone(companyId, body, req) {
        return this.company.upsertZoneTemplate(parseInt(companyId, 10), body, req.user.id);
    }
    createSds(companyId, body, req) {
        return this.company.createSds(parseInt(companyId, 10), body, req.user.id);
    }
    createEmergency(companyId, body, req) {
        return this.company.createEmergencyPlan(parseInt(companyId, 10), body, req.user.id);
    }
};
exports.PmCompanySafetyContextController = PmCompanySafetyContextController;
__decorate([
    (0, common_1.Get)('company/:companyId'),
    __param(0, (0, common_1.Param)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PmCompanySafetyContextController.prototype, "getContext", null);
__decorate([
    (0, common_1.Get)('profile/:companyId'),
    __param(0, (0, common_1.Param)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PmCompanySafetyContextController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Post)('profile/:companyId/auto-generate'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PmCompanySafetyContextController.prototype, "autoGenerate", null);
__decorate([
    (0, common_1.Post)('profile/:companyId/publish'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PmCompanySafetyContextController.prototype, "publishProfile", null);
__decorate([
    (0, common_1.Post)('profile/:companyId/sync-projects'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PmCompanySafetyContextController.prototype, "syncProjects", null);
__decorate([
    (0, common_1.Get)('hazards/:companyId'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PmCompanySafetyContextController.prototype, "listHazards", null);
__decorate([
    (0, common_1.Post)('hazards/:companyId'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], PmCompanySafetyContextController.prototype, "createHazard", null);
__decorate([
    (0, common_1.Post)('hazards/:hazardId/publish'),
    __param(0, (0, common_1.Param)('hazardId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PmCompanySafetyContextController.prototype, "publishHazard", null);
__decorate([
    (0, common_1.Get)('controls/:companyId'),
    __param(0, (0, common_1.Param)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PmCompanySafetyContextController.prototype, "listControls", null);
__decorate([
    (0, common_1.Post)('controls/:companyId'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], PmCompanySafetyContextController.prototype, "createControl", null);
__decorate([
    (0, common_1.Post)('controls/:controlId/publish'),
    __param(0, (0, common_1.Param)('controlId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PmCompanySafetyContextController.prototype, "publishControl", null);
__decorate([
    (0, common_1.Get)('training-matrix/:companyId'),
    __param(0, (0, common_1.Param)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PmCompanySafetyContextController.prototype, "listTraining", null);
__decorate([
    (0, common_1.Put)('training-matrix/:companyId'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], PmCompanySafetyContextController.prototype, "upsertTraining", null);
__decorate([
    (0, common_1.Get)('policies/:companyId'),
    __param(0, (0, common_1.Param)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PmCompanySafetyContextController.prototype, "listPolicies", null);
__decorate([
    (0, common_1.Post)('policies/:companyId'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], PmCompanySafetyContextController.prototype, "createPolicy", null);
__decorate([
    (0, common_1.Post)('policies/:policyId/publish'),
    __param(0, (0, common_1.Param)('policyId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PmCompanySafetyContextController.prototype, "publishPolicy", null);
__decorate([
    (0, common_1.Get)('sds/:companyId'),
    __param(0, (0, common_1.Param)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PmCompanySafetyContextController.prototype, "listSds", null);
__decorate([
    (0, common_1.Post)('sds/:companyId/import-legacy'),
    __param(0, (0, common_1.Param)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PmCompanySafetyContextController.prototype, "importSds", null);
__decorate([
    (0, common_1.Get)('emergency-plans/:companyId'),
    __param(0, (0, common_1.Param)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PmCompanySafetyContextController.prototype, "listEmergency", null);
__decorate([
    (0, common_1.Post)('emergency-plans/:companyId/import-legacy'),
    __param(0, (0, common_1.Param)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PmCompanySafetyContextController.prototype, "importEmergency", null);
__decorate([
    (0, common_1.Get)('equipment-rules/:companyId'),
    __param(0, (0, common_1.Param)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PmCompanySafetyContextController.prototype, "listEquipmentRules", null);
__decorate([
    (0, common_1.Get)('zone-templates/:companyId'),
    __param(0, (0, common_1.Param)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PmCompanySafetyContextController.prototype, "listZones", null);
__decorate([
    (0, common_1.Get)('overrides/:companyId'),
    __param(0, (0, common_1.Param)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PmCompanySafetyContextController.prototype, "listOverrides", null);
__decorate([
    (0, common_1.Post)('overrides/:companyId'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], PmCompanySafetyContextController.prototype, "createOverride", null);
__decorate([
    (0, common_1.Post)('enforcement/evaluate'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PmCompanySafetyContextController.prototype, "evaluateEnforcement", null);
__decorate([
    (0, common_1.Get)('analytics/:companyId'),
    __param(0, (0, common_1.Param)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PmCompanySafetyContextController.prototype, "analytics", null);
__decorate([
    (0, common_1.Get)('cail/insights/:companyId'),
    __param(0, (0, common_1.Param)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PmCompanySafetyContextController.prototype, "cailInsights", null);
__decorate([
    (0, common_1.Get)('sync/company/:companyId'),
    __param(0, (0, common_1.Param)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PmCompanySafetyContextController.prototype, "offlineBundle", null);
__decorate([
    (0, common_1.Post)('sync/company/:companyId'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], PmCompanySafetyContextController.prototype, "offlineSyncUpload", null);
__decorate([
    (0, common_1.Get)('score/:companyId'),
    __param(0, (0, common_1.Param)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PmCompanySafetyContextController.prototype, "safetyScore", null);
__decorate([
    (0, common_1.Get)('validate/:companyId'),
    __param(0, (0, common_1.Param)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PmCompanySafetyContextController.prototype, "validateReadiness", null);
__decorate([
    (0, common_1.Put)('equipment-rules/:companyId'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], PmCompanySafetyContextController.prototype, "upsertEquipment", null);
__decorate([
    (0, common_1.Put)('zone-templates/:companyId'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], PmCompanySafetyContextController.prototype, "upsertZone", null);
__decorate([
    (0, common_1.Post)('sds/:companyId'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], PmCompanySafetyContextController.prototype, "createSds", null);
__decorate([
    (0, common_1.Post)('emergency-plans/:companyId'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], PmCompanySafetyContextController.prototype, "createEmergency", null);
exports.PmCompanySafetyContextController = PmCompanySafetyContextController = __decorate([
    (0, common_1.Controller)(`${routes_1.API_V1_PREFIX}/pm/company-safety-context`),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...PM_ROLES),
    __metadata("design:paramtypes", [pm_company_safety_context_service_1.PmCompanySafetyContextService,
        pm_company_safety_cail_intelligence_service_1.PmCompanySafetyCailIntelligenceService])
], PmCompanySafetyContextController);
//# sourceMappingURL=pm-company-safety-context.controller.js.map