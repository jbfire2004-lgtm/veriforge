import {
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { VeriForgeTenantGuard } from './veriforge-tenant.guard';
import type { TenantAuthService } from './tenant-auth.service';

describe('VeriForgeTenantGuard (fail-closed JWT)', () => {
  const claims = {
    sub: 9,
    email: 'a@example.com',
    role: 'Admin',
    tenantId: 'tenant-a',
    iss: 'veriforge-saas',
    aud: 'veriforge-tenants',
    iat: 1,
    exp: Math.floor(Date.now() / 1000) + 3600,
  };

  function createGuard(verifyImpl?: (token: string) => typeof claims) {
    const tenantAuth = {
      verifyAccessToken:
        verifyImpl ??
        jest.fn(() => claims),
    } as unknown as TenantAuthService;
    return new VeriForgeTenantGuard(tenantAuth);
  }

  function ctx(req: Record<string, unknown>) {
    return {
      switchToHttp: () => ({
        getRequest: () => req,
      }),
    } as any;
  }

  it('rejects missing Bearer token even with tenant header', () => {
    const guard = createGuard();
    expect(() =>
      guard.canActivate(
        ctx({
          headers: { 'x-veriforge-tenant': 'tenant-a' },
          params: { tenantId: 'tenant-a' },
        }),
      ),
    ).toThrow(UnauthorizedException);
  });

  it('rejects route tenant mismatch', () => {
    const guard = createGuard();
    expect(() =>
      guard.canActivate(
        ctx({
          headers: { authorization: 'Bearer aaa.bbb.ccc' },
          params: { tenantId: 'tenant-b' },
        }),
      ),
    ).toThrow(ForbiddenException);
  });

  it('rejects tenant header that disagrees with JWT', () => {
    const guard = createGuard();
    expect(() =>
      guard.canActivate(
        ctx({
          headers: {
            authorization: 'Bearer aaa.bbb.ccc',
            'x-veriforge-tenant': 'tenant-other',
          },
          params: {},
        }),
      ),
    ).toThrow(ForbiddenException);
  });

  it('accepts matching JWT tenant and populates request', () => {
    const guard = createGuard();
    const req: Record<string, unknown> = {
      headers: { authorization: 'Bearer aaa.bbb.ccc' },
      params: { tenantId: 'tenant-a' },
    };
    expect(guard.canActivate(ctx(req))).toBe(true);
    expect(req.veriforgeTenantId).toBe('tenant-a');
    expect((req.user as { role: string }).role).toBe('Admin');
  });
});
