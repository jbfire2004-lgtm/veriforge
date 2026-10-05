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
exports.VeraCoreController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
const roles_decorator_1 = require("../../auth/roles.decorator");
const roles_guard_1 = require("../../auth/roles.guard");
const routes_1 = require("../../config/routes");
const registry_service_1 = require("./registry.service");
const company_links_service_1 = require("./company-links.service");
const equipment_links_service_1 = require("./equipment-links.service");
const projects_service_1 = require("./projects.service");
const union_halls_service_1 = require("./union-halls.service");
const union_hall_training_service_1 = require("./union-hall-training.service");
const union_hall_training_dto_1 = require("./dto/union-hall-training.dto");
const wallets_service_1 = require("./wallets.service");
const training_pipeline_service_1 = require("./training-pipeline.service");
const inspections_core_service_1 = require("./inspections-core.service");
const competency_core_service_1 = require("./competency-core.service");
const vera_platform_service_1 = require("./vera-platform.service");
const core_readiness_service_1 = require("./core-readiness.service");
const core_documents_service_1 = require("./core-documents.service");
const provider_integration_hub_service_1 = require("./provider-integration-hub.service");
const vera_core_hub_service_1 = require("./vera-core-hub.service");
const training_ingestion_service_1 = require("../../training-ingestion/training-ingestion.service");
const digital_twin_service_1 = require("../digital-twin/digital-twin.service");
const link_equipment_qr_dto_1 = require("./dto/link-equipment-qr.dto");
const search_workers_dto_1 = require("./dto/search-workers.dto");
const link_worker_dto_1 = require("./dto/link-worker.dto");
const merge_worker_dto_1 = require("./dto/merge-worker.dto");
const create_project_dto_1 = require("./dto/create-project.dto");
const union_hall_dto_1 = require("./dto/union-hall.dto");
const training_ingest_dto_1 = require("./dto/training-ingest.dto");
const create_inspection_dto_1 = require("./dto/create-inspection.dto");
const competency_evaluate_dto_1 = require("./dto/competency-evaluate.dto");
const roles_1 = require("./roles");
const actor_util_1 = require("../../security/actor.util");
const require_permission_decorator_1 = require("../../security/decorators/require-permission.decorator");
const tenant_scoped_decorator_1 = require("../../security/decorators/tenant-scoped.decorator");
const permission_service_1 = require("../../security/permission.service");
const tenant_scope_service_1 = require("../../security/tenant-scope.service");
const security_types_1 = require("../../security/security.types");
let VeraCoreController = class VeraCoreController {
    constructor(registry, companyLinks, equipmentLinks, projects, unionHalls, unionHallTraining, wallets, trainingPipeline, inspections, competency, platform, readiness, permissions, tenant, documents, trainingIngestion, digitalTwin, providerHub, hub) {
        this.registry = registry;
        this.companyLinks = companyLinks;
        this.equipmentLinks = equipmentLinks;
        this.projects = projects;
        this.unionHalls = unionHalls;
        this.unionHallTraining = unionHallTraining;
        this.wallets = wallets;
        this.trainingPipeline = trainingPipeline;
        this.inspections = inspections;
        this.competency = competency;
        this.platform = platform;
        this.readiness = readiness;
        this.permissions = permissions;
        this.tenant = tenant;
        this.documents = documents;
        this.trainingIngestion = trainingIngestion;
        this.digitalTwin = digitalTwin;
        this.providerHub = providerHub;
        this.hub = hub;
    }
    hubMetrics(companyId, req) {
        var _a;
        return this.hub.getHubMetrics(companyId ? Number(companyId) : undefined, (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.id);
    }
    platformSummary(companyId) {
        return this.platform.getPlatformSummary(companyId ? Number(companyId) : undefined);
    }
    platformNotifyDue(companyId) {
        return this.platform.runScheduledNotifications(companyId ? Number(companyId) : undefined);
    }
    searchWorkers(query) {
        return this.registry.searchWorkers(query);
    }
    workerProfile(id) {
        return this.registry.getWorkerProfile(id);
    }
    workerDuplicates(id) {
        return this.registry.findDuplicateWorkers(id);
    }
    mergeWorkers(dto, req) {
        return this.registry.mergeWorkers(dto.survivorId, dto.mergedId, req.user.id, dto.reason);
    }
    searchEquipment(q, serial, assetTag, qr, limit) {
        return this.registry.searchEquipment({
            q,
            serial,
            assetTag,
            qr,
            limit: limit ? Number(limit) : undefined,
        });
    }
    equipmentProfile(id) {
        return this.registry.getEquipmentProfile(id);
    }
    mergeEquipment(body, req) {
        return this.registry.mergeEquipment(body.survivorId, body.mergedId, req.user.id, body.reason);
    }
    companyWorkers(companyId, activeOnly) {
        return this.companyLinks.listByCompany(companyId, activeOnly !== 'false');
    }
    linkWorker(dto) {
        return this.companyLinks.linkWorker(dto.workerId, dto.companyId, {
            role: dto.role,
            trade: dto.trade,
            deactivateOtherCompanies: dto.deactivateOtherCompanies,
        });
    }
    linkWorkerByQr(dto) {
        return this.companyLinks.linkByQrToken(dto.qrToken, dto.companyId);
    }
    endWorkerAssignment(workerId, companyId) {
        return this.companyLinks.endAssignment(workerId, companyId);
    }
    activateWorker(workerId, companyId) {
        return this.companyLinks.activate(workerId, companyId);
    }
    companyEquipment(companyId, activeOnly) {
        return this.equipmentLinks.listByCompany(companyId, activeOnly !== 'false');
    }
    linkEquipment(body) {
        return this.equipmentLinks.linkEquipment(body.equipmentId, body.companyId);
    }
    async linkEquipmentByQr(body) {
        var _a, _b;
        const link = await this.equipmentLinks.linkByQrToken(body.qrToken, body.companyId);
        const summary = await this.wallets.getEquipmentWallet(link.equipmentId);
        return {
            linked: true,
            equipmentId: link.equipmentId,
            companyId: body.companyId,
            linkId: link.id,
            complianceStatus: link.complianceStatus,
            equipmentName: (_b = (_a = link.equipment) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : null,
            walletUrl: `/equipment/${link.equipmentId}/wallet`,
            summary,
        };
    }
    endEquipmentAssignment(equipmentId, companyId) {
        return this.equipmentLinks.endAssignment(equipmentId, companyId);
    }
    listProjects(companyId) {
        return this.projects.listByCompany(companyId);
    }
    createProject(dto) {
        return this.projects.create(Object.assign(Object.assign({}, dto), { startDate: dto.startDate ? new Date(dto.startDate) : undefined }));
    }
    assignWorker(projectId, dto, req) {
        return this.projects.assignWorker(projectId, dto.workerId, req.user.id, dto.equipmentId);
    }
    assignEquipment(projectId, dto, req) {
        return this.projects.assignEquipment(projectId, dto.equipmentId, req.user.id);
    }
    removeWorker(projectId, dto) {
        return this.projects.removeWorker(projectId, dto.workerId);
    }
    closeProject(projectId) {
        return this.projects.close(projectId);
    }
    listUnionHalls() {
        return this.unionHalls.listHalls();
    }
    createUnionHall(dto) {
        return this.unionHalls.createHall(dto);
    }
    unionMembers(id) {
        return this.unionHalls.listMembers(id);
    }
    addMember(id, dto) {
        return this.unionHalls.addMember(id, dto);
    }
    dispatch(id, dto, req) {
        return this.unionHalls.dispatchWorker(id, dto.workerId, dto.companyId, req.user.id, dto.notes);
    }
    recall(id, dto) {
        return this.unionHalls.recallWorker(id, dto.workerId, dto.companyId);
    }
    unionHallTrainingDashboard(id, req) {
        return this.unionHallTraining.getDashboard(id, req.user);
    }
    unionHallPendingTraining(id, req) {
        return this.unionHallTraining.listPending(id, req.user);
    }
    linkUnionHallProvider(id, dto, req) {
        return this.unionHallTraining.linkProvider(id, dto.trainingProviderId, req.user);
    }
    acceptUnionHallTraining(id, recordId, dto, req) {
        return this.unionHallTraining.acceptTraining(id, recordId, req.user, dto.notes);
    }
    rejectUnionHallTraining(id, recordId, dto, req) {
        return this.unionHallTraining.rejectTraining(id, recordId, req.user, dto.notes);
    }
    validateUnionHallTraining(id, recordId, req) {
        return this.unionHallTraining.validateTraining(id, recordId, req.user);
    }
    pushUnionHallTraining(id, recordId, dto, req) {
        return this.unionHallTraining.pushTraining(id, recordId, req.user, dto);
    }
    workerWallet(id) {
        return this.wallets.getWorkerWallet(id);
    }
    workerWalletFull(id) {
        return this.wallets.getWorkerWallet(id);
    }
    equipmentWallet(id) {
        return this.wallets.getEquipmentWallet(id);
    }
    equipmentWalletFull(id) {
        return this.wallets.getEquipmentWalletFull(id);
    }
    trainingIngest(dto) {
        return this.trainingPipeline.ingest(Object.assign(Object.assign({}, dto), { expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined, issuedAt: dto.issuedAt ? new Date(dto.issuedAt) : undefined }));
    }
    createInspection(dto, req) {
        return this.inspections.createInspection(Object.assign(Object.assign({}, dto), { inspectorId: req.user.id }));
    }
    equipmentInspections(id) {
        return this.inspections.listForEquipment(id);
    }
    competencyEvaluate(dto, req) {
        return this.competency.evaluate(Object.assign(Object.assign({}, dto), { evaluatorUserId: req.user.id }));
    }
    workerCompetency(id) {
        return this.competency.listForWorker(id);
    }
    async readinessSummary(companyId, req) {
        const actor = (0, actor_util_1.toSecurityActor)(req.user);
        const resolved = companyId ? Number(companyId) : undefined;
        await this.permissions.assertCanViewCompanyReadiness(actor, resolved);
        return this.readiness.summary(resolved, actor.id);
    }
    async workerReadiness(id, req) {
        await this.permissions.assertCanViewWorker((0, actor_util_1.toSecurityActor)(req.user), id);
        return this.readiness.workerScore(id);
    }
    async equipmentReadiness(id, req) {
        const actor = (0, actor_util_1.toSecurityActor)(req.user);
        this.permissions.assertPermission(actor, security_types_1.Permission.CORE_ACCESS);
        await this.tenant.assertEquipmentInTenant(actor, id);
        return this.readiness.equipmentScore(id);
    }
    listDocuments(purpose, companyId, projectId, linkedProjectId, limit, mine, req) {
        var _a, _b, _c;
        const parsedCompany = companyId ? Number(companyId) : undefined;
        const resolvedCompany = parsedCompany != null && Number.isFinite(parsedCompany)
            ? parsedCompany
            : (_b = (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.companyId) !== null && _b !== void 0 ? _b : undefined;
        const projectRaw = projectId !== null && projectId !== void 0 ? projectId : linkedProjectId;
        const parsedProject = projectRaw ? Number(projectRaw) : undefined;
        const mineOnly = mine === '1' || mine === 'true';
        return this.documents.listDocuments({
            purpose,
            companyId: resolvedCompany,
            projectId: parsedProject != null && Number.isFinite(parsedProject)
                ? parsedProject
                : undefined,
            userId: mineOnly ? (_c = req === null || req === void 0 ? void 0 : req.user) === null || _c === void 0 ? void 0 : _c.id : undefined,
            limit: limit ? Number(limit) : undefined,
        });
    }
    trainingIngestionRuns(companyId, status, limit) {
        return this.trainingIngestion.listRuns({
            companyId,
            status,
            limit: limit ? Number(limit) : undefined,
        });
    }
    trainingVerificationQueue(companyId, limit) {
        return this.trainingIngestion.verificationQueue(companyId, limit ? Number(limit) : undefined);
    }
    async providerHubSummary(companyId, req) {
        const actor = (0, actor_util_1.toSecurityActor)(req.user);
        this.tenant.assertCompanyAccess(actor, companyId);
        return this.providerHub.getSummary(companyId);
    }
    hydrateTwins(companyId) {
        return this.digitalTwin.hydrateCompany(companyId);
    }
    twinsDashboard() {
        return this.digitalTwin.getDashboard();
    }
};
exports.VeraCoreController = VeraCoreController;
__decorate([
    (0, common_1.Get)('hub/metrics'),
    (0, roles_decorator_1.Roles)(...roles_1.SUPERVISOR_ROLES),
    __param(0, (0, common_1.Query)('companyId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], VeraCoreController.prototype, "hubMetrics", null);
__decorate([
    (0, common_1.Get)('platform/summary'),
    (0, roles_decorator_1.Roles)(...roles_1.SUPERVISOR_ROLES),
    __param(0, (0, common_1.Query)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VeraCoreController.prototype, "platformSummary", null);
__decorate([
    (0, common_1.Post)('platform/notify-due'),
    (0, roles_decorator_1.Roles)(...roles_1.COMPANY_ADMIN_ROLES),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Query)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VeraCoreController.prototype, "platformNotifyDue", null);
__decorate([
    (0, common_1.Get)('workers/search'),
    (0, roles_decorator_1.Roles)(...roles_1.STAFF_ROLES),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [search_workers_dto_1.SearchWorkersDto]),
    __metadata("design:returntype", void 0)
], VeraCoreController.prototype, "searchWorkers", null);
__decorate([
    (0, common_1.Get)('workers/:id/profile'),
    (0, roles_decorator_1.Roles)(...roles_1.STAFF_ROLES, client_1.UserRole.WORKER),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], VeraCoreController.prototype, "workerProfile", null);
__decorate([
    (0, common_1.Get)('workers/:id/duplicates'),
    (0, roles_decorator_1.Roles)(...roles_1.SUPER_ADMIN_ROLES, client_1.UserRole.COMPANY_ADMIN),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], VeraCoreController.prototype, "workerDuplicates", null);
__decorate([
    (0, common_1.Post)('workers/merge'),
    (0, roles_decorator_1.Roles)(...roles_1.SUPER_ADMIN_ROLES),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [merge_worker_dto_1.MergeWorkerDto, Object]),
    __metadata("design:returntype", void 0)
], VeraCoreController.prototype, "mergeWorkers", null);
__decorate([
    (0, common_1.Get)('equipment/search'),
    (0, roles_decorator_1.Roles)(...roles_1.STAFF_ROLES),
    __param(0, (0, common_1.Query)('q')),
    __param(1, (0, common_1.Query)('serial')),
    __param(2, (0, common_1.Query)('assetTag')),
    __param(3, (0, common_1.Query)('qr')),
    __param(4, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], VeraCoreController.prototype, "searchEquipment", null);
__decorate([
    (0, common_1.Get)('equipment/:id/profile'),
    (0, roles_decorator_1.Roles)(...roles_1.STAFF_ROLES),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], VeraCoreController.prototype, "equipmentProfile", null);
__decorate([
    (0, common_1.Post)('equipment/merge'),
    (0, roles_decorator_1.Roles)(...roles_1.SUPER_ADMIN_ROLES),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], VeraCoreController.prototype, "mergeEquipment", null);
__decorate([
    (0, common_1.Get)('companies/:companyId/workers'),
    (0, roles_decorator_1.Roles)(...roles_1.COMPANY_ADMIN_ROLES, client_1.UserRole.SUPERVISOR),
    __param(0, (0, common_1.Param)('companyId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('activeOnly')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", void 0)
], VeraCoreController.prototype, "companyWorkers", null);
__decorate([
    (0, common_1.Post)('company-links'),
    (0, roles_decorator_1.Roles)(...roles_1.COMPANY_ADMIN_ROLES, client_1.UserRole.SUPERVISOR),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [link_worker_dto_1.LinkWorkerDto]),
    __metadata("design:returntype", void 0)
], VeraCoreController.prototype, "linkWorker", null);
__decorate([
    (0, common_1.Post)('company-links/scan'),
    (0, roles_decorator_1.Roles)(...roles_1.SUPERVISOR_ROLES),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [link_worker_dto_1.LinkWorkerByQrDto]),
    __metadata("design:returntype", void 0)
], VeraCoreController.prototype, "linkWorkerByQr", null);
__decorate([
    (0, common_1.Post)('company-links/:workerId/:companyId/end'),
    (0, roles_decorator_1.Roles)(...roles_1.COMPANY_ADMIN_ROLES, client_1.UserRole.SUPERVISOR),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('workerId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('companyId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], VeraCoreController.prototype, "endWorkerAssignment", null);
__decorate([
    (0, common_1.Post)('company-links/:workerId/:companyId/activate'),
    (0, roles_decorator_1.Roles)(...roles_1.COMPANY_ADMIN_ROLES, client_1.UserRole.SUPERVISOR),
    __param(0, (0, common_1.Param)('workerId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('companyId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], VeraCoreController.prototype, "activateWorker", null);
__decorate([
    (0, common_1.Get)('companies/:companyId/equipment'),
    (0, roles_decorator_1.Roles)(...roles_1.COMPANY_ADMIN_ROLES, client_1.UserRole.SUPERVISOR),
    __param(0, (0, common_1.Param)('companyId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('activeOnly')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", void 0)
], VeraCoreController.prototype, "companyEquipment", null);
__decorate([
    (0, common_1.Post)('equipment-links'),
    (0, roles_decorator_1.Roles)(...roles_1.COMPANY_ADMIN_ROLES, client_1.UserRole.SUPERVISOR),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], VeraCoreController.prototype, "linkEquipment", null);
__decorate([
    (0, common_1.Post)('equipment-links/scan'),
    (0, roles_decorator_1.Roles)(...roles_1.SUPERVISOR_ROLES),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [link_equipment_qr_dto_1.LinkEquipmentByQrDto]),
    __metadata("design:returntype", Promise)
], VeraCoreController.prototype, "linkEquipmentByQr", null);
__decorate([
    (0, common_1.Post)('equipment-links/:equipmentId/:companyId/end'),
    (0, roles_decorator_1.Roles)(...roles_1.COMPANY_ADMIN_ROLES, client_1.UserRole.SUPERVISOR),
    __param(0, (0, common_1.Param)('equipmentId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('companyId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], VeraCoreController.prototype, "endEquipmentAssignment", null);
__decorate([
    (0, common_1.Get)('companies/:companyId/projects'),
    (0, roles_decorator_1.Roles)(...roles_1.COMPANY_ADMIN_ROLES, client_1.UserRole.SUPERVISOR, client_1.UserRole.PROJECT_MANAGER),
    __param(0, (0, common_1.Param)('companyId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], VeraCoreController.prototype, "listProjects", null);
__decorate([
    (0, common_1.Post)('projects'),
    (0, roles_decorator_1.Roles)(...roles_1.COMPANY_ADMIN_ROLES, client_1.UserRole.PROJECT_MANAGER),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_project_dto_1.CreateProjectDto]),
    __metadata("design:returntype", void 0)
], VeraCoreController.prototype, "createProject", null);
__decorate([
    (0, common_1.Post)('projects/:projectId/assign-worker'),
    (0, roles_decorator_1.Roles)(...roles_1.SUPERVISOR_ROLES),
    __param(0, (0, common_1.Param)('projectId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, create_project_dto_1.AssignToProjectDto, Object]),
    __metadata("design:returntype", void 0)
], VeraCoreController.prototype, "assignWorker", null);
__decorate([
    (0, common_1.Post)('projects/:projectId/assign-equipment'),
    (0, roles_decorator_1.Roles)(...roles_1.SUPERVISOR_ROLES),
    __param(0, (0, common_1.Param)('projectId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, create_project_dto_1.AssignToProjectDto, Object]),
    __metadata("design:returntype", void 0)
], VeraCoreController.prototype, "assignEquipment", null);
__decorate([
    (0, common_1.Post)('projects/:projectId/remove-worker'),
    (0, roles_decorator_1.Roles)(...roles_1.SUPERVISOR_ROLES),
    __param(0, (0, common_1.Param)('projectId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, create_project_dto_1.AssignToProjectDto]),
    __metadata("design:returntype", void 0)
], VeraCoreController.prototype, "removeWorker", null);
__decorate([
    (0, common_1.Post)('projects/:projectId/close'),
    (0, roles_decorator_1.Roles)(...roles_1.COMPANY_ADMIN_ROLES, client_1.UserRole.PROJECT_MANAGER),
    __param(0, (0, common_1.Param)('projectId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], VeraCoreController.prototype, "closeProject", null);
__decorate([
    (0, common_1.Get)('union-halls'),
    (0, roles_decorator_1.Roles)(...roles_1.UNION_HALL_ROLES),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], VeraCoreController.prototype, "listUnionHalls", null);
__decorate([
    (0, common_1.Post)('union-halls'),
    (0, roles_decorator_1.Roles)(...roles_1.SUPER_ADMIN_ROLES),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [union_hall_dto_1.CreateUnionHallDto]),
    __metadata("design:returntype", void 0)
], VeraCoreController.prototype, "createUnionHall", null);
__decorate([
    (0, common_1.Get)('union-halls/:id/members'),
    (0, roles_decorator_1.Roles)(...roles_1.UNION_HALL_ROLES),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], VeraCoreController.prototype, "unionMembers", null);
__decorate([
    (0, common_1.Post)('union-halls/:id/members'),
    (0, roles_decorator_1.Roles)(...roles_1.UNION_HALL_ROLES),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, union_hall_dto_1.AddUnionMemberDto]),
    __metadata("design:returntype", void 0)
], VeraCoreController.prototype, "addMember", null);
__decorate([
    (0, common_1.Post)('union-halls/:id/dispatch'),
    (0, roles_decorator_1.Roles)(...roles_1.UNION_HALL_ROLES),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, union_hall_dto_1.DispatchWorkerDto, Object]),
    __metadata("design:returntype", void 0)
], VeraCoreController.prototype, "dispatch", null);
__decorate([
    (0, common_1.Post)('union-halls/:id/recall'),
    (0, roles_decorator_1.Roles)(...roles_1.UNION_HALL_ROLES),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, union_hall_dto_1.DispatchWorkerDto]),
    __metadata("design:returntype", void 0)
], VeraCoreController.prototype, "recall", null);
__decorate([
    (0, common_1.Get)('union-halls/:id/training-dashboard'),
    (0, roles_decorator_1.Roles)(...roles_1.UNION_HALL_ROLES, ...roles_1.SUPER_ADMIN_ROLES),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], VeraCoreController.prototype, "unionHallTrainingDashboard", null);
__decorate([
    (0, common_1.Get)('union-halls/:id/training/pending'),
    (0, roles_decorator_1.Roles)(...roles_1.UNION_HALL_ROLES, ...roles_1.SUPER_ADMIN_ROLES),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], VeraCoreController.prototype, "unionHallPendingTraining", null);
__decorate([
    (0, common_1.Post)('union-halls/:id/providers/link'),
    (0, roles_decorator_1.Roles)(...roles_1.UNION_HALL_ROLES, ...roles_1.SUPER_ADMIN_ROLES),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, union_hall_training_dto_1.LinkUnionHallProviderDto, Object]),
    __metadata("design:returntype", void 0)
], VeraCoreController.prototype, "linkUnionHallProvider", null);
__decorate([
    (0, common_1.Post)('union-halls/:id/training/:recordId/accept'),
    (0, roles_decorator_1.Roles)(...roles_1.UNION_HALL_ROLES, ...roles_1.SUPER_ADMIN_ROLES),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('recordId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, union_hall_training_dto_1.UnionHallTrainingNotesDto, Object]),
    __metadata("design:returntype", void 0)
], VeraCoreController.prototype, "acceptUnionHallTraining", null);
__decorate([
    (0, common_1.Post)('union-halls/:id/training/:recordId/reject'),
    (0, roles_decorator_1.Roles)(...roles_1.UNION_HALL_ROLES, ...roles_1.SUPER_ADMIN_ROLES),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('recordId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, union_hall_training_dto_1.UnionHallTrainingNotesDto, Object]),
    __metadata("design:returntype", void 0)
], VeraCoreController.prototype, "rejectUnionHallTraining", null);
__decorate([
    (0, common_1.Post)('union-halls/:id/training/:recordId/validate'),
    (0, roles_decorator_1.Roles)(...roles_1.UNION_HALL_ROLES, ...roles_1.SUPER_ADMIN_ROLES),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('recordId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object]),
    __metadata("design:returntype", void 0)
], VeraCoreController.prototype, "validateUnionHallTraining", null);
__decorate([
    (0, common_1.Post)('union-halls/:id/training/:recordId/push'),
    (0, roles_decorator_1.Roles)(...roles_1.UNION_HALL_ROLES, ...roles_1.SUPER_ADMIN_ROLES),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('recordId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, union_hall_training_dto_1.PushUnionHallTrainingDto, Object]),
    __metadata("design:returntype", void 0)
], VeraCoreController.prototype, "pushUnionHallTraining", null);
__decorate([
    (0, common_1.Get)('wallets/worker/:id'),
    (0, roles_decorator_1.Roles)(...roles_1.STAFF_ROLES),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], VeraCoreController.prototype, "workerWallet", null);
__decorate([
    (0, common_1.Get)('wallets/worker/:id/full'),
    (0, roles_decorator_1.Roles)(...roles_1.STAFF_ROLES),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], VeraCoreController.prototype, "workerWalletFull", null);
__decorate([
    (0, common_1.Get)('wallets/equipment/:id'),
    (0, roles_decorator_1.Roles)(...roles_1.STAFF_ROLES),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], VeraCoreController.prototype, "equipmentWallet", null);
__decorate([
    (0, common_1.Get)('wallets/equipment/:id/full'),
    (0, roles_decorator_1.Roles)(...roles_1.STAFF_ROLES),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], VeraCoreController.prototype, "equipmentWalletFull", null);
__decorate([
    (0, common_1.Post)('training/ingest'),
    (0, roles_decorator_1.Roles)(...roles_1.COMPANY_ADMIN_ROLES, ...roles_1.UNION_HALL_ROLES, client_1.UserRole.SUPERVISOR),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [training_ingest_dto_1.TrainingIngestDto]),
    __metadata("design:returntype", void 0)
], VeraCoreController.prototype, "trainingIngest", null);
__decorate([
    (0, common_1.Post)('inspections'),
    (0, roles_decorator_1.Roles)(...roles_1.SUPERVISOR_ROLES),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_inspection_dto_1.CreateInspectionDto, Object]),
    __metadata("design:returntype", void 0)
], VeraCoreController.prototype, "createInspection", null);
__decorate([
    (0, common_1.Get)('equipment/:id/inspections'),
    (0, roles_decorator_1.Roles)(...roles_1.STAFF_ROLES),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], VeraCoreController.prototype, "equipmentInspections", null);
__decorate([
    (0, common_1.Post)('competency/evaluate'),
    (0, roles_decorator_1.Roles)(...roles_1.SUPERVISOR_ROLES),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [competency_evaluate_dto_1.CompetencyEvaluateDto, Object]),
    __metadata("design:returntype", void 0)
], VeraCoreController.prototype, "competencyEvaluate", null);
__decorate([
    (0, common_1.Get)('workers/:id/competency'),
    (0, roles_decorator_1.Roles)(...roles_1.STAFF_ROLES),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], VeraCoreController.prototype, "workerCompetency", null);
__decorate([
    (0, common_1.Get)('readiness/summary'),
    (0, roles_decorator_1.Roles)(...roles_1.SUPERVISOR_ROLES),
    (0, require_permission_decorator_1.RequirePermission)(security_types_1.Permission.COMPANY_READINESS_VIEW),
    (0, tenant_scoped_decorator_1.TenantScoped)('companyId'),
    __param(0, (0, common_1.Query)('companyId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], VeraCoreController.prototype, "readinessSummary", null);
__decorate([
    (0, common_1.Get)('readiness/workers/:id'),
    (0, roles_decorator_1.Roles)(...roles_1.STAFF_ROLES),
    (0, require_permission_decorator_1.RequirePermission)(security_types_1.Permission.WORKER_VIEW),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], VeraCoreController.prototype, "workerReadiness", null);
__decorate([
    (0, common_1.Get)('readiness/equipment/:id'),
    (0, roles_decorator_1.Roles)(...roles_1.STAFF_ROLES),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], VeraCoreController.prototype, "equipmentReadiness", null);
__decorate([
    (0, common_1.Get)('documents'),
    (0, roles_decorator_1.Roles)(...roles_1.STAFF_ROLES),
    __param(0, (0, common_1.Query)('purpose')),
    __param(1, (0, common_1.Query)('companyId')),
    __param(2, (0, common_1.Query)('projectId')),
    __param(3, (0, common_1.Query)('linked_project_id')),
    __param(4, (0, common_1.Query)('limit')),
    __param(5, (0, common_1.Query)('mine')),
    __param(6, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, Object]),
    __metadata("design:returntype", void 0)
], VeraCoreController.prototype, "listDocuments", null);
__decorate([
    (0, common_1.Get)('training/runs'),
    (0, roles_decorator_1.Roles)(...roles_1.COMPANY_ADMIN_ROLES, ...roles_1.UNION_HALL_ROLES, client_1.UserRole.SUPERVISOR),
    __param(0, (0, common_1.Query)('companyId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String]),
    __metadata("design:returntype", void 0)
], VeraCoreController.prototype, "trainingIngestionRuns", null);
__decorate([
    (0, common_1.Get)('training/verification-queue'),
    (0, roles_decorator_1.Roles)(...roles_1.COMPANY_ADMIN_ROLES, ...roles_1.UNION_HALL_ROLES, client_1.UserRole.SUPERVISOR),
    __param(0, (0, common_1.Query)('companyId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", void 0)
], VeraCoreController.prototype, "trainingVerificationQueue", null);
__decorate([
    (0, common_1.Get)('provider-hub/summary'),
    (0, roles_decorator_1.Roles)(...roles_1.SUPERVISOR_ROLES),
    (0, require_permission_decorator_1.RequirePermission)(security_types_1.Permission.CORE_ACCESS),
    (0, tenant_scoped_decorator_1.TenantScoped)('companyId'),
    __param(0, (0, common_1.Query)('companyId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], VeraCoreController.prototype, "providerHubSummary", null);
__decorate([
    (0, common_1.Post)('twins/hydrate'),
    (0, roles_decorator_1.Roles)(...roles_1.SUPERVISOR_ROLES),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Query)('companyId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], VeraCoreController.prototype, "hydrateTwins", null);
__decorate([
    (0, common_1.Get)('twins/dashboard'),
    (0, roles_decorator_1.Roles)(...roles_1.SUPERVISOR_ROLES),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], VeraCoreController.prototype, "twinsDashboard", null);
exports.VeraCoreController = VeraCoreController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)(`${routes_1.API_V1_PREFIX}/core`),
    __metadata("design:paramtypes", [registry_service_1.RegistryService,
        company_links_service_1.CompanyLinksService,
        equipment_links_service_1.EquipmentLinksService,
        projects_service_1.ProjectsService,
        union_halls_service_1.UnionHallsService,
        union_hall_training_service_1.UnionHallTrainingService,
        wallets_service_1.WalletsService,
        training_pipeline_service_1.TrainingPipelineService,
        inspections_core_service_1.InspectionsCoreService,
        competency_core_service_1.CompetencyCoreService,
        vera_platform_service_1.VeraPlatformService,
        core_readiness_service_1.CoreReadinessService,
        permission_service_1.PermissionService,
        tenant_scope_service_1.TenantScopeService,
        core_documents_service_1.CoreDocumentsService,
        training_ingestion_service_1.TrainingIngestionService,
        digital_twin_service_1.DigitalTwinService,
        provider_integration_hub_service_1.ProviderIntegrationHubService,
        vera_core_hub_service_1.VeraCoreHubService])
], VeraCoreController);
//# sourceMappingURL=vera-core.controller.js.map