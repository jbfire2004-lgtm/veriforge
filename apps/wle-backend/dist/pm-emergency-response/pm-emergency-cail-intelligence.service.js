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
exports.PmEmergencyCailIntelligenceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let PmEmergencyCailIntelligenceService = class PmEmergencyCailIntelligenceService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async projectInsights(projectId) {
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
            include: { site: true },
        });
        if (!(project === null || project === void 0 ? void 0 : project.siteId))
            return [];
        const insights = [];
        const activeMuster = await this.prisma.musterEvent.findFirst({
            where: {
                projectId,
                status: { in: ['activated', 'accounting'] },
            },
        });
        if (activeMuster) {
            const missing = Array.isArray(activeMuster.missingWorkerIds)
                ? activeMuster.missingWorkerIds
                : [];
            if (missing.length > 0) {
                insights.push({
                    type: 'missing_workers',
                    score: Math.min(100, missing.length * 25),
                    confidence: 0.92,
                    title: `${missing.length} workers not mustered`,
                    explanation: 'Workers on site roster without muster check-in require search workflow escalation.',
                    evidence: [`missing_ids=${missing.join(',')}`],
                    suggestedActions: ['Escalate notifications', 'Supervisor sweep'],
                });
            }
        }
        const lowReadiness = await this.prisma.pmEmergencyEquipment.count({
            where: {
                companyId: project.companyId,
                active: true,
                readinessScore: { lt: 70 },
            },
        });
        if (lowReadiness > 0) {
            insights.push({
                type: 'emergency_equipment_readiness',
                score: Math.min(100, lowReadiness * 20),
                confidence: 0.85,
                title: `${lowReadiness} emergency equipment items below readiness threshold`,
                explanation: 'Spill kits, AEDs, or extinguishers may not be deployable.',
                evidence: [`low_readiness_count=${lowReadiness}`],
                suggestedActions: ['Inspect equipment', 'Auto-CAPA'],
            });
        }
        const unackedPlans = await this.prisma.emergencyPlan.count({
            where: {
                companyId: project.companyId,
                status: 'published',
                requiresAckForAccess: true,
                deletedAt: null,
            },
        });
        if (unackedPlans > 0) {
            insights.push({
                type: 'plan_ack_gap',
                score: 40,
                confidence: 0.8,
                title: 'Access-gated emergency plans require acknowledgment',
                explanation: 'Workers without plan acknowledgment may be denied site access.',
                evidence: [`published_access_gated=${unackedPlans}`],
                suggestedActions: ['Run acknowledgment campaign'],
            });
        }
        return insights.sort((a, b) => b.score - a.score);
    }
    musterComplianceScore(checkedIn, expected) {
        if (expected <= 0)
            return 100;
        return Math.round((checkedIn / expected) * 100);
    }
    responseQualityScore(input) {
        let score = 100;
        if (input.declareToMusterMinutes != null &&
            input.declareToMusterMinutes > 15) {
            score -= 20;
        }
        score -= Math.min(40, input.missingWorkerCount * 10);
        if (input.equipmentReadinessAvg < 80)
            score -= 15;
        return Math.max(0, score);
    }
    async predictEmergencyRisk(emergencyEventId) {
        var _a;
        const event = await this.prisma.pmEmergencyEvent.findUnique({
            where: { id: emergencyEventId },
            include: {
                musterSessions: { include: { checkins: true } },
            },
        });
        if (!event)
            return { emergencyEventId, score: 0 };
        const muster = event.musterSessions[0];
        const expected = muster && Array.isArray(muster.expectedWorkerIds)
            ? muster.expectedWorkerIds.length
            : 0;
        const checked = (_a = muster === null || muster === void 0 ? void 0 : muster.checkins.length) !== null && _a !== void 0 ? _a : 0;
        const missing = muster && Array.isArray(muster.missingWorkerIds)
            ? muster.missingWorkerIds.length
            : 0;
        const musterCompliance = this.musterComplianceScore(checked, expected);
        const responseQuality = this.responseQualityScore({
            declareToMusterMinutes: muster && event.declaredAt
                ? Math.round((muster.triggeredAt.getTime() - event.declaredAt.getTime()) /
                    60000)
                : undefined,
            missingWorkerCount: missing,
            equipmentReadinessAvg: 100,
        });
        const predictiveLikelihood = Math.min(100, (event.eventType === 'evacuation' ? 30 : 15) +
            missing * 12 +
            (100 - musterCompliance) * 0.5);
        return {
            emergencyEventId,
            predictiveEmergencyLikelihood: predictiveLikelihood,
            musterComplianceScore: musterCompliance,
            responseQualityScore: responseQuality,
            missingWorkerDetection: missing > 0,
            missingWorkerIds: muster && Array.isArray(muster.missingWorkerIds)
                ? muster.missingWorkerIds
                : [],
            hazardCorrelation: this.correlateEmergency(emergencyEventId),
            explainability: [
                {
                    rule: 'predictive_likelihood',
                    detail: 'event severity + missing workers + muster gap',
                },
            ],
        };
    }
    async predictProjectEmergencyLikelihood(projectId) {
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
        });
        if (!project)
            return { projectId, likelihood: 0 };
        const [lowEquipment, unackedPlans, recentIncidents] = await Promise.all([
            this.prisma.pmEmergencyEquipment.count({
                where: { companyId: project.companyId, readinessScore: { lt: 60 } },
            }),
            this.prisma.emergencyPlan.count({
                where: {
                    companyId: project.companyId,
                    status: 'published',
                    requiresAckForAccess: true,
                },
            }),
            this.prisma.pmSafetyEvent.count({
                where: {
                    projectId,
                    createdAt: { gte: new Date(Date.now() - 30 * 86400000) },
                    severity: { in: ['high', 'critical'] },
                },
            }),
        ]);
        const likelihood = Math.min(100, lowEquipment * 8 + unackedPlans * 5 + recentIncidents * 10);
        return {
            projectId,
            predictiveEmergencyLikelihood: likelihood,
            factors: { lowEquipment, unackedPlans, recentIncidents },
        };
    }
    correlateEmergency(eventId) {
        return {
            eventId,
            jha: 'Review active JHA/FLHA tasks against emergency hazard',
            inspections: 'Pause non-critical inspections during lockdown',
            incidents: 'Promote to PmSafetyEvent when injury or property damage',
            correctiveActions: 'CAPA for equipment/plan deficiencies',
        };
    }
};
exports.PmEmergencyCailIntelligenceService = PmEmergencyCailIntelligenceService;
exports.PmEmergencyCailIntelligenceService = PmEmergencyCailIntelligenceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PmEmergencyCailIntelligenceService);
//# sourceMappingURL=pm-emergency-cail-intelligence.service.js.map