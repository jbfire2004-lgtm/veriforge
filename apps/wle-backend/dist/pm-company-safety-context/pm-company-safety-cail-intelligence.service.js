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
exports.PmCompanySafetyCailIntelligenceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let PmCompanySafetyCailIntelligenceService = class PmCompanySafetyCailIntelligenceService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    workerRiskScore(denials30d, openCapa, missingTraining) {
        return Math.min(100, denials30d * 10 + openCapa * 12 + missingTraining * 8);
    }
    equipmentRiskScore(lotoCount, failedInspections) {
        return Math.min(100, lotoCount * 30 + failedInspections * 15);
    }
    hazardRiskScore(severity, likelihood, sifPotential) {
        return Math.min(100, severity * 12 + likelihood * 10 + (sifPotential ? 25 : 0));
    }
    weakControlDetection(controlStrength, openDeficiencies) {
        if (controlStrength < 3 && openDeficiencies >= 3) {
            return {
                type: 'weak_controls',
                score: 75,
                confidence: 0.85,
                title: 'Weak corporate controls with repeat deficiencies',
                explanation: 'Control strength below threshold while inspections show recurring gaps.',
                evidence: [
                    `strength=${controlStrength}`,
                    `deficiencies=${openDeficiencies}`,
                ],
                suggestedActions: [
                    'Strengthen control library',
                    'CAPA from inspection trends',
                ],
            };
        }
        return null;
    }
    async companyInsights(companyId) {
        var _a;
        const insights = [];
        const profile = await this.prisma.pmCompanySafetyProfile.findUnique({
            where: { companyId },
        });
        if (!profile || profile.status !== 'published') {
            insights.push({
                type: 'profile_unpublished',
                score: 85,
                confidence: 0.95,
                title: 'Corporate safety profile not published',
                explanation: 'All projects inherit defaults until company profile is published.',
                evidence: [`status=${(_a = profile === null || profile === void 0 ? void 0 : profile.status) !== null && _a !== void 0 ? _a : 'missing'}`],
                suggestedActions: ['Auto-generate and publish company profile'],
            });
        }
        const draftHazards = await this.prisma.pmCompanyHazard.count({
            where: { companyId, status: 'draft', deletedAt: null },
        });
        if (draftHazards > 10) {
            insights.push({
                type: 'hazard_backlog',
                score: 50,
                confidence: 0.8,
                title: `${draftHazards} corporate hazards unpublished`,
                explanation: 'Project libraries may be out of sync with corporate master hazards.',
                evidence: [`draft=${draftHazards}`],
                suggestedActions: ['Publish hazard library', 'Run project sync'],
            });
        }
        const sifHazards = await this.prisma.pmCompanyHazard.count({
            where: { companyId, sifPotential: true, active: true, deletedAt: null },
        });
        if (sifHazards > 0) {
            insights.push({
                type: 'sif_corporate_exposure',
                score: Math.min(100, 40 + sifHazards * 10),
                confidence: 0.9,
                title: `${sifHazards} SIF-potential corporate hazard(s)`,
                explanation: 'Cross-correlate with SIF/HECA, incidents, and project profiles.',
                evidence: [`sifHazards=${sifHazards}`],
                suggestedActions: ['Executive review', 'Project risk elevation'],
            });
        }
        const expiredSds = await this.prisma.pmCompanySdsLibrary.count({
            where: {
                companyId,
                active: true,
                expiresAt: { lt: new Date() },
            },
        });
        if (expiredSds > 0) {
            insights.push({
                type: 'sds_expiry',
                score: 65,
                confidence: 0.92,
                title: `${expiredSds} expired SDS entries`,
                explanation: 'Chemical zones may block access until SDS refreshed.',
                evidence: [`expired=${expiredSds}`],
                suggestedActions: ['SDS renewal', 'Notify document control'],
            });
        }
        const projects = await this.prisma.project.count({
            where: { companyId, status: 'ACTIVE' },
        });
        const publishedProfiles = await this.prisma.pmProjectSafetyProfile.count({
            where: { companyId, status: 'published' },
        });
        if (projects > 0 && publishedProfiles / projects < 0.5) {
            insights.push({
                type: 'project_profile_gap',
                score: 60,
                confidence: 0.78,
                title: 'Less than half of active projects have published safety profiles',
                explanation: 'Company → project alignment incomplete.',
                evidence: [`projects=${projects}`, `published=${publishedProfiles}`],
                suggestedActions: ['Bulk project profile auto-generate'],
            });
        }
        return insights.sort((a, b) => b.score - a.score);
    }
    predictCorporateRisk(incidentTrend, denialRate) {
        const score = Math.min(100, incidentTrend * 15 + denialRate * 40);
        const predictedLevel = score >= 70
            ? 'critical'
            : score >= 50
                ? 'high'
                : score >= 25
                    ? 'medium'
                    : 'low';
        const factors = [];
        if (incidentTrend > 2)
            factors.push('incident_trend');
        if (denialRate > 0.15)
            factors.push('access_denial_rate');
        return { predictedLevel, score, factors };
    }
    suggestControlsForHazard(hazard) {
        const suggestions = [];
        if (hazard.sifPotential) {
            suggestions.push('Corporate engineering control + SIF review');
            suggestions.push('Zone template restriction (SIF_ZONE)');
        }
        if (hazard.category === 'chemical') {
            suggestions.push('SDS linkage + WHMIS training refresh');
        }
        if (hazard.severity >= 4) {
            suggestions.push('Elevate control strength to 4+ and require verification steps');
        }
        if (suggestions.length === 0) {
            suggestions.push('Standard administrative control + training matrix entry');
        }
        return suggestions;
    }
    async hazardForecast(companyId) {
        const since = new Date(Date.now() - 180 * 86400000);
        const [defs, incidents, existing] = await Promise.all([
            this.prisma.pmInspectionDeficiency.findMany({
                where: { inspection: { companyId }, createdAt: { gte: since } },
                take: 8,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.pmSafetyEvent.findMany({
                where: { companyId, occurredAt: { gte: since } },
                take: 8,
                orderBy: { occurredAt: 'desc' },
            }),
            this.prisma.pmCompanyHazard.findMany({
                where: { companyId, deletedAt: null },
                select: { title: true },
            }),
        ]);
        const seen = new Set(existing.map((h) => h.title.toLowerCase()));
        const out = [];
        for (const d of defs) {
            if (seen.has(d.title.toLowerCase()))
                continue;
            out.push({
                title: d.title,
                confidence: 0.74,
                source: 'inspection_deficiency',
            });
        }
        for (const e of incidents) {
            if (seen.has(e.title.toLowerCase()))
                continue;
            out.push({ title: e.title, confidence: 0.7, source: 'incident' });
        }
        return out.slice(0, 10);
    }
    async generateCorporateSafetyScore(companyId) {
        var _a;
        const since90 = new Date(Date.now() - 90 * 86400000);
        const profile = await this.prisma.pmCompanySafetyProfile.findUnique({
            where: { companyId },
        });
        const [hazards, controls, openCapa, overdueCapa, incidents, sifHazards, expiredSds, requiredPolicies, policyAcks, roleTypes, projectScores,] = await Promise.all([
            this.prisma.pmCompanyHazard.count({
                where: { companyId, status: 'published', deletedAt: null },
            }),
            this.prisma.pmCompanyControl.findMany({
                where: { companyId, status: 'published', deletedAt: null },
                select: { controlStrength: true },
            }),
            this.prisma.pmCorrectiveAction.count({
                where: {
                    companyId,
                    status: { in: ['open', 'in_progress', 'assigned'] },
                },
            }),
            this.prisma.pmCorrectiveAction.count({
                where: {
                    companyId,
                    status: { in: ['open', 'in_progress', 'assigned'] },
                    dueAt: { lt: new Date() },
                },
            }),
            this.prisma.pmSafetyEvent.count({
                where: { companyId, occurredAt: { gte: since90 } },
            }),
            this.prisma.pmCompanyHazard.count({
                where: { companyId, sifPotential: true, active: true, deletedAt: null },
            }),
            this.prisma.pmCompanySdsLibrary.count({
                where: { companyId, active: true, expiresAt: { lt: new Date() } },
            }),
            this.prisma.pmCompanyPolicy.count({
                where: {
                    companyId,
                    requiresAckForAccess: true,
                    status: 'published',
                    deletedAt: null,
                },
            }),
            this.prisma.pmCompanyPolicyAcknowledgment.count({
                where: { policy: { companyId } },
            }),
            this.prisma.pmCompanyTrainingMatrix.groupBy({
                by: ['roleType'],
                where: { companyId, active: true, status: 'published' },
                _count: true,
            }),
            this.prisma.pmProjectSafetyProfile.findMany({
                where: { companyId, status: 'published' },
                select: { riskLevel: true },
            }),
        ]);
        let score = 100;
        const components = [];
        if (!profile || profile.status !== 'published') {
            const d = 25;
            score -= d;
            components.push({
                key: 'profile_unpublished',
                deduction: d,
                value: (_a = profile === null || profile === void 0 ? void 0 : profile.status) !== null && _a !== void 0 ? _a : 'missing',
            });
        }
        const capaDed = Math.min(25, overdueCapa * 8 + openCapa * 2);
        score -= capaDed;
        components.push({
            key: 'capa',
            deduction: capaDed,
            value: { openCapa, overdueCapa },
        });
        const incidentDed = Math.min(20, incidents * 4);
        score -= incidentDed;
        components.push({
            key: 'incidents_90d',
            deduction: incidentDed,
            value: incidents,
        });
        const sifDed = Math.min(15, sifHazards * 5);
        score -= sifDed;
        components.push({
            key: 'sif_hazards',
            deduction: sifDed,
            value: sifHazards,
        });
        const sdsDed = Math.min(12, expiredSds * 4);
        score -= sdsDed;
        components.push({
            key: 'expired_sds',
            deduction: sdsDed,
            value: expiredSds,
        });
        const ackRate = requiredPolicies > 0
            ? Math.min(1, policyAcks / (requiredPolicies * 10))
            : 1;
        const policyDed = Math.max(0, (1 - ackRate) * 15);
        score -= policyDed;
        components.push({
            key: 'policy_ack',
            deduction: policyDed,
            value: ackRate,
        });
        const avgStrength = controls.length > 0
            ? controls.reduce((s, c) => s + c.controlStrength, 0) / controls.length
            : 0;
        const weakControls = [];
        if (controls.length === 0)
            weakControls.push('No published corporate controls');
        if (avgStrength < 3)
            weakControls.push('Average control strength below 3');
        if (hazards > 0 && controls.length < hazards) {
            weakControls.push('Fewer controls than published hazards');
        }
        const weakDed = Math.min(10, weakControls.length * 3);
        score -= weakDed;
        components.push({
            key: 'weak_controls',
            deduction: weakDed,
            value: weakControls,
        });
        if (roleTypes.length < 2) {
            const d = 8;
            score -= d;
            components.push({
                key: 'training_matrix_roles',
                deduction: d,
                value: roleTypes.length,
            });
        }
        const criticalProjects = projectScores.filter((p) => p.riskLevel === 'critical').length;
        if (criticalProjects > 0) {
            const d = Math.min(10, criticalProjects * 3);
            score -= d;
            components.push({
                key: 'critical_projects',
                deduction: d,
                value: criticalProjects,
            });
        }
        const finalScore = Math.max(0, Math.round(score));
        const band = finalScore >= 80
            ? 'low'
            : finalScore >= 60
                ? 'medium'
                : finalScore >= 40
                    ? 'high'
                    : 'critical';
        const predictedRisk = Math.min(100, Math.round((100 - finalScore) * 0.5 + sifHazards * 5 + expiredSds * 3));
        return {
            score: finalScore,
            maxScore: 100,
            band,
            components,
            predictedRisk,
            weakControls,
            computedAt: new Date().toISOString(),
        };
    }
};
exports.PmCompanySafetyCailIntelligenceService = PmCompanySafetyCailIntelligenceService;
exports.PmCompanySafetyCailIntelligenceService = PmCompanySafetyCailIntelligenceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PmCompanySafetyCailIntelligenceService);
//# sourceMappingURL=pm-company-safety-cail-intelligence.service.js.map