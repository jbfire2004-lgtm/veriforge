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
exports.SifHecaController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const routes_1 = require("../config/routes");
const sif_heca_service_1 = require("./sif-heca.service");
const sif_heca_ingestion_service_1 = require("./sif-heca-ingestion.service");
const sif_heca_orchestrator_service_1 = require("./sif-heca-orchestrator.service");
const PM_ROLES = [
    client_1.UserRole.WORKER,
    client_1.UserRole.SUPERVISOR,
    client_1.UserRole.ADMIN,
    client_1.UserRole.SUPER_ADMIN,
    client_1.UserRole.COMPANY_ADMIN,
    client_1.UserRole.PROJECT_MANAGER,
];
let SifHecaController = class SifHecaController {
    constructor(sifHeca, ingestion, orchestrator) {
        this.sifHeca = sifHeca;
        this.ingestion = ingestion;
        this.orchestrator = orchestrator;
    }
    listEvents(projectId, companyId, status, workerId) {
        return this.sifHeca.list({
            projectId: projectId ? parseInt(projectId, 10) : undefined,
            companyId: companyId ? parseInt(companyId, 10) : undefined,
            status,
            workerId: workerId ? parseInt(workerId, 10) : undefined,
        });
    }
    getEvent(id) {
        return this.sifHeca.getEvent(id);
    }
    orchestratorAnalysis(id) {
        return this.orchestrator.analyzeEvent(id);
    }
    evaluate(body) {
        var _a;
        return this.sifHeca.evaluateDryRun({
            companyId: body.companyId,
            projectId: body.projectId,
            title: body.title,
            description: body.description,
            scoringInput: {
                hazardSeverity: body.hazardSeverity,
                hazardLikelihood: body.hazardLikelihood,
                energyTypes: body.energyTypes,
                controls: ((_a = body.controls) !== null && _a !== void 0 ? _a : []).map((c) => {
                    var _a, _b, _c, _d;
                    return ({
                        controlType: c.controlType,
                        adequate: (_a = c.adequate) !== null && _a !== void 0 ? _a : null,
                        effectivenessScore: (_b = c.effectivenessScore) !== null && _b !== void 0 ? _b : null,
                        verified: (_c = c.verified) !== null && _c !== void 0 ? _c : false,
                        ppeRequired: (_d = c.ppeRequired) !== null && _d !== void 0 ? _d : false,
                    });
                }),
            },
        });
    }
    analyzeScope(body) {
        return this.sifHeca.analyzeScope(body);
    }
    csraAssess(body) {
        return this.sifHeca.assessCsra(body);
    }
    energyWheel() {
        return this.sifHeca.getEnergyWheel();
    }
    score(req, body) {
        var _a, _b;
        return this.sifHeca.ingest({
            companyId: body.companyId,
            projectId: body.projectId,
            siteId: body.siteId,
            workerId: body.workerId,
            sourceType: body.sourceType,
            sourceId: body.sourceId,
            sourceItemId: body.sourceItemId,
            title: body.title,
            description: body.description,
            scoringInput: {
                hazardSeverity: body.hazardSeverity,
                hazardLikelihood: body.hazardLikelihood,
                energyTypes: body.energyTypes,
                controls: ((_a = body.controls) !== null && _a !== void 0 ? _a : []).map((c) => {
                    var _a, _b, _c, _d;
                    return ({
                        controlType: c.controlType,
                        adequate: (_a = c.adequate) !== null && _a !== void 0 ? _a : null,
                        effectivenessScore: (_b = c.effectivenessScore) !== null && _b !== void 0 ? _b : null,
                        verified: (_c = c.verified) !== null && _c !== void 0 ? _c : false,
                        ppeRequired: (_d = c.ppeRequired) !== null && _d !== void 0 ? _d : false,
                    });
                }),
            },
            actorId: (_b = req.user) === null || _b === void 0 ? void 0 : _b.userId,
        });
    }
    review(id, req, body) {
        var _a;
        return this.sifHeca.supervisorReview(id, body.action, (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId, body.notes);
    }
    ingestJha(jhaFlhaId, req) {
        var _a;
        return this.ingestion.ingestFromJhaFlha(jhaFlhaId, (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId);
    }
    ingestForm(formId, req) {
        var _a;
        return this.ingestion.ingestFromSafetyForm(formId, (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId);
    }
    analytics(projectId) {
        return this.sifHeca.projectAnalytics(parseInt(projectId, 10));
    }
    accessCheck(workerId, projectId) {
        return this.sifHeca.workerAccessCheck(parseInt(workerId, 10), parseInt(projectId, 10));
    }
    sync(req, body) {
        var _a;
        return this.sifHeca.syncOffline(Object.assign(Object.assign({}, body), { actorId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId }));
    }
    indicators(companyId, projectId) {
        return this.sifHeca.listIndicators(parseInt(companyId, 10), projectId ? parseInt(projectId, 10) : undefined);
    }
    hecaCategories(companyId, projectId) {
        return this.sifHeca.listHecaCategories(parseInt(companyId, 10), projectId ? parseInt(projectId, 10) : undefined);
    }
};
exports.SifHecaController = SifHecaController;
__decorate([
    (0, common_1.Get)('events'),
    __param(0, (0, common_1.Query)('projectId')),
    __param(1, (0, common_1.Query)('companyId')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('workerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], SifHecaController.prototype, "listEvents", null);
__decorate([
    (0, common_1.Get)('events/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SifHecaController.prototype, "getEvent", null);
__decorate([
    (0, common_1.Get)('events/:id/orchestrator'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SifHecaController.prototype, "orchestratorAnalysis", null);
__decorate([
    (0, common_1.Post)('evaluate'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SifHecaController.prototype, "evaluate", null);
__decorate([
    (0, common_1.Post)('analyze-scope'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SifHecaController.prototype, "analyzeScope", null);
__decorate([
    (0, common_1.Post)('csra-assess'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SifHecaController.prototype, "csraAssess", null);
__decorate([
    (0, common_1.Get)('energy-wheel'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SifHecaController.prototype, "energyWheel", null);
__decorate([
    (0, common_1.Post)('score'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SifHecaController.prototype, "score", null);
__decorate([
    (0, common_1.Post)('events/:id/review'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], SifHecaController.prototype, "review", null);
__decorate([
    (0, common_1.Post)('ingest/jha-flha/:jhaFlhaId'),
    __param(0, (0, common_1.Param)('jhaFlhaId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SifHecaController.prototype, "ingestJha", null);
__decorate([
    (0, common_1.Post)('ingest/safety-form/:formId'),
    __param(0, (0, common_1.Param)('formId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SifHecaController.prototype, "ingestForm", null);
__decorate([
    (0, common_1.Get)('analytics/project/:projectId'),
    __param(0, (0, common_1.Param)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SifHecaController.prototype, "analytics", null);
__decorate([
    (0, common_1.Get)('access/worker'),
    __param(0, (0, common_1.Query)('workerId')),
    __param(1, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], SifHecaController.prototype, "accessCheck", null);
__decorate([
    (0, common_1.Post)('sync'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SifHecaController.prototype, "sync", null);
__decorate([
    (0, common_1.Get)('library/indicators'),
    __param(0, (0, common_1.Query)('companyId')),
    __param(1, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], SifHecaController.prototype, "indicators", null);
__decorate([
    (0, common_1.Get)('library/heca-categories'),
    __param(0, (0, common_1.Query)('companyId')),
    __param(1, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], SifHecaController.prototype, "hecaCategories", null);
exports.SifHecaController = SifHecaController = __decorate([
    (0, common_1.Controller)(`${routes_1.API_V1_PREFIX}/pm/sif-heca`),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...PM_ROLES),
    __metadata("design:paramtypes", [sif_heca_service_1.SifHecaService,
        sif_heca_ingestion_service_1.SifHecaIngestionService,
        sif_heca_orchestrator_service_1.SifHecaOrchestratorService])
], SifHecaController);
//# sourceMappingURL=sif-heca.controller.js.map