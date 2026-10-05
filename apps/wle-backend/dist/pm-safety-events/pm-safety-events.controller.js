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
exports.PmSafetyEventsController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const routes_1 = require("../config/routes");
const pm_safety_events_service_1 = require("./pm-safety-events.service");
const pm_safety_events_library_service_1 = require("./pm-safety-events-library.service");
const pm_safety_events_intelligence_service_1 = require("./pm-safety-events-intelligence.service");
const pm_safety_events_investigation_service_1 = require("./pm-safety-events-investigation.service");
const pm_investigation_report_service_1 = require("./pm-investigation-report.service");
const incident_sif_engine_service_1 = require("./incident-sif-engine.service");
const dangerous_occurrence_engine_1 = require("../verisuite-sms/services/dangerous-occurrence.engine");
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
let PmSafetyEventsController = class PmSafetyEventsController {
    constructor(events, library, intelligence, investigation, report, incidentEngine) {
        this.events = events;
        this.library = library;
        this.intelligence = intelligence;
        this.investigation = investigation;
        this.report = report;
        this.incidentEngine = incidentEngine;
    }
    generateIncidentEngine(body) {
        return this.incidentEngine.generate(body);
    }
    rootCauses(companyId) {
        return this.library.rootCauses(parseInt(companyId, 10));
    }
    contributingFactors(companyId) {
        return this.library.contributingFactors(parseInt(companyId, 10));
    }
    seedLibrary(companyId) {
        return this.library.ensureLibraries(parseInt(companyId, 10));
    }
    list(projectId, companyId, status, eventType) {
        return this.events.list({
            projectId: projectId ? parseInt(projectId, 10) : undefined,
            companyId: companyId ? parseInt(companyId, 10) : undefined,
            status,
            eventType,
        });
    }
    analytics(projectId) {
        return this.intelligence.projectAnalytics(parseInt(projectId, 10));
    }
    workerAccess(workerId, projectId) {
        return this.events.workerAccessCheck(parseInt(workerId, 10), parseInt(projectId, 10));
    }
    sync(req, body) {
        var _a, _b, _c;
        return this.events.syncOffline(Object.assign(Object.assign({}, body), { createdByUserId: (_c = (_a = body.createdByUserId) !== null && _a !== void 0 ? _a : (_b = req.user) === null || _b === void 0 ? void 0 : _b.userId) !== null && _c !== void 0 ? _c : 0 }));
    }
    evaluateOhs(body) {
        var _a;
        const text = [body === null || body === void 0 ? void 0 : body.title, body === null || body === void 0 ? void 0 : body.description, body === null || body === void 0 ? void 0 : body.text]
            .filter(Boolean)
            .join(' ');
        return (0, dangerous_occurrence_engine_1.evaluateDangerousOccurrences)(text, (_a = body === null || body === void 0 ? void 0 : body.regionCode) !== null && _a !== void 0 ? _a : 'CA-AB');
    }
    syncOfflineAlias(req, body) {
        var _a, _b, _c;
        return this.events.syncOffline(Object.assign(Object.assign({}, body), { createdByUserId: (_c = (_a = body.createdByUserId) !== null && _a !== void 0 ? _a : (_b = req.user) === null || _b === void 0 ? void 0 : _b.userId) !== null && _c !== void 0 ? _c : 0 }));
    }
    generateIncidentEngineFromEvent(id) {
        return this.events.get(id).then((event) => {
            const input = this.incidentEngine.inputFromEvent(event);
            return this.incidentEngine.generate(input);
        });
    }
    score(id) {
        return this.intelligence.getEventScore(id);
    }
    predict(id) {
        return this.intelligence.predictFromEvent(id);
    }
    timeline(id) {
        return this.events.listTimeline(id);
    }
    get(id) {
        return this.events.get(id);
    }
    create(req, body) {
        var _a, _b;
        return this.events.createDraft(Object.assign(Object.assign({}, body), { createdByUserId: (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) !== null && _b !== void 0 ? _b : 0 }));
    }
    update(id, req, body) {
        var _a;
        return this.events.update(id, body, (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId);
    }
    submit(id, req) {
        var _a, _b;
        return this.events.submit(id, (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) !== null && _b !== void 0 ? _b : 0);
    }
    review(id, req, body) {
        var _a, _b;
        return this.events.review(id, body.action, (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) !== null && _b !== void 0 ? _b : 0, body.notes);
    }
    approve(id, req, body) {
        var _a, _b;
        return this.events.review(id, 'approve', (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) !== null && _b !== void 0 ? _b : 0, body === null || body === void 0 ? void 0 : body.notes);
    }
    close(id, req) {
        var _a, _b;
        return this.events.close(id, (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) !== null && _b !== void 0 ? _b : 0);
    }
    addTimeline(id, req, body) {
        var _a;
        return this.events.addTimelineEntry(id, {
            description: body.description,
            timestamp: body.timestamp ? new Date(body.timestamp) : undefined,
            actorId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId,
        });
    }
    suggestRca(id) {
        return this.events.suggestRootCauses(id);
    }
    addRca(id, req, body) {
        var _a;
        return this.events.addRootCause(id, body, (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId);
    }
    addInjury(id, body) {
        return this.events.addInjury(id, body);
    }
    addPerson(id, body) {
        return this.events.addPerson(id, body);
    }
    linkEquipment(id, body) {
        return this.events.linkEquipment(id, body.equipmentId, body.failureNotes, body.conditionScore);
    }
    addWitness(id, req, body) {
        var _a;
        return this.events.addWitness(id, body, (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId);
    }
    addStatement(id, body) {
        return this.events.addStatement(id, body);
    }
    addAttachment(id, body) {
        return this.events.addAttachment(id, body);
    }
    addFactor(id, body) {
        return this.events.addContributingFactor(id, body);
    }
    openInvestigation(id, req) {
        var _a;
        return this.investigation.getOrCreate(id, (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId);
    }
    getInvestigation(id) {
        return this.investigation.getOrCreate(id);
    }
    updateInvestigation(id, body) {
        return this.investigation.update(id, body);
    }
    guidedQuestions(id) {
        return this.investigation.guidedQuestions(id);
    }
    saveGuidedAnswers(id, req, body) {
        var _a;
        return this.investigation.saveGuidedAnswers(id, body.answers, (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId);
    }
    causalTree(id) {
        return this.investigation.getCausalTree(id);
    }
    regenerateCausalTree(id) {
        return this.investigation.regenerateCausalTree(id);
    }
    suggestInvestigation(id) {
        return this.investigation.suggestFactorsAndRca(id);
    }
    investigationReport(id) {
        return this.report.buildReport(id);
    }
    async investigationReportHtml(id) {
        const r = await this.report.buildReport(id);
        return r.html;
    }
};
exports.PmSafetyEventsController = PmSafetyEventsController;
__decorate([
    (0, common_1.Post)('engine/generate'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PmSafetyEventsController.prototype, "generateIncidentEngine", null);
__decorate([
    (0, common_1.Get)('library/root-causes'),
    __param(0, (0, common_1.Query)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PmSafetyEventsController.prototype, "rootCauses", null);
__decorate([
    (0, common_1.Get)('library/contributing-factors'),
    __param(0, (0, common_1.Query)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PmSafetyEventsController.prototype, "contributingFactors", null);
__decorate([
    (0, common_1.Post)('library/seed'),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    __param(0, (0, common_1.Query)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PmSafetyEventsController.prototype, "seedLibrary", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('projectId')),
    __param(1, (0, common_1.Query)('companyId')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('eventType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], PmSafetyEventsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('analytics/project/:projectId'),
    __param(0, (0, common_1.Param)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PmSafetyEventsController.prototype, "analytics", null);
__decorate([
    (0, common_1.Get)('access/worker'),
    __param(0, (0, common_1.Query)('workerId')),
    __param(1, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PmSafetyEventsController.prototype, "workerAccess", null);
__decorate([
    (0, common_1.Post)('sync'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PmSafetyEventsController.prototype, "sync", null);
__decorate([
    (0, common_1.Post)('ohs/evaluate'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PmSafetyEventsController.prototype, "evaluateOhs", null);
__decorate([
    (0, common_1.Post)('offline/sync'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PmSafetyEventsController.prototype, "syncOfflineAlias", null);
__decorate([
    (0, common_1.Post)(':id/engine/generate'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PmSafetyEventsController.prototype, "generateIncidentEngineFromEvent", null);
__decorate([
    (0, common_1.Get)(':id/score'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PmSafetyEventsController.prototype, "score", null);
__decorate([
    (0, common_1.Get)(':id/predict'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PmSafetyEventsController.prototype, "predict", null);
__decorate([
    (0, common_1.Get)(':id/timeline'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PmSafetyEventsController.prototype, "timeline", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PmSafetyEventsController.prototype, "get", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PmSafetyEventsController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], PmSafetyEventsController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/submit'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PmSafetyEventsController.prototype, "submit", null);
__decorate([
    (0, common_1.Post)(':id/review'),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], PmSafetyEventsController.prototype, "review", null);
__decorate([
    (0, common_1.Post)(':id/approve'),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], PmSafetyEventsController.prototype, "approve", null);
__decorate([
    (0, common_1.Post)(':id/close'),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PmSafetyEventsController.prototype, "close", null);
__decorate([
    (0, common_1.Post)(':id/timeline'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], PmSafetyEventsController.prototype, "addTimeline", null);
__decorate([
    (0, common_1.Get)(':id/rca/suggest'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PmSafetyEventsController.prototype, "suggestRca", null);
__decorate([
    (0, common_1.Post)(':id/rca'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], PmSafetyEventsController.prototype, "addRca", null);
__decorate([
    (0, common_1.Post)(':id/injuries'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PmSafetyEventsController.prototype, "addInjury", null);
__decorate([
    (0, common_1.Post)(':id/people'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PmSafetyEventsController.prototype, "addPerson", null);
__decorate([
    (0, common_1.Post)(':id/equipment'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PmSafetyEventsController.prototype, "linkEquipment", null);
__decorate([
    (0, common_1.Post)(':id/witnesses'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], PmSafetyEventsController.prototype, "addWitness", null);
__decorate([
    (0, common_1.Post)(':id/statements'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PmSafetyEventsController.prototype, "addStatement", null);
__decorate([
    (0, common_1.Post)(':id/attachments'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PmSafetyEventsController.prototype, "addAttachment", null);
__decorate([
    (0, common_1.Post)(':id/contributing-factors'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PmSafetyEventsController.prototype, "addFactor", null);
__decorate([
    (0, common_1.Post)(':id/investigation/open'),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PmSafetyEventsController.prototype, "openInvestigation", null);
__decorate([
    (0, common_1.Get)(':id/investigation'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PmSafetyEventsController.prototype, "getInvestigation", null);
__decorate([
    (0, common_1.Put)(':id/investigation'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PmSafetyEventsController.prototype, "updateInvestigation", null);
__decorate([
    (0, common_1.Get)(':id/investigation/guided-questions'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PmSafetyEventsController.prototype, "guidedQuestions", null);
__decorate([
    (0, common_1.Post)(':id/investigation/guided-answers'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], PmSafetyEventsController.prototype, "saveGuidedAnswers", null);
__decorate([
    (0, common_1.Get)(':id/investigation/causal-tree'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PmSafetyEventsController.prototype, "causalTree", null);
__decorate([
    (0, common_1.Post)(':id/investigation/regenerate-causal-tree'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PmSafetyEventsController.prototype, "regenerateCausalTree", null);
__decorate([
    (0, common_1.Get)(':id/investigation/suggest'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PmSafetyEventsController.prototype, "suggestInvestigation", null);
__decorate([
    (0, common_1.Get)(':id/investigation/report'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PmSafetyEventsController.prototype, "investigationReport", null);
__decorate([
    (0, common_1.Get)(':id/investigation/report/html'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PmSafetyEventsController.prototype, "investigationReportHtml", null);
exports.PmSafetyEventsController = PmSafetyEventsController = __decorate([
    (0, common_1.Controller)(`${routes_1.API_V1_PREFIX}/pm/incidents`),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...PM_ROLES),
    __metadata("design:paramtypes", [pm_safety_events_service_1.PmSafetyEventsService,
        pm_safety_events_library_service_1.PmSafetyEventsLibraryService,
        pm_safety_events_intelligence_service_1.PmSafetyEventsIntelligenceService,
        pm_safety_events_investigation_service_1.PmSafetyEventsInvestigationService,
        pm_investigation_report_service_1.PmInvestigationReportService,
        incident_sif_engine_service_1.IncidentSifEngineService])
], PmSafetyEventsController);
//# sourceMappingURL=pm-safety-events.controller.js.map