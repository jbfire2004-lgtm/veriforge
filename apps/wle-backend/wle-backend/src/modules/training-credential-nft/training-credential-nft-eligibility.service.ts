import { Injectable } from '@nestjs/common';
import {
  RegulatoryComplianceStatus,
  TrainingCredentialNftMintStatus,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { isNftMintEnabled } from './training-credential-nft.config';

export type MintEligibility = {
  eligible: boolean;
  reason?: string;
  decisionId?: number;
  workerId?: number;
};

@Injectable()
export class TrainingCredentialNftEligibilityService {
  constructor(private readonly prisma: PrismaService) {}

  async checkMintEligibility(
    trainingRecordId: number,
    regulatoryDecisionId?: number,
  ): Promise<MintEligibility> {
    if (!isNftMintEnabled()) {
      return {
        eligible: false,
        reason: 'NFT minting disabled (VERA_NFT_MINT_ENABLED)',
      };
    }

    const existing = await this.prisma.trainingCredentialNft.findUnique({
      where: { trainingRecordId },
    });
    if (existing?.mintStatus === TrainingCredentialNftMintStatus.MINTED) {
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

    if (
      decision.regulatoryComplianceStatus !==
      RegulatoryComplianceStatus.COMPLIANT
    ) {
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
}
