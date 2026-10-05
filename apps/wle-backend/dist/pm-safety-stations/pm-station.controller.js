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
exports.PmStationController = void 0;
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
let PmStationController = class PmStationController {
    constructor(stations, cail) {
        this.stations = stations;
        this.cail = cail;
    }
    register(body, req) {
        return this.stations.register(Object.assign(Object.assign({}, body), { actorId: req.user.id }));
    }
    heartbeat(body) {
        return this.stations.recordHeartbeat(body.stationCode, body);
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
    emergencyMode(body, req) {
        return this.stations.setEmergencyMode(body.stationId, body.active, req.user.id);
    }
    offlineSync(body) {
        return this.stations.applyOfflineSync(body.stationId, body);
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
};
exports.PmStationController = PmStationController;
__decorate([
    (0, common_1.Post)('register'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PmStationController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('heartbeat'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PmStationController.prototype, "heartbeat", null);
__decorate([
    (0, common_1.Post)('validate/worker'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...PM_ROLES),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PmStationController.prototype, "validateWorker", null);
__decorate([
    (0, common_1.Post)('validate/equipment'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...PM_ROLES),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PmStationController.prototype, "validateEquipment", null);
__decorate([
    (0, common_1.Post)('muster/checkin'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PmStationController.prototype, "musterCheckIn", null);
__decorate([
    (0, common_1.Post)('emergency/mode'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PmStationController.prototype, "emergencyMode", null);
__decorate([
    (0, common_1.Post)('offline/sync'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...PM_ROLES),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PmStationController.prototype, "offlineSync", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...PM_ROLES),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], PmStationController.prototype, "getStation", null);
__decorate([
    (0, common_1.Get)(':id/predict'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...PM_ROLES),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('workerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", void 0)
], PmStationController.prototype, "predict", null);
exports.PmStationController = PmStationController = __decorate([
    (0, common_1.Controller)(`${routes_1.API_V1_PREFIX}/pm/station`),
    __metadata("design:paramtypes", [pm_safety_stations_service_1.PmSafetyStationsService,
        pm_safety_stations_cail_intelligence_service_1.PmSafetyStationsCailIntelligenceService])
], PmStationController);
//# sourceMappingURL=pm-station.controller.js.map