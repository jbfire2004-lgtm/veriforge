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
exports.PmEquipmentCailIntelligenceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const equipment_condition_engine_1 = require("./equipment-condition.engine");
let PmEquipmentCailIntelligenceService = class PmEquipmentCailIntelligenceService {
    constructor(prisma) {
        this.prisma = prisma;
        this.conditionEngine = new equipment_condition_engine_1.EquipmentConditionEngine();
    }
    async projectInsights(projectId) {
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
            select: { companyId: true },
        });
        if (!project)
            return [];
        const insights = [];
        const equipment = await this.prisma.equipment.findMany({
            where: { companyId: project.companyId, deletedAt: null },
            take: 200,
        });
        const now = new Date();
        for (const eq of equipment) {
            const expiredCerts = await this.prisma.pmEquipmentCertification.count({
                where: {
                    equipmentId: eq.id,
                    status: 'approved',
                    expiresAt: { lt: now },
                },
            });
            const chronicFailures = await this.prisma.pmEquipmentFailure.count({
                where: {
                    equipmentId: eq.id,
                    createdAt: { gte: new Date(now.getTime() - 90 * 86400000) },
                },
            });
            const openCritical = await this.prisma.pmInspectionDeficiency.count({
                where: {
                    severity: 'critical',
                    status: { not: 'closed' },
                    inspection: { equipmentId: eq.id, projectId },
                },
            });
            const condition = this.conditionEngine.score({
                complianceStatus: eq.complianceStatus,
                safetyStatus: eq.safetyStatus,
                lockoutStatus: eq.lockoutStatus,
                operationalStatus: eq.operationalStatus,
                openCriticalDeficiencies: openCritical,
                expiredCertifications: expiredCerts,
                chronicFailureCount: chronicFailures,
            });
            if (condition.riskBand === 'critical' || condition.riskBand === 'high') {
                insights.push({
                    type: 'equipment_risk',
                    score: 100 - condition.score,
                    confidence: 0.88,
                    title: `High-risk equipment: ${eq.name}`,
                    explanation: `Condition score ${condition.score} (${condition.riskBand}) from compliance, inspections, certifications, and failure history.`,
                    evidence: Object.entries(condition.factors).map(([k, v]) => `${k}=${v}`),
                    suggestedActions: [
                        'Lock out if unsafe',
                        'Schedule inspection',
                        'Review operator authorizations',
                    ],
                    equipmentId: eq.id,
                });
            }
            if (chronicFailures >= 3) {
                insights.push({
                    type: 'chronic_failure',
                    score: Math.min(100, chronicFailures * 20),
                    confidence: 0.9,
                    title: `Chronic failures on ${eq.name}`,
                    explanation: `${chronicFailures} failures in 90 days indicates weak preventive maintenance or operator controls.`,
                    evidence: [`failures_90d=${chronicFailures}`],
                    suggestedActions: ['Root cause analysis', 'Permanent CAPA'],
                    equipmentId: eq.id,
                });
            }
        }
        return insights.sort((a, b) => b.score - a.score).slice(0, 25);
    }
    async equipmentRiskPrediction(equipmentId) {
        const eq = await this.prisma.equipment.findUnique({
            where: { id: equipmentId },
        });
        if (!eq)
            return { equipmentId, score: 0, band: 'low' };
        const now = new Date();
        const [expiredCerts, chronicFailures, openCritical, activeLoto] = await Promise.all([
            this.prisma.pmEquipmentCertification.count({
                where: {
                    equipmentId,
                    status: 'approved',
                    expiresAt: { lt: now },
                },
            }),
            this.prisma.pmEquipmentFailure.count({
                where: {
                    equipmentId,
                    createdAt: { gte: new Date(now.getTime() - 90 * 86400000) },
                },
            }),
            this.prisma.pmInspectionDeficiency.count({
                where: {
                    severity: 'critical',
                    status: { not: 'closed' },
                    inspection: { equipmentId },
                },
            }),
            this.prisma.pmEquipmentLoto.count({
                where: { equipmentId, status: { in: ['active', 'verified'] } },
            }),
        ]);
        const condition = this.conditionEngine.score({
            complianceStatus: eq.complianceStatus,
            safetyStatus: eq.safetyStatus,
            lockoutStatus: eq.lockoutStatus,
            operationalStatus: eq.operationalStatus,
            openCriticalDeficiencies: openCritical,
            expiredCertifications: expiredCerts,
            chronicFailureCount: chronicFailures,
        });
        const recurrenceLikelihood = Math.min(100, 100 - condition.score + chronicFailures * 8 + activeLoto * 15);
        return {
            equipmentId,
            conditionScore: condition.score,
            riskBand: condition.riskBand,
            predictiveFailureLikelihood: recurrenceLikelihood,
            recommendedActions: [
                ...(expiredCerts > 0 ? ['Renew equipment certification'] : []),
                ...(openCritical > 0 ? ['Close critical inspection deficiencies'] : []),
                ...(chronicFailures >= 2
                    ? ['Schedule preventive maintenance CAPA']
                    : []),
                ...(activeLoto > 0 ? ['Verify LOTO before return to service'] : []),
            ],
            explainability: Object.entries(condition.factors).map(([k, v]) => `${k}=${v}`),
        };
    }
    operatorRiskScore(workerId, projectId) {
        const failures = this.prisma.pmEquipmentFailure.count({
            where: { reportedByUserId: workerId, projectId },
        });
        const openCapa = this.prisma.pmCorrectiveAction.count({
            where: {
                workerId,
                projectId,
                status: { in: ['open', 'in_progress', 'assigned'] },
            },
        });
        return Promise.all([failures, openCapa]).then(([f, c]) => ({
            workerId,
            failureCount: f,
            openCapa: c,
            score: Math.min(100, f * 15 + c * 10),
            band: f + c > 5 ? 'high' : f + c > 2 ? 'medium' : 'low',
        }));
    }
    correlateEquipment(equipmentId) {
        return {
            equipmentId,
            jha: 'Validate hazards and controls against equipment profile',
            inspections: 'Link pre-use/daily templates to equipment category',
            incidents: 'equipment_failure events auto-ingest',
            correctiveActions: 'CAPA from deficiencies and failures',
            sds: 'Chemical exposure equipment links to SDS library',
        };
    }
};
exports.PmEquipmentCailIntelligenceService = PmEquipmentCailIntelligenceService;
exports.PmEquipmentCailIntelligenceService = PmEquipmentCailIntelligenceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PmEquipmentCailIntelligenceService);
//# sourceMappingURL=pm-equipment-cail-intelligence.service.js.map