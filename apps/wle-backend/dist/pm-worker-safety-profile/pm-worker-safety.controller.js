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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PmWorkerSafetyController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const routes_1 = require("../config/routes");
const pm_worker_safety_profile_service_1 = require("./pm-worker-safety-profile.service");
const pm_worker_safety_cail_intelligence_service_1 = require("./pm-worker-safety-cail-intelligence.service");
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
let PmWorkerSafetyController = class PmWorkerSafetyController {
    constructor(workers, cail) {
        this.workers = workers;
        this.cail = cail;
    }
    profile(body, req) {
        if (body.rebuild) {
            return this.workers.rebuildProfile(body.workerId, body.projectId, req.user.id);
        }
        if (body.roleType || body.tradeCode) {
            return this.workers
                .updateWorkerIdentity(body.workerId, { roleType: body.roleType, tradeCode: body.tradeCode }, req.user.id)
                .then((profile) => ({ profile }));
        }
        return this.workers.getFullProfile(body.workerId, body.projectId);
    }
    training(body, req) {
        var _a;
        return this.workers.upsertTrainingSnapshot(body.workerId, {
            trainingCode: body.trainingCode,
            courseName: body.courseName,
            completedAt: body.completedAt,
            expiresAt: (_a = body.expiryDate) !== null && _a !== void 0 ? _a : body.expiresAt,
            competencyLevel: body.competencyLevel,
            certificatePath: body.certificatePath,
        }, req.user.id);
    }
    authorization(body, req) {
        var _a, _b, _c, _d, _e;
        const authType = (_c = (_b = (_a = body.authType) !== null && _a !== void 0 ? _a : body.authorizationType) !== null && _b !== void 0 ? _b : body.equipmentType) !== null && _c !== void 0 ? _c : 'forklift_operator';
        return this.workers.upsertAuthorization(body.workerId, {
            authType,
            equipmentId: body.equipmentId,
            issuedAt: (_d = body.issueDate) !== null && _d !== void 0 ? _d : body.issuedAt,
            expiresAt: (_e = body.expiryDate) !== null && _e !== void 0 ? _e : body.expiresAt,
        }, req.user.id);
    }
    restriction(body, req) {
        var _a;
        return this.workers.addMedicalRestriction(body.workerId, {
            restrictionType: body.restrictionType,
            description: body.description,
            expiresAt: (_a = body.expiry) !== null && _a !== void 0 ? _a : body.expiresAt,
            blocksHighRisk: body.blocksHighRisk,
            blocksConfinedSpace: body.blocksConfinedSpace,
            blocksHotWork: body.blocksHotWork,
            blocksEquipment: body.blocksEquipment,
        }, req.user.id);
    }
    exposure(body, req) {
        var _a, _b;
        return this.workers.recordHazardExposure(body.workerId, {
            hazardType: (_b = (_a = body.hazardType) !== null && _a !== void 0 ? _a : body.hazardId) !== null && _b !== void 0 ? _b : 'site_specific',
            severity: body.severity,
            likelihood: body.likelihood,
            exposureDate: body.exposureDate,
            projectId: body.projectId,
            sifPotential: body.sifPotential,
            sourceId: body.hazardId,
        }, req.user.id);
    }
    corrective(body, req) {
        var _a, _b, _c;
        return this.workers.linkCorrectiveAction(body.workerId, {
            correctiveActionId: (_b = (_a = body.correctiveActionId) !== null && _a !== void 0 ? _a : body.corrective_action_id) !== null && _b !== void 0 ? _b : '',
            status: body.status,
            dueDate: (_c = body.dueDate) !== null && _c !== void 0 ? _c : body.due_date,
        }, req.user.id);
    }
    override(body, req) {
        var _a, _b;
        return this.workers.createOverride(body.workerId, {
            overrideType: body.overrideType,
            ruleKey: body.ruleKey,
            reason: body.reason,
            expiresAt: (_b = (_a = body.expiry) !== null && _a !== void 0 ? _a : body.expiresAt) !== null && _b !== void 0 ? _b : new Date(Date.now() + 86400000).toISOString(),
            projectId: body.projectId,
            supervisorSig: body.supervisorSig,
            safetySig: body.safetySig,
        }, req.user.id);
    }
    offlineSync(body, req) {
        const { workerId } = body, payload = __rest(body, ["workerId"]);
        return this.workers.applyOfflineSync(workerId, payload, req.user.id);
    }
    score(workerId, projectId) {
        return this.workers.getWorkerSafetyScore(workerId, projectId ? parseInt(projectId, 10) : undefined);
    }
    analytics(workerId) {
        return this.workers.analytics(workerId);
    }
    cailBundle(workerId, projectId) {
        const pid = projectId ? parseInt(projectId, 10) : undefined;
        return Promise.all([
            this.cail.workerInsights(workerId, pid),
            this.cail.predictTrainingNeeds(workerId),
            this.cail.predictAuthorizationNeeds(workerId),
            this.workers.getWorkerSafetyScore(workerId, pid),
        ]).then(([insights, trainingNeeds, authorizationNeeds, score]) => ({
            insights,
            trainingNeeds,
            authorizationNeeds,
            score: score.score,
            complianceState: score.complianceState,
            incidentForecast: score.incidentForecast,
        }));
    }
};
exports.PmWorkerSafetyController = PmWorkerSafetyController;
__decorate([
    (0, common_1.Post)('profile'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PmWorkerSafetyController.prototype, "profile", null);
__decorate([
    (0, common_1.Post)('training'),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PmWorkerSafetyController.prototype, "training", null);
__decorate([
    (0, common_1.Post)('authorization'),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PmWorkerSafetyController.prototype, "authorization", null);
__decorate([
    (0, common_1.Post)('restriction'),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PmWorkerSafetyController.prototype, "restriction", null);
__decorate([
    (0, common_1.Post)('exposure'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PmWorkerSafetyController.prototype, "exposure", null);
__decorate([
    (0, common_1.Post)('corrective'),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PmWorkerSafetyController.prototype, "corrective", null);
__decorate([
    (0, common_1.Post)('override'),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PmWorkerSafetyController.prototype, "override", null);
__decorate([
    (0, common_1.Post)('offline/sync'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PmWorkerSafetyController.prototype, "offlineSync", null);
__decorate([
    (0, common_1.Get)(':workerId/score'),
    __param(0, (0, common_1.Param)('workerId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", void 0)
], PmWorkerSafetyController.prototype, "score", null);
__decorate([
    (0, common_1.Get)(':workerId/analytics'),
    __param(0, (0, common_1.Param)('workerId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], PmWorkerSafetyController.prototype, "analytics", null);
__decorate([
    (0, common_1.Get)(':workerId/cail'),
    __param(0, (0, common_1.Param)('workerId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", void 0)
], PmWorkerSafetyController.prototype, "cailBundle", null);
exports.PmWorkerSafetyController = PmWorkerSafetyController = __decorate([
    (0, common_1.Controller)(`${routes_1.API_V1_PREFIX}/pm/worker/safety`),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...PM_ROLES),
    __metadata("design:paramtypes", [pm_worker_safety_profile_service_1.PmWorkerSafetyProfileService,
        pm_worker_safety_cail_intelligence_service_1.PmWorkerSafetyCailIntelligenceService])
], PmWorkerSafetyController);
//# sourceMappingURL=pm-worker-safety.controller.js.map