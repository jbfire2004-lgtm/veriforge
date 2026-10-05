import { Injectable } from '@nestjs/common';
import {
  NftMintJobStatus,
  RegulatoryComplianceStatus,
  TrainingCredentialNftMintStatus,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

export type VerifiedByVeraStatus =
  | 'UNVERIFIED'
  | 'PENDING'
  | 'VERIFIED'
  | 'VERIFIED_WITH_NFT';

export type VerifiedByVeraProjection = {
  trainingRecordId: number;
  verifiedByVeraStatus: VerifiedByVeraStatus;
  jurisdictionCoverage: string[];
  regulatorySummary: string | null;
  nftTokenId: string | null;
  nftChain: string | null;
};

@Injectable()
export class TrainingCredentialNftProjectionService {
  constructor(private readonly prisma: PrismaService) {}

  async getProjection(
    trainingRecordId: number,
  ): Promise<VerifiedByVeraProjection> {
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

    const jurisdictionCoverage = decision.jurisdictionCoverage ?? [];
    const regulatorySummary = `Regulatory ${decision.regulatoryComplianceStatus} (score ${decision.complianceScore}) in ${decision.jurisdictionCode}`;

    if (nft?.mintStatus === TrainingCredentialNftMintStatus.MINTED) {
      return {
        trainingRecordId,
        verifiedByVeraStatus: 'VERIFIED_WITH_NFT',
        jurisdictionCoverage,
        regulatorySummary,
        nftTokenId: nft.nftTokenId,
        nftChain: nft.chain,
      };
    }

    if (
      mintJob &&
      (mintJob.status === NftMintJobStatus.PENDING ||
        mintJob.status === NftMintJobStatus.PROCESSING)
    ) {
      return {
        trainingRecordId,
        verifiedByVeraStatus: 'PENDING',
        jurisdictionCoverage,
        regulatorySummary,
        nftTokenId: null,
        nftChain: null,
      };
    }

    if (
      decision.regulatoryComplianceStatus ===
        RegulatoryComplianceStatus.COMPLIANT &&
      hasAttestation
    ) {
      return {
        trainingRecordId,
        verifiedByVeraStatus: 'VERIFIED',
        jurisdictionCoverage,
        regulatorySummary,
        nftTokenId: nft?.nftTokenId ?? null,
        nftChain: nft?.chain ?? null,
      };
    }

    if (
      decision.regulatoryComplianceStatus ===
      RegulatoryComplianceStatus.PARTIALLY_COMPLIANT
    ) {
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

  async getProjectionsForRecords(
    trainingRecordIds: number[],
  ): Promise<Map<number, VerifiedByVeraProjection>> {
    const map = new Map<number, VerifiedByVeraProjection>();
    await Promise.all(
      trainingRecordIds.map(async (id) => {
        map.set(id, await this.getProjection(id));
      }),
    );
    return map;
  }
}
