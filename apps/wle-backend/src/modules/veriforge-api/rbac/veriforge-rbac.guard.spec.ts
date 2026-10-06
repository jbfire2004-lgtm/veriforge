import {
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { VeriForgeRbacGuard } from './veriforge-rbac.guard';
import {
  VERIFORGE_PERMISSIONS,
  type VeriForgePermission,
} from './permissions';

describe('VeriForgeRbacGuard (JWT-only)', () => {
  function createGuard(required: VeriForgePermission[] | undefined) {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(required),
    } as unknown as Reflector;
    return new VeriForgeRbacGuard(reflector);
  }

  function ctx(req: Record<string, unknown>) {
    return {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => req,
      }),
    } as any;
  }

  it('rejects spoofed x-veriforge-role header', () => {
    const guard = createGuard([VERIFORGE_PERMISSIONS.AUDIT_VIEW]);
    expect(() =>
      guard.canActivate(
        ctx({
          headers: { 'x-veriforge-role': 'SuperAdmin' },
          user: { role: 'Worker' },
        }),
      ),
    ).toThrow(ForbiddenException);
  });

  it('uses JWT user role only when no permissions required', () => {
    const guard = createGuard([]);
    expect(guard.canActivate(ctx({ headers: {}, user: { role: 'Admin' } }))).toBe(
      true,
    );
  });

  it('requires authenticated user when permissions required', () => {
    const guard = createGuard([VERIFORGE_PERMISSIONS.AUDIT_VIEW]);
    expect(() => guard.canActivate(ctx({ headers: {} }))).toThrow(
      UnauthorizedException,
    );
  });

  it('grants SuperAdmin from JWT role claim', () => {
    const guard = createGuard([VERIFORGE_PERMISSIONS.AUDIT_VIEW]);
    expect(
      guard.canActivate(
        ctx({ headers: {}, user: { role: 'SuperAdmin' } }),
      ),
    ).toBe(true);
  });

  it('requires Bearer JWT when TenantAuthService is wired', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue([
        VERIFORGE_PERMISSIONS.AUDIT_VIEW,
      ]),
    } as unknown as Reflector;
    const tenantAuth = {
      verifyAccessToken: jest.fn(() => {
        throw new UnauthorizedException('Invalid tenant token');
      }),
    };
    const guard = new VeriForgeRbacGuard(reflector, tenantAuth as any);
    expect(() =>
      guard.canActivate(
        ctx({
          headers: { authorization: 'Bearer bad.token' },
          user: { role: 'SuperAdmin' },
        }),
      ),
    ).toThrow(UnauthorizedException);
  });

  it('binds tenant JWT claims when TenantAuthService is wired', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue([
        VERIFORGE_PERMISSIONS.AUDIT_VIEW,
      ]),
    } as unknown as Reflector;
    const tenantAuth = {
      verifyAccessToken: jest.fn(() => ({
        sub: 101,
        email: 'ops@alloy.works',
        role: 'Admin',
        tenantId: 'tenant-alloy',
      })),
    };
    const guard = new VeriForgeRbacGuard(reflector, tenantAuth as any);
    const req: Record<string, unknown> = {
      headers: { authorization: 'Bearer good.token' },
      params: {},
    };
    expect(guard.canActivate(ctx(req))).toBe(true);
    expect(req.veriforgeTenantId).toBe('tenant-alloy');
    expect((req.user as { role: string }).role).toBe('Admin');
  });

  it('denies Auditor ledger write while allowing audit view', () => {
    const view = createGuard([VERIFORGE_PERMISSIONS.AUDIT_VIEW]);
    expect(
      view.canActivate(ctx({ headers: {}, user: { role: 'Auditor' } })),
    ).toBe(true);
    const write = createGuard([VERIFORGE_PERMISSIONS.AUDIT_WRITE]);
    expect(() =>
      write.canActivate(ctx({ headers: {}, user: { role: 'Auditor' } })),
    ).toThrow(ForbiddenException);
  });
});
