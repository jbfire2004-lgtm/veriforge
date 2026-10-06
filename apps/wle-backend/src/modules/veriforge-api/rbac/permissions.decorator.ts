import { SetMetadata } from '@nestjs/common';
import type { VeriForgePermission } from './permissions';

export const VERIFORGE_PERMISSIONS_KEY = 'veriforge:permissions';

export const VeriForgePermissions = (...permissions: VeriForgePermission[]) =>
  SetMetadata(VERIFORGE_PERMISSIONS_KEY, permissions);
