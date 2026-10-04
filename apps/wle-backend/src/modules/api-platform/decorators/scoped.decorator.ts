import { SetMetadata } from '@nestjs/common';

export const COMPANY_SCOPE_KEY = 'vera:scope:company';
export const PROJECT_SCOPE_KEY = 'vera:scope:project';

export const CompanyScoped = (paramName = 'companyId') =>
  SetMetadata(COMPANY_SCOPE_KEY, paramName);

export const ProjectScoped = (paramName = 'projectId') =>
  SetMetadata(PROJECT_SCOPE_KEY, paramName);
