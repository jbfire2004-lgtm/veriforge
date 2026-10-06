import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSION_KEY } from '../decorators/require-permission.decorator';
import type { PermissionKey, SecurityActor } from '../security.types';
import { PermissionService } from '../permission.service';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly permissions: PermissionService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const permission = this.reflector.getAllAndOverride<PermissionKey>(
      PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!permission) return true;

    const request = context
      .switchToHttp()
      .getRequest<{ user?: SecurityActor }>();
    const actor = request.user;
    if (!actor?.role) {
      throw new UnauthorizedException('Authentication required');
    }

    this.permissions.assertPermission(actor, permission);
    return true;
  }
}
