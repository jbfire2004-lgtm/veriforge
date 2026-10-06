import { SetMetadata } from '@nestjs/common';
import type { PermissionKey } from '../security.types';

export const PERMISSION_KEY = 'vera_permission';

export const RequirePermission = (permission: PermissionKey) =>
  SetMetadata(PERMISSION_KEY, permission);
