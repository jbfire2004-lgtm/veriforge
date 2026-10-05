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
exports.JhaFlhaController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const routes_1 = require("../config/routes");
const jha_flha_service_1 = require("./jha-flha.service");
const jha_library_service_1 = require("./jha-library.service");
const jha_flha_orchestrator_service_1 = require("./jha-flha-orchestrator.service");
const jha_flha_engine_service_1 = require("./jha-flha-engine.service");
const jha_industry_packs_1 = require("./jha-industry-packs");
const PM_ROLES = [
    client_1.UserRole.WORKER,
    client_1.UserRole.SUPERVISOR,
    client_1.UserRole.ADMIN,
    client_1.UserRole.SUPER_ADMIN,
    client_1.UserRole.COMPANY_ADMIN,
    client_1.UserRole.PROJECT_MANAGER,
];
let JhaFlhaController = class JhaFlhaController {
    constructor(jha, library, orchestrator, engine) {
        this.jha = jha;
        this.library = library;
        this.orchestrator = orchestrator;
        this.engine = engine;
    }
    generateJhaFlha(body) {
        return this.engine.generate(body);
    }
    list(projectId, companyId, status, kind) {
        return this.jha.list({
            projectId: projectId ? parseInt(projectId, 10) : undefined,
            companyId: companyId ? parseInt(companyId, 10) : undefined,
            status,
            kind,
        });
    }
    create(req, body) {
        var _a;
        return this.jha.create(Object.assign(Object.assign({}, body), { createdByUserId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId }));
    }
    energyWheel() {
        return this.library.energyWheel();
    }
    async hazards(companyId, projectId, taskCode) {
        const rows = await this.library.listHazards(parseInt(companyId, 10), projectId ? parseInt(projectId, 10) : undefined, taskCode);
        return rows.map((h) => this.library.mapHazardRow(h));
    }
    async controls(companyId, projectId, category) {
        const rows = await this.library.listControls(parseInt(companyId, 10), projectId ? parseInt(projectId, 10) : undefined, category);
        return rows.map((c) => this.library.mapControlRow(c));
    }
    tasks(companyId, projectId) {
        return this.library.listTasks(parseInt(companyId, 10), projectId ? parseInt(projectId, 10) : undefined);
    }
    async libraryPacks(companyId) {
        const cid = parseInt(companyId, 10);
        const packIds = await this.library.resolveCompanyPacks(cid);
        return { packIds, labels: (0, jha_industry_packs_1.packLabels)(packIds) };
    }
    async projectLearnings(projectId) {
        return this.library.getProjectLearnings(parseInt(projectId, 10));
    }
    async suggestLibrary(companyId, projectId, taskDescription, locationNote, weather, hazardCategories, energyTypes, existingHazards, existingControls, focusedHazardCategory, focusedHazardEnergyTypes, focusedHazardDescription) {
        var _a, _b, _c, _d, _e;
        const cid = parseInt(companyId, 10);
        const pid = projectId ? parseInt(projectId, 10) : undefined;
        const hazards = await this.library.listHazards(cid, pid);
        const controls = await this.library.listControls(cid, pid);
        const categories = (_a = hazardCategories === null || hazardCategories === void 0 ? void 0 : hazardCategories.split(',').filter(Boolean)) !== null && _a !== void 0 ? _a : [];
        const energies = (_b = energyTypes === null || energyTypes === void 0 ? void 0 : energyTypes.split(',').filter(Boolean)) !== null && _b !== void 0 ? _b : [];
        const existingH = (_c = existingHazards === null || existingHazards === void 0 ? void 0 : existingHazards.split('|').filter(Boolean)) !== null && _c !== void 0 ? _c : [];
        const existingC = (_d = existingControls === null || existingControls === void 0 ? void 0 : existingControls.split('|').filter(Boolean)) !== null && _d !== void 0 ? _d : [];
        const focusedEnergies = (_e = focusedHazardEnergyTypes === null || focusedHazardEnergyTypes === void 0 ? void 0 : focusedHazardEnergyTypes.split(',').filter(Boolean)) !== null && _e !== void 0 ? _e : [];
        return this.library.suggest({
            taskDescription,
            locationNote,
            weather,
            selectedHazardCategories: categories,
            selectedEnergyTypes: energies,
            existingHazardDescriptions: existingH,
            existingControlDescriptions: existingC,
            focusedHazardCategory,
            focusedHazardEnergyTypes: focusedEnergies,
            focusedHazardDescription,
            hazardLibrary: hazards.map((h) => this.library.mapHazardRow(h)),
            controlLibrary: controls.map((c) => this.library.mapControlRow(c)),
        }, pid);
    }
    createLibraryHazard(body) {
        return this.library.createHazard(body);
    }
    createLibraryControl(body) {
        return this.library.createControl(body);
    }
    analytics(projectId) {
        return this.jha.getProjectAnalytics(parseInt(projectId, 10));
    }
    workerCompliance(workerId, projectId) {
        return this.jha.workerCompliance(parseInt(workerId, 10), parseInt(projectId, 10));
    }
    sync(req, body) {
        var _a;
        return this.jha.syncOffline(Object.assign(Object.assign({}, body), { actorId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId }));
    }
    get(id) {
        return this.jha.getById(id);
    }
    updateDraft(id, req, body) {
        var _a;
        return this.jha.updateDraft(id, body, (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId);
    }
    addHazard(id, req, body) {
        var _a;
        return this.jha.addHazard(id, body, (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId);
    }
    addControl(id, req, body) {
        var _a;
        return this.jha.addControl(id, body, (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId);
    }
    setEnergy(id, req, body) {
        var _a;
        return this.jha.setEnergySources(id, body.sources, (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId);
    }
    setCrew(id, req, body) {
        var _a;
        return this.jha.setCrew(id, body.workers, (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId);
    }
    setEquipment(id, req, body) {
        var _a;
        return this.jha.setEquipment(id, body.items, (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId);
    }
    score(id) {
        return this.jha.getScore(id);
    }
    evaluate(id) {
        return this.jha.evaluate(id);
    }
    orchestratorAnalysis(id) {
        return this.orchestrator.analyze(id);
    }
    submit(id, req) {
        var _a;
        return this.jha.submit(id, (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId);
    }
    review(id, req, body) {
        var _a;
        return this.jha.supervisorReview(id, body.action, (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId, body.reviewNotes);
    }
    lock(id, req) {
        var _a;
        return this.jha.lock(id, (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId);
    }
    sign(id, req, body) {
        var _a;
        return this.jha.sign(id, Object.assign(Object.assign({}, body), { signerUserId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId }));
    }
    addAttachment(id, body) {
        return this.jha.addAttachment(id, body);
    }
    suggestions(id) {
        return this.jha.getSuggestions(id);
    }
};
exports.JhaFlhaController = JhaFlhaController;
__decorate([
    (0, common_1.Post)('engine/generate'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], JhaFlhaController.prototype, "generateJhaFlha", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('projectId')),
    __param(1, (0, common_1.Query)('companyId')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('kind')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], JhaFlhaController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], JhaFlhaController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('library/energy-wheel'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], JhaFlhaController.prototype, "energyWheel", null);
__decorate([
    (0, common_1.Get)('library/hazards'),
    __param(0, (0, common_1.Query)('companyId')),
    __param(1, (0, common_1.Query)('projectId')),
    __param(2, (0, common_1.Query)('taskCode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], JhaFlhaController.prototype, "hazards", null);
__decorate([
    (0, common_1.Get)('library/controls'),
    __param(0, (0, common_1.Query)('companyId')),
    __param(1, (0, common_1.Query)('projectId')),
    __param(2, (0, common_1.Query)('category')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], JhaFlhaController.prototype, "controls", null);
__decorate([
    (0, common_1.Get)('library/tasks'),
    __param(0, (0, common_1.Query)('companyId')),
    __param(1, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], JhaFlhaController.prototype, "tasks", null);
__decorate([
    (0, common_1.Get)('library/packs'),
    __param(0, (0, common_1.Query)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], JhaFlhaController.prototype, "libraryPacks", null);
__decorate([
    (0, common_1.Get)('library/learnings'),
    __param(0, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], JhaFlhaController.prototype, "projectLearnings", null);
__decorate([
    (0, common_1.Get)('library/suggest'),
    __param(0, (0, common_1.Query)('companyId')),
    __param(1, (0, common_1.Query)('projectId')),
    __param(2, (0, common_1.Query)('taskDescription')),
    __param(3, (0, common_1.Query)('locationNote')),
    __param(4, (0, common_1.Query)('weather')),
    __param(5, (0, common_1.Query)('hazardCategories')),
    __param(6, (0, common_1.Query)('energyTypes')),
    __param(7, (0, common_1.Query)('existingHazards')),
    __param(8, (0, common_1.Query)('existingControls')),
    __param(9, (0, common_1.Query)('focusedHazardCategory')),
    __param(10, (0, common_1.Query)('focusedHazardEnergyTypes')),
    __param(11, (0, common_1.Query)('focusedHazardDescription')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], JhaFlhaController.prototype, "suggestLibrary", null);
__decorate([
    (0, common_1.Post)('library/hazards'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], JhaFlhaController.prototype, "createLibraryHazard", null);
__decorate([
    (0, common_1.Post)('library/controls'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], JhaFlhaController.prototype, "createLibraryControl", null);
__decorate([
    (0, common_1.Get)('analytics'),
    __param(0, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], JhaFlhaController.prototype, "analytics", null);
__decorate([
    (0, common_1.Get)('compliance/worker'),
    __param(0, (0, common_1.Query)('workerId')),
    __param(1, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], JhaFlhaController.prototype, "workerCompliance", null);
__decorate([
    (0, common_1.Post)('sync'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], JhaFlhaController.prototype, "sync", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], JhaFlhaController.prototype, "get", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], JhaFlhaController.prototype, "updateDraft", null);
__decorate([
    (0, common_1.Post)(':id/hazards'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], JhaFlhaController.prototype, "addHazard", null);
__decorate([
    (0, common_1.Post)(':id/controls'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], JhaFlhaController.prototype, "addControl", null);
__decorate([
    (0, common_1.Post)(':id/energy-sources'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], JhaFlhaController.prototype, "setEnergy", null);
__decorate([
    (0, common_1.Post)(':id/crew'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], JhaFlhaController.prototype, "setCrew", null);
__decorate([
    (0, common_1.Post)(':id/equipment'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], JhaFlhaController.prototype, "setEquipment", null);
__decorate([
    (0, common_1.Get)(':id/score'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], JhaFlhaController.prototype, "score", null);
__decorate([
    (0, common_1.Post)(':id/evaluate'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], JhaFlhaController.prototype, "evaluate", null);
__decorate([
    (0, common_1.Get)(':id/orchestrator'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], JhaFlhaController.prototype, "orchestratorAnalysis", null);
__decorate([
    (0, common_1.Post)(':id/submit'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], JhaFlhaController.prototype, "submit", null);
__decorate([
    (0, common_1.Post)(':id/review'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], JhaFlhaController.prototype, "review", null);
__decorate([
    (0, common_1.Post)(':id/lock'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], JhaFlhaController.prototype, "lock", null);
__decorate([
    (0, common_1.Post)(':id/sign'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], JhaFlhaController.prototype, "sign", null);
__decorate([
    (0, common_1.Post)(':id/attachments'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], JhaFlhaController.prototype, "addAttachment", null);
__decorate([
    (0, common_1.Get)(':id/suggestions'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], JhaFlhaController.prototype, "suggestions", null);
exports.JhaFlhaController = JhaFlhaController = __decorate([
    (0, common_1.Controller)(`${routes_1.API_V1_PREFIX}/pm/jha-flha`),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...PM_ROLES),
    __metadata("design:paramtypes", [jha_flha_service_1.JhaFlhaService,
        jha_library_service_1.JhaLibraryService,
        jha_flha_orchestrator_service_1.JhaFlhaOrchestratorService,
        jha_flha_engine_service_1.JhaFlhaEngineService])
], JhaFlhaController);
//# sourceMappingURL=jha-flha.controller.js.map