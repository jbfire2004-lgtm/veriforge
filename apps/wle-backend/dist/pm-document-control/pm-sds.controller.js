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
exports.PmSdsController = void 0;
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
let PmSdsController = class PmSdsController {
    constructor(docs, cail) {
        this.docs = docs;
        this.cail = cail;
    }
    offlineSync(body, req) {
        return this.docs.applyOfflineSync(body.projectId, body, req.user.id);
    }
    workerCompliance(workerId, projectId) {
        return this.cail.workerSdsCompliance(parseInt(workerId, 10), parseInt(projectId, 10));
    }
    workerSds(workerId, projectId) {
        return this.docs.getWorkerSds(parseInt(workerId, 10), projectId ? parseInt(projectId, 10) : undefined);
    }
    create(body, req) {
        return this.docs.createSds(body, req.user.id);
    }
    extractHazards(id) {
        return this.docs.extractSdsHazards(id);
    }
    score(id) {
        return this.docs.scoreSds(id);
    }
    acknowledge(id, body) {
        return this.docs.acknowledgeDocument({
            workerId: body.workerId,
            sdsDocumentId: id,
            signatureData: body.signatureData,
            clientSyncId: body.clientSyncId,
            deviceId: body.deviceId,
        });
    }
    get(id) {
        return this.docs.getSds(id);
    }
};
exports.PmSdsController = PmSdsController;
__decorate([
    (0, common_1.Post)('offline/sync'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PmSdsController.prototype, "offlineSync", null);
__decorate([
    (0, common_1.Get)('worker/:workerId/compliance'),
    __param(0, (0, common_1.Param)('workerId')),
    __param(1, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PmSdsController.prototype, "workerCompliance", null);
__decorate([
    (0, common_1.Get)('worker/:workerId'),
    __param(0, (0, common_1.Param)('workerId')),
    __param(1, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PmSdsController.prototype, "workerSds", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PmSdsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(':id/hazards'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PmSdsController.prototype, "extractHazards", null);
__decorate([
    (0, common_1.Get)(':id/score'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PmSdsController.prototype, "score", null);
__decorate([
    (0, common_1.Post)(':id/acknowledge'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PmSdsController.prototype, "acknowledge", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PmSdsController.prototype, "get", null);
exports.PmSdsController = PmSdsController = __decorate([
    (0, common_1.Controller)(`${routes_1.API_V1_PREFIX}/pm/sds`),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...PM_ROLES),
    __metadata("design:paramtypes", [pm_document_control_service_1.PmDocumentControlService,
        pm_document_cail_intelligence_service_1.PmDocumentCailIntelligenceService])
], PmSdsController);
//# sourceMappingURL=pm-sds.controller.js.map