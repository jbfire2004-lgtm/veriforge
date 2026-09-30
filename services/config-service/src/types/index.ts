export interface AuthJwtPayload {
  user_id: string;
  company_id: string;
  email?: string;
  roles?: string[];
}

export interface ConfigEntryDto {
  id: string;
  namespace: string;
  key: string;
  value: unknown;
  version: number;
  companyId: string | null;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ConfigNamespaceDto {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}
