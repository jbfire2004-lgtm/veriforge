import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { VERA_MODULE_KEY } from '../decorators/vera-access.decorator';
import { AcpAccessService } from '../acp-access.service';

/** Middleware: combined module gate (permission + feature + tier from HUB_MODULE_GATES). */
@Injectable()
export class VeraModuleGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly access: AcpAccessService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const moduleId = this.reflector.getAllAndOverride<string | undefined>(
      VERA_MODULE_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!moduleId) return true;

    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id as number | undefined;
    const legacyRole = request.user?.role as string | undefined;
    if (!userId) throw new ForbiddenException('Authentication required');
    if (legacyRole && this.access.isLegacyPlatformAdmin(legacyRole))
      return true;

    const result = await this.access.check({ userId, module: moduleId });
    if (!result.allowed) {
      throw new ForbiddenException(result.reason ?? 'Module not available');
    }
    return true;
  }
}
