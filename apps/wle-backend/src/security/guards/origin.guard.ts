import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

/**
 * CSRF mitigation for cookie/credentials requests without Bearer token.
 * Requires matching Origin or Referer host when ENABLE_ORIGIN_GUARD=1.
 * Bearer-authenticated API calls are exempt (not vulnerable to classic CSRF).
 */
@Injectable()
export class OriginGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const isProduction = process.env.NODE_ENV === 'production';
    const enabled = process.env.ENABLE_ORIGIN_GUARD === '1' || isProduction;
    if (!enabled) return true;

    const request = context.switchToHttp().getRequest<{
      method?: string;
      headers?: Record<string, string | string[] | undefined>;
    }>();

    if (request.method === 'GET' || request.method === 'HEAD') return true;

    const auth = request.headers?.authorization;
    if (typeof auth === 'string' && auth.startsWith('Bearer ')) return true;

    const allowed = (process.env.CORS_ORIGIN ?? '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (!allowed.length) {
      if (isProduction) {
        throw new ForbiddenException('Origin guard requires CORS_ORIGIN');
      }
      return true;
    }
    if (isProduction && allowed.includes('*')) {
      throw new ForbiddenException('Wildcard CORS_ORIGIN is not allowed');
    }

    const origin = String(request.headers?.origin ?? '');
    const referer = String(request.headers?.referer ?? '');
    const ok = allowed.some(
      (base) => origin.startsWith(base) || referer.startsWith(base),
    );
    if (!ok) {
      throw new ForbiddenException('Origin not allowed');
    }
    return true;
  }
}
