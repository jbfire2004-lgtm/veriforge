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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderIntegrationHubService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const domain_events_1 = require("../api-platform/events/domain-events");
const event_bus_service_1 = require("../api-platform/events/event-bus.service");
let ProviderIntegrationHubService = class ProviderIntegrationHubService {
    constructor(prisma, events) {
        this.prisma = prisma;
        this.events = events;
    }
    async getSummary(companyId) {
        const since90 = new Date();
        since90.setDate(since90.getDate() - 90);
        const since24h = new Date();
        since24h.setHours(since24h.getHours() - 24);
        const [providers, ingestionRuns, validationFailures, pendingVerification, providerRecords, unionHallReceipts90d, providerPortalRecords90d, unionHallReceipts24h,] = await Promise.all([
            this.prisma.trainingProvider.findMany({
                where: { active: true },
                include: {
                    complianceStatuses: { orderBy: { assessedAt: 'desc' }, take: 1 },
                    _count: {
                        select: {
                            trainingRecords: {
                                where: { companyId, issuedAt: { gte: since90 } },
                            },
                        },
                    },
                },
                orderBy: { name: 'asc' },
                take: 100,
            }),
            this.prisma.trainingIngestionRun.findMany({
                where: { companyId, createdAt: { gte: since90 } },
                orderBy: { createdAt: 'desc' },
                take: 25,
                include: { _count: { select: { createdRecords: true } } },
            }),
            this.prisma.trainingValidationResult.findMany({
                where: {
                    outcome: { in: ['REJECTED', 'NEEDS_REVIEW'] },
                    validatedAt: { gte: since90 },
                    trainingRecord: { companyId },
                },
                orderBy: { validatedAt: 'desc' },
                take: 20,
                select: {
                    id: true,
                    outcome: true,
                    subjectType: true,
                    trainingProviderId: true,
                    trainingRecordId: true,
                    missingStandardCodes: true,
                    validatedAt: true,
                },
            }),
            this.prisma.trainingRecord.count({
                where: {
                    companyId,
                    completedAt: null,
                    OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
                },
            }),
            this.prisma.trainingRecord.groupBy({
                by: ['trainingProviderId'],
                where: {
                    companyId,
                    trainingProviderId: { not: null },
                    issuedAt: { gte: since90 },
                },
                _count: { id: true },
                _max: { issuedAt: true },
            }),
            this.prisma.unionHallTrainingReceipt.count({
                where: {
                    createdAt: { gte: since90 },
                    trainingRecord: { companyId },
                },
            }),
            this.prisma.trainingRecord.count({
                where: {
                    companyId,
                    trainingProviderId: { not: null },
                    ingestionRunId: null,
                    issuedAt: { gte: since90 },
                },
            }),
            this.prisma.unionHallTrainingReceipt.count({
                where: {
                    createdAt: { gte: since24h },
                    trainingRecord: { companyId },
                },
            }),
        ]);
        const lastProviderRecord = new Map(providerRecords.map((r) => [r.trainingProviderId, r._max.issuedAt]));
        const providerRecordCounts = new Map(providerRecords.map((r) => [r.trainingProviderId, r._count.id]));
        const ingestionCompleted = ingestionRuns.filter((r) => r.status === 'COMPLETED').length;
        const ingestionFailed = ingestionRuns.filter((r) => r.status === 'FAILED').length;
        const ingestionTotal = ingestionRuns.length || 1;
        const portalUploads = Math.max(ingestionRuns.filter((r) => r.sourceChannel === 'provider_portal').length, providerPortalRecords90d);
        const csvUploads = ingestionRuns.filter((r) => r.sourceChannel === 'csv').length;
        const fileUploads = ingestionRuns.filter((r) => r.sourceChannel === 'upload' || r.sourceChannel === 'ocr').length;
        const channels = [
            this.channelHealth('provider_portal', 'Provider portal API', portalUploads, ingestionRuns, since24h),
            this.channelHealth('training_ingestion', 'Bulk file ingestion', fileUploads, ingestionRuns, since24h),
            this.channelHealth('csv_import', 'CSV / email ingest', csvUploads, ingestionRuns, since24h),
            this.unionHallChannelHealth(unionHallReceipts90d, unionHallReceipts24h, since24h),
        ];
        const summary = {
            generatedAt: new Date().toISOString(),
            companyId,
            channels,
            providers: providers.map((p) => {
                var _a, _b, _c, _d, _e, _f;
                return ({
                    id: p.id,
                    name: p.name,
                    code: p.code,
                    approvalStatus: p.approvalStatus,
                    active: p.active,
                    recordCount90d: (_a = providerRecordCounts.get(p.id)) !== null && _a !== void 0 ? _a : p._count.trainingRecords,
                    lastRecordAt: (_d = (_c = ((_b = lastProviderRecord.get(p.id)) !== null && _b !== void 0 ? _b : null)) === null || _c === void 0 ? void 0 : _c.toISOString()) !== null && _d !== void 0 ? _d : null,
                    complianceStatus: (_f = (_e = p.complianceStatuses[0]) === null || _e === void 0 ? void 0 : _e.status) !== null && _f !== void 0 ? _f : null,
                });
            }),
            recentIngestion: ingestionRuns.map((r) => {
                var _a, _b;
                return ({
                    id: r.id,
                    status: r.status,
                    sourceChannel: r.sourceChannel,
                    originalFilename: r.originalFilename,
                    createdAt: r.createdAt.toISOString(),
                    completedAt: (_b = (_a = r.completedAt) === null || _a === void 0 ? void 0 : _a.toISOString()) !== null && _b !== void 0 ? _b : null,
                    recordsCreated: r._count.createdRecords,
                    errorMessage: r.errorMessage,
                });
            }),
            recentValidationFailures: validationFailures.map((v) => ({
                id: v.id,
                outcome: v.outcome,
                subjectType: v.subjectType,
                trainingProviderId: v.trainingProviderId,
                trainingRecordId: v.trainingRecordId,
                missingStandardCodes: v.missingStandardCodes,
                validatedAt: v.validatedAt.toISOString(),
            })),
            metrics: {
                providersActive: providers.filter((p) => p.approvalStatus === 'APPROVED').length,
                providersPendingApproval: providers.filter((p) => p.approvalStatus === 'PENDING').length,
                ingestionSuccessRate90d: Math.round((ingestionCompleted / ingestionTotal) * 100),
                recordsFromProviders90d: providerRecords.reduce((n, r) => n + r._count.id, 0),
                validationFailures90d: validationFailures.length,
                pendingVerification,
            },
            eventFlow: [
                'provider.upload → training-ingestion.run → training-record.created',
                'training-record.created → verification.validate → wallet.sync',
                'verification.attention → notification.inbox → supervisor review',
                'verification.complete → company-compliance.refresh → readiness.recalculate',
                'verification.complete → credential-nft.project (stub chain)',
            ],
        };
        this.events.emit({
            name: domain_events_1.DomainEvent.PROVIDER_HUB_SUMMARY,
            occurredAt: summary.generatedAt,
            companyId,
            entityType: 'provider_hub',
            entityId: companyId,
            data: { metrics: summary.metrics },
        });
        return summary;
    }
    unionHallChannelHealth(activityCount90d, activityCount24h, since24h) {
        let status = 'healthy';
        if (activityCount90d === 0)
            status = 'offline';
        else if (activityCount24h === 0)
            status = 'degraded';
        return {
            key: 'union_hall',
            label: 'Union hall receipts',
            status,
            lastActivityAt: activityCount24h > 0 ? since24h.toISOString() : null,
            pendingCount: 0,
            failedCount24h: 0,
        };
    }
    channelHealth(key, label, activityCount, runs, since24h) {
        var _a, _b, _c;
        const channelRuns = runs.filter((r) => key === 'provider_portal'
            ? r.sourceChannel === 'provider_portal'
            : key === 'csv_import'
                ? r.sourceChannel === 'csv'
                : key === 'training_ingestion'
                    ? r.sourceChannel === 'upload' || r.sourceChannel === 'ocr'
                    : false);
        const failed24h = channelRuns.filter((r) => r.status === 'FAILED' && r.createdAt >= since24h).length;
        const pending = channelRuns.filter((r) => r.status === 'PENDING' || r.status === 'PROCESSING').length;
        const last = (_b = (_a = channelRuns[0]) === null || _a === void 0 ? void 0 : _a.createdAt) !== null && _b !== void 0 ? _b : null;
        let status = 'healthy';
        if (activityCount === 0 && key !== 'union_hall')
            status = 'offline';
        else if (failed24h > 2 || pending > 5)
            status = 'degraded';
        return {
            key,
            label,
            status,
            lastActivityAt: (_c = last === null || last === void 0 ? void 0 : last.toISOString()) !== null && _c !== void 0 ? _c : null,
            pendingCount: pending,
            failedCount24h: failed24h,
        };
    }
};
exports.ProviderIntegrationHubService = ProviderIntegrationHubService;
exports.ProviderIntegrationHubService = ProviderIntegrationHubService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        event_bus_service_1.EventBusService])
], ProviderIntegrationHubService);
//# sourceMappingURL=provider-integration-hub.service.js.map