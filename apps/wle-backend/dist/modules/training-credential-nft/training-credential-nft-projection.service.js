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
exports.TrainingCredentialNftProjectionService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
let TrainingCredentialNftProjectionService = class TrainingCredentialNftProjectionService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getProjection(trainingRecordId) {
        var _a, _b, _c;
        const [decision, nft, mintJob, attestation] = await Promise.all([
            this.prisma.regulatoryVerificationDecision.findFirst({
                where: { trainingRecordId },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.trainingCredentialNft.findUnique({
                where: { trainingRecordId },
            }),
            this.prisma.nftMintJob.findUnique({
                where: { idempotencyKey: `training-record:${trainingRecordId}` },
            }),
            this.prisma.trainingAttestation.findFirst({
                where: { trainingRecordId },
                orderBy: { createdAt: 'desc' },
            }),
        ]);
        const hasAttestation = attestation != null;
        if (!decision) {
            return {
                trainingRecordId,
                verifiedByVeraStatus: 'UNVERIFIED',
                jurisdictionCoverage: [],
                regulatorySummary: null,
                nftTokenId: null,
                nftChain: null,
            };
        }
        const jurisdictionCoverage = (_a = decision.jurisdictionCoverage) !== null && _a !== void 0 ? _a : [];
        const regulatorySummary = `Regulatory ${decision.regulatoryComplianceStatus} (score ${decision.complianceScore}) in ${decision.jurisdictionCode}`;
        if ((nft === null || nft === void 0 ? void 0 : nft.mintStatus) === client_1.TrainingCredentialNftMintStatus.MINTED) {
            return {
                trainingRecordId,
                verifiedByVeraStatus: 'VERIFIED_WITH_NFT',
                jurisdictionCoverage,
                regulatorySummary,
                nftTokenId: nft.nftTokenId,
                nftChain: nft.chain,
            };
        }
        if (mintJob &&
            (mintJob.status === client_1.NftMintJobStatus.PENDING ||
                mintJob.status === client_1.NftMintJobStatus.PROCESSING)) {
            return {
                trainingRecordId,
                verifiedByVeraStatus: 'PENDING',
                jurisdictionCoverage,
                regulatorySummary,
                nftTokenId: null,
                nftChain: null,
            };
        }
        if (decision.regulatoryComplianceStatus ===
            client_1.RegulatoryComplianceStatus.COMPLIANT &&
            hasAttestation) {
            return {
                trainingRecordId,
                verifiedByVeraStatus: 'VERIFIED',
                jurisdictionCoverage,
                regulatorySummary,
                nftTokenId: (_b = nft === null || nft === void 0 ? void 0 : nft.nftTokenId) !== null && _b !== void 0 ? _b : null,
                nftChain: (_c = nft === null || nft === void 0 ? void 0 : nft.chain) !== null && _c !== void 0 ? _c : null,
            };
        }
        if (decision.regulatoryComplianceStatus ===
            client_1.RegulatoryComplianceStatus.PARTIALLY_COMPLIANT) {
            return {
                trainingRecordId,
                verifiedByVeraStatus: 'PENDING',
                jurisdictionCoverage,
                regulatorySummary,
                nftTokenId: null,
                nftChain: null,
            };
        }
        return {
            trainingRecordId,
            verifiedByVeraStatus: 'UNVERIFIED',
            jurisdictionCoverage,
            regulatorySummary,
            nftTokenId: null,
            nftChain: null,
        };
    }
    async getProjectionsForRecords(trainingRecordIds) {
        const map = new Map();
        await Promise.all(trainingRecordIds.map(async (id) => {
            map.set(id, await this.getProjection(id));
        }));
        return map;
    }
};
exports.TrainingCredentialNftProjectionService = TrainingCredentialNftProjectionService;
exports.TrainingCredentialNftProjectionService = TrainingCredentialNftProjectionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TrainingCredentialNftProjectionService);
//# sourceMappingURL=training-credential-nft-projection.service.js.map