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
exports.PmWorkerSafetyCailIntelligenceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let PmWorkerSafetyCailIntelligenceService = class PmWorkerSafetyCailIntelligenceService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    predictIncidentLikelihood(score, sifExposures, denials30d) {
        let p = 0.05;
        const factors = [];
        if (score < 50) {
            p += 0.25;
            factors.push('low_safety_score');
        }
        if (sifExposures > 2) {
            p += 0.2;
            factors.push('sif_hazard_exposure');
        }
        if (denials30d > 5) {
            p += 0.15;
            factors.push('chronic_access_denials');
        }
        return {
            probability: Math.min(0.95, p),
            level: p > 0.4 ? 'high' : p > 0.2 ? 'medium' : 'low',
            factors,
        };
    }
    async workerInsights(workerId, projectId) {
        const insights = [];
        const since30 = new Date(Date.now() - 30 * 86400000);
        const profile = await this.prisma.pmWorkerSafetyProfile.findUnique({
            where: { workerId },
        });
        if (!profile) {
            insights.push({
                type: 'profile_missing',
                score: 70,
                confidence: 0.9,
                title: 'Worker safety profile not initialized',
                explanation: 'Run profile rebuild to aggregate training, CAPA, and access history.',
                evidence: [],
                suggestedActions: ['POST /worker/:id/rebuild'],
            });
        }
        else if (profile.riskLevel === 'critical' ||
            profile.riskLevel === 'high') {
            insights.push({
                type: 'elevated_risk',
                score: 100 - profile.safetyScore,
                confidence: 0.88,
                title: `Worker risk level: ${profile.riskLevel}`,
                explanation: `Safety score ${profile.safetyScore}/100 — supervisor review recommended.`,
                evidence: [`score=${profile.safetyScore}`],
                suggestedActions: Array.isArray(profile.requiredActionsJson)
                    ? profile.requiredActionsJson
                    : ['Supervisor review'],
            });
        }
        const chronicDenials = await this.prisma.pmWorkerAccessLog.count({
            where: Object.assign({ workerId, granted: false, createdAt: { gte: since30 } }, (projectId ? { projectId } : {})),
        });
        if (chronicDenials >= 4) {
            insights.push({
                type: 'chronic_non_compliance',
                score: Math.min(100, chronicDenials * 15),
                confidence: 0.85,
                title: `${chronicDenials} access denials in 30 days`,
                explanation: 'Repeated denials may indicate training gaps or unclear zone requirements.',
                evidence: [`denials=${chronicDenials}`],
                suggestedActions: ['Coaching', 'Training refresh'],
            });
        }
        const sifExposure = await this.prisma.pmWorkerHazardExposure.count({
            where: { workerId, sifPotential: true, exposedAt: { gte: since30 } },
        });
        if (sifExposure > 0) {
            insights.push({
                type: 'chronic_hazard_exposure',
                score: 65,
                confidence: 0.82,
                title: 'SIF-potential hazard exposure detected',
                explanation: 'Correlate with JHA quality and inspection findings.',
                evidence: [`exposures=${sifExposure}`],
                suggestedActions: ['JHA review', 'Task reassignment'],
            });
        }
        const overdueCapa = await this.prisma.pmWorkerCorrectiveActionLink.count({
            where: {
                workerId,
                status: { in: ['open', 'overdue'] },
                dueAt: { lt: new Date() },
            },
        });
        if (overdueCapa > 0) {
            insights.push({
                type: 'overdue_capa',
                score: 80,
                confidence: 0.95,
                title: `${overdueCapa} overdue corrective action(s)`,
                explanation: 'Access may be blocked until CAPA closed.',
                evidence: [`overdue=${overdueCapa}`],
                suggestedActions: ['Close CAPA', 'Supervisor verification'],
            });
        }
        return insights.sort((a, b) => b.score - a.score);
    }
    async predictTrainingNeeds(workerId) {
        const worker = await this.prisma.worker.findUnique({
            where: { id: workerId },
        });
        if (!(worker === null || worker === void 0 ? void 0 : worker.companyId))
            return [];
        const [matrix, held] = await Promise.all([
            this.prisma.pmCompanyTrainingMatrix.findMany({
                where: {
                    companyId: worker.companyId,
                    status: 'published',
                    active: true,
                },
            }),
            this.prisma.pmWorkerSafetyTraining.findMany({ where: { workerId } }),
        ]);
        const needs = [];
        for (const m of matrix) {
            const snap = held.find((h) => h.trainingCode === m.trainingCode);
            if (!snap) {
                needs.push({
                    trainingCode: m.trainingCode,
                    reason: 'Not completed',
                    priority: m.category === 'general_safety' ? 'high' : 'medium',
                });
            }
            else if (snap.status === 'expired') {
                needs.push({
                    trainingCode: m.trainingCode,
                    reason: 'Expired',
                    priority: 'high',
                });
            }
        }
        return needs;
    }
    async predictAuthorizationNeeds(workerId) {
        var _a, _b;
        const assignments = await this.prisma.equipmentAssignment.findMany({
            where: { workerId, endedAt: null },
            include: { equipment: true },
            take: 20,
        });
        const auths = await this.prisma.pmWorkerSafetyAuthorization.findMany({
            where: { workerId, active: true },
        });
        const needs = [];
        for (const a of assignments) {
            const type = (_b = (_a = a.equipment) === null || _a === void 0 ? void 0 : _a.catalogCategory) !== null && _b !== void 0 ? _b : 'equipment';
            const has = auths.some((auth) => auth.equipmentId === a.equipmentId &&
                (!auth.expiresAt || auth.expiresAt > new Date()));
            if (!has) {
                needs.push({
                    authType: type,
                    reason: 'Active equipment assignment without authorization',
                });
            }
        }
        return needs;
    }
    chronicHazardExposure(exposures, windowDays = 90) {
        const since = new Date(Date.now() - windowDays * 86400000);
        const recent = exposures.filter((e) => e.exposedAt >= since);
        const highSeverity = recent.filter((e) => e.severity >= 4 || e.sifPotential).length;
        return {
            chronic: recent.length >= 5 || highSeverity >= 3,
            count: recent.length,
            highSeverityCount: highSeverity,
        };
    }
    weakControlSignals(openCapa, overdueCapa, denials30d) {
        const signals = [];
        if (overdueCapa > 0)
            signals.push('Overdue corrective actions indicate weak closure controls');
        if (openCapa > 2)
            signals.push('Multiple open CAPA — administrative control gap');
        if (denials30d > 5)
            signals.push('Repeated access denials — training/control weakness');
        return signals;
    }
};
exports.PmWorkerSafetyCailIntelligenceService = PmWorkerSafetyCailIntelligenceService;
exports.PmWorkerSafetyCailIntelligenceService = PmWorkerSafetyCailIntelligenceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PmWorkerSafetyCailIntelligenceService);
//# sourceMappingURL=pm-worker-safety-cail-intelligence.service.js.map