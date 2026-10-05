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
exports.PmInspectionsController = void 0;
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const routes_1 = require("../config/routes");
const actor_util_1 = require("../security/actor.util");
const require_permission_decorator_1 = require("../security/decorators/require-permission.decorator");
const tenant_scoped_decorator_1 = require("../security/decorators/tenant-scoped.decorator");
const permission_service_1 = require("../security/permission.service");
const tenant_scope_service_1 = require("../security/tenant-scope.service");
const security_types_1 = require("../security/security.types");
const pm_inspections_service_1 = require("./pm-inspections.service");
const pm_inspection_templates_service_1 = require("./pm-inspection-templates.service");
const pm_inspections_cail_intelligence_service_1 = require("./pm-inspections-cail-intelligence.service");
const pm_inspection_photo_pipeline_service_1 = require("./pm-inspection-photo-pipeline.service");
const pm_inspection_dashboard_service_1 = require("./pm-inspection-dashboard.service");
const pm_inspection_contractor_dispatch_service_1 = require("./pm-inspection-contractor-dispatch.service");
const pm_inspection_subcontractor_resolver_service_1 = require("./pm-inspection-subcontractor-resolver.service");
const pm_safety_meetings_service_1 = require("../pm-safety-meetings/pm-safety-meetings.service");
const add_inspection_signature_dto_1 = require("./dto/add-inspection-signature.dto");
const pm_inspection_report_service_1 = require("./pm-inspection-report.service");
const pm_inspection_access_service_1 = require("./pm-inspection-access.service");
const pm_inspection_findings_log_service_1 = require("./pm-inspection-findings-log.service");
const pm_inspection_shared_service_1 = require("./pm-inspection-shared.service");
const audit_inspection_capa_engine_service_1 = require("./audit-inspection-capa-engine.service");
const pm_inspection_kind_util_1 = require("./pm-inspection-kind.util");
const pm_inspection_template_dto_1 = require("./dto/pm-inspection-template.dto");
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
let PmInspectionsController = class PmInspectionsController {
    constructor(permissions, tenant, inspections, templates, cailIntelligence, photoPipeline, dashboard, contractorDispatch, subcontractorResolver, safetyMeetings, reportService, inspectionAccess, findingsLog, sharedReports, auditCapaEngine) {
        this.permissions = permissions;
        this.tenant = tenant;
        this.inspections = inspections;
        this.templates = templates;
        this.cailIntelligence = cailIntelligence;
        this.photoPipeline = photoPipeline;
        this.dashboard = dashboard;
        this.contractorDispatch = contractorDispatch;
        this.subcontractorResolver = subcontractorResolver;
        this.safetyMeetings = safetyMeetings;
        this.reportService = reportService;
        this.inspectionAccess = inspectionAccess;
        this.findingsLog = findingsLog;
        this.sharedReports = sharedReports;
        this.auditCapaEngine = auditCapaEngine;
    }
    generateAuditCapaEngine(body) {
        return this.auditCapaEngine.generate(body);
    }
    listTemplates(req, companyId, projectId, category, status) {
        const actor = req.user;
        const effectiveCompanyId = this.tenant.effectiveCompanyId(actor, this.parseOptionalCompanyId(companyId));
        return this.templates.list({
            companyId: effectiveCompanyId,
            projectId: projectId ? parseInt(projectId, 10) : undefined,
            category,
            status,
        });
    }
    seedTemplates(req, companyId, projectId) {
        const actor = req.user;
        const effectiveCompanyId = this.tenant.effectiveCompanyId(actor, this.parseOptionalCompanyId(companyId));
        return this.templates.ensureDefaults(effectiveCompanyId, projectId ? parseInt(projectId, 10) : undefined);
    }
    async getTemplate(id, req) {
        const tpl = await this.templates.get(id);
        this.tenant.assertCompanyAccess((0, actor_util_1.toSecurityActor)(req.user), tpl.companyId);
        return tpl;
    }
    createTemplate(req, body) {
        const actor = (0, actor_util_1.toSecurityActor)(req.user);
        const companyId = this.tenant.effectiveCompanyId(actor, body.companyId);
        return this.templates.create(Object.assign(Object.assign({}, body), { companyId }));
    }
    async updateTemplate(id, req, body) {
        const tpl = await this.templates.get(id);
        this.tenant.assertCompanyAccess((0, actor_util_1.toSecurityActor)(req.user), tpl.companyId);
        return this.templates.update(id, body);
    }
    async publishTemplate(id, req) {
        var _a, _b;
        const actor = (0, actor_util_1.toSecurityActor)(req.user);
        const tpl = await this.templates.get(id);
        this.tenant.assertCompanyAccess(actor, tpl.companyId);
        return this.templates.publish(id, (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) !== null && _b !== void 0 ? _b : actor.id);
    }
    async newVersion(id, req) {
        const tpl = await this.templates.get(id);
        this.tenant.assertCompanyAccess((0, actor_util_1.toSecurityActor)(req.user), tpl.companyId);
        return this.templates.newVersion(id);
    }
    async archiveTemplate(id, req) {
        const tpl = await this.templates.get(id);
        this.tenant.assertCompanyAccess((0, actor_util_1.toSecurityActor)(req.user), tpl.companyId);
        return this.templates.archive(id);
    }
    listSharedReports(req, projectId) {
        return this.sharedReports.listSharedReports((0, actor_util_1.toSecurityActor)(req.user), projectId ? parseInt(projectId, 10) : undefined);
    }
    async projectFindingsLog(projectId, req, companyId) {
        await this.inspectionAccess.assertCanViewProjectFindingsLog((0, actor_util_1.toSecurityActor)(req.user), parseInt(projectId, 10));
        return this.findingsLog.listProjectLog(parseInt(projectId, 10), {
            companyId: companyId ? parseInt(companyId, 10) : undefined,
        });
    }
    listContractorDispatches(projectId, companyId) {
        return this.contractorDispatch.listForContractorCompany(parseInt(projectId, 10), parseInt(companyId, 10));
    }
    list(projectId, companyId, status, equipmentId) {
        return this.inspections.list({
            projectId: projectId ? parseInt(projectId, 10) : undefined,
            companyId: companyId ? parseInt(companyId, 10) : undefined,
            status,
            equipmentId: equipmentId ? parseInt(equipmentId, 10) : undefined,
        });
    }
    analytics(projectId) {
        return this.inspections.analytics(parseInt(projectId, 10));
    }
    correctiveBoard(projectId) {
        return this.dashboard.correctiveActionBoard(parseInt(projectId, 10));
    }
    overdueAlerts(projectId) {
        return this.dashboard.overdueAlerts(parseInt(projectId, 10));
    }
    contractorPerformance(projectId) {
        return this.dashboard.contractorPerformance(parseInt(projectId, 10));
    }
    listProjectSubcontractors(projectId) {
        return this.subcontractorResolver.listWithNames(parseInt(projectId, 10));
    }
    projectIntelligence(projectId) {
        return this.cailIntelligence.projectInsights(parseInt(projectId, 10));
    }
    inspectorScore(userId, projectId) {
        return this.cailIntelligence.inspectorPerformance(parseInt(userId, 10), parseInt(projectId, 10));
    }
    workerAccess(workerId, projectId) {
        return this.inspections.workerAccessCheck(parseInt(workerId, 10), parseInt(projectId, 10));
    }
    async sync(req, body) {
        var _a, _b;
        const actor = (0, actor_util_1.toSecurityActor)(req.user);
        const companyId = this.tenant.effectiveCompanyId(actor, typeof body.companyId === 'number' ? body.companyId : undefined);
        const actorId = (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) !== null && _b !== void 0 ? _b : actor.id;
        const result = await this.inspections.syncOffline(Object.assign(Object.assign({}, body), { companyId, inspectorUserId: actorId }));
        const photoCaptures = body.photoCaptures;
        if ((photoCaptures === null || photoCaptures === void 0 ? void 0 : photoCaptures.length) && (result === null || result === void 0 ? void 0 : result.id)) {
            await this.permissions.assertCanEditInspection(actor, result.id);
            await Promise.all(photoCaptures.map((photo) => this.photoPipeline.captureAndAnalyze(Object.assign(Object.assign({ inspectionId: result.id, actorId }, photo), { offline: true, waitForAnalysis: false }))));
        }
        return result;
    }
    async get(id, req) {
        await this.permissions.assertCanViewInspection((0, actor_util_1.toSecurityActor)(req.user), id);
        return this.inspections.get(id);
    }
    create(req, body) {
        var _a, _b, _c;
        const actor = req.user;
        const effectiveCompanyId = this.tenant.effectiveCompanyId(actor, body.companyId);
        return this.inspections.createFromTemplate(Object.assign(Object.assign({}, body), { companyId: effectiveCompanyId, inspectorUserId: (_c = (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) !== null && _b !== void 0 ? _b : actor.id) !== null && _c !== void 0 ? _c : 0 }));
    }
    parseOptionalCompanyId(raw) {
        if (!raw)
            return undefined;
        const parsed = parseInt(raw, 10);
        return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
    }
    predict(body) {
        return this.cailIntelligence.predictFromAnswers(body.templateId, body.answers);
    }
    async saveAnswers(id, req, body) {
        var _a;
        await this.permissions.assertCanEditInspection((0, actor_util_1.toSecurityActor)(req.user), id);
        return this.inspections.saveAnswers(id, body.answers, (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId);
    }
    async saveItems(id, req, body) {
        var _a, _b, _c;
        await this.permissions.assertCanEditInspection((0, actor_util_1.toSecurityActor)(req.user), id);
        const answers = (_b = (_a = body.answers) !== null && _a !== void 0 ? _a : body.items) !== null && _b !== void 0 ? _b : {};
        return this.inspections.saveAnswers(id, answers, (_c = req.user) === null || _c === void 0 ? void 0 : _c.userId);
    }
    async submit(id, req) {
        var _a, _b;
        await this.permissions.assertCanSubmitInspection((0, actor_util_1.toSecurityActor)(req.user), id);
        const actorId = (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) !== null && _b !== void 0 ? _b : 0;
        const inspection = await this.inspections.get(id);
        if ((0, pm_inspection_kind_util_1.isPhotoFirstTemplate)(inspection.template)) {
            await this.photoPipeline.assertReadyForPhotoFirstSubmit(id);
        }
        await this.photoPipeline.ensureAtRiskAssignmentsOnSubmit(id, actorId);
        return this.inspections.submit(id, actorId);
    }
    review(id, req, body) {
        var _a, _b;
        return this.inspections.review(id, body.action, (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) !== null && _b !== void 0 ? _b : 0, body.notes);
    }
    addSignature(id, body) {
        return this.inspections.addSignature(id, body);
    }
    addAttachment(id, body) {
        return this.inspections.addAttachment(id, body);
    }
    async generateAuditCapaEngineFromInspection(id) {
        const input = await this.auditCapaEngine.buildInputFromInspection(id);
        return this.auditCapaEngine.generate(input);
    }
    async inspectionReport(id, req) {
        await this.inspectionAccess.assertCanViewInspectionReport((0, actor_util_1.toSecurityActor)(req.user), id);
        return this.reportService.buildReport(id);
    }
    async updateReportSharing(id, req, body) {
        await this.inspectionAccess.assertCanManageInspectionSharing((0, actor_util_1.toSecurityActor)(req.user), id);
        return this.inspections.updateSharing(id, body);
    }
    async savePhotoMetadata(id, attachmentId, req, body) {
        var _a, _b;
        await this.permissions.assertCanEditInspection((0, actor_util_1.toSecurityActor)(req.user), id);
        return this.photoPipeline.savePhotoMetadata(Object.assign({ inspectionId: id, attachmentId, actorId: (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) !== null && _b !== void 0 ? _b : 0 }, body));
    }
    async capturePhoto(id, req, body) {
        var _a, _b;
        await this.permissions.assertCanEditInspection((0, actor_util_1.toSecurityActor)(req.user), id);
        return this.photoPipeline.captureAndAnalyze(Object.assign({ inspectionId: id, actorId: (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) !== null && _b !== void 0 ? _b : 0 }, body));
    }
    async photoFindings(id, req) {
        await this.permissions.assertCanViewInspection((0, actor_util_1.toSecurityActor)(req.user), id);
        return this.dashboard.photoFindingsSummary(id);
    }
    acknowledgeDispatch(dispatchId, req) {
        var _a, _b;
        return this.contractorDispatch.acknowledge(dispatchId, (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) !== null && _b !== void 0 ? _b : 0);
    }
    completeDispatch(dispatchId, req, body) {
        var _a, _b;
        return this.contractorDispatch.complete(dispatchId, (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) !== null && _b !== void 0 ? _b : 0, body);
    }
    dispatchContractor(actionId, req, body) {
        var _a, _b;
        return this.contractorDispatch.dispatchForCorrectiveAction(actionId, (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) !== null && _b !== void 0 ? _b : 0, body.clientSyncId);
    }
    escalateToIncident(id, req, body) {
        var _a, _b;
        return this.inspections.escalateToIncident(id, (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) !== null && _b !== void 0 ? _b : 0, body);
    }
    draftSafetyMeeting(id, req) {
        var _a, _b;
        return this.safetyMeetings
            .createFromInspection(id, (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) !== null && _b !== void 0 ? _b : 0)
            .then((result) => result.meeting);
    }
    createDeficiency(id, req, body) {
        var _a;
        return this.inspections.createManualDeficiency(id, body, (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId);
    }
    verifyDeficiency(deficiencyId, req) {
        var _a, _b;
        return this.inspections.verifyDeficiency(deficiencyId, (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) !== null && _b !== void 0 ? _b : 0);
    }
};
exports.PmInspectionsController = PmInspectionsController;
__decorate([
    (0, common_1.Post)('engine/generate'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PmInspectionsController.prototype, "generateAuditCapaEngine", null);
__decorate([
    (0, common_1.Get)('templates'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('companyId')),
    __param(2, (0, common_1.Query)('projectId')),
    __param(3, (0, common_1.Query)('category')),
    __param(4, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String]),
    __metadata("design:returntype", void 0)
], PmInspectionsController.prototype, "listTemplates", null);
__decorate([
    (0, common_1.Post)('templates/seed'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('companyId')),
    __param(2, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], PmInspectionsController.prototype, "seedTemplates", null);
__decorate([
    (0, common_1.Get)('templates/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PmInspectionsController.prototype, "getTemplate", null);
__decorate([
    (0, common_1.Post)('templates'),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    (0, require_permission_decorator_1.RequirePermission)(security_types_1.Permission.TEMPLATE_MANAGE),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, pm_inspection_template_dto_1.CreatePmInspectionTemplateDto]),
    __metadata("design:returntype", void 0)
], PmInspectionsController.prototype, "createTemplate", null);
__decorate([
    (0, common_1.Put)('templates/:id'),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    (0, require_permission_decorator_1.RequirePermission)(security_types_1.Permission.TEMPLATE_MANAGE),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, pm_inspection_template_dto_1.UpdatePmInspectionTemplateDto]),
    __metadata("design:returntype", Promise)
], PmInspectionsController.prototype, "updateTemplate", null);
__decorate([
    (0, common_1.Post)('templates/:id/publish'),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    (0, require_permission_decorator_1.RequirePermission)(security_types_1.Permission.TEMPLATE_MANAGE),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PmInspectionsController.prototype, "publishTemplate", null);
__decorate([
    (0, common_1.Post)('templates/:id/version'),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    (0, require_permission_decorator_1.RequirePermission)(security_types_1.Permission.TEMPLATE_MANAGE),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PmInspectionsController.prototype, "newVersion", null);
__decorate([
    (0, common_1.Post)('templates/:id/archive'),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    (0, require_permission_decorator_1.RequirePermission)(security_types_1.Permission.TEMPLATE_MANAGE),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PmInspectionsController.prototype, "archiveTemplate", null);
__decorate([
    (0, common_1.Get)('shared'),
    (0, require_permission_decorator_1.RequirePermission)(security_types_1.Permission.INSPECTION_VIEW),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], PmInspectionsController.prototype, "listSharedReports", null);
__decorate([
    (0, common_1.Get)('projects/:projectId/findings-log'),
    (0, require_permission_decorator_1.RequirePermission)(security_types_1.Permission.INSPECTION_VIEW),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Query)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", Promise)
], PmInspectionsController.prototype, "projectFindingsLog", null);
__decorate([
    (0, common_1.Get)('projects/:projectId/contractor-dispatches'),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Query)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PmInspectionsController.prototype, "listContractorDispatches", null);
__decorate([
    (0, common_1.Get)(),
    (0, require_permission_decorator_1.RequirePermission)(security_types_1.Permission.INSPECTION_VIEW),
    (0, tenant_scoped_decorator_1.TenantScoped)('companyId'),
    __param(0, (0, common_1.Query)('projectId')),
    __param(1, (0, common_1.Query)('companyId')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('equipmentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], PmInspectionsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('analytics/project/:projectId'),
    __param(0, (0, common_1.Param)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PmInspectionsController.prototype, "analytics", null);
__decorate([
    (0, common_1.Get)('dashboard/project/:projectId/corrective-board'),
    __param(0, (0, common_1.Param)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PmInspectionsController.prototype, "correctiveBoard", null);
__decorate([
    (0, common_1.Get)('dashboard/project/:projectId/overdue-alerts'),
    __param(0, (0, common_1.Param)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PmInspectionsController.prototype, "overdueAlerts", null);
__decorate([
    (0, common_1.Get)('dashboard/project/:projectId/contractor-performance'),
    __param(0, (0, common_1.Param)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PmInspectionsController.prototype, "contractorPerformance", null);
__decorate([
    (0, common_1.Get)('projects/:projectId/subcontractors'),
    __param(0, (0, common_1.Param)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PmInspectionsController.prototype, "listProjectSubcontractors", null);
__decorate([
    (0, common_1.Get)('intelligence/project/:projectId'),
    __param(0, (0, common_1.Param)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PmInspectionsController.prototype, "projectIntelligence", null);
__decorate([
    (0, common_1.Get)('intelligence/inspector/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PmInspectionsController.prototype, "inspectorScore", null);
__decorate([
    (0, common_1.Get)('access/worker'),
    __param(0, (0, common_1.Query)('workerId')),
    __param(1, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PmInspectionsController.prototype, "workerAccess", null);
__decorate([
    (0, common_1.Post)('sync'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, throttler_1.Throttle)(30, 60),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PmInspectionsController.prototype, "sync", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permission_decorator_1.RequirePermission)(security_types_1.Permission.INSPECTION_VIEW),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PmInspectionsController.prototype, "get", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PmInspectionsController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('predict'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PmInspectionsController.prototype, "predict", null);
__decorate([
    (0, common_1.Put)(':id/answers'),
    (0, require_permission_decorator_1.RequirePermission)(security_types_1.Permission.INSPECTION_EDIT),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], PmInspectionsController.prototype, "saveAnswers", null);
__decorate([
    (0, common_1.Post)(':id/items'),
    (0, require_permission_decorator_1.RequirePermission)(security_types_1.Permission.INSPECTION_EDIT),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], PmInspectionsController.prototype, "saveItems", null);
__decorate([
    (0, common_1.Post)(':id/submit'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, require_permission_decorator_1.RequirePermission)(security_types_1.Permission.INSPECTION_SUBMIT),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PmInspectionsController.prototype, "submit", null);
__decorate([
    (0, common_1.Post)(':id/review'),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], PmInspectionsController.prototype, "review", null);
__decorate([
    (0, common_1.Post)(':id/signatures'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, add_inspection_signature_dto_1.AddInspectionSignatureDto]),
    __metadata("design:returntype", void 0)
], PmInspectionsController.prototype, "addSignature", null);
__decorate([
    (0, common_1.Post)(':id/attachments'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PmInspectionsController.prototype, "addAttachment", null);
__decorate([
    (0, common_1.Post)(':id/engine/generate'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PmInspectionsController.prototype, "generateAuditCapaEngineFromInspection", null);
__decorate([
    (0, common_1.Get)(':id/report'),
    (0, require_permission_decorator_1.RequirePermission)(security_types_1.Permission.INSPECTION_VIEW),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PmInspectionsController.prototype, "inspectionReport", null);
__decorate([
    (0, common_1.Put)(':id/sharing'),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], PmInspectionsController.prototype, "updateReportSharing", null);
__decorate([
    (0, common_1.Put)(':id/photos/:attachmentId/metadata'),
    (0, require_permission_decorator_1.RequirePermission)(security_types_1.Permission.INSPECTION_EDIT),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('attachmentId')),
    __param(2, (0, common_1.Req)()),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], PmInspectionsController.prototype, "savePhotoMetadata", null);
__decorate([
    (0, common_1.Post)(':id/photos/capture'),
    (0, common_1.HttpCode)(common_1.HttpStatus.ACCEPTED),
    (0, throttler_1.Throttle)(60, 60),
    (0, require_permission_decorator_1.RequirePermission)(security_types_1.Permission.INSPECTION_EDIT),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], PmInspectionsController.prototype, "capturePhoto", null);
__decorate([
    (0, common_1.Get)(':id/photo-findings'),
    (0, require_permission_decorator_1.RequirePermission)(security_types_1.Permission.INSPECTION_VIEW),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PmInspectionsController.prototype, "photoFindings", null);
__decorate([
    (0, common_1.Post)('contractor-dispatch/:dispatchId/acknowledge'),
    __param(0, (0, common_1.Param)('dispatchId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PmInspectionsController.prototype, "acknowledgeDispatch", null);
__decorate([
    (0, common_1.Post)('contractor-dispatch/:dispatchId/complete'),
    __param(0, (0, common_1.Param)('dispatchId')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], PmInspectionsController.prototype, "completeDispatch", null);
__decorate([
    (0, common_1.Post)('corrective-actions/:actionId/dispatch-contractor'),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    __param(0, (0, common_1.Param)('actionId')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], PmInspectionsController.prototype, "dispatchContractor", null);
__decorate([
    (0, common_1.Post)(':id/escalate-to-incident'),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], PmInspectionsController.prototype, "escalateToIncident", null);
__decorate([
    (0, common_1.Post)(':id/draft-safety-meeting'),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PmInspectionsController.prototype, "draftSafetyMeeting", null);
__decorate([
    (0, common_1.Post)(':id/deficiencies'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], PmInspectionsController.prototype, "createDeficiency", null);
__decorate([
    (0, common_1.Post)('deficiencies/:deficiencyId/verify'),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    __param(0, (0, common_1.Param)('deficiencyId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PmInspectionsController.prototype, "verifyDeficiency", null);
exports.PmInspectionsController = PmInspectionsController = __decorate([
    (0, common_1.Controller)(`${routes_1.API_V1_PREFIX}/pm/inspections`),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...PM_ROLES),
    (0, require_permission_decorator_1.RequirePermission)(security_types_1.Permission.PM_ACCESS),
    __metadata("design:paramtypes", [permission_service_1.PermissionService,
        tenant_scope_service_1.TenantScopeService,
        pm_inspections_service_1.PmInspectionsService,
        pm_inspection_templates_service_1.PmInspectionTemplatesService,
        pm_inspections_cail_intelligence_service_1.PmInspectionsCailIntelligenceService,
        pm_inspection_photo_pipeline_service_1.PmInspectionPhotoPipelineService,
        pm_inspection_dashboard_service_1.PmInspectionDashboardService,
        pm_inspection_contractor_dispatch_service_1.PmInspectionContractorDispatchService,
        pm_inspection_subcontractor_resolver_service_1.PmInspectionSubcontractorResolverService,
        pm_safety_meetings_service_1.PmSafetyMeetingsService,
        pm_inspection_report_service_1.PmInspectionReportService,
        pm_inspection_access_service_1.PmInspectionAccessService,
        pm_inspection_findings_log_service_1.PmInspectionFindingsLogService,
        pm_inspection_shared_service_1.PmInspectionSharedService,
        audit_inspection_capa_engine_service_1.AuditInspectionCapaEngineService])
], PmInspectionsController);
//# sourceMappingURL=pm-inspections.controller.js.map