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
exports.PmSmsCoreController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const routes_1 = require("../config/routes");
const sms_risk_context_service_1 = require("./sms-risk-context.service");
const sms_heca_library_service_1 = require("./sms-heca-library.service");
const sms_energy_wheel_service_1 = require("./sms-energy-wheel.service");
const sms_notification_router_service_1 = require("./sms-notification-router.service");
const sms_inspection_integration_service_1 = require("./sms-inspection-integration.service");
const sms_investigation_integration_service_1 = require("./sms-investigation-integration.service");
const sms_analytics_service_1 = require("./sms-analytics.service");
const PM_ROLES = [
    client_1.UserRole.WORKER,
    client_1.UserRole.SUPERVISOR,
    client_1.UserRole.ADMIN,
    client_1.UserRole.SUPER_ADMIN,
    client_1.UserRole.COMPANY_ADMIN,
    client_1.UserRole.PROJECT_MANAGER,
    client_1.UserRole.CONTRACTOR_ADMIN,
    client_1.UserRole.CONTRACTOR_USER,
];
let PmSmsCoreController = class PmSmsCoreController {
    constructor(riskContext, hecaLibrary, energyWheel, notifications, inspection, investigation, analytics) {
        this.riskContext = riskContext;
        this.hecaLibrary = hecaLibrary;
        this.energyWheel = energyWheel;
        this.notifications = notifications;
        this.inspection = inspection;
        this.investigation = investigation;
        this.analytics = analytics;
    }
    meta() {
        return {
            pillars: ['SCL', 'HECA', 'Energy Wheel'],
            sclStates: ['safe', 'conditional', 'loss'],
            energyCatalog: this.energyWheel.catalog(),
        };
    }
    energyCatalog() {
        return this.energyWheel.catalog();
    }
    listHeca(companyId, projectId) {
        return this.hecaLibrary.list(parseInt(companyId, 10), projectId ? parseInt(projectId, 10) : undefined);
    }
    seedHeca(companyId, projectId) {
        return this.hecaLibrary.seedDefaults(parseInt(companyId, 10), projectId ? parseInt(projectId, 10) : undefined);
    }
    createHeca(companyId, body) {
        return this.hecaLibrary.create(parseInt(companyId, 10), body);
    }
    listRiskContext(companyId, projectId, sclState, hecaOnly, highEnergyOnly) {
        return this.riskContext.listByCompany(parseInt(companyId, 10), {
            projectId: projectId ? parseInt(projectId, 10) : undefined,
            sclState,
            hecaOnly: hecaOnly === 'true',
            highEnergyOnly: highEnergyOnly === 'true',
        });
    }
    getRiskContext(entityType, entityId) {
        return this.riskContext.getForEntity(entityType, entityId);
    }
    upsertRiskContext(entityType, entityId, body) {
        return this.riskContext.upsert(Object.assign(Object.assign({}, body), { entityType, entityId }));
    }
    tagInspectionFinding(findingId, body) {
        return this.inspection.applyTagsToPhotoFinding(findingId, body.companyId, body.projectId, body.baseSeverity, body);
    }
    classifyInvestigationScl(eventId, body) {
        return this.investigation.classifyScl(eventId, body);
    }
    saveInvestigationEnergy(eventId, body) {
        return this.investigation.saveEnergyWheel(eventId, body.entries);
    }
    saveHecaVerification(eventId, body) {
        return this.investigation.saveHecaVerification(eventId, body);
    }
    guidedQuestions(eventId) {
        return this.investigation.guidedQuestionsWithSms(eventId);
    }
    leadingIndicators(companyId, projectId) {
        return this.analytics.leadingIndicators(parseInt(companyId, 10), projectId ? parseInt(projectId, 10) : undefined);
    }
    listNotificationRoutes(companyId) {
        return this.notifications.listRoutes(parseInt(companyId, 10));
    }
    seedNotificationRoutes(companyId) {
        return this.notifications.ensureDefaultRoutes(parseInt(companyId, 10));
    }
};
exports.PmSmsCoreController = PmSmsCoreController;
__decorate([
    (0, common_1.Get)('meta'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PmSmsCoreController.prototype, "meta", null);
__decorate([
    (0, common_1.Get)('energy-wheel/catalog'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PmSmsCoreController.prototype, "energyCatalog", null);
__decorate([
    (0, common_1.Get)('heca-library'),
    __param(0, (0, common_1.Query)('companyId')),
    __param(1, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PmSmsCoreController.prototype, "listHeca", null);
__decorate([
    (0, common_1.Post)('heca-library/seed'),
    __param(0, (0, common_1.Query)('companyId')),
    __param(1, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PmSmsCoreController.prototype, "seedHeca", null);
__decorate([
    (0, common_1.Post)('heca-library'),
    __param(0, (0, common_1.Query)('companyId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PmSmsCoreController.prototype, "createHeca", null);
__decorate([
    (0, common_1.Get)('risk-context'),
    __param(0, (0, common_1.Query)('companyId')),
    __param(1, (0, common_1.Query)('projectId')),
    __param(2, (0, common_1.Query)('sclState')),
    __param(3, (0, common_1.Query)('hecaOnly')),
    __param(4, (0, common_1.Query)('highEnergyOnly')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], PmSmsCoreController.prototype, "listRiskContext", null);
__decorate([
    (0, common_1.Get)('risk-context/:entityType/:entityId'),
    __param(0, (0, common_1.Param)('entityType')),
    __param(1, (0, common_1.Param)('entityId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PmSmsCoreController.prototype, "getRiskContext", null);
__decorate([
    (0, common_1.Put)('risk-context/:entityType/:entityId'),
    __param(0, (0, common_1.Param)('entityType')),
    __param(1, (0, common_1.Param)('entityId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], PmSmsCoreController.prototype, "upsertRiskContext", null);
__decorate([
    (0, common_1.Put)('inspections/findings/:findingId/tags'),
    __param(0, (0, common_1.Param)('findingId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PmSmsCoreController.prototype, "tagInspectionFinding", null);
__decorate([
    (0, common_1.Put)('investigations/:eventId/scl'),
    __param(0, (0, common_1.Param)('eventId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PmSmsCoreController.prototype, "classifyInvestigationScl", null);
__decorate([
    (0, common_1.Put)('investigations/:eventId/energy-wheel'),
    __param(0, (0, common_1.Param)('eventId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PmSmsCoreController.prototype, "saveInvestigationEnergy", null);
__decorate([
    (0, common_1.Put)('investigations/:eventId/heca-verification'),
    __param(0, (0, common_1.Param)('eventId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PmSmsCoreController.prototype, "saveHecaVerification", null);
__decorate([
    (0, common_1.Get)('investigations/:eventId/guided-questions'),
    __param(0, (0, common_1.Param)('eventId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PmSmsCoreController.prototype, "guidedQuestions", null);
__decorate([
    (0, common_1.Get)('analytics/leading-indicators'),
    __param(0, (0, common_1.Query)('companyId')),
    __param(1, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PmSmsCoreController.prototype, "leadingIndicators", null);
__decorate([
    (0, common_1.Get)('notifications/routes'),
    __param(0, (0, common_1.Query)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PmSmsCoreController.prototype, "listNotificationRoutes", null);
__decorate([
    (0, common_1.Post)('notifications/routes/seed'),
    __param(0, (0, common_1.Query)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PmSmsCoreController.prototype, "seedNotificationRoutes", null);
exports.PmSmsCoreController = PmSmsCoreController = __decorate([
    (0, common_1.Controller)(`${routes_1.API_V1_PREFIX}/pm/sms`),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...PM_ROLES),
    __metadata("design:paramtypes", [sms_risk_context_service_1.SmsRiskContextService,
        sms_heca_library_service_1.SmsHecaLibraryService,
        sms_energy_wheel_service_1.SmsEnergyWheelService,
        sms_notification_router_service_1.SmsNotificationRouterService,
        sms_inspection_integration_service_1.SmsInspectionIntegrationService,
        sms_investigation_integration_service_1.SmsInvestigationIntegrationService,
        sms_analytics_service_1.SmsAnalyticsService])
], PmSmsCoreController);
//# sourceMappingURL=pm-sms-core.controller.js.map