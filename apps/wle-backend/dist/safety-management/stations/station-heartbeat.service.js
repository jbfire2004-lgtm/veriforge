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
exports.StationHeartbeatService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const pm_safety_stations_service_1 = require("../../pm-safety-stations/pm-safety-stations.service");
let StationHeartbeatService = class StationHeartbeatService {
    constructor(prisma, pmStations) {
        this.prisma = prisma;
        this.pmStations = pmStations;
    }
    async recordHeartbeat(stationCode, payload) {
        if (this.pmStations) {
            return this.pmStations.recordHeartbeat(stationCode, {
                payload,
                batteryLevel: payload === null || payload === void 0 ? void 0 : payload.batteryLevel,
                storageFreeMb: payload === null || payload === void 0 ? void 0 : payload.storageFreeMb,
                sensorHealth: payload === null || payload === void 0 ? void 0 : payload.sensorHealth,
                firmwareVersion: payload === null || payload === void 0 ? void 0 : payload.firmwareVersion,
                online: payload === null || payload === void 0 ? void 0 : payload.online,
            });
        }
        const station = await this.prisma.safetyStation.findUnique({
            where: { code: stationCode },
        });
        if (!station)
            throw new common_1.NotFoundException('Safety station not found');
        const now = new Date();
        await this.prisma.$transaction([
            this.prisma.safetyStation.update({
                where: { id: station.id },
                data: { lastPing: now },
            }),
            this.prisma.safetyStationHeartbeat.create({
                data: {
                    stationId: station.id,
                    payload: (payload !== null && payload !== void 0 ? payload : {}),
                },
            }),
        ]);
        return { stationId: station.id, lastPing: now.toISOString(), ok: true };
    }
    async listHeartbeats(stationId, limit = 50) {
        if (this.pmStations) {
            return this.pmStations.listHeartbeats(stationId, limit);
        }
        return this.prisma.safetyStationHeartbeat.findMany({
            where: { stationId },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    }
    async stationHealth(siteId) {
        if (this.pmStations) {
            return this.pmStations.stationHealth(undefined, siteId);
        }
        const stations = await this.prisma.safetyStation.findMany({
            where: { siteId, active: true },
            select: {
                id: true,
                code: true,
                name: true,
                lastPing: true,
                siteId: true,
            },
        });
        const staleMs = 5 * 60 * 1000;
        const now = Date.now();
        return stations.map((s) => (Object.assign(Object.assign({}, s), { healthy: s.lastPing ? now - s.lastPing.getTime() < staleMs : false, minutesSincePing: s.lastPing
                ? Math.round((now - s.lastPing.getTime()) / 60000)
                : null })));
    }
};
exports.StationHeartbeatService = StationHeartbeatService;
exports.StationHeartbeatService = StationHeartbeatService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        pm_safety_stations_service_1.PmSafetyStationsService])
], StationHeartbeatService);
//# sourceMappingURL=station-heartbeat.service.js.map