export const ALLOWED_ROLES = [
  'worker',
  'supervisor',
  'admin',
  'company_admin',
  'project_manager',
  'super_admin',
] as const;

export type Role = (typeof ALLOWED_ROLES)[number];

export type JwtPayload = {
  sub: string;
  user_id: string;
  company_id: string;
  email: string;
  roles: string[];
  iat?: number;
  exp?: number;
};

export type AuthUser = {
  id: string;
  companyId: string;
  email: string;
  firstName: string;
  lastName: string;
  status: string;
  roles: string[];
};

export type SessionTokens = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
};

export type SafeUser = Omit<AuthUser, never> & {
  createdAt: Date;
  updatedAt: Date;
};
