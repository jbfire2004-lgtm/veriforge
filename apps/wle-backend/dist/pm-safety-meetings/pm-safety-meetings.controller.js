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
exports.PmSafetyMeetingsController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const routes_1 = require("../config/routes");
const pm_safety_meetings_service_1 = require("./pm-safety-meetings.service");
const pm_safety_meetings_templates_service_1 = require("./pm-safety-meetings-templates.service");
const pm_safety_meetings_topic_library_service_1 = require("./pm-safety-meetings-topic-library.service");
const pm_safety_meetings_intelligence_service_1 = require("./pm-safety-meetings-intelligence.service");
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
let PmSafetyMeetingsController = class PmSafetyMeetingsController {
    constructor(meetings, templates, topics, intelligence) {
        this.meetings = meetings;
        this.templates = templates;
        this.topics = topics;
        this.intelligence = intelligence;
    }
    list(projectId, companyId, status, meetingType) {
        return this.meetings.list({
            projectId: projectId ? parseInt(projectId, 10) : undefined,
            companyId: companyId ? parseInt(companyId, 10) : undefined,
            status,
            meetingType,
        });
    }
    analytics(projectId) {
        return this.intelligence.projectAnalytics(parseInt(projectId, 10));
    }
    workerAccess(workerId, projectId) {
        return this.meetings.workerMeetingAccess(parseInt(workerId, 10), parseInt(projectId, 10));
    }
    sync(req, body) {
        var _a, _b, _c;
        return this.meetings.syncOffline(Object.assign(Object.assign({}, body), { createdByUserId: (_c = (_a = body.createdByUserId) !== null && _a !== void 0 ? _a : (_b = req.user) === null || _b === void 0 ? void 0 : _b.userId) !== null && _c !== void 0 ? _c : 0 }));
    }
    listTopics(companyId, projectId, category) {
        return this.topics.listTopics(parseInt(companyId, 10), projectId ? parseInt(projectId, 10) : undefined, category);
    }
    createTopic(body) {
        return this.topics.createTopic(body);
    }
    suggestTopics(projectId, companyId) {
        return this.topics.suggestTopics(parseInt(projectId, 10), parseInt(companyId, 10));
    }
    listTemplates(companyId, projectId, meetingType) {
        return this.templates.list(parseInt(companyId, 10), projectId ? parseInt(projectId, 10) : undefined, meetingType);
    }
    createTemplate(body) {
        return this.templates.create(body);
    }
    publishTemplate(id, req) {
        var _a, _b;
        return this.templates.publish(id, (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) !== null && _b !== void 0 ? _b : 0);
    }
    get(id) {
        return this.meetings.get(id);
    }
    create(req, body) {
        var _a, _b;
        return this.meetings.create(Object.assign(Object.assign({}, body), { createdByUserId: (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) !== null && _b !== void 0 ? _b : 0 }));
    }
    publish(id, req) {
        var _a, _b;
        return this.meetings.publish(id, (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) !== null && _b !== void 0 ? _b : 0);
    }
    start(id, req) {
        var _a, _b;
        return this.meetings.start(id, (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) !== null && _b !== void 0 ? _b : 0);
    }
    complete(id, req) {
        var _a, _b;
        return this.meetings.transition(id, 'completed', (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) !== null && _b !== void 0 ? _b : 0);
    }
    lock(id, req) {
        var _a, _b;
        return this.meetings.transition(id, 'locked', (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) !== null && _b !== void 0 ? _b : 0);
    }
    review(id, body, req) {
        var _a, _b;
        return this.meetings.supervisorReview(id, body.outcome, (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) !== null && _b !== void 0 ? _b : 0, body.notes);
    }
    addAttendee(id, body, req) {
        var _a, _b;
        return this.meetings.addAttendee(id, body.workerId, (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) !== null && _b !== void 0 ? _b : 0);
    }
    checkIn(id, workerId, req) {
        var _a, _b;
        return this.meetings.checkInAttendee(id, parseInt(workerId, 10), (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) !== null && _b !== void 0 ? _b : 0);
    }
    signOn(id, body, req) {
        var _a, _b;
        return this.meetings.signOnWorker({
            meetingId: id,
            workerId: body.workerId,
            actorId: (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) !== null && _b !== void 0 ? _b : 0,
            signatureData: body.signatureData,
            signerName: body.signerName,
        });
    }
    sign(id, body) {
        return this.meetings.addSignature(Object.assign({ meetingId: id }, body));
    }
    createCapa(id, body, req) {
        var _a, _b;
        return this.meetings.createCapaFromMeeting(Object.assign(Object.assign({ meetingId: id }, body), { createdByUserId: (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) !== null && _b !== void 0 ? _b : 0 }));
    }
    score(id) {
        return this.intelligence.scoreMeeting(id);
    }
    linkStation(id, stationId) {
        return this.meetings.linkStation(id, parseInt(stationId, 10));
    }
};
exports.PmSafetyMeetingsController = PmSafetyMeetingsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('projectId')),
    __param(1, (0, common_1.Query)('companyId')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('meetingType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], PmSafetyMeetingsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('analytics/project/:projectId'),
    __param(0, (0, common_1.Param)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PmSafetyMeetingsController.prototype, "analytics", null);
__decorate([
    (0, common_1.Get)('access/worker'),
    __param(0, (0, common_1.Query)('workerId')),
    __param(1, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PmSafetyMeetingsController.prototype, "workerAccess", null);
__decorate([
    (0, common_1.Post)('sync'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PmSafetyMeetingsController.prototype, "sync", null);
__decorate([
    (0, common_1.Get)('topics'),
    __param(0, (0, common_1.Query)('companyId')),
    __param(1, (0, common_1.Query)('projectId')),
    __param(2, (0, common_1.Query)('category')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], PmSafetyMeetingsController.prototype, "listTopics", null);
__decorate([
    (0, common_1.Post)('topics'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PmSafetyMeetingsController.prototype, "createTopic", null);
__decorate([
    (0, common_1.Get)('topics/suggest'),
    __param(0, (0, common_1.Query)('projectId')),
    __param(1, (0, common_1.Query)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PmSafetyMeetingsController.prototype, "suggestTopics", null);
__decorate([
    (0, common_1.Get)('templates'),
    __param(0, (0, common_1.Query)('companyId')),
    __param(1, (0, common_1.Query)('projectId')),
    __param(2, (0, common_1.Query)('meetingType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], PmSafetyMeetingsController.prototype, "listTemplates", null);
__decorate([
    (0, common_1.Post)('templates'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PmSafetyMeetingsController.prototype, "createTemplate", null);
__decorate([
    (0, common_1.Post)('templates/:id/publish'),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PmSafetyMeetingsController.prototype, "publishTemplate", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PmSafetyMeetingsController.prototype, "get", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PmSafetyMeetingsController.prototype, "create", null);
__decorate([
    (0, common_1.Post)(':id/publish'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PmSafetyMeetingsController.prototype, "publish", null);
__decorate([
    (0, common_1.Post)(':id/start'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PmSafetyMeetingsController.prototype, "start", null);
__decorate([
    (0, common_1.Post)(':id/complete'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PmSafetyMeetingsController.prototype, "complete", null);
__decorate([
    (0, common_1.Post)(':id/lock'),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PmSafetyMeetingsController.prototype, "lock", null);
__decorate([
    (0, common_1.Post)(':id/review'),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], PmSafetyMeetingsController.prototype, "review", null);
__decorate([
    (0, common_1.Post)(':id/attendees'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], PmSafetyMeetingsController.prototype, "addAttendee", null);
__decorate([
    (0, common_1.Post)(':id/attendees/:workerId/check-in'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('workerId')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], PmSafetyMeetingsController.prototype, "checkIn", null);
__decorate([
    (0, common_1.Post)(':id/sign-on'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], PmSafetyMeetingsController.prototype, "signOn", null);
__decorate([
    (0, common_1.Post)(':id/signatures'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PmSafetyMeetingsController.prototype, "sign", null);
__decorate([
    (0, common_1.Post)(':id/corrective-actions'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], PmSafetyMeetingsController.prototype, "createCapa", null);
__decorate([
    (0, common_1.Get)(':id/intelligence/score'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PmSafetyMeetingsController.prototype, "score", null);
__decorate([
    (0, common_1.Put)(':id/station/:stationId'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('stationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PmSafetyMeetingsController.prototype, "linkStation", null);
exports.PmSafetyMeetingsController = PmSafetyMeetingsController = __decorate([
    (0, common_1.Controller)(`${routes_1.API_V1_PREFIX}/pm/safety-meetings`),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...PM_ROLES),
    __metadata("design:paramtypes", [pm_safety_meetings_service_1.PmSafetyMeetingsService,
        pm_safety_meetings_templates_service_1.PmSafetyMeetingsTemplatesService,
        pm_safety_meetings_topic_library_service_1.PmSafetyMeetingsTopicLibraryService,
        pm_safety_meetings_intelligence_service_1.PmSafetyMeetingsIntelligenceService])
], PmSafetyMeetingsController);
//# sourceMappingURL=pm-safety-meetings.controller.js.map