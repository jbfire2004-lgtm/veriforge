import { SetMetadata } from '@nestjs/common';

export const TENANT_SCOPE_PARAM_KEY = 'vera_tenant_scope_param';

/** Names the route param/query/body field holding companyId for tenant guard. */
export const TenantScoped = (paramName = 'companyId') =>
  SetMetadata(TENANT_SCOPE_PARAM_KEY, paramName);
