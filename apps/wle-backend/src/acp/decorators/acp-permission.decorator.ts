import { SetMetadata } from '@nestjs/common';

export const ACP_PERMISSION_KEY = 'acp_permission';

export const RequireAcpPermission = (permission: string) =>
  SetMetadata(ACP_PERMISSION_KEY, permission);
