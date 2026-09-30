import type { DocumentCategory, DocumentCenterStatus } from '@prisma/client';

/**
 * Document Center category rules.
 * Required categories contribute to directory compliance scoring.
 */
export type CategoryRule = {
  category: DocumentCategory;
  label: string;
  required: boolean;
  /** Days before expiry to mark as expiring / alert */
  expiryWarningDays: number;
  /** Allowed MIME types for upload */
  allowedMimes: string[];
  maxBytes: number;
  description: string;
};

export const DOCUMENT_CATEGORY_RULES: Record<DocumentCategory, CategoryRule> = {
  insurance: {
    category: 'insurance',
    label: 'Insurance',
    required: true,
    expiryWarningDays: 30,
    allowedMimes: [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/webp',
    ],
    maxBytes: 15 * 1024 * 1024,
    description: 'Liability / workers compensation / COI certificates',
  },
  safety_program: {
    category: 'safety_program',
    label: 'Safety programs',
    required: true,
    expiryWarningDays: 60,
    allowedMimes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    maxBytes: 25 * 1024 * 1024,
    description: 'Written safety programs, COR/SECOR manuals, HSE policies',
  },
  license: {
    category: 'license',
    label: 'Licenses',
    required: true,
    expiryWarningDays: 45,
    allowedMimes: ['application/pdf', 'image/jpeg', 'image/png'],
    maxBytes: 10 * 1024 * 1024,
    description: 'Trade licenses, business licenses, permits',
  },
  training: {
    category: 'training',
    label: 'Training',
    required: false,
    expiryWarningDays: 30,
    allowedMimes: ['application/pdf', 'image/jpeg', 'image/png'],
    maxBytes: 10 * 1024 * 1024,
    description: 'Training certificates and competency records',
  },
};

export const DOCUMENT_CATEGORIES = Object.keys(
  DOCUMENT_CATEGORY_RULES,
) as DocumentCategory[];

export function getCategoryRule(category: DocumentCategory): CategoryRule {
  return DOCUMENT_CATEGORY_RULES[category];
}

export function isMimeAllowed(category: DocumentCategory, mime: string): boolean {
  return getCategoryRule(category).allowedMimes.includes(mime);
}

/** Map document center status → directory ContractorDocument-compatible status. */
export function toDirectoryDocStatus(
  status: DocumentCenterStatus,
): 'valid' | 'expired' | 'pending_review' | 'rejected' | 'missing' {
  switch (status) {
    case 'valid':
    case 'expiring':
    case 'exempt':
      return 'valid';
    case 'expired':
      return 'expired';
    case 'rejected':
      return 'rejected';
    case 'missing':
      return 'missing';
    default:
      return 'pending_review';
  }
}

export function deriveStatusFromExpiry(
  expiryDate: Date | null | undefined,
  warningDays: number,
  now = new Date(),
): DocumentCenterStatus | null {
  if (!expiryDate) return null;
  const ms = expiryDate.getTime() - now.getTime();
  if (ms < 0) return 'expired';
  if (ms / 86_400_000 <= warningDays) return 'expiring';
  return 'valid';
}
