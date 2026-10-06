import { Injectable, NotFoundException, Optional } from '@nestjs/common';
import {
  RegulatoryComplianceStatus,
  TrainingValidationOutcome,
} from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { TrainingStandardsComplianceService } from '../training-standards-compliance.service';
import { RegulatoryEquivalencyService } from './regulatory-equivalency.service';
import type {
  RegulatoryDecision,
  RegulatoryTrainingInput,
} from './regulatory-decision.types';
import { hashRegulatoryDecisionPayload } from '../../training-credential-nft/training-credential-nft-hash.util';
import { TrainingCredentialNftCoordinatorService } from '../../training-credential-nft/training-credential-nft-coordinator.service';
@Injectable()
export class RegulatoryDecisionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly standards: TrainingStandardsComplianceService,
    private readonly equivalency: RegulatoryEquivalencyService,
    @Optional()
    private readonly nftCoordinator?: TrainingCredentialNftCoordinatorService,
  ) {}

  /**
   * Main entry: run standards compliance, apply equivalencies, persist audit row.
   * Safe to call from ingestion/verification orchestration without changing existing endpoints.
   */
  async verifyTrainingAgainstRegulations(
    input: RegulatoryTrainingInput | number,
    validatedBy?: number,
  ): Promise<RegulatoryDecision> {
    const trainingRecordId =
      typeof input === 'number' ? input : input.trainingRecordId;
    const jurisdictionOverride =
      typeof input === 'number' ? undefined : input.jurisdictionCode;

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
      throw new NotFoundException('Training record not found');
    }

    const report = await this.standards.validateTraining(
      trainingRecordId,
      jurisdictionOverride,
      validatedBy,
    );

    const jurisdictionCoverage =
      await this.equivalency.resolveJurisdictionCoverage(
        report.jurisdictionCode,
        report.matchedStandardCodes,
      );

    const reasons = this.buildReasons(report);
    const regulatoryComplianceStatus = this.mapToRegulatoryStatus(
      report.outcome,
      report.score,
      report.issues.length,
    );
    const recommendedAction = this.mapRecommendedAction(
      regulatoryComplianceStatus,
    );

    if (report.missingStandardCodes.length > 0) {
      reasons.push(
        `Missing required standards for ${
          report.jurisdictionCode
        }: ${report.missingStandardCodes.join(', ')}`,
      );
    }
    if (jurisdictionCoverage.length > 1) {
      reasons.push(
        `Cross-jurisdiction coverage: ${jurisdictionCoverage.join(', ')}`,
      );
    }
    if (record.provider?.name) {
      reasons.push(`Issuing body (provider): ${record.provider.name}`);
    } else if (record.trainingProvider?.name) {
      reasons.push(
        `Issuing body (training provider): ${record.trainingProvider.name}`,
      );
    }

    const decisionPayload = {
      trainingRecordId,
      regulatoryComplianceStatus,
      complianceScore: report.score,
      jurisdictionCode: report.jurisdictionCode,
      matchedStandards: report.matchedStandardCodes,
      jurisdictionCoverage,
      validationResultId: report.validationResultId ?? null,
    };
    const decisionHash = hashRegulatoryDecisionPayload(decisionPayload);

    const saved = await this.prisma.regulatoryVerificationDecision.create({
      data: {
        ...decisionPayload,
        reasons,
        recommendedAction,
        decisionHash,
        details: JSON.parse(
          JSON.stringify({
            standardsOutcome: report.outcome,
            missingStandardCodes: report.missingStandardCodes,
            issues: report.issues,
          }),
        ),
      },
    });

    if (regulatoryComplianceStatus === RegulatoryComplianceStatus.COMPLIANT) {
      void this.nftCoordinator?.scheduleMintIfEligible(
        trainingRecordId,
        saved.id,
      );
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

  async getLatestDecision(
    trainingRecordId: number,
  ): Promise<RegulatoryDecision | null> {
    const row = await this.prisma.regulatoryVerificationDecision.findFirst({
      where: { trainingRecordId },
      orderBy: { createdAt: 'desc' },
    });
    if (!row) return null;
    const details = (row.details ?? {}) as {
      standardsOutcome?: TrainingValidationOutcome;
    };
    return {
      trainingRecordId: row.trainingRecordId,
      regulatoryComplianceStatus: row.regulatoryComplianceStatus,
      complianceScore: row.complianceScore,
      matchedStandards: row.matchedStandards,
      jurisdictionCoverage: row.jurisdictionCoverage,
      reasons: row.reasons,
      jurisdictionCode: row.jurisdictionCode,
      validationResultId: row.validationResultId ?? undefined,
      standardsOutcome: details.standardsOutcome,
      recommendedAction:
        row.recommendedAction as RegulatoryDecision['recommendedAction'],
      decisionId: row.id,
      createdAt: row.createdAt.toISOString(),
    };
  }

  private mapToRegulatoryStatus(
    outcome: TrainingValidationOutcome,
    score: number,
    issueCount: number,
  ): RegulatoryComplianceStatus {
    if (outcome === TrainingValidationOutcome.PENDING) {
      return RegulatoryComplianceStatus.UNKNOWN;
    }
    if (outcome === TrainingValidationOutcome.REJECTED) {
      return RegulatoryComplianceStatus.NON_COMPLIANT;
    }
    if (
      outcome === TrainingValidationOutcome.APPROVED &&
      score >= 85 &&
      issueCount === 0
    ) {
      return RegulatoryComplianceStatus.COMPLIANT;
    }
    if (
      outcome === TrainingValidationOutcome.NEEDS_REVIEW ||
      (outcome === TrainingValidationOutcome.APPROVED && score < 85) ||
      issueCount > 0
    ) {
      return RegulatoryComplianceStatus.PARTIALLY_COMPLIANT;
    }
    return RegulatoryComplianceStatus.UNKNOWN;
  }

  private mapRecommendedAction(
    status: RegulatoryComplianceStatus,
  ): RegulatoryDecision['recommendedAction'] {
    switch (status) {
      case RegulatoryComplianceStatus.COMPLIANT:
        return 'approve';
      case RegulatoryComplianceStatus.NON_COMPLIANT:
        return 'reject';
      case RegulatoryComplianceStatus.PARTIALLY_COMPLIANT:
      case RegulatoryComplianceStatus.UNKNOWN:
      default:
        return 'manual_review';
    }
  }

  private buildReasons(report: {
    outcome: TrainingValidationOutcome;
    score: number;
    issues: { code: string; message: string }[];
  }): string[] {
    const reasons: string[] = [
      `Standards validation outcome: ${report.outcome} (score ${report.score})`,
    ];
    for (const issue of report.issues.slice(0, 12)) {
      reasons.push(`${issue.code}: ${issue.message}`);
    }
    return reasons;
  }
}
