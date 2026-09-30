import type { DeveloperRole } from '@prisma/client';
import type { DeveloperPermissionKey } from '../rbac/developer-permissions';

export interface DeveloperJwtPayload {
  sub: string;
  ns: 'developer';
  developer_id: string;
  email: string;
  role: DeveloperRole;
  permissions: DeveloperPermissionKey[] | string[];
  iat?: number;
  exp?: number;
}

export interface DeveloperSessionTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export interface SafeDeveloper {
  id: string;
  email: string;
  fullName: string | null;
  role: DeveloperRole;
  permissions: string[];
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DeveloperBootstrapInput {
  email: string;
  password: string;
  role: DeveloperRole;
  fullName?: string;
  bootstrapSecret?: string;
}
