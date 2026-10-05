import type { PermissionKey } from '../security.types';
export declare const PERMISSION_KEY = "vera_permission";
export declare const RequirePermission: (permission: PermissionKey) => import("@nestjs/common").CustomDecorator<string>;
