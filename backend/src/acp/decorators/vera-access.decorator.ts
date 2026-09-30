import { SetMetadata } from '@nestjs/common';

export const VERA_PERMISSION_KEY = 'vera_permission';
export const VERA_FEATURE_KEY = 'vera_feature';
export const VERA_MODULE_KEY = 'vera_module';
export const VERA_MIN_TIER_KEY = 'vera_min_tier';

export const RequirePermission = (permission: string) =>
  SetMetadata(VERA_PERMISSION_KEY, permission);

export const RequireFeature = (feature: string) =>
  SetMetadata(VERA_FEATURE_KEY, feature);

export const RequireModule = (moduleId: string) =>
  SetMetadata(VERA_MODULE_KEY, moduleId);

export const RequireMinTier = (tierKey: string) =>
  SetMetadata(VERA_MIN_TIER_KEY, tierKey);

export const VERA_ROLE_KEY = 'vera_role';

export const RequireRoles = (...roles: string[]) =>
  SetMetadata(VERA_ROLE_KEY, roles);
