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
exports.VeraCoreHubService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const core_readiness_service_1 = require("./core-readiness.service");
const event_bus_metrics_service_1 = require("../vera-event-bus/event-bus-metrics.service");
const provider_integration_hub_service_1 = require("./provider-integration-hub.service");
let VeraCoreHubService = class VeraCoreHubService {
    constructor(prisma, readiness, eventMetrics, providerHub) {
        this.prisma = prisma;
        this.readiness = readiness;
        this.eventMetrics = eventMetrics;
        this.providerHub = providerHub;
    }
    async getHubMetrics(companyId, userId) {
        var _a;
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const companyFilter = companyId
            ? {
                OR: [
                    { companyId },
                    { companyLinks: { some: { companyId, active: true } } },
                ],
            }
            : {};
        const trainingWhere = companyId ? { companyId } : {};
        const [workers, verifiedTraining30d, openVerifications, readinessSummary, providerHub,] = await Promise.all([
            this.prisma.worker.count({ where: companyFilter }),
            this.prisma.trainingRecord.count({
                where: Object.assign(Object.assign({}, trainingWhere), { lastVerificationStatus: 'VERIFIED', verifiedAt: { gte: thirtyDaysAgo } }),
            }),
            this.prisma.trainingRecord.count({
                where: Object.assign(Object.assign({}, trainingWhere), { OR: [
                        { lastVerificationStatus: null },
                        {
                            lastVerificationStatus: {
                                in: ['ATTENTION', 'INVALID', 'PENDING'],
                            },
                        },
                    ] }),
            }),
            this.readiness.summary(companyId, userId),
            companyId
                ? this.providerHub.getSummary(companyId)
                : Promise.resolve(null),
        ]);
        const readinessScore = this.extractReadinessScore(readinessSummary);
        const readinessState = this.extractReadinessState(readinessSummary);
        const channels = (_a = providerHub === null || providerHub === void 0 ? void 0 : providerHub.channels) !== null && _a !== void 0 ? _a : [];
        const eventSnap = this.eventMetrics.getSnapshot();
        return {
            generatedAt: new Date().toISOString(),
            companyId: companyId !== null && companyId !== void 0 ? companyId : null,
            workers,
            verifiedTraining30d,
            openVerifications,
            readinessScore,
            readinessState,
            providerChannelsHealthy: channels.filter((c) => c.status === 'healthy')
                .length,
            providerChannelsTotal: channels.length,
            eventBus: {
                emitted: eventSnap.emitted,
                published: eventSnap.published,
                dlq: eventSnap.dlq,
            },
        };
    }
    extractReadinessScore(summary) {
        var _a, _b, _c;
        const dims = (_a = summary.dimensions) !== null && _a !== void 0 ? _a : [];
        if (dims.length === 0) {
            return Math.round((_c = (_b = summary.workers) === null || _b === void 0 ? void 0 : _b.score) !== null && _c !== void 0 ? _c : 0);
        }
        const avg = dims.reduce((sum, d) => { var _a; return sum + ((_a = d.score) !== null && _a !== void 0 ? _a : 0); }, 0) /
            Math.max(1, dims.length);
        return Math.round(avg);
    }
    extractReadinessState(summary) {
        var _a;
        const dims = (_a = summary.dimensions) !== null && _a !== void 0 ? _a : [];
        if (dims.some((d) => d.state === 'NON_COMPLIANT' || d.state === 'AT_RISK')) {
            return 'at_risk';
        }
        return 'ok';
    }
};
exports.VeraCoreHubService = VeraCoreHubService;
exports.VeraCoreHubService = VeraCoreHubService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        core_readiness_service_1.CoreReadinessService,
        event_bus_metrics_service_1.EventBusMetricsService,
        provider_integration_hub_service_1.ProviderIntegrationHubService])
], VeraCoreHubService);
//# sourceMappingURL=vera-core-hub.service.js.map