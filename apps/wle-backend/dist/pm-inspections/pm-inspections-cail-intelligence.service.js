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
exports.PmInspectionsCailIntelligenceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const inspection_scoring_engine_1 = require("./inspection-scoring.engine");
const deficiency_scoring_engine_1 = require("./deficiency-scoring.engine");
let PmInspectionsCailIntelligenceService = class PmInspectionsCailIntelligenceService {
    constructor(prisma, scoring, deficiencyScoring) {
        this.prisma = prisma;
        this.scoring = scoring;
        this.deficiencyScoring = deficiencyScoring;
    }
    async predictFromAnswers(templateId, answers) {
        const template = await this.prisma.pmInspectionTemplate.findFirst({
            where: { id: templateId, deletedAt: null },
        });
        if (!template)
            throw new common_1.NotFoundException('Template not found');
        const items = template.items;
        const scoringRules = template.scoringRules;
        const score = this.scoring.score(template.scoringMode, items, answers, scoringRules);
        const predictedDeficiencies = score.failedItemIds.map((itemId) => {
            var _a, _b;
            const item = items.find((i) => i.id === itemId);
            const severity = item
                ? this.deficiencyScoring.severityForFailedItem(item, template.category)
                : 'medium';
            return {
                itemId,
                label: (_a = item === null || item === void 0 ? void 0 : item.label) !== null && _a !== void 0 ? _a : itemId,
                severity,
                notes: String((_b = answers[`${itemId}_notes`]) !== null && _b !== void 0 ? _b : ''),
                requiredActions: [
                    'Assign corrective owner',
                    severity === 'critical'
                        ? 'Stop work until verified'
                        : 'Close within due date',
                ],
            };
        });
        const weakControlHints = score.failedItemIds
            .filter((id) => {
            const it = items.find((i) => i.id === id);
            return !!(it === null || it === void 0 ? void 0 : it.energyType);
        })
            .map((id) => `High-energy checklist item failed: ${id}`);
        return {
            inspectionQualityScore: Math.max(0, 100 - score.riskScore),
            riskScore: score.riskScore,
            scorePercent: score.scorePercent,
            passed: score.passed,
            requiresSupervisorReview: score.requiresSupervisorReview,
            predictedDeficiencyCount: predictedDeficiencies.length,
            predictedDeficiencies,
            weakControlDetection: weakControlHints,
            explainability: score.explainability,
        };
    }
    async projectInsights(projectId) {
        var _a, _b;
        const [inspections, deficiencies] = await Promise.all([
            this.prisma.pmInspection.findMany({
                where: { projectId, deletedAt: null },
                select: {
                    id: true,
                    passed: true,
                    riskScore: true,
                    scorePercent: true,
                    template: { select: { category: true } },
                },
                take: 200,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.pmInspectionDeficiency.findMany({
                where: {
                    inspection: { projectId, deletedAt: null },
                    status: { not: 'closed' },
                },
                select: { severity: true, category: true, itemId: true },
            }),
        ]);
        const failed = inspections.filter((i) => i.passed === false).length;
        const avgRisk = inspections.length > 0
            ? Math.round(inspections.reduce((s, i) => { var _a; return s + ((_a = i.riskScore) !== null && _a !== void 0 ? _a : 0); }, 0) /
                inspections.length)
            : 0;
        const byCategory = {};
        for (const d of deficiencies) {
            const cat = (_a = d.category) !== null && _a !== void 0 ? _a : 'general';
            byCategory[cat] = ((_b = byCategory[cat]) !== null && _b !== void 0 ? _b : 0) + 1;
        }
        const weakPatterns = Object.entries(byCategory)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([category, count]) => ({
            category,
            count,
            prediction: count >= 3
                ? 'Elevated repeat deficiency — review controls'
                : 'Monitor',
        }));
        return {
            inspectionQualityScore: Math.max(0, 100 - avgRisk - failed * 5),
            averageRiskScore: avgRisk,
            failureRate: inspections.length > 0 ? failed / inspections.length : 0,
            openDeficiencies: deficiencies.length,
            hazardPatterns: weakPatterns,
            explainability: [
                {
                    rule: 'quality_score',
                    detail: `100 - avgRisk(${avgRisk}) - failed*5(${failed * 5})`,
                },
            ],
        };
    }
    async inspectorPerformance(inspectorUserId, projectId) {
        const rows = await this.prisma.pmInspection.findMany({
            where: { inspectorUserId, projectId, deletedAt: null },
            select: { passed: true, requiresSupervisorReview: true },
        });
        const total = rows.length;
        const passRate = total > 0 ? rows.filter((r) => r.passed).length / total : 1;
        return {
            inspectorUserId,
            inspectionsCompleted: total,
            passRate: Math.round(passRate * 100),
            reviewEscalationRate: total > 0
                ? Math.round((rows.filter((r) => r.requiresSupervisorReview).length / total) *
                    100)
                : 0,
            score: Math.round(passRate * 80 + (total > 10 ? 20 : total * 2)),
        };
    }
};
exports.PmInspectionsCailIntelligenceService = PmInspectionsCailIntelligenceService;
exports.PmInspectionsCailIntelligenceService = PmInspectionsCailIntelligenceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        inspection_scoring_engine_1.InspectionScoringEngine,
        deficiency_scoring_engine_1.DeficiencyScoringEngine])
], PmInspectionsCailIntelligenceService);
//# sourceMappingURL=pm-inspections-cail-intelligence.service.js.map