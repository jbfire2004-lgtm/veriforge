export type TenantDbMode = 'shared' | 'dedicated';
export type TenantStatus = 'active' | 'suspended' | 'provisioning';

export type TenantBranding = {
  logoUrl: string | null;
  primaryColor: string | null;
  accentColor: string | null;
  useDefaultForgeIdentity: boolean;
};

export type TenantConfig = {
  trainingRequired: boolean;
  verificationStrict: boolean;
  complianceRetentionDays: number;
  maxUsers: number;
  features: string[];
};

export type TenantRecord = {
  tenantId: string;
  slug: string;
  name: string;
  status: TenantStatus;
  dbMode: TenantDbMode;
  dbConnectionKey: string;
  storageBucket: string;
  encryptionKeyId: string;
  branding: TenantBranding;
  config: TenantConfig;
  loadScore: number;
  createdAt: string;
  updatedAt: string;
};

export type TenantUserPoolUser = {
  id: number;
  tenantId: string;
  email: string;
  name: string;
  role: string;
  passwordHash: string;
  active: boolean;
  createdAt: string;
};

export type TenantJwtClaims = {
  sub: number;
  email: string;
  role: string;
  tenantId: string;
  iss: string;
  aud: string;
  iat: number;
  exp: number;
};

export type TenantAuditEntry = {
  id: string;
  tenantId: string;
  userId: number | null;
  action: string;
  resource: string;
  details: Record<string, unknown>;
  timestamp: string;
};

export type TenantStorageObject = {
  key: string;
  tenantId: string;
  bucket: string;
  category: 'compliance' | 'training' | 'verification' | 'general';
  fileName: string;
  sizeBytes: number;
  uploadedBy: number | null;
  timestamp: string;
};

export type TenantPasswordReset = {
  id: string;
  tenantId: string;
  userId: number;
  tokenHash: string;
  expiresAt: string;
  usedAt: string | null;
};

export type TenantRegistrySnapshot = {
  version: number;
  auditSeq: number;
  storageSeq: number;
  tenants: TenantRecord[];
  users: TenantUserPoolUser[];
  auditLog: TenantAuditEntry[];
  storageObjects: TenantStorageObject[];
  resetTokens: TenantPasswordReset[];
};

export const DEFAULT_FORGE_BRANDING: TenantBranding = {
  logoUrl: null,
  primaryColor: '#C62828',
  accentColor: '#424242',
  useDefaultForgeIdentity: true,
};
