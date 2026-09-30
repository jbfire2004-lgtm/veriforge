import type { HiringClientRole } from '@prisma/client';
import type { HiringClientPermissionKey } from '../rbac/hiring-client-permissions';

export interface HiringClientJwtPayload {
  sub: string;
  ns: 'hiring_client';
  user_id: string;
  hiring_client_id: string;
  email: string;
  role: HiringClientRole;
  permissions: HiringClientPermissionKey[] | string[];
  iat?: number;
  exp?: number;
}

export interface HiringClientSessionTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export interface SafeHiringClientUser {
  id: string;
  hiringClientId: string;
  email: string;
  fullName: string | null;
  role: HiringClientRole;
  permissions: string[];
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface HiringClientCreateInput {
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  password: string;
  adminFullName?: string;
}
