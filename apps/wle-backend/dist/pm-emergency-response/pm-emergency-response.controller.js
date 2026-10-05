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
exports.PmEmergencyResponseController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const routes_1 = require("../config/routes");
const pm_emergency_response_service_1 = require("./pm-emergency-response.service");
const pm_emergency_cail_intelligence_service_1 = require("./pm-emergency-cail-intelligence.service");
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
let PmEmergencyResponseController = class PmEmergencyResponseController {
    constructor(emergency, cail) {
        this.emergency = emergency;
        this.cail = cail;
    }
    listPlans(companyId, siteId, projectId) {
        return this.emergency.listPlans({
            companyId: parseInt(companyId, 10),
            siteId: siteId ? parseInt(siteId, 10) : undefined,
            projectId: projectId ? parseInt(projectId, 10) : undefined,
        });
    }
    createPlan(body, req) {
        return this.emergency.createPlan(body, req.user.id);
    }
    publishPlan(id, req) {
        return this.emergency.publishPlan(id, req.user.id);
    }
    acknowledgePlan(body) {
        return this.emergency.acknowledgePlan(body);
    }
    declareEvent(body, req) {
        return this.emergency.declareEmergency(body, req.user.id);
    }
    transitionEvent(id, status, req) {
        return this.emergency.transitionEvent(id, status, req.user.id);
    }
    addAttachment(id, body) {
        return this.emergency.addEventAttachment(id, body);
    }
    startMuster(body, req) {
        return this.emergency.startMuster(body, req.user.id);
    }
    activeMuster(siteId) {
        return this.emergency.getActiveMuster(parseInt(siteId, 10));
    }
    checkIn(id, body) {
        return this.emergency.musterCheckIn(Object.assign({ musterEventId: id }, body));
    }
    allClear(id, req) {
        return this.emergency.musterAllClear(id, req.user.id);
    }
    createEquipment(body) {
        return this.emergency.createEmergencyEquipment(body);
    }
    listEquipment(companyId, siteId) {
        return this.emergency.listEmergencyEquipment(parseInt(companyId, 10), siteId ? parseInt(siteId, 10) : undefined);
    }
    inspectEquipment(id, body, req) {
        return this.emergency.recordEquipmentInspection(id, body, req.user.id);
    }
    scanEquipment(companyId, req) {
        return this.emergency.scanEmergencyEquipment(parseInt(companyId, 10), req.user.id);
    }
    workerAccess(workerId, projectId) {
        return this.emergency.workerAccessCheck(parseInt(workerId, 10), parseInt(projectId, 10));
    }
    siteLock(projectId) {
        return this.emergency.isSiteLocked(parseInt(projectId, 10));
    }
    analytics(projectId) {
        return this.emergency.analytics(parseInt(projectId, 10));
    }
    intelligence(projectId) {
        return this.cail.projectInsights(parseInt(projectId, 10));
    }
    syncBundle(projectId) {
        return this.emergency.syncBundle(parseInt(projectId, 10));
    }
    applySync(projectId, body, req) {
        return this.emergency.applyOfflineSync(parseInt(projectId, 10), body, req.user.id);
    }
    station(companyId, siteId) {
        return this.emergency.stationPayload(parseInt(companyId, 10), parseInt(siteId, 10));
    }
};
exports.PmEmergencyResponseController = PmEmergencyResponseController;
__decorate([
    (0, common_1.Get)('plans'),
    __param(0, (0, common_1.Query)('companyId')),
    __param(1, (0, common_1.Query)('siteId')),
    __param(2, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], PmEmergencyResponseController.prototype, "listPlans", null);
__decorate([
    (0, common_1.Post)('plans'),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PmEmergencyResponseController.prototype, "createPlan", null);
__decorate([
    (0, common_1.Post)('plans/:id/publish'),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PmEmergencyResponseController.prototype, "publishPlan", null);
__decorate([
    (0, common_1.Post)('plans/acknowledge'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PmEmergencyResponseController.prototype, "acknowledgePlan", null);
__decorate([
    (0, common_1.Post)('events/declare'),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PmEmergencyResponseController.prototype, "declareEvent", null);
__decorate([
    (0, common_1.Put)('events/:id/status'),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('status')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], PmEmergencyResponseController.prototype, "transitionEvent", null);
__decorate([
    (0, common_1.Post)('events/:id/attachments'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PmEmergencyResponseController.prototype, "addAttachment", null);
__decorate([
    (0, common_1.Post)('muster/start'),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PmEmergencyResponseController.prototype, "startMuster", null);
__decorate([
    (0, common_1.Get)('muster/active'),
    __param(0, (0, common_1.Query)('siteId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PmEmergencyResponseController.prototype, "activeMuster", null);
__decorate([
    (0, common_1.Post)('muster/:id/checkin'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PmEmergencyResponseController.prototype, "checkIn", null);
__decorate([
    (0, common_1.Post)('muster/:id/all-clear'),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PmEmergencyResponseController.prototype, "allClear", null);
__decorate([
    (0, common_1.Post)('equipment'),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PmEmergencyResponseController.prototype, "createEquipment", null);
__decorate([
    (0, common_1.Get)('equipment'),
    __param(0, (0, common_1.Query)('companyId')),
    __param(1, (0, common_1.Query)('siteId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PmEmergencyResponseController.prototype, "listEquipment", null);
__decorate([
    (0, common_1.Post)('equipment/:id/inspect'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], PmEmergencyResponseController.prototype, "inspectEquipment", null);
__decorate([
    (0, common_1.Post)('equipment/scan'),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    __param(0, (0, common_1.Query)('companyId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PmEmergencyResponseController.prototype, "scanEquipment", null);
__decorate([
    (0, common_1.Get)('access/worker'),
    __param(0, (0, common_1.Query)('workerId')),
    __param(1, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PmEmergencyResponseController.prototype, "workerAccess", null);
__decorate([
    (0, common_1.Get)('site-lock/:projectId'),
    __param(0, (0, common_1.Param)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PmEmergencyResponseController.prototype, "siteLock", null);
__decorate([
    (0, common_1.Get)('analytics/project/:projectId'),
    __param(0, (0, common_1.Param)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PmEmergencyResponseController.prototype, "analytics", null);
__decorate([
    (0, common_1.Get)('intelligence/project/:projectId'),
    __param(0, (0, common_1.Param)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PmEmergencyResponseController.prototype, "intelligence", null);
__decorate([
    (0, common_1.Get)('sync/project/:projectId'),
    __param(0, (0, common_1.Param)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PmEmergencyResponseController.prototype, "syncBundle", null);
__decorate([
    (0, common_1.Post)('sync/project/:projectId'),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], PmEmergencyResponseController.prototype, "applySync", null);
__decorate([
    (0, common_1.Get)('station/:companyId'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Query)('siteId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PmEmergencyResponseController.prototype, "station", null);
exports.PmEmergencyResponseController = PmEmergencyResponseController = __decorate([
    (0, common_1.Controller)(`${routes_1.API_V1_PREFIX}/pm/emergency-response`),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...PM_ROLES),
    __metadata("design:paramtypes", [pm_emergency_response_service_1.PmEmergencyResponseService,
        pm_emergency_cail_intelligence_service_1.PmEmergencyCailIntelligenceService])
], PmEmergencyResponseController);
//# sourceMappingURL=pm-emergency-response.controller.js.map