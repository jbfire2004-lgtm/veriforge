import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { VERA_MIN_TIER_KEY } from '../decorators/vera-access.decorator';
import { AcpAccessService } from '../acp-access.service';

/** Middleware: checkSubscriptionTier — requires @RequireMinTier('enterprise'). */
@Injectable()
export class VeraTierGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly access: AcpAccessService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const minTier = this.reflector.getAllAndOverride<string | undefined>(
      VERA_MIN_TIER_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!minTier) return true;

    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id as number | undefined;
    const legacyRole = request.user?.role as string | undefined;
    if (!userId) throw new ForbiddenException('Authentication required');
    if (legacyRole && this.access.isLegacyPlatformAdmin(legacyRole))
      return true;

    const result = await this.access.check({ userId, minTier });
    if (!result.allowed) {
      throw new ForbiddenException(
        result.reason ?? 'Subscription tier required',
      );
    }
    return true;
  }
}
