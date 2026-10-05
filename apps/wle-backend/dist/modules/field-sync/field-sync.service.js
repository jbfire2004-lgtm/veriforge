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
var FieldSyncService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FieldSyncService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const field_sync_batch_processor_1 = require("./field-sync-batch.processor");
const field_sync_delta_service_1 = require("./field-sync-delta.service");
const field_offline_bundle_service_1 = require("./field-offline-bundle.service");
const field_sync_prisma_1 = require("./field-sync.prisma");
let FieldSyncService = FieldSyncService_1 = class FieldSyncService {
    constructor(prisma, processor, delta, offlineBundle) {
        this.prisma = prisma;
        this.processor = processor;
        this.delta = delta;
        this.offlineBundle = offlineBundle;
        this.logger = new common_1.Logger(FieldSyncService_1.name);
    }
    async registerOfflineScan(body, actorUserId) {
        var _a, _b, _c, _d;
        const deviceId = String((_b = (_a = body.deviceId) !== null && _a !== void 0 ? _a : body.clientId) !== null && _b !== void 0 ? _b : 'unknown');
        const companyId = typeof body.companyId === 'number' ? body.companyId : undefined;
        const workerId = typeof body.workerId === 'number' ? body.workerId : undefined;
        const batch = await (0, field_sync_prisma_1.coreOfflineSyncBatchDelegate)(this.prisma).create({
            data: {
                deviceId,
                companyId: companyId !== null && companyId !== void 0 ? companyId : null,
                workerId: workerId !== null && workerId !== void 0 ? workerId : null,
                moduleType: String((_c = body.moduleType) !== null && _c !== void 0 ? _c : 'field_scan'),
                status: 'PENDING',
                itemCount: 1,
                payload: body,
                submittedById: actorUserId !== null && actorUserId !== void 0 ? actorUserId : null,
            },
        });
        this.logger.log(JSON.stringify({
            type: 'field.offline_registry',
            batchId: batch.id,
            deviceId,
        }));
        return {
            accepted: true,
            batchId: batch.id,
            tempId: (_d = body.tempId) !== null && _d !== void 0 ? _d : null,
            receivedAt: new Date().toISOString(),
        };
    }
    async processBatch(actions, actorUserId = 0, meta) {
        var _a;
        const deviceId = (_a = meta === null || meta === void 0 ? void 0 : meta.clientId) !== null && _a !== void 0 ? _a : 'field-client';
        const batchRow = await (0, field_sync_prisma_1.coreOfflineSyncBatchDelegate)(this.prisma).create({
            data: {
                deviceId,
                moduleType: 'field_sync',
                status: 'PROCESSING',
                itemCount: actions.length,
                payload: { actions: actions.map((a) => a.type) },
                submittedById: actorUserId || null,
            },
        });
        const results = [];
        for (const action of actions) {
            const result = await this.processor.processOne(action, actorUserId);
            results.push(result);
        }
        const failed = results.filter((r) => !r.ok).length;
        await (0, field_sync_prisma_1.coreOfflineSyncBatchDelegate)(this.prisma).update({
            where: { id: batchRow.id },
            data: {
                status: failed > 0 ? 'CONFLICT' : 'COMPLETED',
                processedAt: new Date(),
                errorMessage: failed > 0 ? `${failed} action(s) failed` : null,
            },
        });
        await this.prisma.auditLog.create({
            data: {
                actorId: actorUserId || null,
                action: 'field.sync.batch',
                entityType: 'FieldSyncBatch',
                metadataJson: {
                    batchId: meta === null || meta === void 0 ? void 0 : meta.batchId,
                    clientId: meta === null || meta === void 0 ? void 0 : meta.clientId,
                    total: actions.length,
                    failed,
                    types: actions.map((a) => a.type),
                },
            },
        });
        return {
            processed: results.length,
            failed,
            results,
            syncedAt: new Date().toISOString(),
        };
    }
    fetchDelta(params) {
        const since = params.since ? new Date(params.since) : undefined;
        return this.delta.fetchDelta({ companyId: params.companyId, since });
    }
    fetchOfflineBundle(params) {
        return this.offlineBundle.fetchBundle(params);
    }
};
exports.FieldSyncService = FieldSyncService;
exports.FieldSyncService = FieldSyncService = FieldSyncService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        field_sync_batch_processor_1.FieldSyncBatchProcessor,
        field_sync_delta_service_1.FieldSyncDeltaService,
        field_offline_bundle_service_1.FieldOfflineBundleService])
], FieldSyncService);
//# sourceMappingURL=field-sync.service.js.map