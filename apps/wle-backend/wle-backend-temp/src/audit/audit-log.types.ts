import type { Prisma } from '@prisma/client';

export type AuditActor = {
  id?: number | null;
  companyId?: number | null;
};

export type AuditEntityRef = {
  type: string;
  id: string | number;
  tenantId?: number | null;
};

export type AuditLogOptions = {
  tx?: Prisma.TransactionClient;
  ip?: string;
  userAgent?: string;
};
