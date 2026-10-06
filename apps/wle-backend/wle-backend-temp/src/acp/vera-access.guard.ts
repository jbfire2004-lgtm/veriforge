import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  VERA_FEATURE_KEY,
  VERA_MIN_TIER_KEY,
  VERA_MODULE_KEY,
  VERA_PERMISSION_KEY,
} from './decorators/vera-access.decorator';
import { AcpAccessService } from './acp-access.service';

/**
 * Combined Vera access guard: permission + feature flag + subscription tier + hub module.
 * Apply with @UseGuards(JwtAuthGuard, VeraAccessGuard) on Hub/Core/PM controllers.
 */
@Injectable()
export class VeraAccessGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly access: AcpAccessService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const permission = this.reflector.getAllAndOverride<string | undefined>(
      VERA_PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );
    const feature = this.reflector.getAllAndOverride<string | undefined>(
      VERA_FEATURE_KEY,
      [context.getHandler(), context.getClass()],
    );
    const moduleId = this.reflector.getAllAndOverride<string | undefined>(
      VERA_MODULE_KEY,
      [context.getHandler(), context.getClass()],
    );
    const minTier = this.reflector.getAllAndOverride<string | undefined>(
      VERA_MIN_TIER_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!permission && !feature && !moduleId && !minTier) return true;

    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id as number | undefined;
    const legacyRole = request.user?.role as string | undefined;
    if (!userId) throw new ForbiddenException('Authentication required');

    if (legacyRole && this.access.isLegacyPlatformAdmin(legacyRole)) {
      return true;
    }

    const result = await this.access.check({
      userId,
      permission,
      feature,
      module: moduleId,
      minTier,
    });

    if (!result.allowed) {
      throw new ForbiddenException(result.reason ?? 'Access denied');
    }
    return true;
  }
}
