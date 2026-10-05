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
exports.PmCompanySafetyController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const routes_1 = require("../config/routes");
const actor_util_1 = require("../security/actor.util");
const tenant_scope_service_1 = require("../security/tenant-scope.service");
const pm_company_safety_context_service_1 = require("./pm-company-safety-context.service");
const pm_company_safety_cail_intelligence_service_1 = require("./pm-company-safety-cail-intelligence.service");
const PM_ROLES = [
    client_1.UserRole.SUPERVISOR,
    client_1.UserRole.ADMIN,
    client_1.UserRole.SUPER_ADMIN,
    client_1.UserRole.COMPANY_ADMIN,
    client_1.UserRole.PROJECT_MANAGER,
];
let PmCompanySafetyController = class PmCompanySafetyController {
    constructor(company, cail, tenant) {
        this.company = company;
        this.cail = cail;
        this.tenant = tenant;
    }
    resolveCompany(req, requested) {
        var _a;
        const actor = (0, actor_util_1.toSecurityActor)(req.user);
        return {
            companyId: this.tenant.effectiveCompanyId(actor, requested),
            actorId: (_a = actor.userId) !== null && _a !== void 0 ? _a : actor.id,
        };
    }
    profile(body, req) {
        const { companyId, actorId } = this.resolveCompany(req, body.companyId);
        if (body.autoGenerate) {
            return this.company
                .autoGenerateProfile(companyId, actorId)
                .then(async (profile) => {
                if (body.publish) {
                    await this.company.publishProfile(companyId, actorId);
                }
                return {
                    profile,
                    workflowState: this.company.mapWorkflowState(profile),
                };
            });
        }
        if (body.updates) {
            return this.company
                .updateProfile(companyId, body.updates, actorId)
                .then(async (profile) => {
                if (body.publish) {
                    await this.company.publishProfile(companyId, actorId);
                }
                return {
                    profile,
                    workflowState: this.company.mapWorkflowState(profile),
                };
            });
        }
        return this.company.getOrCreateProfile(companyId).then((profile) => ({
            profile,
            workflowState: this.company.mapWorkflowState(profile),
        }));
    }
    hazards(body, req) {
        const { companyId, actorId } = this.resolveCompany(req, body.companyId);
        return this.company.createHazard(companyId, body, actorId);
    }
    controls(body, req) {
        const { companyId, actorId } = this.resolveCompany(req, body.companyId);
        return this.company.createControl(companyId, body, actorId);
    }
    training(body, req) {
        const { companyId, actorId } = this.resolveCompany(req, body.companyId);
        return this.company.upsertTrainingRule(companyId, body, actorId);
    }
    policy(body, req) {
        const { companyId, actorId } = this.resolveCompany(req, body.companyId);
        return this.company.createPolicy(companyId, body, actorId);
    }
    sds(body, req) {
        const { companyId, actorId } = this.resolveCompany(req, body.companyId);
        return this.company.createSds(companyId, body, actorId);
    }
    emergency(body, req) {
        const { companyId, actorId } = this.resolveCompany(req, body.companyId);
        return this.company.createEmergencyPlan(companyId, body, actorId);
    }
    equipment(body, req) {
        const { companyId, actorId } = this.resolveCompany(req, body.companyId);
        return this.company.upsertEquipmentRule(companyId, body, actorId);
    }
    zones(body, req) {
        const { companyId, actorId } = this.resolveCompany(req, body.companyId);
        return this.company.upsertZoneTemplate(companyId, body, actorId);
    }
    override(body, req) {
        var _a, _b;
        const { companyId, actorId } = this.resolveCompany(req, body.companyId);
        return this.company.createOverride(companyId, {
            overrideType: body.overrideType,
            ruleKey: body.ruleKey,
            reason: body.reason,
            expiresAt: (_b = (_a = body.expiry) !== null && _a !== void 0 ? _a : body.expiresAt) !== null && _b !== void 0 ? _b : new Date(Date.now() + 86400000).toISOString(),
            supervisorSig: body.supervisorSig,
            safetySig: body.safetySig,
        }, actorId);
    }
    offlineSync(body, req) {
        const { companyId: requested } = body, payload = __rest(body, ["companyId"]);
        const { companyId, actorId } = this.resolveCompany(req, requested);
        return this.company.applyOfflineSync(companyId, payload, actorId);
    }
    score(companyId, req) {
        const effective = this.tenant.effectiveCompanyId((0, actor_util_1.toSecurityActor)(req.user), companyId);
        return this.company.getCompanySafetyScore(effective);
    }
    analytics(companyId, req) {
        const effective = this.tenant.effectiveCompanyId((0, actor_util_1.toSecurityActor)(req.user), companyId);
        return this.company.analytics(effective);
    }
    cailBundle(companyId, req) {
        const effective = this.tenant.effectiveCompanyId((0, actor_util_1.toSecurityActor)(req.user), companyId);
        return Promise.all([
            this.cail.companyInsights(effective),
            this.cail.hazardForecast(effective),
            this.company.getCompanySafetyScore(effective),
        ]).then(([insights, forecast, score]) => ({
            insights,
            hazardForecast: forecast,
            score: score.score,
            predictedRisk: score.predictedRisk,
        }));
    }
};
exports.PmCompanySafetyController = PmCompanySafetyController;
__decorate([
    (0, common_1.Post)('profile'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PmCompanySafetyController.prototype, "profile", null);
__decorate([
    (0, common_1.Post)('hazards'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PmCompanySafetyController.prototype, "hazards", null);
__decorate([
    (0, common_1.Post)('controls'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PmCompanySafetyController.prototype, "controls", null);
__decorate([
    (0, common_1.Post)('training'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PmCompanySafetyController.prototype, "training", null);
__decorate([
    (0, common_1.Post)('policy'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PmCompanySafetyController.prototype, "policy", null);
__decorate([
    (0, common_1.Post)('sds'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PmCompanySafetyController.prototype, "sds", null);
__decorate([
    (0, common_1.Post)('emergency'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PmCompanySafetyController.prototype, "emergency", null);
__decorate([
    (0, common_1.Post)('equipment'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PmCompanySafetyController.prototype, "equipment", null);
__decorate([
    (0, common_1.Post)('zones'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PmCompanySafetyController.prototype, "zones", null);
__decorate([
    (0, common_1.Post)('override'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PmCompanySafetyController.prototype, "override", null);
__decorate([
    (0, common_1.Post)('offline/sync'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PmCompanySafetyController.prototype, "offlineSync", null);
__decorate([
    (0, common_1.Get)(':companyId/score'),
    __param(0, (0, common_1.Param)('companyId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], PmCompanySafetyController.prototype, "score", null);
__decorate([
    (0, common_1.Get)(':companyId/analytics'),
    __param(0, (0, common_1.Param)('companyId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], PmCompanySafetyController.prototype, "analytics", null);
__decorate([
    (0, common_1.Get)(':companyId/cail'),
    __param(0, (0, common_1.Param)('companyId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], PmCompanySafetyController.prototype, "cailBundle", null);
exports.PmCompanySafetyController = PmCompanySafetyController = __decorate([
    (0, common_1.Controller)(`${routes_1.API_V1_PREFIX}/pm/company/safety`),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...PM_ROLES),
    __metadata("design:paramtypes", [pm_company_safety_context_service_1.PmCompanySafetyContextService,
        pm_company_safety_cail_intelligence_service_1.PmCompanySafetyCailIntelligenceService,
        tenant_scope_service_1.TenantScopeService])
], PmCompanySafetyController);
//# sourceMappingURL=pm-company-safety.controller.js.map