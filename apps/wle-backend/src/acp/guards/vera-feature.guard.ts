import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { VERA_FEATURE_KEY } from '../decorators/vera-access.decorator';
import { AcpAccessService } from '../acp-access.service';

/** Middleware: checkFeatureFlag — requires @RequireFeature('key'). */
@Injectable()
export class VeraFeatureGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly access: AcpAccessService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const feature = this.reflector.getAllAndOverride<string | undefined>(
      VERA_FEATURE_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!feature) return true;

    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id as number | undefined;
    const legacyRole = request.user?.role as string | undefined;
    if (!userId) throw new ForbiddenException('Authentication required');
    if (legacyRole && this.access.isLegacyPlatformAdmin(legacyRole))
      return true;

    const result = await this.access.check({ userId, feature });
    if (!result.allowed) {
      throw new ForbiddenException(result.reason ?? 'Feature not enabled');
    }
    return true;
  }
}
