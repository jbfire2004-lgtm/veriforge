export type AuthJwtPayload = {
  sub: string;
  user_id: string;
  company_id: string;
  email?: string;
  roles?: string[];
};

export type PermissionRecord = {
  id: string;
  name: string;
  resource: string;
  action: string;
};

export type EvaluationInput = {
  userId: string;
  companyId: string;
  action: string;
  resource: string;
};

export type EvaluationResult = {
  allow: boolean;
  reason: string;
  matchedPermission?: string;
  matchedRole?: string;
};
