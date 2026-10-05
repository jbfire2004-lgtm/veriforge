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
exports.PmHazardController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const routes_1 = require("../config/routes");
const pm_unified_hazard_control_service_1 = require("./pm-unified-hazard-control.service");
const pm_unified_hazard_control_cail_service_1 = require("./pm-unified-hazard-control-cail.service");
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
let PmHazardController = class PmHazardController {
    constructor(hc, cail) {
        this.hc = hc;
        this.cail = cail;
    }
    createHazard(body, req) {
        const { companyId } = body, data = __rest(body, ["companyId"]);
        return this.hc.createHazard(companyId, data, req.user.id);
    }
    ingest(body, req) {
        return this.hc.ingestBatch(body.companyId, body.source, body.projectId, req.user.id);
    }
    mapControls(body, req) {
        return this.hc.linkHazardControl(body.hazardId, body.controlId, body.effectivenessScore, req.user.id);
    }
    scoreSif(body) {
        return this.hc.scoreHazardSifHeca(body.hazardId);
    }
    offlineSync(body, req) {
        const { companyId, projectId } = body, payload = __rest(body, ["companyId", "projectId"]);
        return this.hc.applyOfflineSync({ companyId, projectId }, payload, req.user.id);
    }
    energyWheel(id) {
        return this.hc.getEnergyWheel(id);
    }
    suggestControls(id) {
        return this.hc.suggestControlsForHazard(id);
    }
    publish(id, req) {
        return this.hc.publishHazard(id, req.user.id);
    }
    hazardCail(id, companyId, projectId) {
        return this.hc.getHazard(id).then((hazard) => {
            var _a;
            return Promise.all([
                this.hc.scoreHazardSifHeca(id),
                this.hc.suggestControlsForHazard(id),
                this.cail.insights({
                    companyId: parseInt(companyId, 10) || hazard.companyId,
                    projectId: projectId
                        ? parseInt(projectId, 10)
                        : (_a = hazard.projectId) !== null && _a !== void 0 ? _a : undefined,
                }),
            ]).then(([sifHeca, suggestions, insights]) => ({
                hazardId: id,
                sifHeca,
                suggestions,
                insights,
            }));
        });
    }
    getHazard(id) {
        return this.hc.getHazard(id);
    }
};
exports.PmHazardController = PmHazardController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PmHazardController.prototype, "createHazard", null);
__decorate([
    (0, common_1.Post)('ingest'),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PmHazardController.prototype, "ingest", null);
__decorate([
    (0, common_1.Post)('map-controls'),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PmHazardController.prototype, "mapControls", null);
__decorate([
    (0, common_1.Post)('sif-heca'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PmHazardController.prototype, "scoreSif", null);
__decorate([
    (0, common_1.Post)('offline/sync'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PmHazardController.prototype, "offlineSync", null);
__decorate([
    (0, common_1.Get)(':id/energy-wheel'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PmHazardController.prototype, "energyWheel", null);
__decorate([
    (0, common_1.Get)(':id/suggest-controls'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PmHazardController.prototype, "suggestControls", null);
__decorate([
    (0, common_1.Post)(':id/publish'),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PmHazardController.prototype, "publish", null);
__decorate([
    (0, common_1.Get)(':id/cail'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('companyId')),
    __param(2, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], PmHazardController.prototype, "hazardCail", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PmHazardController.prototype, "getHazard", null);
exports.PmHazardController = PmHazardController = __decorate([
    (0, common_1.Controller)(`${routes_1.API_V1_PREFIX}/pm/hazard`),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...PM_ROLES),
    __metadata("design:paramtypes", [pm_unified_hazard_control_service_1.PmUnifiedHazardControlService,
        pm_unified_hazard_control_cail_service_1.PmUnifiedHazardControlCailService])
], PmHazardController);
//# sourceMappingURL=pm-hazard.controller.js.map