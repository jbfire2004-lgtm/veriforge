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
exports.PmSafetyStationsService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const prisma_service_1 = require("../prisma/prisma.service");
const pm_site_access_control_service_1 = require("../pm-site-access-control/pm-site-access-control.service");
const pm_equipment_safety_service_1 = require("../pm-equipment-safety/pm-equipment-safety.service");
const pm_emergency_response_service_1 = require("../pm-emergency-response/pm-emergency-response.service");
const pm_document_control_service_1 = require("../pm-document-control/pm-document-control.service");
const station_registration_engine_1 = require("./station-registration.engine");
const station_heartbeat_engine_1 = require("./station-heartbeat.engine");
const station_jha_engine_1 = require("./station-jha.engine");
const pm_safety_stations_cail_intelligence_service_1 = require("./pm-safety-stations-cail-intelligence.service");
let PmSafetyStationsService = class PmSafetyStationsService {
    constructor(prisma, cail, siteAccess, equipmentSafety, emergency, documents) {
        this.prisma = prisma;
        this.cail = cail;
        this.siteAccess = siteAccess;
        this.equipmentSafety = equipmentSafety;
        this.emergency = emergency;
        this.documents = documents;
        this.registrationEngine = new station_registration_engine_1.StationRegistrationEngine();
        this.heartbeatEngine = new station_heartbeat_engine_1.StationHeartbeatEngine();
        this.jhaEngine = new station_jha_engine_1.StationJhaEngine(prisma);
    }
    async audit(entityType, entityId, eventType, stationId, actorId, payload) {
        await this.prisma.pmSafetyStationAuditLog.create({
            data: {
                stationId,
                entityType,
                entityId,
                eventType,
                actorId,
                payload: payload,
            },
        });
    }
    async resolveStation(stationId, code, hardwareId) {
        if (stationId) {
            const s = await this.prisma.safetyStation.findFirst({
                where: { id: stationId, deletedAt: null },
            });
            if (!s)
                throw new common_1.NotFoundException('Station not found');
            return s;
        }
        if (code) {
            const s = await this.prisma.safetyStation.findFirst({
                where: { code, deletedAt: null },
            });
            if (!s)
                throw new common_1.NotFoundException('Station not found');
            return s;
        }
        if (hardwareId) {
            const s = await this.prisma.safetyStation.findFirst({
                where: { hardwareId, deletedAt: null },
            });
            if (!s)
                throw new common_1.NotFoundException('Station not found');
            return s;
        }
        throw new common_1.BadRequestException('stationId, code, or hardwareId required');
    }
    async register(input) {
        var _a, _b, _c, _d;
        const validation = this.registrationEngine.validateRegistration(input);
        if (!validation.valid) {
            throw new common_1.BadRequestException(validation.errors.join('; '));
        }
        const row = await this.prisma.safetyStation.create({
            data: {
                name: input.name,
                code: input.code,
                companyId: input.companyId,
                projectId: input.projectId,
                siteId: input.siteId,
                zoneCode: (_a = input.zoneCode) !== null && _a !== void 0 ? _a : 'SITE',
                stationType: (_b = input.stationType) !== null && _b !== void 0 ? _b : 'zone',
                hardwareId: input.hardwareId,
                firmwareVersion: input.firmwareVersion,
                networkMode: (_c = input.networkMode) !== null && _c !== void 0 ? _c : 'online',
                equipmentId: input.equipmentId,
                latitude: input.latitude,
                longitude: input.longitude,
                heartbeatIntervalSec: (_d = input.heartbeatIntervalSec) !== null && _d !== void 0 ? _d : 60,
                status: 'pending',
                active: true,
            },
        });
        await this.audit('safety_station', String(row.id), 'registered', row.id, input.actorId);
        return row;
    }
    async activate(stationId, actorId) {
        const station = await this.resolveStation(stationId);
        const next = this.registrationEngine.activationTransition(station.status, !!station.hardwareId, !!station.projectId);
        const updated = await this.prisma.safetyStation.update({
            where: { id: stationId },
            data: { status: next, active: next === 'active' },
        });
        await this.audit('safety_station', String(stationId), 'activated', stationId, actorId, {
            status: next,
        });
        return updated;
    }
    async deactivate(stationId, actorId) {
        const updated = await this.prisma.safetyStation.update({
            where: { id: stationId },
            data: {
                status: 'deactivated',
                active: false,
                deletedAt: new Date(),
            },
        });
        await this.audit('safety_station', String(stationId), 'deactivated', stationId, actorId);
        return updated;
    }
    async list(filters) {
        return this.prisma.safetyStation.findMany({
            where: {
                companyId: filters.companyId,
                projectId: filters.projectId,
                siteId: filters.siteId,
                stationType: filters.stationType,
                status: filters.status,
                deletedAt: null,
            },
            include: {
                site: true,
                project: true,
                equipment: { select: { id: true, name: true } },
            },
            orderBy: { name: 'asc' },
        });
    }
    async recordHeartbeat(stationCode, payload) {
        var _a, _b, _c, _d, _e;
        const station = await this.resolveStation(undefined, stationCode);
        const now = new Date();
        const sensorHealth = (_a = payload === null || payload === void 0 ? void 0 : payload.sensorHealth) !== null && _a !== void 0 ? _a : (_b = payload === null || payload === void 0 ? void 0 : payload.payload) === null || _b === void 0 ? void 0 : _b.sensorHealth;
        const alerts = this.heartbeatEngine.evaluateAlerts({
            lastPing: station.lastPing,
            heartbeatIntervalSec: station.heartbeatIntervalSec,
            batteryLevel: payload === null || payload === void 0 ? void 0 : payload.batteryLevel,
            sensorHealth,
            expectedFirmware: station.firmwareVersion,
            reportedFirmware: payload === null || payload === void 0 ? void 0 : payload.firmwareVersion,
        });
        await this.prisma.$transaction([
            this.prisma.safetyStation.update({
                where: { id: station.id },
                data: {
                    lastPing: now,
                    status: station.status === 'pending' ? station.status : 'active',
                    networkMode: (payload === null || payload === void 0 ? void 0 : payload.online) === false ? 'offline' : station.networkMode,
                    firmwareVersion: (_c = payload === null || payload === void 0 ? void 0 : payload.firmwareVersion) !== null && _c !== void 0 ? _c : station.firmwareVersion,
                },
            }),
            this.prisma.safetyStationHeartbeat.create({
                data: {
                    stationId: station.id,
                    payload: ((_e = (_d = payload === null || payload === void 0 ? void 0 : payload.payload) !== null && _d !== void 0 ? _d : payload) !== null && _e !== void 0 ? _e : {}),
                    batteryLevel: payload === null || payload === void 0 ? void 0 : payload.batteryLevel,
                    storageFreeMb: payload === null || payload === void 0 ? void 0 : payload.storageFreeMb,
                    sensorHealthJson: (sensorHealth !== null && sensorHealth !== void 0 ? sensorHealth : {}),
                    firmwareVersion: payload === null || payload === void 0 ? void 0 : payload.firmwareVersion,
                    alertsJson: alerts,
                    online: (payload === null || payload === void 0 ? void 0 : payload.online) !== false,
                },
            }),
        ]);
        if (alerts.some((a) => a.severity === 'critical')) {
            await this.audit('safety_station', String(station.id), 'heartbeat_alert', station.id, undefined, {
                alerts,
            });
        }
        return {
            stationId: station.id,
            lastPing: now.toISOString(),
            ok: true,
            alerts,
            healthy: this.heartbeatEngine.isHealthy(alerts),
        };
    }
    async stationHealth(projectId, siteId) {
        const stations = await this.prisma.safetyStation.findMany({
            where: {
                deletedAt: null,
                active: true,
                projectId,
                siteId,
            },
            select: {
                id: true,
                code: true,
                name: true,
                lastPing: true,
                status: true,
                stationType: true,
                heartbeatIntervalSec: true,
            },
        });
        const latestHeartbeats = await Promise.all(stations.map(async (s) => {
            var _a;
            const hb = await this.prisma.safetyStationHeartbeat.findFirst({
                where: { stationId: s.id },
                orderBy: { createdAt: 'desc' },
            });
            const alerts = this.heartbeatEngine.evaluateAlerts({
                lastPing: s.lastPing,
                heartbeatIntervalSec: s.heartbeatIntervalSec,
                batteryLevel: hb === null || hb === void 0 ? void 0 : hb.batteryLevel,
                sensorHealth: (_a = hb === null || hb === void 0 ? void 0 : hb.sensorHealthJson) !== null && _a !== void 0 ? _a : {},
                reportedFirmware: hb === null || hb === void 0 ? void 0 : hb.firmwareVersion,
            });
            return Object.assign(Object.assign({}, s), { healthy: this.heartbeatEngine.isHealthy(alerts), alerts, batteryLevel: hb === null || hb === void 0 ? void 0 : hb.batteryLevel });
        }));
        return latestHeartbeats;
    }
    async listHeartbeats(stationId, limit = 50) {
        return this.prisma.safetyStationHeartbeat.findMany({
            where: { stationId },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    }
    async validateWorker(input) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        const station = await this.resolveStation(input.stationId, input.stationCode);
        const zoneCode = (_b = (_a = input.zoneCode) !== null && _a !== void 0 ? _a : station.zoneCode) !== null && _b !== void 0 ? _b : 'SITE';
        const action = (_c = input.action) !== null && _c !== void 0 ? _c : 'sign_in';
        if (station.emergencyModeActive) {
            const log = await this.writeAccessLog({
                stationId: station.id,
                workerId: input.workerId,
                projectId: input.projectId,
                zoneCode,
                action,
                granted: false,
                decision: 'denied',
                denialReasons: ['Emergency mode active — access locked'],
                checksJson: { emergencyLock: false },
                clientSyncId: input.clientSyncId,
            });
            return { granted: false, log, denialReasons: ['Emergency mode active'] };
        }
        const rule = await this.prisma.siteAccessRule.findUnique({
            where: {
                projectId_zoneCode: {
                    projectId: input.projectId,
                    zoneCode,
                },
            },
        });
        let accessResult = {
            granted: false,
            denialReasons: ['Site access module unavailable'],
            checks: {},
        };
        if (this.siteAccess) {
            const r = await this.siteAccess.stationValidate({
                workerId: input.workerId,
                projectId: input.projectId,
                zoneCode,
                equipmentId: (_e = (_d = input.equipmentId) !== null && _d !== void 0 ? _d : station.equipmentId) !== null && _e !== void 0 ? _e : undefined,
            });
            accessResult = {
                granted: r.granted,
                denialReasons: r.denialReasons,
                checks: r.checks,
                attemptId: r.attemptId,
                decision: r.decision,
            };
        }
        const jha = await this.jhaEngine.validateForStation({
            workerId: input.workerId,
            projectId: input.projectId,
            zoneCode,
            requiresJha: (_f = rule === null || rule === void 0 ? void 0 : rule.requiresJha) !== null && _f !== void 0 ? _f : false,
            flhaHours: (_g = rule === null || rule === void 0 ? void 0 : rule.requiresFlhaHours) !== null && _g !== void 0 ? _g : 24,
            equipmentId: (_j = (_h = input.equipmentId) !== null && _h !== void 0 ? _h : station.equipmentId) !== null && _j !== void 0 ? _j : undefined,
        });
        const mergedChecks = Object.assign(Object.assign({}, accessResult.checks), jha.checks);
        const denialReasons = [...accessResult.denialReasons, ...jha.denialReasons];
        const granted = accessResult.granted && jha.valid;
        const log = await this.writeAccessLog({
            stationId: station.id,
            workerId: input.workerId,
            projectId: input.projectId,
            zoneCode,
            action,
            granted,
            decision: accessResult.decision,
            denialReasons,
            checksJson: mergedChecks,
            accessAttemptId: accessResult.attemptId,
            jhaFlhaId: jha.jhaFlhaId,
            clientSyncId: input.clientSyncId,
        });
        await this.audit('access_log', log.id, granted ? 'access_granted' : 'access_denied', station.id, input.actorId, { workerId: input.workerId, denialReasons });
        const prediction = this.cail.predictAccessDenial(mergedChecks);
        return {
            granted,
            log,
            denialReasons,
            checks: mergedChecks,
            requiredPpe: jha.requiredPpe,
            cail: prediction,
        };
    }
    async writeAccessLog(data) {
        return this.prisma.pmSafetyStationAccessLog.create({
            data: {
                id: (0, crypto_1.randomUUID)(),
                stationId: data.stationId,
                workerId: data.workerId,
                projectId: data.projectId,
                zoneCode: data.zoneCode,
                action: data.action,
                granted: data.granted,
                decision: data.decision,
                denialReasons: data.denialReasons,
                checksJson: data.checksJson,
                accessAttemptId: data.accessAttemptId,
                jhaFlhaId: data.jhaFlhaId,
                clientSyncId: data.clientSyncId,
            },
        });
    }
    async validateEquipment(input) {
        var _a, _b;
        const station = await this.resolveStation(input.stationId, input.stationCode);
        if (!this.equipmentSafety) {
            throw new common_1.BadRequestException('Equipment safety module unavailable');
        }
        let granted = true;
        const denialReasons = [];
        const checks = {};
        if (input.workerId) {
            const validation = await this.equipmentSafety.validateAssignment({
                workerId: input.workerId,
                equipmentId: input.equipmentId,
                projectId: (_b = (_a = input.projectId) !== null && _a !== void 0 ? _a : station.projectId) !== null && _b !== void 0 ? _b : undefined,
                actorId: input.actorId,
            });
            granted = validation.allowed;
            if (!validation.allowed)
                denialReasons.push(...validation.failures);
            checks.assignment = validation.allowed;
        }
        else {
            const eq = await this.prisma.equipment.findUnique({
                where: { id: input.equipmentId },
            });
            if (!eq)
                throw new common_1.NotFoundException('Equipment not found');
            const blocked = eq.operationalStatus === 'out_of_service' ||
                eq.operationalStatus === 'locked_out' ||
                eq.lockoutStatus !== 'CLEAR';
            granted = !blocked;
            checks.operational = !blocked;
            if (blocked)
                denialReasons.push(`Equipment status: ${eq.operationalStatus}`);
        }
        const log = await this.prisma.pmSafetyStationEquipmentLog.create({
            data: {
                id: (0, crypto_1.randomUUID)(),
                stationId: station.id,
                equipmentId: input.equipmentId,
                workerId: input.workerId,
                granted,
                denialReasons: denialReasons,
                checksJson: checks,
                clientSyncId: input.clientSyncId,
            },
        });
        return { granted, log, denialReasons, checks };
    }
    async musterCheckIn(input) {
        var _a;
        const station = await this.resolveStation(input.stationId, input.stationCode);
        const projectId = station.projectId;
        if (!projectId)
            throw new common_1.BadRequestException('Station not assigned to project');
        const activeMuster = await this.prisma.musterEvent.findFirst({
            where: { projectId, status: { in: ['activated', 'accounting'] } },
            orderBy: { triggeredAt: 'desc' },
        });
        const log = await this.prisma.pmSafetyStationMusterLog.create({
            data: {
                id: (0, crypto_1.randomUUID)(),
                stationId: station.id,
                workerId: input.workerId,
                musterEventId: activeMuster === null || activeMuster === void 0 ? void 0 : activeMuster.id,
                action: 'check_in',
                musterPointCode: (_a = input.musterPointCode) !== null && _a !== void 0 ? _a : station.zoneCode,
                geoJson: input.geoJson,
                clientSyncId: input.clientSyncId,
            },
        });
        if (activeMuster) {
            await this.prisma.musterCheckin.upsert({
                where: {
                    musterEventId_workerId: {
                        musterEventId: activeMuster.id,
                        workerId: input.workerId,
                    },
                },
                create: {
                    musterEventId: activeMuster.id,
                    workerId: input.workerId,
                    method: `safety_station:${station.code}`,
                },
                update: {
                    checkedInAt: new Date(),
                    method: 'safety_station',
                },
            });
        }
        return { log, musterEventId: activeMuster === null || activeMuster === void 0 ? void 0 : activeMuster.id };
    }
    async musterStatus(projectId) {
        const activeMuster = await this.prisma.musterEvent.findFirst({
            where: { projectId, status: { in: ['activated', 'accounting'] } },
            include: { checkins: true },
        });
        if (!activeMuster)
            return { active: false };
        const missing = Array.isArray(activeMuster.missingWorkerIds)
            ? activeMuster.missingWorkerIds
            : [];
        return {
            active: true,
            musterEventId: activeMuster.id,
            checkedIn: activeMuster.checkins.length,
            missingWorkerIds: missing,
        };
    }
    async setEmergencyMode(stationId, active, actorId) {
        const updated = await this.prisma.safetyStation.update({
            where: { id: stationId },
            data: { emergencyModeActive: active },
        });
        await this.audit('safety_station', String(stationId), active ? 'emergency_mode_on' : 'emergency_mode_off', stationId, actorId);
        return updated;
    }
    async emergencyPayload(stationId) {
        const station = await this.resolveStation(stationId);
        if (!station.companyId || !station.siteId) {
            return { plans: [], lock: null };
        }
        const plans = this.emergency
            ? await this.emergency.stationPayload(station.companyId, station.siteId)
            : [];
        const lock = station.projectId
            ? await this.prisma.pmSiteEmergencyLock.findFirst({
                where: { projectId: station.projectId, active: true },
            })
            : null;
        return { plans, lock, emergencyModeActive: station.emergencyModeActive };
    }
    async buildOfflineBundle(stationId) {
        var _a;
        const station = await this.resolveStation(stationId);
        const projectId = station.projectId;
        if (!projectId || !station.companyId) {
            throw new common_1.BadRequestException('Station requires company and project for sync');
        }
        const workers = await this.prisma.projectAssignment.findMany({
            where: { projectId, endedAt: null },
            include: {
                worker: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        qrToken: true,
                    },
                },
            },
        });
        const equipment = await this.prisma.equipmentProjectAssignment.findMany({
            where: { projectId, endedAt: null },
            include: {
                equipment: {
                    select: {
                        id: true,
                        name: true,
                        qrToken: true,
                        operationalStatus: true,
                        lockoutStatus: true,
                    },
                },
            },
        });
        const jha = await this.jhaEngine.syncPayload(projectId);
        const zoneRules = await this.prisma.siteAccessRule.findMany({
            where: { projectId },
        });
        const emergency = await this.emergencyPayload(stationId);
        const sds = this.documents
            ? await this.documents.stationSyncPayload(station.companyId, (_a = station.siteId) !== null && _a !== void 0 ? _a : undefined)
            : { documents: [] };
        const bundle = {
            station: {
                id: station.id,
                code: station.code,
                zoneCode: station.zoneCode,
                stationType: station.stationType,
            },
            workers: workers.map((w) => w.worker),
            equipment: equipment.map((e) => e.equipment),
            jha,
            zoneRules,
            emergency,
            sds,
            syncedAt: new Date().toISOString(),
        };
        await this.prisma.pmSafetyStationOfflineCache.upsert({
            where: {
                stationId_cacheKey: { stationId, cacheKey: 'full_bundle' },
            },
            create: {
                id: (0, crypto_1.randomUUID)(),
                stationId,
                cacheKey: 'full_bundle',
                payload: bundle,
            },
            update: {
                payload: bundle,
                cacheVersion: { increment: 1 },
                syncedAt: new Date(),
            },
        });
        await this.prisma.safetyStation.update({
            where: { id: stationId },
            data: { lastSyncAt: new Date() },
        });
        return bundle;
    }
    async applyOfflineSync(stationId, events) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
        const results = {
            access: 0,
            equipment: 0,
            muster: 0,
            attachments: 0,
            conflicts: 0,
        };
        for (const row of (_a = events.accessLogs) !== null && _a !== void 0 ? _a : []) {
            const clientSyncId = row.clientSyncId;
            if (clientSyncId) {
                const existing = await this.prisma.pmSafetyStationAccessLog.findUnique({
                    where: { clientSyncId },
                });
                if (existing) {
                    results.conflicts++;
                    continue;
                }
            }
            await this.prisma.pmSafetyStationAccessLog.create({
                data: {
                    id: (0, crypto_1.randomUUID)(),
                    stationId,
                    workerId: row.workerId,
                    projectId: row.projectId,
                    zoneCode: (_b = row.zoneCode) !== null && _b !== void 0 ? _b : 'SITE',
                    action: (_c = row.action) !== null && _c !== void 0 ? _c : 'sign_in',
                    granted: !!row.granted,
                    decision: row.decision,
                    denialReasons: ((_d = row.denialReasons) !== null && _d !== void 0 ? _d : []),
                    checksJson: ((_e = row.checksJson) !== null && _e !== void 0 ? _e : {}),
                    clientSyncId,
                },
            });
            results.access++;
        }
        for (const row of (_f = events.equipmentLogs) !== null && _f !== void 0 ? _f : []) {
            const clientSyncId = row.clientSyncId;
            if (clientSyncId) {
                const existing = await this.prisma.pmSafetyStationEquipmentLog.findUnique({
                    where: { clientSyncId },
                });
                if (existing) {
                    results.conflicts++;
                    continue;
                }
            }
            await this.prisma.pmSafetyStationEquipmentLog.create({
                data: {
                    id: (0, crypto_1.randomUUID)(),
                    stationId,
                    equipmentId: row.equipmentId,
                    workerId: row.workerId,
                    granted: !!row.granted,
                    denialReasons: ((_g = row.denialReasons) !== null && _g !== void 0 ? _g : []),
                    checksJson: ((_h = row.checksJson) !== null && _h !== void 0 ? _h : {}),
                    clientSyncId,
                },
            });
            results.equipment++;
        }
        for (const row of (_j = events.musterLogs) !== null && _j !== void 0 ? _j : []) {
            const clientSyncId = row.clientSyncId;
            if (clientSyncId) {
                const existing = await this.prisma.pmSafetyStationMusterLog.findUnique({
                    where: { clientSyncId },
                });
                if (existing) {
                    results.conflicts++;
                    continue;
                }
            }
            await this.prisma.pmSafetyStationMusterLog.create({
                data: {
                    id: (0, crypto_1.randomUUID)(),
                    stationId,
                    workerId: row.workerId,
                    action: (_k = row.action) !== null && _k !== void 0 ? _k : 'check_in',
                    musterEventId: row.musterEventId,
                    clientSyncId,
                },
            });
            results.muster++;
        }
        for (const row of (_l = events.attachments) !== null && _l !== void 0 ? _l : []) {
            const clientSyncId = row.clientSyncId;
            if (clientSyncId) {
                const existing = await this.prisma.pmSafetyStationAttachment.findUnique({
                    where: { clientSyncId },
                });
                if (existing) {
                    results.conflicts++;
                    continue;
                }
            }
            await this.prisma.pmSafetyStationAttachment.create({
                data: {
                    id: (0, crypto_1.randomUUID)(),
                    stationId,
                    entityType: row.entityType,
                    entityId: row.entityId,
                    fileName: row.fileName,
                    mimeType: row.mimeType,
                    dataUrl: row.dataUrl,
                    clientSyncId,
                },
            });
            results.attachments++;
        }
        await this.audit('safety_station', String(stationId), 'offline_sync_applied', stationId, undefined, results);
        return results;
    }
    async addAttachment(input) {
        return this.prisma.pmSafetyStationAttachment.create({
            data: {
                id: (0, crypto_1.randomUUID)(),
                stationId: input.stationId,
                entityType: input.entityType,
                entityId: input.entityId,
                fileName: input.fileName,
                mimeType: input.mimeType,
                dataUrl: input.dataUrl,
                clientSyncId: input.clientSyncId,
            },
        });
    }
    mapOperationalState(input) {
        if (input.emergencyModeActive)
            return 'emergency_mode';
        if (input.alerts.some((a) => a.code === 'station_offline'))
            return 'offline';
        if (input.alerts.some((a) => a.code === 'sensor_failure'))
            return 'sensor_fault';
        if (input.alerts.some((a) => a.code === 'low_battery'))
            return 'low_battery';
        if (input.networkMode === 'offline')
            return 'offline';
        return 'online';
    }
    async getStation(id) {
        var _a;
        const station = await this.resolveStation(id);
        const hb = await this.prisma.safetyStationHeartbeat.findFirst({
            where: { stationId: id },
            orderBy: { createdAt: 'desc' },
        });
        const alerts = this.heartbeatEngine.evaluateAlerts({
            lastPing: station.lastPing,
            heartbeatIntervalSec: station.heartbeatIntervalSec,
            batteryLevel: hb === null || hb === void 0 ? void 0 : hb.batteryLevel,
            sensorHealth: (_a = hb === null || hb === void 0 ? void 0 : hb.sensorHealthJson) !== null && _a !== void 0 ? _a : {},
            reportedFirmware: hb === null || hb === void 0 ? void 0 : hb.firmwareVersion,
            expectedFirmware: station.firmwareVersion,
        });
        return Object.assign(Object.assign({}, station), { operationalState: this.mapOperationalState({
                emergencyModeActive: station.emergencyModeActive,
                networkMode: station.networkMode,
                alerts,
            }), lastHeartbeat: hb, healthy: this.heartbeatEngine.isHealthy(alerts) });
    }
    async analytics(projectId) {
        const since30 = new Date(Date.now() - 30 * 86400000);
        const accessLogs = await this.prisma.pmSafetyStationAccessLog.findMany({
            where: { projectId, createdAt: { gte: since30 } },
            select: { granted: true, createdAt: true, workerId: true },
        });
        const denied = accessLogs.filter((l) => !l.granted).length;
        const granted = accessLogs.filter((l) => l.granted).length;
        const equipmentLogs = await this.prisma.pmSafetyStationEquipmentLog.count({
            where: {
                station: { projectId },
                createdAt: { gte: since30 },
            },
        });
        const musterLogs = await this.prisma.pmSafetyStationMusterLog.count({
            where: {
                station: { projectId },
                createdAt: { gte: since30 },
            },
        });
        const health = await this.stationHealth(projectId);
        const uptimePct = health.length > 0
            ? Math.round((health.filter((h) => h.healthy).length / health.length) * 100)
            : 100;
        const cailInsights = await this.cail.projectInsights(projectId);
        const musterAnomaly = await this.cail.musterAnomalyDetection(projectId);
        if (musterAnomaly)
            cailInsights.push(musterAnomaly);
        const denialRate = accessLogs.length > 0 ? denied / accessLogs.length : 0;
        return {
            access: { granted, denied, total: accessLogs.length },
            equipmentValidations: equipmentLogs,
            musterCheckins: musterLogs,
            stationUptimePct: uptimePct,
            stations: health.length,
            denialRate,
            syncSuccessRate: accessLogs.length > 0 ? granted / accessLogs.length : 1,
            musterCompliancePct: granted + denied > 0
                ? Math.round((granted / (granted + denied)) * 100)
                : 100,
            cailInsights,
        };
    }
    async accessLogs(filters) {
        var _a;
        return this.prisma.pmSafetyStationAccessLog.findMany({
            where: {
                stationId: filters.stationId,
                projectId: filters.projectId,
                workerId: filters.workerId,
            },
            orderBy: { createdAt: 'desc' },
            take: (_a = filters.limit) !== null && _a !== void 0 ? _a : 100,
            include: {
                worker: { select: { id: true, firstName: true, lastName: true } },
                station: { select: { id: true, code: true, name: true } },
            },
        });
    }
    async equipmentLogs(stationId, limit = 100) {
        return this.prisma.pmSafetyStationEquipmentLog.findMany({
            where: { stationId },
            orderBy: { createdAt: 'desc' },
            take: limit,
            include: {
                equipment: { select: { id: true, name: true } },
            },
        });
    }
};
exports.PmSafetyStationsService = PmSafetyStationsService;
exports.PmSafetyStationsService = PmSafetyStationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, common_1.Optional)()),
    __param(3, (0, common_1.Optional)()),
    __param(4, (0, common_1.Optional)()),
    __param(5, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        pm_safety_stations_cail_intelligence_service_1.PmSafetyStationsCailIntelligenceService,
        pm_site_access_control_service_1.PmSiteAccessControlService,
        pm_equipment_safety_service_1.PmEquipmentSafetyService,
        pm_emergency_response_service_1.PmEmergencyResponseService,
        pm_document_control_service_1.PmDocumentControlService])
], PmSafetyStationsService);
//# sourceMappingURL=pm-safety-stations.service.js.map