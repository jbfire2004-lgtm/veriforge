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
exports.PmSafetyStationsController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const routes_1 = require("../config/routes");
const pm_safety_stations_service_1 = require("./pm-safety-stations.service");
const pm_safety_stations_cail_intelligence_service_1 = require("./pm-safety-stations-cail-intelligence.service");
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
let PmSafetyStationsController = class PmSafetyStationsController {
    constructor(stations, cail) {
        this.stations = stations;
        this.cail = cail;
    }
    deviceHeartbeat(code, body) {
        return this.stations.recordHeartbeat(code, body);
    }
    deviceValidateWorker(body) {
        return this.stations.validateWorker(body);
    }
    deviceValidateEquipment(body) {
        return this.stations.validateEquipment(body);
    }
    deviceMusterCheckIn(body) {
        return this.stations.musterCheckIn(body);
    }
    deviceOfflineSync(stationId, body) {
        return this.stations.applyOfflineSync(stationId, body);
    }
    deviceOfflineBundle(stationId) {
        return this.stations.buildOfflineBundle(stationId);
    }
    register(body, req) {
        return this.stations.register(Object.assign(Object.assign({}, body), { actorId: req.user.id }));
    }
    activate(id, req) {
        return this.stations.activate(id, req.user.id);
    }
    deactivate(id, req) {
        return this.stations.deactivate(id, req.user.id);
    }
    list(companyId, projectId, siteId, stationType) {
        return this.stations.list({
            companyId: parseInt(companyId, 10),
            projectId: projectId ? parseInt(projectId, 10) : undefined,
            siteId: siteId ? parseInt(siteId, 10) : undefined,
            stationType,
        });
    }
    health(projectId, siteId) {
        return this.stations.stationHealth(projectId ? parseInt(projectId, 10) : undefined, siteId ? parseInt(siteId, 10) : undefined);
    }
    validateWorker(body, req) {
        return this.stations.validateWorker(Object.assign(Object.assign({}, body), { actorId: req.user.id }));
    }
    validateEquipment(body, req) {
        return this.stations.validateEquipment(Object.assign(Object.assign({}, body), { actorId: req.user.id }));
    }
    musterCheckIn(body) {
        return this.stations.musterCheckIn(body);
    }
    musterStatus(projectId) {
        return this.stations.musterStatus(parseInt(projectId, 10));
    }
    emergencyMode(id, body, req) {
        return this.stations.setEmergencyMode(id, body.active, req.user.id);
    }
    emergencyPayload(id) {
        return this.stations.emergencyPayload(id);
    }
    offlineBundle(id) {
        return this.stations.buildOfflineBundle(id);
    }
    offlineSync(id, body) {
        return this.stations.applyOfflineSync(id, body);
    }
    addAttachment(body) {
        return this.stations.addAttachment(body);
    }
    accessLogs(stationId, projectId, workerId, limit) {
        return this.stations.accessLogs({
            stationId: stationId ? parseInt(stationId, 10) : undefined,
            projectId: projectId ? parseInt(projectId, 10) : undefined,
            workerId: workerId ? parseInt(workerId, 10) : undefined,
            limit: limit ? parseInt(limit, 10) : undefined,
        });
    }
    equipmentLogs(stationId, limit) {
        return this.stations.equipmentLogs(stationId ? parseInt(stationId, 10) : undefined, limit ? parseInt(limit, 10) : undefined);
    }
    analytics(projectId) {
        return this.stations.analytics(parseInt(projectId, 10));
    }
    cailInsights(projectId) {
        return this.cail.projectInsights(parseInt(projectId, 10));
    }
    getStation(id) {
        return this.stations.getStation(id);
    }
    predict(id, workerId) {
        return this.stations.getStation(id).then(async (station) => {
            if (!station.projectId)
                return { stationId: id };
            const bundle = await this.cail.stationRiskBundle(station.projectId, workerId ? parseInt(workerId, 10) : undefined);
            const insights = await this.cail.projectInsights(station.projectId);
            return Object.assign(Object.assign({ stationId: id }, bundle), { insights });
        });
    }
    heartbeats(stationId, limit) {
        return this.stations.listHeartbeats(stationId, limit ? parseInt(limit, 10) : undefined);
    }
    heartbeat(code, body) {
        return this.stations.recordHeartbeat(code, body);
    }
};
exports.PmSafetyStationsController = PmSafetyStationsController;
__decorate([
    (0, common_1.Post)('device/heartbeat/:code'),
    __param(0, (0, common_1.Param)('code')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PmSafetyStationsController.prototype, "deviceHeartbeat", null);
__decorate([
    (0, common_1.Post)('device/validate-worker'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PmSafetyStationsController.prototype, "deviceValidateWorker", null);
__decorate([
    (0, common_1.Post)('device/validate-equipment'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PmSafetyStationsController.prototype, "deviceValidateEquipment", null);
__decorate([
    (0, common_1.Post)('device/muster-check-in'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PmSafetyStationsController.prototype, "deviceMusterCheckIn", null);
__decorate([
    (0, common_1.Post)('device/offline-sync/:stationId'),
    __param(0, (0, common_1.Param)('stationId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], PmSafetyStationsController.prototype, "deviceOfflineSync", null);
__decorate([
    (0, common_1.Get)('device/offline-bundle/:stationId'),
    __param(0, (0, common_1.Param)('stationId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], PmSafetyStationsController.prototype, "deviceOfflineBundle", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...PM_ROLES),
    (0, common_1.Post)('register'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PmSafetyStationsController.prototype, "register", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    (0, common_1.Put)(':id/activate'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], PmSafetyStationsController.prototype, "activate", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    (0, common_1.Put)(':id/deactivate'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], PmSafetyStationsController.prototype, "deactivate", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...PM_ROLES),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('companyId')),
    __param(1, (0, common_1.Query)('projectId')),
    __param(2, (0, common_1.Query)('siteId')),
    __param(3, (0, common_1.Query)('stationType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], PmSafetyStationsController.prototype, "list", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...PM_ROLES),
    (0, common_1.Get)('health'),
    __param(0, (0, common_1.Query)('projectId')),
    __param(1, (0, common_1.Query)('siteId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PmSafetyStationsController.prototype, "health", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...PM_ROLES),
    (0, common_1.Post)('validate-worker'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PmSafetyStationsController.prototype, "validateWorker", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...PM_ROLES),
    (0, common_1.Post)('validate-equipment'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PmSafetyStationsController.prototype, "validateEquipment", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...PM_ROLES),
    (0, common_1.Post)('muster/check-in'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PmSafetyStationsController.prototype, "musterCheckIn", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...PM_ROLES),
    (0, common_1.Get)('muster/status'),
    __param(0, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PmSafetyStationsController.prototype, "musterStatus", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    (0, common_1.Put)(':id/emergency-mode'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", void 0)
], PmSafetyStationsController.prototype, "emergencyMode", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...PM_ROLES),
    (0, common_1.Get)(':id/emergency-payload'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], PmSafetyStationsController.prototype, "emergencyPayload", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...PM_ROLES),
    (0, common_1.Get)(':id/offline-bundle'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], PmSafetyStationsController.prototype, "offlineBundle", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...PM_ROLES),
    (0, common_1.Post)(':id/offline-sync'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], PmSafetyStationsController.prototype, "offlineSync", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...PM_ROLES),
    (0, common_1.Post)('attachments'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PmSafetyStationsController.prototype, "addAttachment", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...PM_ROLES),
    (0, common_1.Get)('access-logs'),
    __param(0, (0, common_1.Query)('stationId')),
    __param(1, (0, common_1.Query)('projectId')),
    __param(2, (0, common_1.Query)('workerId')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], PmSafetyStationsController.prototype, "accessLogs", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...PM_ROLES),
    (0, common_1.Get)('equipment-logs'),
    __param(0, (0, common_1.Query)('stationId')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PmSafetyStationsController.prototype, "equipmentLogs", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...PM_ROLES),
    (0, common_1.Get)('analytics'),
    __param(0, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PmSafetyStationsController.prototype, "analytics", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...PM_ROLES),
    (0, common_1.Get)('cail/insights'),
    __param(0, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PmSafetyStationsController.prototype, "cailInsights", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...PM_ROLES),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], PmSafetyStationsController.prototype, "getStation", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...PM_ROLES),
    (0, common_1.Get)(':id/predict'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('workerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", void 0)
], PmSafetyStationsController.prototype, "predict", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...PM_ROLES),
    (0, common_1.Get)(':stationId/heartbeats'),
    __param(0, (0, common_1.Param)('stationId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", void 0)
], PmSafetyStationsController.prototype, "heartbeats", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...PM_ROLES),
    (0, common_1.Post)('heartbeat/:code'),
    __param(0, (0, common_1.Param)('code')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PmSafetyStationsController.prototype, "heartbeat", null);
exports.PmSafetyStationsController = PmSafetyStationsController = __decorate([
    (0, common_1.Controller)(`${routes_1.API_V1_PREFIX}/pm/safety-stations`),
    __metadata("design:paramtypes", [pm_safety_stations_service_1.PmSafetyStationsService,
        pm_safety_stations_cail_intelligence_service_1.PmSafetyStationsCailIntelligenceService])
], PmSafetyStationsController);
//# sourceMappingURL=pm-safety-stations.controller.js.map