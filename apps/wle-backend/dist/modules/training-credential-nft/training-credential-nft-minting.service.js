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
var TrainingCredentialNftMintingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrainingCredentialNftMintingService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const blockchain_provider_interface_1 = require("./blockchain-provider.interface");
const training_credential_nft_hash_util_1 = require("./training-credential-nft-hash.util");
const training_credential_nft_config_1 = require("./training-credential-nft.config");
let TrainingCredentialNftMintingService = TrainingCredentialNftMintingService_1 = class TrainingCredentialNftMintingService {
    constructor(prisma, chain) {
        this.prisma = prisma;
        this.chain = chain;
        this.logger = new common_1.Logger(TrainingCredentialNftMintingService_1.name);
    }
    async mintTrainingCredentialNft(trainingRecordId, regulatoryVerificationDecisionId) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
        const record = await this.prisma.trainingRecord.findUnique({
            where: { id: trainingRecordId },
            include: {
                certification: true,
                provider: true,
                trainingProvider: true,
                ingestionRun: { include: { coreFile: true } },
            },
        });
        if (!record)
            throw new Error('Training record not found');
        const decision = await this.prisma.regulatoryVerificationDecision.findUnique({
            where: { id: regulatoryVerificationDecisionId },
        });
        if (!decision)
            throw new Error('Regulatory decision not found');
        const regulatoryDecisionHash = (_a = decision.decisionHash) !== null && _a !== void 0 ? _a : (0, training_credential_nft_hash_util_1.hashRegulatoryDecisionPayload)({
            id: decision.id,
            trainingRecordId: decision.trainingRecordId,
            regulatoryComplianceStatus: decision.regulatoryComplianceStatus,
            complianceScore: decision.complianceScore,
            jurisdictionCode: decision.jurisdictionCode,
            matchedStandards: decision.matchedStandards,
            jurisdictionCoverage: decision.jurisdictionCoverage,
            createdAt: decision.createdAt.toISOString(),
        });
        const originalDocumentHash = (0, training_credential_nft_hash_util_1.hashOriginalDocumentRef)({
            coreFileObjectKey: (_c = (_b = record.ingestionRun) === null || _b === void 0 ? void 0 : _b.coreFile) === null || _c === void 0 ? void 0 : _c.objectKey,
            coreFileId: (_d = record.ingestionRun) === null || _d === void 0 ? void 0 : _d.coreFileId,
            ingestionRunId: record.ingestionRunId,
            certificateNumber: record.certificateNumber,
        });
        const metadata = {
            trainingId: record.id,
            workerId: record.workerId,
            issuingBody: (_h = (_f = (_e = record.provider) === null || _e === void 0 ? void 0 : _e.name) !== null && _f !== void 0 ? _f : (_g = record.trainingProvider) === null || _g === void 0 ? void 0 : _g.name) !== null && _h !== void 0 ? _h : null,
            trainingType: record.certification.name,
            issueDate: record.issuedAt.toISOString(),
            expiryDate: (_k = (_j = record.expiresAt) === null || _j === void 0 ? void 0 : _j.toISOString()) !== null && _k !== void 0 ? _k : null,
            jurisdictionCoverage: decision.jurisdictionCoverage,
            regulatoryDecisionHash,
            originalDocumentHash,
            matchedStandards: decision.matchedStandards,
        };
        const minted = await this.chain.mintTrainingCredential({
            trainingRecordId: record.id,
            workerId: record.workerId,
            metadata,
        });
        const row = await this.prisma.trainingCredentialNft.upsert({
            where: { trainingRecordId: record.id },
            create: {
                trainingRecordId: record.id,
                workerId: record.workerId,
                regulatoryVerificationDecisionId: decision.id,
                nftTokenId: minted.tokenId,
                chain: (_l = minted.chain) !== null && _l !== void 0 ? _l : (0, training_credential_nft_config_1.nftStubChainId)(),
                transactionHash: minted.transactionHash,
                mintStatus: client_1.TrainingCredentialNftMintStatus.MINTED,
                regulatoryDecisionHash,
                originalDocumentHash,
                metadata: metadata,
                mintedAt: new Date(),
            },
            update: {
                nftTokenId: minted.tokenId,
                chain: (_m = minted.chain) !== null && _m !== void 0 ? _m : (0, training_credential_nft_config_1.nftStubChainId)(),
                transactionHash: minted.transactionHash,
                mintStatus: client_1.TrainingCredentialNftMintStatus.MINTED,
                regulatoryDecisionHash,
                originalDocumentHash,
                metadata: metadata,
                mintedAt: new Date(),
            },
        });
        return row;
    }
    async processMintJob(jobId) {
        const job = await this.prisma.nftMintJob.findUnique({
            where: { id: jobId },
        });
        if (!job || job.status === client_1.NftMintJobStatus.COMPLETED)
            return;
        await this.prisma.nftMintJob.update({
            where: { id: jobId },
            data: { status: client_1.NftMintJobStatus.PROCESSING, attempts: { increment: 1 } },
        });
        try {
            const decision = await this.prisma.regulatoryVerificationDecision.findFirst({
                where: { trainingRecordId: job.trainingRecordId },
                orderBy: { createdAt: 'desc' },
            });
            if (!decision)
                throw new Error('No regulatory decision for mint job');
            await this.mintTrainingCredentialNft(job.trainingRecordId, decision.id);
            await this.prisma.nftMintJob.update({
                where: { id: jobId },
                data: {
                    status: client_1.NftMintJobStatus.COMPLETED,
                    processedAt: new Date(),
                    lastError: null,
                },
            });
        }
        catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            this.logger.warn(`NFT mint job ${jobId} failed: ${message}`);
            await this.prisma.nftMintJob.update({
                where: { id: jobId },
                data: {
                    status: client_1.NftMintJobStatus.FAILED,
                    lastError: message,
                    processedAt: new Date(),
                },
            });
            await this.prisma.trainingCredentialNft
                .updateMany({
                where: { trainingRecordId: job.trainingRecordId },
                data: { mintStatus: client_1.TrainingCredentialNftMintStatus.FAILED },
            })
                .catch(() => undefined);
        }
    }
};
exports.TrainingCredentialNftMintingService = TrainingCredentialNftMintingService;
exports.TrainingCredentialNftMintingService = TrainingCredentialNftMintingService = TrainingCredentialNftMintingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)(blockchain_provider_interface_1.BLOCKCHAIN_CREDENTIAL_PROVIDER)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, Object])
], TrainingCredentialNftMintingService);
//# sourceMappingURL=training-credential-nft-minting.service.js.map