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
exports.PmDocumentControlController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const routes_1 = require("../config/routes");
const pm_document_control_service_1 = require("./pm-document-control.service");
const pm_document_cail_intelligence_service_1 = require("./pm-document-cail-intelligence.service");
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
let PmDocumentControlController = class PmDocumentControlController {
    constructor(docs, cail) {
        this.docs = docs;
        this.cail = cail;
    }
    listSds(companyId, projectId, category, status, search) {
        return this.docs.listSds({
            companyId: parseInt(companyId, 10),
            projectId: projectId ? parseInt(projectId, 10) : undefined,
            category,
            status,
            search,
        });
    }
    createSds(body, req) {
        return this.docs.createSds(body, req.user.id);
    }
    getSds(id) {
        return this.docs.getSds(id);
    }
    transitionSds(id, status, req) {
        return this.docs.transitionSds(id, status, req.user.id);
    }
    replaceSds(id, body, req) {
        return this.docs.replaceSds(id, body, req.user.id);
    }
    addSdsAttachment(id, body) {
        return this.docs.addSdsAttachment(id, body);
    }
    listInventory(companyId, projectId, siteId) {
        return this.docs.listChemicalInventory({
            companyId: companyId ? parseInt(companyId, 10) : undefined,
            projectId: projectId ? parseInt(projectId, 10) : undefined,
            siteId: siteId ? parseInt(siteId, 10) : undefined,
        });
    }
    upsertInventory(body, req) {
        return this.docs.upsertChemicalItem(body, req.user.id);
    }
    scanDeficiencies(projectId, req) {
        return this.docs.scanChemicalDeficiencies(parseInt(projectId, 10), req.user.id);
    }
    listControlled(companyId, projectId, documentType, status) {
        return this.docs.listControlledDocuments({
            companyId: parseInt(companyId, 10),
            projectId: projectId ? parseInt(projectId, 10) : undefined,
            documentType,
            status,
        });
    }
    createControlled(body, req) {
        return this.docs.createControlledDocument(body, req.user.id);
    }
    transitionControlled(id, status, req) {
        return this.docs.transitionControlledDocument(id, status, req.user.id);
    }
    listPolicies(companyId, projectId) {
        return this.docs.listPolicies(parseInt(companyId, 10), projectId ? parseInt(projectId, 10) : undefined);
    }
    publishPolicy(id, req) {
        return this.docs.publishPolicy(id, req.user.id);
    }
    acknowledge(body) {
        return this.docs.acknowledgeDocument(body);
    }
    listManufacturer(companyId, equipmentId) {
        return this.docs.listManufacturerInstructions(parseInt(companyId, 10), equipmentId ? parseInt(equipmentId, 10) : undefined);
    }
    createManufacturer(body, req) {
        return this.docs.createManufacturerInstruction(body, req.user.id);
    }
    suggestControls(equipmentId) {
        return this.docs.suggestControlsFromManufacturer(parseInt(equipmentId, 10));
    }
    workerAccess(workerId, projectId) {
        return this.docs.workerAccessCheck(parseInt(workerId, 10), parseInt(projectId, 10));
    }
    analytics(projectId) {
        return this.docs.analytics(parseInt(projectId, 10));
    }
    intelligence(projectId) {
        return this.cail.projectInsights(parseInt(projectId, 10));
    }
    suggestSds(body) {
        return this.cail.suggestSdsForTask(body);
    }
    syncBundle(projectId) {
        return this.docs.syncBundle(parseInt(projectId, 10));
    }
    applySync(projectId, body, req) {
        return this.docs.applyOfflineSync(parseInt(projectId, 10), body, req.user.id);
    }
    stationPayload(companyId, siteId) {
        return this.docs.stationSyncPayload(parseInt(companyId, 10), siteId ? parseInt(siteId, 10) : undefined);
    }
};
exports.PmDocumentControlController = PmDocumentControlController;
__decorate([
    (0, common_1.Get)('sds'),
    __param(0, (0, common_1.Query)('companyId')),
    __param(1, (0, common_1.Query)('projectId')),
    __param(2, (0, common_1.Query)('category')),
    __param(3, (0, common_1.Query)('status')),
    __param(4, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], PmDocumentControlController.prototype, "listSds", null);
__decorate([
    (0, common_1.Post)('sds'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PmDocumentControlController.prototype, "createSds", null);
__decorate([
    (0, common_1.Get)('sds/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PmDocumentControlController.prototype, "getSds", null);
__decorate([
    (0, common_1.Put)('sds/:id/status'),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('status')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], PmDocumentControlController.prototype, "transitionSds", null);
__decorate([
    (0, common_1.Post)('sds/:id/replace'),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], PmDocumentControlController.prototype, "replaceSds", null);
__decorate([
    (0, common_1.Post)('sds/:id/attachments'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PmDocumentControlController.prototype, "addSdsAttachment", null);
__decorate([
    (0, common_1.Get)('chemical-inventory'),
    __param(0, (0, common_1.Query)('companyId')),
    __param(1, (0, common_1.Query)('projectId')),
    __param(2, (0, common_1.Query)('siteId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], PmDocumentControlController.prototype, "listInventory", null);
__decorate([
    (0, common_1.Post)('chemical-inventory'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PmDocumentControlController.prototype, "upsertInventory", null);
__decorate([
    (0, common_1.Post)('chemical-inventory/scan/:projectId'),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PmDocumentControlController.prototype, "scanDeficiencies", null);
__decorate([
    (0, common_1.Get)('controlled'),
    __param(0, (0, common_1.Query)('companyId')),
    __param(1, (0, common_1.Query)('projectId')),
    __param(2, (0, common_1.Query)('documentType')),
    __param(3, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], PmDocumentControlController.prototype, "listControlled", null);
__decorate([
    (0, common_1.Post)('controlled'),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PmDocumentControlController.prototype, "createControlled", null);
__decorate([
    (0, common_1.Put)('controlled/:id/status'),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('status')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], PmDocumentControlController.prototype, "transitionControlled", null);
__decorate([
    (0, common_1.Get)('policies'),
    __param(0, (0, common_1.Query)('companyId')),
    __param(1, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PmDocumentControlController.prototype, "listPolicies", null);
__decorate([
    (0, common_1.Post)('policies/:id/publish'),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PmDocumentControlController.prototype, "publishPolicy", null);
__decorate([
    (0, common_1.Post)('acknowledge'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PmDocumentControlController.prototype, "acknowledge", null);
__decorate([
    (0, common_1.Get)('manufacturer-instructions'),
    __param(0, (0, common_1.Query)('companyId')),
    __param(1, (0, common_1.Query)('equipmentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PmDocumentControlController.prototype, "listManufacturer", null);
__decorate([
    (0, common_1.Post)('manufacturer-instructions'),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PmDocumentControlController.prototype, "createManufacturer", null);
__decorate([
    (0, common_1.Get)('manufacturer-instructions/equipment/:equipmentId/suggest-controls'),
    __param(0, (0, common_1.Param)('equipmentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PmDocumentControlController.prototype, "suggestControls", null);
__decorate([
    (0, common_1.Get)('access/worker'),
    __param(0, (0, common_1.Query)('workerId')),
    __param(1, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PmDocumentControlController.prototype, "workerAccess", null);
__decorate([
    (0, common_1.Get)('analytics/project/:projectId'),
    __param(0, (0, common_1.Param)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PmDocumentControlController.prototype, "analytics", null);
__decorate([
    (0, common_1.Get)('intelligence/project/:projectId'),
    __param(0, (0, common_1.Param)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PmDocumentControlController.prototype, "intelligence", null);
__decorate([
    (0, common_1.Post)('intelligence/suggest-sds'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PmDocumentControlController.prototype, "suggestSds", null);
__decorate([
    (0, common_1.Get)('sync/project/:projectId'),
    __param(0, (0, common_1.Param)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PmDocumentControlController.prototype, "syncBundle", null);
__decorate([
    (0, common_1.Post)('sync/project/:projectId'),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], PmDocumentControlController.prototype, "applySync", null);
__decorate([
    (0, common_1.Get)('station/:companyId'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Query)('siteId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PmDocumentControlController.prototype, "stationPayload", null);
exports.PmDocumentControlController = PmDocumentControlController = __decorate([
    (0, common_1.Controller)(`${routes_1.API_V1_PREFIX}/pm/document-control`),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...PM_ROLES),
    __metadata("design:paramtypes", [pm_document_control_service_1.PmDocumentControlService,
        pm_document_cail_intelligence_service_1.PmDocumentCailIntelligenceService])
], PmDocumentControlController);
//# sourceMappingURL=pm-document-control.controller.js.map