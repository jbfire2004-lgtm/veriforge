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
exports.PmDocumentCailIntelligenceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const chemical_hazard_engine_1 = require("./chemical-hazard.engine");
let PmDocumentCailIntelligenceService = class PmDocumentCailIntelligenceService {
    constructor(prisma) {
        this.prisma = prisma;
        this.hazardEngine = new chemical_hazard_engine_1.ChemicalHazardEngine();
    }
    async workerSdsCompliance(workerId, projectId) {
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
        });
        if (!project)
            return { workerId, complianceScore: 100, missingAcks: [] };
        const required = await this.prisma.sdsDocument.findMany({
            where: {
                companyId: project.companyId,
                status: 'published',
                requiresAck: true,
                deletedAt: null,
                OR: [{ projectId }, { projectId: null }],
            },
            select: {
                id: true,
                productName: true,
                hazardClasses: true,
                metadataJson: true,
                whmisJson: true,
            },
        });
        const acks = await this.prisma.pmDocumentAcknowledgment.findMany({
            where: { workerId, sdsDocumentId: { in: required.map((r) => r.id) } },
        });
        const ackSet = new Set(acks.map((a) => a.sdsDocumentId));
        const missingAcks = required
            .filter((r) => !ackSet.has(r.id))
            .map((r) => r.productName);
        const complianceScore = required.length > 0
            ? Math.round(((required.length - missingAcks.length) / required.length) * 100)
            : 100;
        let aggregateRisk = 0;
        for (const sds of required) {
            aggregateRisk += this.hazardEngine.extract(sds).chemicalRiskScore;
        }
        const predictiveChemicalRisk = required.length > 0
            ? Math.min(100, Math.round(aggregateRisk / required.length))
            : 0;
        return {
            workerId,
            projectId,
            complianceScore,
            missingAcks,
            predictiveChemicalRisk,
            recommendedAcknowledgments: missingAcks.map((name) => ({
                action: `Acknowledge SDS: ${name}`,
                priority: 'high',
            })),
        };
    }
    async projectInsights(projectId) {
        var _a;
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
            select: { companyId: true, siteId: true },
        });
        if (!project)
            return [];
        const now = new Date();
        const insights = [];
        const expiredSds = await this.prisma.sdsDocument.count({
            where: {
                OR: [{ projectId }, { projectId: null, companyId: project.companyId }],
                deletedAt: null,
                expiresAt: { lt: now },
                status: 'published',
            },
        });
        if (expiredSds > 0) {
            insights.push({
                type: 'sds_expired',
                score: Math.min(100, expiredSds * 15),
                confidence: 0.95,
                title: `${expiredSds} expired SDS on record`,
                explanation: 'Published SDS past expiry date require replacement and re-acknowledgment before chemical work continues.',
                evidence: [`expired_count=${expiredSds}`],
                suggestedActions: [
                    'Upload replacement SDS',
                    'Run deficiency scan',
                    'Notify supervisors',
                ],
                links: [],
            });
        }
        const missingSds = await this.prisma.chemicalInventoryItem.count({
            where: {
                AND: [
                    { OR: [{ projectId }, { siteId: (_a = project.siteId) !== null && _a !== void 0 ? _a : -1 }] },
                    { OR: [{ sdsDocumentId: null }, { missingSdsFlag: true }] },
                ],
            },
        });
        if (missingSds > 0) {
            insights.push({
                type: 'missing_sds',
                score: Math.min(100, missingSds * 20),
                confidence: 0.9,
                title: `${missingSds} inventory items without valid SDS`,
                explanation: 'Chemical inventory entries must link to a current published SDS.',
                evidence: [`missing_sds_inventory=${missingSds}`],
                suggestedActions: ['Link SDS', 'Auto-generate CAPA'],
                links: [],
            });
        }
        const unackedPolicies = await this.prisma.policyDocument.count({
            where: {
                companyId: project.companyId,
                OR: [{ projectId }, { projectId: null }],
                status: 'published',
                requiresAckForAccess: true,
                deletedAt: null,
            },
        });
        if (unackedPolicies > 0) {
            insights.push({
                type: 'policy_ack_gap',
                score: 40,
                confidence: 0.85,
                title: 'Access-gated policies require acknowledgment',
                explanation: 'Workers without acknowledgment on published access-gated policies will be denied site entry.',
                evidence: [`access_gated_policies=${unackedPolicies}`],
                suggestedActions: ['Publish acknowledgment campaign'],
                links: [],
            });
        }
        const outdatedManuals = await this.prisma.pmManufacturerInstruction.count({
            where: {
                companyId: project.companyId,
                active: true,
                OR: [
                    { outdatedAt: { not: null } },
                    { revisionDate: { lt: new Date(now.getTime() - 365 * 86400000) } },
                ],
            },
        });
        if (outdatedManuals > 0) {
            insights.push({
                type: 'outdated_manufacturer_instruction',
                score: 35,
                confidence: 0.8,
                title: `${outdatedManuals} manufacturer instructions may be outdated`,
                explanation: 'Equipment manuals older than 12 months or flagged outdated should be reviewed against current OEM guidance.',
                evidence: [`outdated_manuals=${outdatedManuals}`],
                suggestedActions: ['Request updated manual from OEM'],
                links: [],
            });
        }
        return insights.sort((a, b) => b.score - a.score);
    }
    suggestSdsForTask(input) {
        const keywords = input.taskKeywords.map((k) => k.toLowerCase());
        return this.prisma.sdsDocument.findMany({
            where: Object.assign(Object.assign({ companyId: input.companyId, deletedAt: null, status: 'published' }, (input.projectId
                ? { OR: [{ projectId: input.projectId }, { projectId: null }] }
                : {})), (keywords.length
                ? {
                    OR: keywords.map((kw) => ({
                        productName: { contains: kw, mode: 'insensitive' },
                    })),
                }
                : {})),
            take: 20,
            orderBy: { productName: 'asc' },
        });
    }
    correlateSdsToModules(sdsId) {
        return {
            sdsId,
            jha: `Link SDS ${sdsId} to JHA hazard chemical controls`,
            inspections: 'Attach SDS reference on chemical storage inspection items',
            incidents: 'Map exposure incidents to SDS first-aid section',
            correctiveActions: 'CAPA from expiry/missing SDS deficiencies',
        };
    }
};
exports.PmDocumentCailIntelligenceService = PmDocumentCailIntelligenceService;
exports.PmDocumentCailIntelligenceService = PmDocumentCailIntelligenceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PmDocumentCailIntelligenceService);
//# sourceMappingURL=pm-document-cail-intelligence.service.js.map