import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  NftMintJobStatus,
  TrainingCredentialNftMintStatus,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  BLOCKCHAIN_CREDENTIAL_PROVIDER,
  BlockchainCredentialProvider,
} from './blockchain-provider.interface';
import {
  hashOriginalDocumentRef,
  hashRegulatoryDecisionPayload,
} from './training-credential-nft-hash.util';
import { nftStubChainId } from './training-credential-nft.config';

@Injectable()
export class TrainingCredentialNftMintingService {
  private readonly logger = new Logger(
    TrainingCredentialNftMintingService.name,
  );

  constructor(
    private readonly prisma: PrismaService,
    @Inject(BLOCKCHAIN_CREDENTIAL_PROVIDER)
    private readonly chain: BlockchainCredentialProvider,
  ) {}

  async mintTrainingCredentialNft(
    trainingRecordId: number,
    regulatoryVerificationDecisionId: number,
  ) {
    const record = await this.prisma.trainingRecord.findUnique({
      where: { id: trainingRecordId },
      include: {
        certification: true,
        provider: true,
        trainingProvider: true,
        ingestionRun: { include: { coreFile: true } },
      },
    });
    if (!record) throw new Error('Training record not found');

    const decision =
      await this.prisma.regulatoryVerificationDecision.findUnique({
        where: { id: regulatoryVerificationDecisionId },
      });
    if (!decision) throw new Error('Regulatory decision not found');

    const regulatoryDecisionHash =
      decision.decisionHash ??
      hashRegulatoryDecisionPayload({
        id: decision.id,
        trainingRecordId: decision.trainingRecordId,
        regulatoryComplianceStatus: decision.regulatoryComplianceStatus,
        complianceScore: decision.complianceScore,
        jurisdictionCode: decision.jurisdictionCode,
        matchedStandards: decision.matchedStandards,
        jurisdictionCoverage: decision.jurisdictionCoverage,
        createdAt: decision.createdAt.toISOString(),
      });

    const originalDocumentHash = hashOriginalDocumentRef({
      coreFileObjectKey: record.ingestionRun?.coreFile?.objectKey,
      coreFileId: record.ingestionRun?.coreFileId,
      ingestionRunId: record.ingestionRunId,
      certificateNumber: record.certificateNumber,
    });

    const metadata = {
      trainingId: record.id,
      workerId: record.workerId,
      issuingBody:
        record.provider?.name ?? record.trainingProvider?.name ?? null,
      trainingType: record.certification.name,
      issueDate: record.issuedAt.toISOString(),
      expiryDate: record.expiresAt?.toISOString() ?? null,
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
        chain: minted.chain ?? nftStubChainId(),
        transactionHash: minted.transactionHash,
        mintStatus: TrainingCredentialNftMintStatus.MINTED,
        regulatoryDecisionHash,
        originalDocumentHash,
        metadata: metadata as object,
        mintedAt: new Date(),
      },
      update: {
        nftTokenId: minted.tokenId,
        chain: minted.chain ?? nftStubChainId(),
        transactionHash: minted.transactionHash,
        mintStatus: TrainingCredentialNftMintStatus.MINTED,
        regulatoryDecisionHash,
        originalDocumentHash,
        metadata: metadata as object,
        mintedAt: new Date(),
      },
    });

    return row;
  }

  async processMintJob(jobId: number) {
    const job = await this.prisma.nftMintJob.findUnique({
      where: { id: jobId },
    });
    if (!job || job.status === NftMintJobStatus.COMPLETED) return;

    await this.prisma.nftMintJob.update({
      where: { id: jobId },
      data: { status: NftMintJobStatus.PROCESSING, attempts: { increment: 1 } },
    });

    try {
      const decision =
        await this.prisma.regulatoryVerificationDecision.findFirst({
          where: { trainingRecordId: job.trainingRecordId },
          orderBy: { createdAt: 'desc' },
        });
      if (!decision) throw new Error('No regulatory decision for mint job');

      await this.mintTrainingCredentialNft(job.trainingRecordId, decision.id);

      await this.prisma.nftMintJob.update({
        where: { id: jobId },
        data: {
          status: NftMintJobStatus.COMPLETED,
          processedAt: new Date(),
          lastError: null,
        },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.warn(`NFT mint job ${jobId} failed: ${message}`);
      await this.prisma.nftMintJob.update({
        where: { id: jobId },
        data: {
          status: NftMintJobStatus.FAILED,
          lastError: message,
          processedAt: new Date(),
        },
      });
      await this.prisma.trainingCredentialNft
        .updateMany({
          where: { trainingRecordId: job.trainingRecordId },
          data: { mintStatus: TrainingCredentialNftMintStatus.FAILED },
        })
        .catch(() => undefined);
    }
  }
}
