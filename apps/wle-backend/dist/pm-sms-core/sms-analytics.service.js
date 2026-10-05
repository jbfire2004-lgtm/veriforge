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
exports.SmsAnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
let SmsAnalyticsService = class SmsAnalyticsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async leadingIndicators(companyId, projectId) {
        var _a, _b;
        const since = new Date();
        since.setDate(since.getDate() - 90);
        const projectFilter = projectId ? { projectId } : {};
        const [riskContexts, events, findings, forecasts] = await Promise.all([
            this.prisma.pmSmsRiskContext.groupBy({
                by: ['sclState'],
                where: Object.assign(Object.assign({ companyId }, projectFilter), { createdAt: { gte: since } }),
                _count: true,
            }),
            this.prisma.pmSafetyEvent.groupBy({
                by: ['sclState'],
                where: Object.assign({ companyId, deletedAt: null, occurredAt: { gte: since } }, projectFilter),
                _count: true,
            }),
            this.prisma.pmInspectionPhotoFinding.groupBy({
                by: ['sclState'],
                where: {
                    inspection: Object.assign({ companyId }, projectFilter),
                    createdAt: { gte: since },
                },
                _count: true,
            }),
            this.prisma.pmSmsWeeklyRiskForecast.findMany({
                where: Object.assign({ companyId }, projectFilter),
                orderBy: { weekStart: 'desc' },
                take: 4,
            }),
        ]);
        const hecaHighEnergy = await this.prisma.pmSmsRiskContext.count({
            where: Object.assign(Object.assign({ companyId }, projectFilter), { hecaInvolved: true, highEnergyFlag: true, sclState: { in: ['conditional', 'loss'] } }),
        });
        const energyGaps = await this.prisma.pmSmsRiskContext.findMany({
            where: Object.assign(Object.assign({ companyId }, projectFilter), { missingControlsJson: { not: client_1.Prisma.JsonNull } }),
            select: { energyTypesJson: true, missingControlsJson: true },
            take: 100,
        });
        const gapByEnergy = {};
        for (const row of energyGaps) {
            const types = row.energyTypesJson;
            const gaps = row.missingControlsJson;
            for (const t of types) {
                gapByEnergy[t] = ((_a = gapByEnergy[t]) !== null && _a !== void 0 ? _a : 0) + ((_b = gaps === null || gaps === void 0 ? void 0 : gaps.length) !== null && _b !== void 0 ? _b : 0);
            }
        }
        return {
            sclDistribution: this.mergeSclCounts(riskContexts, events, findings),
            hecaHighEnergyConditionalLoss: hecaHighEnergy,
            energyControlGaps: gapByEnergy,
            weeklyForecasts: forecasts,
        };
    }
    async saveWeeklyForecast(companyId, projectId, forecast) {
        var _a, _b, _c, _d, _e;
        const weekStart = startOfWeek(new Date());
        const existing = await this.prisma.pmSmsWeeklyRiskForecast.findFirst({
            where: { companyId, projectId: projectId !== null && projectId !== void 0 ? projectId : null, weekStart },
        });
        const payload = {
            forecastJson: forecast.forecastJson,
            alertsJson: ((_a = forecast.alertsJson) !== null && _a !== void 0 ? _a : []),
            recommendationsJson: ((_b = forecast.recommendationsJson) !== null && _b !== void 0 ? _b : []),
            sclBreakdownJson: ((_c = forecast.sclBreakdownJson) !== null && _c !== void 0 ? _c : {}),
            hecaHotspotsJson: ((_d = forecast.hecaHotspotsJson) !== null && _d !== void 0 ? _d : []),
            energyGapsJson: ((_e = forecast.energyGapsJson) !== null && _e !== void 0 ? _e : []),
        };
        if (existing) {
            return this.prisma.pmSmsWeeklyRiskForecast.update({
                where: { id: existing.id },
                data: payload,
            });
        }
        return this.prisma.pmSmsWeeklyRiskForecast.create({
            data: Object.assign({ companyId, projectId, weekStart }, payload),
        });
    }
    mergeSclCounts(contexts, events, findings) {
        var _a, _b;
        const out = {
            safe: 0,
            conditional: 0,
            loss: 0,
            untagged: 0,
        };
        for (const row of [...contexts, ...events, ...findings]) {
            const key = (_a = row.sclState) !== null && _a !== void 0 ? _a : 'untagged';
            out[key] = ((_b = out[key]) !== null && _b !== void 0 ? _b : 0) + row._count;
        }
        return out;
    }
};
exports.SmsAnalyticsService = SmsAnalyticsService;
exports.SmsAnalyticsService = SmsAnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SmsAnalyticsService);
function startOfWeek(d) {
    const copy = new Date(d);
    const day = copy.getDay();
    const diff = copy.getDate() - day + (day === 0 ? -6 : 1);
    copy.setDate(diff);
    copy.setHours(0, 0, 0, 0);
    return copy;
}
//# sourceMappingURL=sms-analytics.service.js.map