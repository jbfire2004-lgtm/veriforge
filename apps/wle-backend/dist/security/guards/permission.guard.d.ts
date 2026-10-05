import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionService } from '../permission.service';
export declare class PermissionGuard implements CanActivate {
    private readonly reflector;
    private readonly permissions;
    constructor(reflector: Reflector, permissions: PermissionService);
    canActivate(context: ExecutionContext): boolean;
}
