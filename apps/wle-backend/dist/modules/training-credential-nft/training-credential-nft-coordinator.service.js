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
var TrainingCredentialNftCoordinatorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrainingCredentialNftCoordinatorService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const training_credential_nft_eligibility_service_1 = require("./training-credential-nft-eligibility.service");
const training_credential_nft_minting_service_1 = require("./training-credential-nft-minting.service");
let TrainingCredentialNftCoordinatorService = TrainingCredentialNftCoordinatorService_1 = class TrainingCredentialNftCoordinatorService {
    constructor(prisma, eligibility, minting) {
        this.prisma = prisma;
        this.eligibility = eligibility;
        this.minting = minting;
        this.logger = new common_1.Logger(TrainingCredentialNftCoordinatorService_1.name);
    }
    async scheduleMintIfEligible(trainingRecordId, regulatoryDecisionId) {
        const check = await this.eligibility.checkMintEligibility(trainingRecordId, regulatoryDecisionId);
        if (!check.eligible) {
            this.logger.debug(`Skip NFT schedule for training ${trainingRecordId}: ${check.reason}`);
            return;
        }
        const idempotencyKey = `training-record:${trainingRecordId}`;
        const existingJob = await this.prisma.nftMintJob.findUnique({
            where: { idempotencyKey },
        });
        if ((existingJob === null || existingJob === void 0 ? void 0 : existingJob.status) === client_1.NftMintJobStatus.PENDING ||
            (existingJob === null || existingJob === void 0 ? void 0 : existingJob.status) === client_1.NftMintJobStatus.PROCESSING ||
            (existingJob === null || existingJob === void 0 ? void 0 : existingJob.status) === client_1.NftMintJobStatus.COMPLETED) {
            return;
        }
        const job = await this.prisma.nftMintJob.upsert({
            where: { idempotencyKey },
            create: {
                trainingRecordId,
                idempotencyKey,
                status: client_1.NftMintJobStatus.PENDING,
            },
            update: {
                status: client_1.NftMintJobStatus.PENDING,
                lastError: null,
            },
        });
        setImmediate(() => {
            void this.minting.processMintJob(job.id).catch((err) => {
                this.logger.error(`Async NFT mint failed for job ${job.id}: ${err instanceof Error ? err.message : err}`);
            });
        });
    }
};
exports.TrainingCredentialNftCoordinatorService = TrainingCredentialNftCoordinatorService;
exports.TrainingCredentialNftCoordinatorService = TrainingCredentialNftCoordinatorService = TrainingCredentialNftCoordinatorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        training_credential_nft_eligibility_service_1.TrainingCredentialNftEligibilityService,
        training_credential_nft_minting_service_1.TrainingCredentialNftMintingService])
], TrainingCredentialNftCoordinatorService);
//# sourceMappingURL=training-credential-nft-coordinator.service.js.map