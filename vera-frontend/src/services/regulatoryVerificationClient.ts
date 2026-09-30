import {
  toBadgeStatus,
  type VerifiedByVeraBadgeStatus,
  type VerifiedByVeraProjection,
  type VerifiedByVeraStatus,
} from "@vera/api-contract";
import {
  fetchLatestRegulatoryDecision,
  verifyTrainingAgainstRegulations,
} from "@/lib/regulatory-decision/api";
import type {
  RegulatoryDecision,
  RegulatoryDecisionBody,
} from "@/lib/regulatory-decision/types";
import { fetchVerifiedByVeraProjection } from "@/lib/training-credential-nft/api";

/** Optional fields for training rows — does not replace complianceStatus. */
export type TrainingVerificationBadgeFields = {
  verificationStatus?: VerifiedByVeraBadgeStatus;
  jurisdictionCoverage?: string[];
  regulatorySummary?: string | null;
  hasNft?: boolean;
  nftTokenId?: string | null;
  nftChain?: string | null;
};

export function badgeFieldsFromProjection(
  projection: VerifiedByVeraProjection,
): TrainingVerificationBadgeFields {
  const verificationStatus = toBadgeStatus(projection.verifiedByVeraStatus);
  return {
    verificationStatus,
    jurisdictionCoverage: projection.jurisdictionCoverage,
    regulatorySummary: projection.regulatorySummary,
    hasNft:
      projection.verifiedByVeraStatus === "VERIFIED_WITH_NFT" ||
      projection.nftTokenId != null,
    nftTokenId: projection.nftTokenId,
    nftChain: projection.nftChain,
  };
}

export async function fetchTrainingVerificationBadgeFields(
  trainingRecordId: number,
): Promise<TrainingVerificationBadgeFields> {
  const projection = await fetchVerifiedByVeraProjection(trainingRecordId);
  return badgeFieldsFromProjection(projection);
}

export async function fetchRegulatoryDecisionForTraining(
  trainingRecordId: number,
): Promise<RegulatoryDecision | null> {
  return fetchLatestRegulatoryDecision(trainingRecordId);
}

export async function runRegulatoryVerification(
  body: RegulatoryDecisionBody,
): Promise<RegulatoryDecision> {
  return verifyTrainingAgainstRegulations(body);
}

export function mapWalletVerifiedStatus(
  status?: VerifiedByVeraStatus | null,
): TrainingVerificationBadgeFields | undefined {
  if (!status || status === "UNVERIFIED") return undefined;
  const verificationStatus = toBadgeStatus(status);
  return {
    verificationStatus,
    hasNft: status === "VERIFIED_WITH_NFT",
  };
}
