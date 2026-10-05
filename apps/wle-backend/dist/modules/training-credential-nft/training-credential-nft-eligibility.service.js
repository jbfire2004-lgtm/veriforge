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
exports.TrainingCredentialNftEligibilityService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const training_credential_nft_config_1 = require("./training-credential-nft.config");
let TrainingCredentialNftEligibilityService = class TrainingCredentialNftEligibilityService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async checkMintEligibility(trainingRecordId, regulatoryDecisionId) {
        if (!(0, training_credential_nft_config_1.isNftMintEnabled)()) {
            return {
                eligible: false,
                reason: 'NFT minting disabled (VERA_NFT_MINT_ENABLED)',
            };
        }
        const existing = await this.prisma.trainingCredentialNft.findUnique({
            where: { trainingRecordId },
        });
        if ((existing === null || existing === void 0 ? void 0 : existing.mintStatus) === client_1.TrainingCredentialNftMintStatus.MINTED) {
            return { eligible: false, reason: 'NFT already minted' };
        }
        const record = await this.prisma.trainingRecord.findUnique({
            where: { id: trainingRecordId },
            select: {
                id: true,
                workerId: true,
                completedAt: true,
                attestations: { take: 1, select: { id: true } },
            },
        });
        if (!record) {
            return { eligible: false, reason: 'Training record not found' };
        }
        if (record.attestations.length === 0 && record.completedAt == null) {
            return {
                eligible: false,
                reason: 'Core attestation / completion required before NFT mint',
            };
        }
        const decision = regulatoryDecisionId
            ? await this.prisma.regulatoryVerificationDecision.findUnique({
                where: { id: regulatoryDecisionId },
            })
            : await this.prisma.regulatoryVerificationDecision.findFirst({
                where: { trainingRecordId },
                orderBy: { createdAt: 'desc' },
            });
        if (!decision) {
            return { eligible: false, reason: 'No regulatory verification decision' };
        }
        if (decision.regulatoryComplianceStatus !==
            client_1.RegulatoryComplianceStatus.COMPLIANT) {
            return {
                eligible: false,
                reason: `Regulatory status is ${decision.regulatoryComplianceStatus}`,
            };
        }
        return {
            eligible: true,
            decisionId: decision.id,
            workerId: record.workerId,
        };
    }
};
exports.TrainingCredentialNftEligibilityService = TrainingCredentialNftEligibilityService;
exports.TrainingCredentialNftEligibilityService = TrainingCredentialNftEligibilityService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TrainingCredentialNftEligibilityService);
//# sourceMappingURL=training-credential-nft-eligibility.service.js.map