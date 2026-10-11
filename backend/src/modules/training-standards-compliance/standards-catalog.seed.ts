export const CSA_STANDARDS_SEED = [
  {
    code: 'CSA-Z1001',
    title: 'Occupational health and safety training',
    kind: 'CSA' as const,
    keywords: ['training', 'ohs', 'whmis'],
    defaultValidityDays: 1095,
  },
  {
    code: 'CSA-Z1006',
    title: 'Management of work in confined spaces',
    kind: 'CSA' as const,
    keywords: ['confined space'],
    defaultValidityDays: 1095,
  },
];

export const FEDERAL_OHS_SEED = [
  {
    code: 'OHS-FED-GEN',
    title: 'Canada Labour Code general occupational health and safety duty',
    kind: 'FEDERAL_OHS' as const,
    jurisdictionCode: 'CA-FED',
    keywords: ['federal', 'ohs'],
    defaultValidityDays: 1095,
  },
];

export const PROVINCIAL_OHS_SEED = [
  {
    code: 'OHS-AB-GEN',
    title: 'Alberta Occupational Health and Safety Act general duty',
    kind: 'PROVINCIAL_OHS' as const,
    jurisdictionCode: 'AB',
    keywords: ['alberta', 'ohs'],
    defaultValidityDays: 1095,
  },
  {
    code: 'OHS-BC-GEN',
    title: 'British Columbia Workers Compensation Act general duty',
    kind: 'PROVINCIAL_OHS' as const,
    jurisdictionCode: 'BC',
    keywords: ['british columbia', 'ohs'],
    defaultValidityDays: 1095,
  },
  {
    code: 'OHS-ON-GEN',
    title: 'Ontario Occupational Health and Safety Act general duty',
    kind: 'PROVINCIAL_OHS' as const,
    jurisdictionCode: 'ON',
    keywords: ['ontario', 'ohs'],
    defaultValidityDays: 1095,
  },
];

export const INDUSTRY_COP_SEED = [
  {
    code: 'COP-FALL',
    title: 'Fall protection code of practice',
    kind: 'INDUSTRY_COP' as const,
    keywords: ['fall protection'],
    defaultValidityDays: 365,
  },
];

export const REJECTION_REASONS_SEED = [
  {
    code: 'STANDARD_MISSING',
    title: 'Required standard is missing',
    category: 'STANDARD',
    severity: 'ERROR',
  },
  {
    code: 'JURISDICTION_MISMATCH',
    title: 'Credential does not match the work jurisdiction',
    category: 'JURISDICTION',
    severity: 'ERROR',
  },
  {
    code: 'PROVIDER_NOT_APPROVED',
    title: 'Training provider is not approved',
    category: 'PROVIDER',
    severity: 'ERROR',
  },
  {
    code: 'CREDENTIAL_EXPIRED',
    title: 'Credential is expired',
    category: 'EXPIRY',
    severity: 'WARNING',
  },
];

export const JURISDICTION_REQUIREMENTS_SEED = [
  {
    jurisdictionCode: 'AB',
    regionName: 'Alberta',
    standardCode: 'CSA-Z1001',
    required: true,
  },
  {
    jurisdictionCode: 'CA-FED',
    regionName: 'Canada federal',
    standardCode: 'OHS-FED-GEN',
    required: true,
  },
];
