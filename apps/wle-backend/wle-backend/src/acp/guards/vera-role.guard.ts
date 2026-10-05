import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';
import { VERA_ROLE_KEY } from '../decorators/vera-access.decorator';

/** Middleware: checkRole — requires @RequireRoles('COMPANY_ADMIN', ...). */
@Injectable()
export class VeraRoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<UserRole[] | undefined>(
      VERA_ROLE_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!required?.length) return true;

    const request = context.switchToHttp().getRequest();
    const role = request.user?.role as UserRole | undefined;
    if (!role) throw new ForbiddenException('Authentication required');

    const allowed =
      required.includes(role) ||
      role === UserRole.SUPER_ADMIN ||
      role === UserRole.ADMIN;

    if (!allowed) {
      throw new ForbiddenException(`Role ${required.join(' or ')} required`);
    }
    return true;
  }
}
