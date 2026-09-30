import type { HiringClientRole } from '@prisma/client';

/**
 * Hiring-client permission keys (separate from org SaaS RBAC).
 * Convention: `contractor.<resource>.<action>`
 */
export const HIRING_CLIENT_PERMISSION_KEYS = {
  CONTRACTOR_SCORECARDS_VIEW: 'contractor.scorecards.view',
  CONTRACTOR_COMPLIANCE_VIEW: 'contractor.compliance.view',
  CONTRACTOR_COMPLIANCE_REVIEW: 'contractor.compliance.review',
  CONTRACTOR_DOCUMENTS_VIEW: 'contractor.documents.view',
  CONTRACTOR_PROJECTS_VIEW: 'contractor.projects.view',
  CONTRACTOR_AWARD_MANAGE: 'contractor.award.manage',
} as const;

export type HiringClientPermissionKey =
  (typeof HIRING_CLIENT_PERMISSION_KEYS)[keyof typeof HIRING_CLIENT_PERMISSION_KEYS];

export const HIRING_CLIENT_PERMISSIONS = HIRING_CLIENT_PERMISSION_KEYS;

export const HIRING_CLIENT_PERMISSION_CATALOG: {
  key: HiringClientPermissionKey;
  name: string;
}[] = [
  {
    key: HIRING_CLIENT_PERMISSION_KEYS.CONTRACTOR_SCORECARDS_VIEW,
    name: 'View contractor scorecards',
  },
  {
    key: HIRING_CLIENT_PERMISSION_KEYS.CONTRACTOR_COMPLIANCE_VIEW,
    name: 'View contractor compliance',
  },
  {
    key: HIRING_CLIENT_PERMISSION_KEYS.CONTRACTOR_COMPLIANCE_REVIEW,
    name: 'Review contractor compliance artifacts',
  },
  {
    key: HIRING_CLIENT_PERMISSION_KEYS.CONTRACTOR_DOCUMENTS_VIEW,
    name: 'View contractor documents',
  },
  {
    key: HIRING_CLIENT_PERMISSION_KEYS.CONTRACTOR_PROJECTS_VIEW,
    name: 'View contractor projects',
  },
  {
    key: HIRING_CLIENT_PERMISSION_KEYS.CONTRACTOR_AWARD_MANAGE,
    name: 'Award contracts to contractors',
  },
];

/** Default permission bundles per hiring-client role. */
export const HIRING_CLIENT_ROLE_PERMISSIONS: Record<
  HiringClientRole,
  HiringClientPermissionKey[]
> = {
  ClientAdmin: HIRING_CLIENT_PERMISSION_CATALOG.map((p) => p.key),
  Reviewer: [
    HIRING_CLIENT_PERMISSION_KEYS.CONTRACTOR_SCORECARDS_VIEW,
    HIRING_CLIENT_PERMISSION_KEYS.CONTRACTOR_COMPLIANCE_VIEW,
    HIRING_CLIENT_PERMISSION_KEYS.CONTRACTOR_COMPLIANCE_REVIEW,
    HIRING_CLIENT_PERMISSION_KEYS.CONTRACTOR_DOCUMENTS_VIEW,
    HIRING_CLIENT_PERMISSION_KEYS.CONTRACTOR_PROJECTS_VIEW,
  ],
};

export const HIRING_CLIENT_JWT_AUDIENCE = 'veriforge-hiring-client';
export const HIRING_CLIENT_JWT_NS = 'hiring_client';
