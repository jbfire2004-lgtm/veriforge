import { Injectable, Logger } from '@nestjs/common';
import { NftMintJobStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { TrainingCredentialNftEligibilityService } from './training-credential-nft-eligibility.service';
import { TrainingCredentialNftMintingService } from './training-credential-nft-minting.service';

@Injectable()
export class TrainingCredentialNftCoordinatorService {
  private readonly logger = new Logger(
    TrainingCredentialNftCoordinatorService.name,
  );

  constructor(
    private readonly prisma: PrismaService,
    private readonly eligibility: TrainingCredentialNftEligibilityService,
    private readonly minting: TrainingCredentialNftMintingService,
  ) {}

  /** Enqueue mint when regulatory COMPLIANT + core attestation exists. */
  async scheduleMintIfEligible(
    trainingRecordId: number,
    regulatoryDecisionId?: number,
  ): Promise<void> {
    const check = await this.eligibility.checkMintEligibility(
      trainingRecordId,
      regulatoryDecisionId,
    );
    if (!check.eligible) {
      this.logger.debug(
        `Skip NFT schedule for training ${trainingRecordId}: ${check.reason}`,
      );
      return;
    }

    const idempotencyKey = `training-record:${trainingRecordId}`;
    const existingJob = await this.prisma.nftMintJob.findUnique({
      where: { idempotencyKey },
    });
    if (
      existingJob?.status === NftMintJobStatus.PENDING ||
      existingJob?.status === NftMintJobStatus.PROCESSING ||
      existingJob?.status === NftMintJobStatus.COMPLETED
    ) {
      return;
    }

    const job = await this.prisma.nftMintJob.upsert({
      where: { idempotencyKey },
      create: {
        trainingRecordId,
        idempotencyKey,
        status: NftMintJobStatus.PENDING,
      },
      update: {
        status: NftMintJobStatus.PENDING,
        lastError: null,
      },
    });

    setImmediate(() => {
      void this.minting.processMintJob(job.id).catch((err) => {
        this.logger.error(
          `Async NFT mint failed for job ${job.id}: ${
            err instanceof Error ? err.message : err
          }`,
        );
      });
    });
  }
}
