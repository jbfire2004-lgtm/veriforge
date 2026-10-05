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
exports.PmEquipmentSafetyController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const routes_1 = require("../config/routes");
const actor_util_1 = require("../security/actor.util");
const tenant_scope_service_1 = require("../security/tenant-scope.service");
const pm_equipment_safety_service_1 = require("./pm-equipment-safety.service");
const pm_equipment_cail_intelligence_service_1 = require("./pm-equipment-cail-intelligence.service");
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
const PROFILE_UPDATE_KEYS = [
    'name',
    'serialNumber',
    'manufacturer',
    'model',
    'yearMade',
    'capacity',
    'safetyCategory',
    'operationalStatus',
    'loadChartJson',
    'pmSafetyMetadataJson',
];
let PmEquipmentSafetyController = class PmEquipmentSafetyController {
    constructor(equipment, cail, tenant) {
        this.equipment = equipment;
        this.cail = cail;
        this.tenant = tenant;
    }
    actor(req) {
        return (0, actor_util_1.toSecurityActor)(req.user);
    }
    parseOptionalCompanyId(raw) {
        if (!raw)
            return undefined;
        const parsed = parseInt(raw, 10);
        return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
    }
    pickProfileUpdate(body) {
        const out = {};
        for (const key of PROFILE_UPDATE_KEYS) {
            if (body[key] !== undefined) {
                out[key] = body[key];
            }
        }
        return out;
    }
    listProfiles(req, companyId, projectId, safetyCategory, operationalStatus) {
        const actor = this.actor(req);
        const effectiveCompanyId = this.tenant.effectiveCompanyId(actor, this.parseOptionalCompanyId(companyId));
        return this.equipment.listProfiles({
            companyId: effectiveCompanyId,
            projectId: projectId ? parseInt(projectId, 10) : undefined,
            safetyCategory,
            operationalStatus,
        });
    }
    async getProfile(id, req) {
        const equipmentId = parseInt(id, 10);
        await this.tenant.assertEquipmentInTenant(this.actor(req), equipmentId);
        return this.equipment.getProfile(equipmentId);
    }
    async updateProfile(id, body, req) {
        var _a;
        const equipmentId = parseInt(id, 10);
        const actor = this.actor(req);
        await this.tenant.assertEquipmentInTenant(actor, equipmentId);
        return this.equipment.updateProfile(equipmentId, this.pickProfileUpdate(body), (_a = actor.userId) !== null && _a !== void 0 ? _a : actor.id);
    }
    async recalculateCondition(id, req, projectId) {
        const equipmentId = parseInt(id, 10);
        await this.tenant.assertEquipmentInTenant(this.actor(req), equipmentId);
        return this.equipment.recalculateCondition(equipmentId, projectId ? parseInt(projectId, 10) : undefined);
    }
    async listCertifications(id, req) {
        const equipmentId = parseInt(id, 10);
        await this.tenant.assertEquipmentInTenant(this.actor(req), equipmentId);
        return this.equipment.listCertifications(equipmentId);
    }
    async createCertification(body, req) {
        var _a;
        const actor = this.actor(req);
        const equipmentId = Number(body.equipmentId);
        if (!Number.isFinite(equipmentId) || equipmentId <= 0) {
            throw new common_1.BadRequestException('equipmentId required');
        }
        await this.tenant.assertEquipmentInTenant(actor, equipmentId);
        return this.equipment.createCertification(body, (_a = actor.userId) !== null && _a !== void 0 ? _a : actor.id);
    }
    approveCertification(id, req) {
        var _a;
        const actor = this.actor(req);
        return this.equipment.approveCertification(id, (_a = actor.userId) !== null && _a !== void 0 ? _a : actor.id);
    }
    flagExpired(req, companyId) {
        const effectiveCompanyId = this.tenant.effectiveCompanyId(this.actor(req), this.parseOptionalCompanyId(companyId));
        return this.equipment.flagExpiredCertifications(effectiveCompanyId);
    }
    async registerInspection(body, req) {
        const equipmentId = Number(body.equipmentId);
        if (!Number.isFinite(equipmentId) || equipmentId <= 0) {
            throw new common_1.BadRequestException('equipmentId required');
        }
        await this.tenant.assertEquipmentInTenant(this.actor(req), equipmentId);
        return this.equipment.registerEquipmentInspection(body);
    }
    async reportFailure(body, req) {
        var _a;
        const actor = this.actor(req);
        const equipmentId = Number(body.equipmentId);
        if (!Number.isFinite(equipmentId) || equipmentId <= 0) {
            throw new common_1.BadRequestException('equipmentId required');
        }
        await this.tenant.assertEquipmentInTenant(actor, equipmentId);
        return this.equipment.reportFailure(body, (_a = actor.userId) !== null && _a !== void 0 ? _a : actor.id);
    }
    transitionFailure(id, status, req) {
        var _a;
        const actor = this.actor(req);
        return this.equipment.transitionFailure(id, status, (_a = actor.userId) !== null && _a !== void 0 ? _a : actor.id);
    }
    async listLoto(equipmentId, req) {
        const id = parseInt(equipmentId, 10);
        await this.tenant.assertEquipmentInTenant(this.actor(req), id);
        return this.equipment.listActiveLoto(id);
    }
    async createLoto(body, req) {
        var _a;
        const actor = this.actor(req);
        const equipmentId = Number(body.equipmentId);
        if (!Number.isFinite(equipmentId) || equipmentId <= 0) {
            throw new common_1.BadRequestException('equipmentId required');
        }
        await this.tenant.assertEquipmentInTenant(actor, equipmentId);
        return this.equipment.createLoto(body, (_a = actor.userId) !== null && _a !== void 0 ? _a : actor.id);
    }
    verifyLoto(id, req) {
        var _a;
        const actor = this.actor(req);
        return this.equipment.verifyLoto(id, (_a = actor.userId) !== null && _a !== void 0 ? _a : actor.id);
    }
    removeLoto(id, req) {
        var _a;
        const actor = this.actor(req);
        return this.equipment.removeLoto(id, (_a = actor.userId) !== null && _a !== void 0 ? _a : actor.id);
    }
    listAuthorizations(req, companyId, workerId, equipmentId) {
        const effectiveCompanyId = this.tenant.effectiveCompanyId(this.actor(req), this.parseOptionalCompanyId(companyId));
        return this.equipment.listAuthorizations({
            companyId: effectiveCompanyId,
            workerId: workerId ? parseInt(workerId, 10) : undefined,
            equipmentId: equipmentId ? parseInt(equipmentId, 10) : undefined,
        });
    }
    async grantAuthorization(body, req) {
        var _a;
        const actor = this.actor(req);
        const equipmentId = Number(body.equipmentId);
        if (!Number.isFinite(equipmentId) || equipmentId <= 0) {
            throw new common_1.BadRequestException('equipmentId required');
        }
        await this.tenant.assertEquipmentInTenant(actor, equipmentId);
        return this.equipment.grantAuthorization(body, (_a = actor.userId) !== null && _a !== void 0 ? _a : actor.id);
    }
    async validateAuth(req, workerId, equipmentId) {
        const actor = this.actor(req);
        const eqId = parseInt(equipmentId, 10);
        const wId = parseInt(workerId, 10);
        await this.tenant.assertEquipmentInTenant(actor, eqId);
        await this.tenant.assertWorkerInTenant(actor, wId);
        return this.equipment.validateWorkerAuthorization(wId, eqId);
    }
    async validateAssignment(body, req) {
        var _a;
        const actor = this.actor(req);
        await this.tenant.assertEquipmentInTenant(actor, body.equipmentId);
        await this.tenant.assertWorkerInTenant(actor, body.workerId);
        return this.equipment.validateAssignment(Object.assign(Object.assign({}, body), { actorId: (_a = actor.userId) !== null && _a !== void 0 ? _a : actor.id }));
    }
    async workerAccess(req, workerId, projectId) {
        const wId = parseInt(workerId, 10);
        await this.tenant.assertWorkerInTenant(this.actor(req), wId);
        return this.equipment.workerAccessCheck(wId, parseInt(projectId, 10));
    }
    analytics(projectId) {
        return this.equipment.analytics(parseInt(projectId, 10));
    }
    intelligence(projectId) {
        return this.cail.projectInsights(parseInt(projectId, 10));
    }
    async operatorRisk(workerId, projectId, req) {
        const wId = parseInt(workerId, 10);
        await this.tenant.assertWorkerInTenant(this.actor(req), wId);
        return this.cail.operatorRiskScore(wId, parseInt(projectId, 10));
    }
    syncBundle(projectId) {
        return this.equipment.syncBundle(parseInt(projectId, 10));
    }
    applySync(projectId, body, req) {
        var _a;
        const actor = this.actor(req);
        return this.equipment.applyOfflineSync(parseInt(projectId, 10), body, (_a = actor.userId) !== null && _a !== void 0 ? _a : actor.id);
    }
    stationPayload(companyId, req) {
        const effectiveCompanyId = this.tenant.effectiveCompanyId(this.actor(req), parseInt(companyId, 10));
        return this.equipment.stationPayload(effectiveCompanyId);
    }
};
exports.PmEquipmentSafetyController = PmEquipmentSafetyController;
__decorate([
    (0, common_1.Get)('profiles'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('companyId')),
    __param(2, (0, common_1.Query)('projectId')),
    __param(3, (0, common_1.Query)('safetyCategory')),
    __param(4, (0, common_1.Query)('operationalStatus')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String]),
    __metadata("design:returntype", void 0)
], PmEquipmentSafetyController.prototype, "listProfiles", null);
__decorate([
    (0, common_1.Get)('profiles/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PmEquipmentSafetyController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Put)('profiles/:id'),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], PmEquipmentSafetyController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Post)('profiles/:id/condition'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", Promise)
], PmEquipmentSafetyController.prototype, "recalculateCondition", null);
__decorate([
    (0, common_1.Get)('profiles/:id/certifications'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PmEquipmentSafetyController.prototype, "listCertifications", null);
__decorate([
    (0, common_1.Post)('certifications'),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PmEquipmentSafetyController.prototype, "createCertification", null);
__decorate([
    (0, common_1.Post)('certifications/:id/approve'),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PmEquipmentSafetyController.prototype, "approveCertification", null);
__decorate([
    (0, common_1.Post)('certifications/flag-expired'),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], PmEquipmentSafetyController.prototype, "flagExpired", null);
__decorate([
    (0, common_1.Post)('inspections/register'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PmEquipmentSafetyController.prototype, "registerInspection", null);
__decorate([
    (0, common_1.Post)('failures'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PmEquipmentSafetyController.prototype, "reportFailure", null);
__decorate([
    (0, common_1.Put)('failures/:id/status'),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('status')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], PmEquipmentSafetyController.prototype, "transitionFailure", null);
__decorate([
    (0, common_1.Get)('loto/equipment/:equipmentId'),
    __param(0, (0, common_1.Param)('equipmentId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PmEquipmentSafetyController.prototype, "listLoto", null);
__decorate([
    (0, common_1.Post)('loto'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PmEquipmentSafetyController.prototype, "createLoto", null);
__decorate([
    (0, common_1.Post)('loto/:id/verify'),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PmEquipmentSafetyController.prototype, "verifyLoto", null);
__decorate([
    (0, common_1.Post)('loto/:id/remove'),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PmEquipmentSafetyController.prototype, "removeLoto", null);
__decorate([
    (0, common_1.Get)('authorizations'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('companyId')),
    __param(2, (0, common_1.Query)('workerId')),
    __param(3, (0, common_1.Query)('equipmentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", void 0)
], PmEquipmentSafetyController.prototype, "listAuthorizations", null);
__decorate([
    (0, common_1.Post)('authorizations'),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PmEquipmentSafetyController.prototype, "grantAuthorization", null);
__decorate([
    (0, common_1.Get)('authorizations/validate'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('workerId')),
    __param(2, (0, common_1.Query)('equipmentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], PmEquipmentSafetyController.prototype, "validateAuth", null);
__decorate([
    (0, common_1.Post)('assignments/validate'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PmEquipmentSafetyController.prototype, "validateAssignment", null);
__decorate([
    (0, common_1.Get)('access/worker'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('workerId')),
    __param(2, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], PmEquipmentSafetyController.prototype, "workerAccess", null);
__decorate([
    (0, common_1.Get)('analytics/project/:projectId'),
    __param(0, (0, common_1.Param)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PmEquipmentSafetyController.prototype, "analytics", null);
__decorate([
    (0, common_1.Get)('intelligence/project/:projectId'),
    __param(0, (0, common_1.Param)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PmEquipmentSafetyController.prototype, "intelligence", null);
__decorate([
    (0, common_1.Get)('intelligence/operator/:workerId'),
    __param(0, (0, common_1.Param)('workerId')),
    __param(1, (0, common_1.Query)('projectId')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], PmEquipmentSafetyController.prototype, "operatorRisk", null);
__decorate([
    (0, common_1.Get)('sync/project/:projectId'),
    __param(0, (0, common_1.Param)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PmEquipmentSafetyController.prototype, "syncBundle", null);
__decorate([
    (0, common_1.Post)('sync/project/:projectId'),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], PmEquipmentSafetyController.prototype, "applySync", null);
__decorate([
    (0, common_1.Get)('station/:companyId'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PmEquipmentSafetyController.prototype, "stationPayload", null);
exports.PmEquipmentSafetyController = PmEquipmentSafetyController = __decorate([
    (0, common_1.Controller)(`${routes_1.API_V1_PREFIX}/pm/equipment-safety`),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...PM_ROLES),
    __metadata("design:paramtypes", [pm_equipment_safety_service_1.PmEquipmentSafetyService,
        pm_equipment_cail_intelligence_service_1.PmEquipmentCailIntelligenceService,
        tenant_scope_service_1.TenantScopeService])
], PmEquipmentSafetyController);
//# sourceMappingURL=pm-equipment-safety.controller.js.map