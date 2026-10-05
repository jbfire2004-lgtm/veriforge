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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegulatoryDecisionService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../../prisma/prisma.service");
const training_standards_compliance_service_1 = require("../training-standards-compliance.service");
const regulatory_equivalency_service_1 = require("./regulatory-equivalency.service");
const training_credential_nft_hash_util_1 = require("../../training-credential-nft/training-credential-nft-hash.util");
const training_credential_nft_coordinator_service_1 = require("../../training-credential-nft/training-credential-nft-coordinator.service");
let RegulatoryDecisionService = class RegulatoryDecisionService {
    constructor(prisma, standards, equivalency, nftCoordinator) {
        this.prisma = prisma;
        this.standards = standards;
        this.equivalency = equivalency;
        this.nftCoordinator = nftCoordinator;
    }
    async verifyTrainingAgainstRegulations(input, validatedBy) {
        var _a, _b, _c, _d;
        const trainingRecordId = typeof input === 'number' ? input : input.trainingRecordId;
        const jurisdictionOverride = typeof input === 'number' ? undefined : input.jurisdictionCode;
        const record = await this.prisma.trainingRecord.findUnique({
            where: { id: trainingRecordId },
            include: {
                certification: true,
                provider: true,
                trainingProvider: true,
                company: true,
            },
        });
        if (!record) {
            throw new common_1.NotFoundException('Training record not found');
        }
        const report = await this.standards.validateTraining(trainingRecordId, jurisdictionOverride, validatedBy);
        const jurisdictionCoverage = await this.equivalency.resolveJurisdictionCoverage(report.jurisdictionCode, report.matchedStandardCodes);
        const reasons = this.buildReasons(report);
        const regulatoryComplianceStatus = this.mapToRegulatoryStatus(report.outcome, report.score, report.issues.length);
        const recommendedAction = this.mapRecommendedAction(regulatoryComplianceStatus);
        if (report.missingStandardCodes.length > 0) {
            reasons.push(`Missing required standards for ${report.jurisdictionCode}: ${report.missingStandardCodes.join(', ')}`);
        }
        if (jurisdictionCoverage.length > 1) {
            reasons.push(`Cross-jurisdiction coverage: ${jurisdictionCoverage.join(', ')}`);
        }
        if ((_a = record.provider) === null || _a === void 0 ? void 0 : _a.name) {
            reasons.push(`Issuing body (provider): ${record.provider.name}`);
        }
        else if ((_b = record.trainingProvider) === null || _b === void 0 ? void 0 : _b.name) {
            reasons.push(`Issuing body (training provider): ${record.trainingProvider.name}`);
        }
        const decisionPayload = {
            trainingRecordId,
            regulatoryComplianceStatus,
            complianceScore: report.score,
            jurisdictionCode: report.jurisdictionCode,
            matchedStandards: report.matchedStandardCodes,
            jurisdictionCoverage,
            validationResultId: (_c = report.validationResultId) !== null && _c !== void 0 ? _c : null,
        };
        const decisionHash = (0, training_credential_nft_hash_util_1.hashRegulatoryDecisionPayload)(decisionPayload);
        const saved = await this.prisma.regulatoryVerificationDecision.create({
            data: Object.assign(Object.assign({}, decisionPayload), { reasons,
                recommendedAction,
                decisionHash, details: JSON.parse(JSON.stringify({
                    standardsOutcome: report.outcome,
                    missingStandardCodes: report.missingStandardCodes,
                    issues: report.issues,
                })) }),
        });
        if (regulatoryComplianceStatus === client_1.RegulatoryComplianceStatus.COMPLIANT) {
            void ((_d = this.nftCoordinator) === null || _d === void 0 ? void 0 : _d.scheduleMintIfEligible(trainingRecordId, saved.id));
        }
        return {
            trainingRecordId,
            regulatoryComplianceStatus,
            complianceScore: report.score,
            matchedStandards: report.matchedStandardCodes,
            jurisdictionCoverage,
            reasons,
            jurisdictionCode: report.jurisdictionCode,
            validationResultId: report.validationResultId,
            standardsOutcome: report.outcome,
            recommendedAction,
            decisionId: saved.id,
            createdAt: saved.createdAt.toISOString(),
        };
    }
    async getLatestDecision(trainingRecordId) {
        var _a, _b;
        const row = await this.prisma.regulatoryVerificationDecision.findFirst({
            where: { trainingRecordId },
            orderBy: { createdAt: 'desc' },
        });
        if (!row)
            return null;
        const details = ((_a = row.details) !== null && _a !== void 0 ? _a : {});
        return {
            trainingRecordId: row.trainingRecordId,
            regulatoryComplianceStatus: row.regulatoryComplianceStatus,
            complianceScore: row.complianceScore,
            matchedStandards: row.matchedStandards,
            jurisdictionCoverage: row.jurisdictionCoverage,
            reasons: row.reasons,
            jurisdictionCode: row.jurisdictionCode,
            validationResultId: (_b = row.validationResultId) !== null && _b !== void 0 ? _b : undefined,
            standardsOutcome: details.standardsOutcome,
            recommendedAction: row.recommendedAction,
            decisionId: row.id,
            createdAt: row.createdAt.toISOString(),
        };
    }
    mapToRegulatoryStatus(outcome, score, issueCount) {
        if (outcome === client_1.TrainingValidationOutcome.PENDING) {
            return client_1.RegulatoryComplianceStatus.UNKNOWN;
        }
        if (outcome === client_1.TrainingValidationOutcome.REJECTED) {
            return client_1.RegulatoryComplianceStatus.NON_COMPLIANT;
        }
        if (outcome === client_1.TrainingValidationOutcome.APPROVED &&
            score >= 85 &&
            issueCount === 0) {
            return client_1.RegulatoryComplianceStatus.COMPLIANT;
        }
        if (outcome === client_1.TrainingValidationOutcome.NEEDS_REVIEW ||
            (outcome === client_1.TrainingValidationOutcome.APPROVED && score < 85) ||
            issueCount > 0) {
            return client_1.RegulatoryComplianceStatus.PARTIALLY_COMPLIANT;
        }
        return client_1.RegulatoryComplianceStatus.UNKNOWN;
    }
    mapRecommendedAction(status) {
        switch (status) {
            case client_1.RegulatoryComplianceStatus.COMPLIANT:
                return 'approve';
            case client_1.RegulatoryComplianceStatus.NON_COMPLIANT:
                return 'reject';
            case client_1.RegulatoryComplianceStatus.PARTIALLY_COMPLIANT:
            case client_1.RegulatoryComplianceStatus.UNKNOWN:
            default:
                return 'manual_review';
        }
    }
    buildReasons(report) {
        const reasons = [
            `Standards validation outcome: ${report.outcome} (score ${report.score})`,
        ];
        for (const issue of report.issues.slice(0, 12)) {
            reasons.push(`${issue.code}: ${issue.message}`);
        }
        return reasons;
    }
};
exports.RegulatoryDecisionService = RegulatoryDecisionService;
exports.RegulatoryDecisionService = RegulatoryDecisionService = __decorate([
    (0, common_1.Injectable)(),
    __param(3, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        training_standards_compliance_service_1.TrainingStandardsComplianceService,
        regulatory_equivalency_service_1.RegulatoryEquivalencyService,
        training_credential_nft_coordinator_service_1.TrainingCredentialNftCoordinatorService])
], RegulatoryDecisionService);
//# sourceMappingURL=regulatory-decision.service.js.map