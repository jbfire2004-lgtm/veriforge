export interface AuthJwtPayload {
  user_id: string;
  company_id: string;
  email?: string;
  roles?: string[];
}

export type ModelVersionStatus = 'draft' | 'staging' | 'production' | 'retired';
