export const SAAS_DEFAULT_URL = "http://127.0.0.1:3020";

export const COMPLIANCE_WEIGHTS = {
  insurance: { valid: 10, expiring: 5, expired: -15 },
  wcb: { valid: 10, expired: -20 },
  cor: { valid: 15, expired: -10 },
  scsa: { active: 10, inactive: -10 },
} as const;

export const COMPLIANCE_BASE_SCORE = 50;
export const COMPLIANCE_EXPIRING_SOON_DAYS = 30;

export const TENANT_HEADER = "x-veriforge-org-id";
