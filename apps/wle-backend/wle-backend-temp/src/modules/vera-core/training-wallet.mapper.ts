import { TrainingValidationOutcome } from '@prisma/client';
import { resolvePublicBaseUrl } from '../../config/public-base-url';

export type WalletTrainingRecordDto = {
  id: number;
  issuedAt: Date;
  expiresAt: Date | null;
  completedAt: Date | null;
  certification: {
    id: number;
    name: string;
    code: string | null;
  } | null;
  providerName: string | null;
  instructorName: string | null;
  courseName: string | null;
  courseCode: string | null;
  courseStandards: string[];
  jurisdictionCode: string | null;
  jurisdictionValid: boolean | null;
  certificateQrToken: string | null;
  certificateQrUrl: string | null;
  certificateNumber: string | null;
  complianceStatus: string;
  companyId: number | null;
  projectId: number | null;
  projectName: string | null;
  companyName: string | null;
  /** Vera regulatory + NFT layer (optional; does not replace complianceStatus). */
  verifiedByVeraStatus?:
    | 'UNVERIFIED'
    | 'PENDING'
    | 'VERIFIED'
    | 'VERIFIED_WITH_NFT';
  jurisdictionCoverage?: string[];
  regulatorySummary?: string | null;
  nftTokenId?: string | null;
  nftChain?: string | null;
};

type TrainingRecordWithRelations = {
  id: number;
  issuedAt: Date;
  expiresAt: Date | null;
  completedAt: Date | null;
  certificateQrToken: string | null;
  certificateNumber: string | null;
  companyId: number | null;
  projectId: number | null;
  certification: { id: number; name: string; code: string | null };
  trainingProvider: { name: string } | null;
  instructor: { firstName: string; lastName: string } | null;
  course: {
    name: string;
    code: string;
    standards: { standardKey: string }[];
  } | null;
  company: { name: string } | null;
  project: { name: string; site: { region: string | null } | null } | null;
};

export function mapTrainingRecordForWallet(
  record: TrainingRecordWithRelations,
  options?: {
    validationOutcome?: TrainingValidationOutcome | null;
    jurisdictionCode?: string | null;
    baseUrl?: string;
    verifiedByVeraStatus?:
      | 'UNVERIFIED'
      | 'PENDING'
      | 'VERIFIED'
      | 'VERIFIED_WITH_NFT';
    jurisdictionCoverage?: string[];
    regulatorySummary?: string | null;
    nftTokenId?: string | null;
    nftChain?: string | null;
  },
): WalletTrainingRecordDto {
  const now = new Date();
  const expired = Boolean(record.expiresAt && record.expiresAt < now);

  let complianceStatus = 'ACTIVE';
  if (options?.validationOutcome) {
    complianceStatus = options.validationOutcome;
  } else if (expired) {
    complianceStatus = TrainingValidationOutcome.REJECTED;
  } else if (!record.completedAt) {
    complianceStatus = TrainingValidationOutcome.NEEDS_REVIEW;
  }

  const jurisdictionCode =
    options?.jurisdictionCode ??
    record.project?.site?.region?.trim().toUpperCase() ??
    null;

  const jurisdictionValid =
    options?.validationOutcome != null
      ? options.validationOutcome === TrainingValidationOutcome.APPROVED
      : expired
      ? false
      : true;

  const base = options?.baseUrl ?? resolvePublicBaseUrl();

  const qrUrl = record.certificateQrToken
    ? `${base}/verify/certificate/${record.certificateQrToken}`
    : null;

  return {
    id: record.id,
    issuedAt: record.issuedAt,
    expiresAt: record.expiresAt,
    completedAt: record.completedAt,
    certification: record.certification
      ? {
          id: record.certification.id,
          name: record.certification.name,
          code: record.certification.code,
        }
      : null,
    providerName: record.trainingProvider?.name ?? null,
    instructorName: record.instructor
      ? `${record.instructor.firstName} ${record.instructor.lastName}`.trim()
      : null,
    courseName: record.course?.name ?? record.certification?.name ?? null,
    courseCode: record.course?.code ?? null,
    courseStandards: record.course?.standards?.map((s) => s.standardKey) ?? [],
    jurisdictionCode,
    jurisdictionValid,
    certificateQrToken: record.certificateQrToken,
    certificateQrUrl: qrUrl,
    certificateNumber: record.certificateNumber,
    complianceStatus,
    companyId: record.companyId,
    projectId: record.projectId,
    projectName: record.project?.name ?? null,
    companyName: record.company?.name ?? null,
    verifiedByVeraStatus: options?.verifiedByVeraStatus,
    jurisdictionCoverage: options?.jurisdictionCoverage,
    regulatorySummary: options?.regulatorySummary,
    nftTokenId: options?.nftTokenId,
    nftChain: options?.nftChain,
  };
}

export const TRAINING_RECORD_WALLET_INCLUDE = {
  certification: true,
  trainingProvider: true,
  instructor: true,
  course: { include: { standards: true } },
  company: true,
  project: { include: { site: true } },
} as const;
