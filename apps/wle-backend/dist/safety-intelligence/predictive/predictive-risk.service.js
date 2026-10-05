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
exports.PredictiveRiskService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const safety_intelligence_ai_service_1 = require("../ai/safety-intelligence-ai.service");
let PredictiveRiskService = class PredictiveRiskService {
    constructor(prisma, ai) {
        this.prisma = prisma;
        this.ai = ai;
    }
    async latestSnapshot(projectId) {
        const row = await this.prisma.projectSafetyRiskSnapshot.findFirst({
            where: { projectId },
            orderBy: { computedAt: 'desc' },
        });
        if (!row)
            return null;
        return this.toReport(row);
    }
    async computeAndStore(projectId) {
        const report = await this.compute(projectId);
        await this.prisma.projectSafetyRiskSnapshot.create({
            data: {
                projectId,
                predictedLevel: report.predictedLevel,
                score: report.score,
                precursors: report.precursors,
                interventions: report.interventions,
                companyHotspots: report.companyHotspots,
                engine: report.engine,
            },
        });
        return report;
    }
    async compute(projectId) {
        var _a, _b, _c;
        const windowStart = new Date();
        windowStart.setDate(windowStart.getDate() - 90);
        const [openCail, overdueCail, atRiskBbo, inspectionAtRisk, incidents, byCompany,] = await Promise.all([
            this.prisma.cailEntry.count({
                where: {
                    projectId,
                    status: {
                        in: [client_1.CailStatus.open, client_1.CailStatus.in_progress, client_1.CailStatus.overdue],
                    },
                },
            }),
            this.prisma.cailEntry.count({
                where: { projectId, status: client_1.CailStatus.overdue },
            }),
            this.prisma.bboObservation.count({
                where: {
                    projectId,
                    polarity: 'at_risk',
                    observedAt: { gte: windowStart },
                },
            }),
            this.prisma.safetyInspectionItem.count({
                where: {
                    polarity: 'at_risk',
                    inspection: { projectId, startedAt: { gte: windowStart } },
                },
            }),
            this.prisma.vsiIncidentInvestigation.count({
                where: { projectId, createdAt: { gte: windowStart } },
            }),
            this.prisma.cailEntry.groupBy({
                by: ['ownerCompanyId', 'riskCategory'],
                where: { projectId, createdAt: { gte: windowStart } },
                _count: true,
            }),
        ]);
        const companyMap = new Map();
        for (const row of byCompany) {
            const bucket = (_a = companyMap.get(row.ownerCompanyId)) !== null && _a !== void 0 ? _a : {
                count: 0,
                categories: {},
            };
            bucket.count += row._count;
            const cat = (_b = row.riskCategory) !== null && _b !== void 0 ? _b : 'other';
            bucket.categories[cat] = ((_c = bucket.categories[cat]) !== null && _c !== void 0 ? _c : 0) + row._count;
            companyMap.set(row.ownerCompanyId, bucket);
        }
        const companyHotspots = [...companyMap.entries()]
            .map(([companyId, data]) => {
            var _a, _b;
            const topCategory = (_b = (_a = Object.entries(data.categories).sort((a, b) => b[1] - a[1])[0]) === null || _a === void 0 ? void 0 : _a[0]) !== null && _b !== void 0 ? _b : null;
            return { companyId, count: data.count, topCategory };
        })
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
        const analysis = await this.ai.buildPredictiveRisk({
            projectId,
            openCailCount: openCail,
            overdueCailCount: overdueCail,
            atRiskBboCount: atRiskBbo,
            inspectionAtRiskCount: inspectionAtRisk,
            incidentCount: incidents,
            companyHotspots,
        });
        return {
            projectId,
            predictedLevel: analysis.predictedLevel,
            score: analysis.score,
            precursors: analysis.precursors,
            interventions: analysis.interventions,
            companyHotspots,
            engine: analysis.engine,
            computedAt: new Date().toISOString(),
        };
    }
    toReport(row) {
        var _a, _b, _c;
        return {
            projectId: row.projectId,
            predictedLevel: row.predictedLevel,
            score: row.score,
            precursors: (_a = row.precursors) !== null && _a !== void 0 ? _a : [],
            interventions: (_b = row.interventions) !== null && _b !== void 0 ? _b : [],
            companyHotspots: (_c = row.companyHotspots) !== null && _c !== void 0 ? _c : [],
            engine: row.engine,
            computedAt: row.computedAt.toISOString(),
        };
    }
};
exports.PredictiveRiskService = PredictiveRiskService;
exports.PredictiveRiskService = PredictiveRiskService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        safety_intelligence_ai_service_1.SafetyIntelligenceAiService])
], PredictiveRiskService);
//# sourceMappingURL=predictive-risk.service.js.map