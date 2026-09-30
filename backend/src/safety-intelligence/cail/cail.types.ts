import { CailStatus } from '@prisma/client';

export const CAIL_TRANSITIONS: Record<CailStatus, CailStatus[]> = {
  open: ['in_progress', 'overdue', 'cancelled'],
  in_progress: ['resolved', 'overdue', 'cancelled'],
  overdue: ['in_progress', 'resolved', 'cancelled'],
  resolved: ['verified', 'open'],
  verified: [],
  cancelled: [],
};

export const PRIME_ROLES = new Set([
  'ADMIN',
  'SUPER_ADMIN',
  'COMPANY_ADMIN',
  'PROJECT_MANAGER',
]);
