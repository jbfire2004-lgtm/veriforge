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
exports.PmProjectSafetyController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const routes_1 = require("../config/routes");
const pm_project_safety_context_service_1 = require("./pm-project-safety-context.service");
const pm_project_safety_cail_intelligence_service_1 = require("./pm-project-safety-cail-intelligence.service");
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
let PmProjectSafetyController = class PmProjectSafetyController {
    constructor(context, cail) {
        this.context = context;
        this.cail = cail;
    }
    profile(body, req) {
        const projectId = body.projectId;
        if (body.autoGenerate) {
            return this.context.autoGenerateProfile(projectId, req.user.id);
        }
        if (body.updates) {
            return this.context
                .updateProfile(projectId, body.updates, req.user.id)
                .then(async (profile) => {
                if (body.publish) {
                    await this.context.publishProfile(projectId, req.user.id);
                }
                return {
                    profile,
                    workflowState: this.context.mapWorkflowState(projectId, profile),
                };
            });
        }
        return this.context.getOrCreateProfile(projectId).then((profile) => ({
            profile,
            workflowState: this.context.mapWorkflowState(projectId, profile),
        }));
    }
    hazards(body, req) {
        return this.context.createHazard(body.projectId, body, req.user.id);
    }
    controls(body, req) {
        return this.context.createControl(body.projectId, body, req.user.id);
    }
    zones(body, req) {
        return this.context.upsertZoneRules(body.projectId, body.zones, req.user.id);
    }
    equipment(body, req) {
        return this.context.upsertEquipmentRules(body.projectId, body.equipmentRules, req.user.id);
    }
    training(body, req) {
        return this.context.upsertTrainingRequirements(body.projectId, body.trainingRules, req.user.id);
    }
    emergency(body, req) {
        return this.context.upsertEmergencyRequirements(body.projectId, body.emergencyRules, req.user.id);
    }
    override(body, req) {
        var _a;
        return this.context.createOverride(body.projectId, {
            ruleType: body.overrideType,
            ruleKey: body.ruleKey,
            reason: body.reason,
            overrideJson: body.overrideJson,
            expiresAt: (_a = body.expiry) !== null && _a !== void 0 ? _a : body.expiresAt,
        }, req.user.id);
    }
    offlineSync(body, req) {
        return this.context.applyOfflineSync(body.projectId, body, req.user.id);
    }
    score(projectId) {
        return this.context.getProjectSafetyScore(projectId);
    }
    analytics(projectId) {
        return this.context.analytics(projectId);
    }
    cailBundle(projectId) {
        return Promise.all([
            this.cail.projectInsights(projectId),
            this.cail.hazardForecast(projectId),
            this.context.getProjectSafetyScore(projectId),
        ]).then(([insights, forecast, score]) => ({
            insights,
            hazardForecast: forecast,
            score: score.score,
            predictedRisk: score.predictedRisk,
        }));
    }
};
exports.PmProjectSafetyController = PmProjectSafetyController;
__decorate([
    (0, common_1.Post)('profile'),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PmProjectSafetyController.prototype, "profile", null);
__decorate([
    (0, common_1.Post)('hazards'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PmProjectSafetyController.prototype, "hazards", null);
__decorate([
    (0, common_1.Post)('controls'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PmProjectSafetyController.prototype, "controls", null);
__decorate([
    (0, common_1.Post)('zones'),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PmProjectSafetyController.prototype, "zones", null);
__decorate([
    (0, common_1.Post)('equipment'),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PmProjectSafetyController.prototype, "equipment", null);
__decorate([
    (0, common_1.Post)('training'),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PmProjectSafetyController.prototype, "training", null);
__decorate([
    (0, common_1.Post)('emergency'),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PmProjectSafetyController.prototype, "emergency", null);
__decorate([
    (0, common_1.Post)('override'),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PmProjectSafetyController.prototype, "override", null);
__decorate([
    (0, common_1.Post)('offline/sync'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PmProjectSafetyController.prototype, "offlineSync", null);
__decorate([
    (0, common_1.Get)(':projectId/score'),
    __param(0, (0, common_1.Param)('projectId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], PmProjectSafetyController.prototype, "score", null);
__decorate([
    (0, common_1.Get)(':projectId/analytics'),
    __param(0, (0, common_1.Param)('projectId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], PmProjectSafetyController.prototype, "analytics", null);
__decorate([
    (0, common_1.Get)(':projectId/cail'),
    __param(0, (0, common_1.Param)('projectId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], PmProjectSafetyController.prototype, "cailBundle", null);
exports.PmProjectSafetyController = PmProjectSafetyController = __decorate([
    (0, common_1.Controller)(`${routes_1.API_V1_PREFIX}/pm/project/safety`),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...PM_ROLES),
    __metadata("design:paramtypes", [pm_project_safety_context_service_1.PmProjectSafetyContextService,
        pm_project_safety_cail_intelligence_service_1.PmProjectSafetyCailIntelligenceService])
], PmProjectSafetyController);
//# sourceMappingURL=pm-project-safety.controller.js.map