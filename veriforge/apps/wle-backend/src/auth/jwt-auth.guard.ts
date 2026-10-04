import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { phase1RequestStore } from '../common/monitoring/phase1-request-context.storage';
import {
  isVeraPmDevOpen,
  veraPmDevOpenActor,
} from '../config/pm-dev-open';
import { IS_PUBLIC_KEY } from './public.decorator';

type JwtUser = { id: number; email?: string; role?: string };

function isVeriForgeApiPath(url?: string): boolean {
  if (!url) return false;
  const path = url.split('?')[0];
  return path === '/veriforge' || path.startsWith('/veriforge/');
}

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  override handleRequest<TUser = JwtUser>(
    err: unknown,
    user: unknown,
    info: unknown,
    context: ExecutionContext,
    status?: unknown,
  ): TUser {
    const u = super.handleRequest(err, user, info, context, status) as TUser;
    if (u && typeof u === 'object' && 'id' in (u as object)) {
      const store = phase1RequestStore.getStore();
      if (store) {
        const ju = u as unknown as JwtUser;
        if (typeof ju.id === 'number') store.userId = ju.id;
      }
    }
    return u;
  }

  override canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{
      originalUrl?: string;
      url?: string;
      headers?: { authorization?: string };
      user?: unknown;
    }>();
    if (isVeriForgeApiPath(request.originalUrl || request.url)) {
      return true;
    }

    // Local PM / Inspections testing without a Bearer token.
    if (isVeraPmDevOpen()) {
      const auth = request.headers?.authorization;
      if (!auth || !auth.startsWith('Bearer ')) {
        request.user = veraPmDevOpenActor();
        return true;
      }
    }

    return super.canActivate(context);
  }
}
