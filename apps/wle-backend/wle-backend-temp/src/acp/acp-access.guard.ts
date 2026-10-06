import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ACP_PERMISSION_KEY } from './decorators/acp-permission.decorator';
import { AcpAccessService } from './acp-access.service';

@Injectable()
export class AcpAccessGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly access: AcpAccessService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const permission = this.reflector.getAllAndOverride<string | undefined>(
      ACP_PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!permission) return true;

    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id as number | undefined;
    const legacyRole = request.user?.role as string | undefined;
    if (!userId) throw new ForbiddenException('Authentication required');

    if (legacyRole && this.access.isLegacyPlatformAdmin(legacyRole)) {
      return true;
    }

    const result = await this.access.check({ userId, permission });
    if (!result.allowed) {
      throw new ForbiddenException(result.reason ?? 'Access denied');
    }
    return true;
  }
}
