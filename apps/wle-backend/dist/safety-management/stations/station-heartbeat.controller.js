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
exports.StationHeartbeatController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
const roles_guard_1 = require("../../auth/roles.guard");
const roles_decorator_1 = require("../../auth/roles.decorator");
const routes_1 = require("../../config/routes");
const station_heartbeat_service_1 = require("./station-heartbeat.service");
const PM_ROLES = [
    client_1.UserRole.SUPERVISOR,
    client_1.UserRole.ADMIN,
    client_1.UserRole.SUPER_ADMIN,
    client_1.UserRole.COMPANY_ADMIN,
    client_1.UserRole.PROJECT_MANAGER,
];
let StationHeartbeatController = class StationHeartbeatController {
    constructor(stations) {
        this.stations = stations;
    }
    heartbeat(code, body) {
        return this.stations.recordHeartbeat(code, body.payload);
    }
    health(siteId) {
        return this.stations.stationHealth(siteId ? parseInt(siteId, 10) : undefined);
    }
    history(stationId) {
        return this.stations.listHeartbeats(parseInt(stationId, 10));
    }
};
exports.StationHeartbeatController = StationHeartbeatController;
__decorate([
    (0, common_1.Post)('heartbeat/:code'),
    __param(0, (0, common_1.Param)('code')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], StationHeartbeatController.prototype, "heartbeat", null);
__decorate([
    (0, common_1.Get)('health'),
    __param(0, (0, common_1.Query)('siteId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], StationHeartbeatController.prototype, "health", null);
__decorate([
    (0, common_1.Get)(':stationId/heartbeats'),
    __param(0, (0, common_1.Param)('stationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], StationHeartbeatController.prototype, "history", null);
exports.StationHeartbeatController = StationHeartbeatController = __decorate([
    (0, common_1.Controller)(`${routes_1.API_V1_PREFIX}/pm/safety/stations`),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...PM_ROLES),
    __metadata("design:paramtypes", [station_heartbeat_service_1.StationHeartbeatService])
], StationHeartbeatController);
//# sourceMappingURL=station-heartbeat.controller.js.map