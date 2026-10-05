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
exports.PmContractorPortalController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const routes_1 = require("../config/routes");
const notifications_service_1 = require("../notifications/notifications.service");
const pm_contractor_portal_access_service_1 = require("./pm-contractor-portal-access.service");
const pm_contractor_portal_inbox_service_1 = require("./pm-contractor-portal-inbox.service");
const pm_contractor_portal_findings_service_1 = require("./pm-contractor-portal-findings.service");
const pm_contractor_portal_compliance_service_1 = require("./pm-contractor-portal-compliance.service");
const pm_contractor_portal_messages_service_1 = require("./pm-contractor-portal-messages.service");
const pm_inspection_shared_service_1 = require("../pm-inspections/pm-inspection-shared.service");
const contractor_compliance_engine_service_1 = require("./contractor-compliance-engine.service");
const PORTAL_ROLES = [...pm_contractor_portal_access_service_1.CONTRACTOR_ROLES, ...pm_contractor_portal_access_service_1.PRIME_PORTAL_ROLES];
let PmContractorPortalController = class PmContractorPortalController {
    constructor(access, inbox, findings, compliance, messages, notifications, sharedReports, complianceEngine) {
        this.access = access;
        this.inbox = inbox;
        this.findings = findings;
        this.compliance = compliance;
        this.messages = messages;
        this.notifications = notifications;
        this.sharedReports = sharedReports;
        this.complianceEngine = complianceEngine;
    }
    generateComplianceEngine(body) {
        return this.complianceEngine.generate(body);
    }
    async generateComplianceEngineFromMembership(membershipId, body) {
        const input = await this.complianceEngine.buildInputFromMembership(membershipId, body === null || body === void 0 ? void 0 : body.work_scope);
        return this.complianceEngine.generate(input);
    }
    securityActor(req) {
        var _a;
        return {
            id: req.user.id,
            role: req.user.role,
            companyId: (_a = req.user.companyId) !== null && _a !== void 0 ? _a : null,
        };
    }
    actor(req) {
        var _a;
        return {
            userId: req.user.id,
            role: req.user.role,
            companyId: (_a = req.user.companyId) !== null && _a !== void 0 ? _a : null,
        };
    }
    listMemberships(req) {
        const actor = this.actor(req);
        const contractorCompanyId = this.access.requireContractorCompany(actor);
        return this.access.listMembershipsForContractor(contractorCompanyId);
    }
    listPrimeMemberships(primeCompanyId, projectId) {
        return this.access.listMembershipsForPrime(parseInt(primeCompanyId, 10), projectId ? parseInt(projectId, 10) : undefined);
    }
    dashboard(req) {
        const actor = this.actor(req);
        return Promise.all([
            this.inbox.listInbox(actor),
            this.findings.listFindings(actor, { unacknowledgedOnly: false }),
            this.compliance.getDashboard(actor),
        ]).then(([inbox, findingList, complianceData]) => ({
            inbox: inbox.summary,
            findings: findingList.summary,
            compliance: complianceData.summary,
        }));
    }
    listInbox(req, status, overdueOnly) {
        return this.inbox.listInbox(this.actor(req), {
            status,
            overdueOnly: overdueOnly === 'true',
        });
    }
    acknowledgeInbox(req, dispatchId) {
        return this.inbox.acknowledgeDispatch(this.actor(req), dispatchId);
    }
    uploadEvidence(req, dispatchId, body) {
        return this.inbox.uploadEvidence(this.actor(req), dispatchId, body);
    }
    completeInbox(req, dispatchId, body) {
        return this.inbox.completeDispatch(this.actor(req), dispatchId, body);
    }
    listSharedReports(req, projectId) {
        return this.sharedReports.listSharedReports(this.securityActor(req), projectId ? parseInt(projectId, 10) : undefined);
    }
    listFindings(req, projectId, unacknowledgedOnly) {
        return this.findings.listFindings(this.actor(req), {
            projectId: projectId ? parseInt(projectId, 10) : undefined,
            unacknowledgedOnly: unacknowledgedOnly === 'true',
        });
    }
    acknowledgeFinding(req, deficiencyId, body) {
        return this.findings.acknowledgeFinding(this.actor(req), deficiencyId, body === null || body === void 0 ? void 0 : body.notes);
    }
    complianceDashboard(req, projectId) {
        return this.compliance.getDashboard(this.actor(req), projectId ? parseInt(projectId, 10) : undefined);
    }
    listMessages(req, primeCompanyId, projectId) {
        return this.messages.listThreads(this.actor(req), {
            primeCompanyId: primeCompanyId ? parseInt(primeCompanyId, 10) : undefined,
            projectId: projectId ? parseInt(projectId, 10) : undefined,
        });
    }
    sendMessage(req, body) {
        return this.messages.sendMessage(this.actor(req), body);
    }
    markMessageRead(req, messageId) {
        return this.messages.markRead(this.actor(req), messageId);
    }
    listNotifications(req, unreadOnly) {
        return this.notifications.listForUser(req.user.id, {
            unreadOnly: unreadOnly === 'true',
            take: 50,
        });
    }
    markNotificationRead(req, id) {
        return this.notifications.markRead(req.user.id, parseInt(id, 10));
    }
    createMembership(body) {
        return this.access.ensureMembership(body.primeCompanyId, body.contractorCompanyId, body.projectId);
    }
};
exports.PmContractorPortalController = PmContractorPortalController;
__decorate([
    (0, common_1.Post)('engine/generate'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.COMPANY_ADMIN, client_1.UserRole.ADMIN, client_1.UserRole.SUPER_ADMIN, client_1.UserRole.PROJECT_MANAGER, client_1.UserRole.SUPERVISOR),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PmContractorPortalController.prototype, "generateComplianceEngine", null);
__decorate([
    (0, common_1.Post)('memberships/:membershipId/engine/generate'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.COMPANY_ADMIN, client_1.UserRole.ADMIN, client_1.UserRole.SUPER_ADMIN, client_1.UserRole.PROJECT_MANAGER, client_1.UserRole.SUPERVISOR),
    __param(0, (0, common_1.Param)('membershipId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PmContractorPortalController.prototype, "generateComplianceEngineFromMembership", null);
__decorate([
    (0, common_1.Get)('memberships'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PmContractorPortalController.prototype, "listMemberships", null);
__decorate([
    (0, common_1.Get)('memberships/prime'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.COMPANY_ADMIN, client_1.UserRole.ADMIN, client_1.UserRole.SUPER_ADMIN, client_1.UserRole.PROJECT_MANAGER, client_1.UserRole.SUPERVISOR),
    __param(0, (0, common_1.Query)('primeCompanyId')),
    __param(1, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PmContractorPortalController.prototype, "listPrimeMemberships", null);
__decorate([
    (0, common_1.Get)('dashboard'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PmContractorPortalController.prototype, "dashboard", null);
__decorate([
    (0, common_1.Get)('inbox'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('overdueOnly')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], PmContractorPortalController.prototype, "listInbox", null);
__decorate([
    (0, common_1.Post)('inbox/:dispatchId/acknowledge'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('dispatchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], PmContractorPortalController.prototype, "acknowledgeInbox", null);
__decorate([
    (0, common_1.Post)('inbox/:dispatchId/evidence'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('dispatchId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], PmContractorPortalController.prototype, "uploadEvidence", null);
__decorate([
    (0, common_1.Post)('inbox/:dispatchId/complete'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('dispatchId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], PmContractorPortalController.prototype, "completeInbox", null);
__decorate([
    (0, common_1.Get)('shared-reports'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], PmContractorPortalController.prototype, "listSharedReports", null);
__decorate([
    (0, common_1.Get)('findings'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('projectId')),
    __param(2, (0, common_1.Query)('unacknowledgedOnly')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], PmContractorPortalController.prototype, "listFindings", null);
__decorate([
    (0, common_1.Post)('findings/:deficiencyId/acknowledge'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('deficiencyId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], PmContractorPortalController.prototype, "acknowledgeFinding", null);
__decorate([
    (0, common_1.Get)('compliance'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], PmContractorPortalController.prototype, "complianceDashboard", null);
__decorate([
    (0, common_1.Get)('messages'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('primeCompanyId')),
    __param(2, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], PmContractorPortalController.prototype, "listMessages", null);
__decorate([
    (0, common_1.Post)('messages'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PmContractorPortalController.prototype, "sendMessage", null);
__decorate([
    (0, common_1.Put)('messages/:messageId/read'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('messageId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], PmContractorPortalController.prototype, "markMessageRead", null);
__decorate([
    (0, common_1.Get)('notifications'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('unreadOnly')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], PmContractorPortalController.prototype, "listNotifications", null);
__decorate([
    (0, common_1.Put)('notifications/:id/read'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], PmContractorPortalController.prototype, "markNotificationRead", null);
__decorate([
    (0, common_1.Post)('memberships'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.COMPANY_ADMIN, client_1.UserRole.ADMIN, client_1.UserRole.SUPER_ADMIN, client_1.UserRole.PROJECT_MANAGER),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PmContractorPortalController.prototype, "createMembership", null);
exports.PmContractorPortalController = PmContractorPortalController = __decorate([
    (0, common_1.Controller)(`${routes_1.API_V1_PREFIX}/pm/contractor-portal`),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...PORTAL_ROLES),
    __metadata("design:paramtypes", [pm_contractor_portal_access_service_1.PmContractorPortalAccessService,
        pm_contractor_portal_inbox_service_1.PmContractorPortalInboxService,
        pm_contractor_portal_findings_service_1.PmContractorPortalFindingsService,
        pm_contractor_portal_compliance_service_1.PmContractorPortalComplianceService,
        pm_contractor_portal_messages_service_1.PmContractorPortalMessagesService,
        notifications_service_1.NotificationsService,
        pm_inspection_shared_service_1.PmInspectionSharedService,
        contractor_compliance_engine_service_1.ContractorComplianceEngineService])
], PmContractorPortalController);
//# sourceMappingURL=pm-contractor-portal.controller.js.map