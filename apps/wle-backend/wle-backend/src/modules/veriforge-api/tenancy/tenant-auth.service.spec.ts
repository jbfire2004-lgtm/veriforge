import {
  UnauthorizedException,
} from '@nestjs/common';
import { join } from 'path';
import { tmpdir } from 'os';
import { TenantAuthService } from './tenant-auth.service';
import { TenantRegistryService } from './tenant-registry.service';
import { VERIFORGE_DEV_SEED_PASSWORD } from './tenant-password';

describe('TenantAuthService.login', () => {
  let registry: TenantRegistryService;
  let auth: TenantAuthService;

  beforeAll(async () => {
    process.env.VERIFORGE_TENANT_REGISTRY_PATH = join(
      tmpdir(),
      `veriforge-tenants-auth-${process.pid}-${Date.now()}.json`,
    );
    registry = new TenantRegistryService();
    await registry.onModuleInit();
    auth = new TenantAuthService(registry);
  });

  it('rejects wrong or truncated-hash style passwords', async () => {
    await expect(
      auth.login({
        email: 'ops@alloy.works',
        password: 'forge',
        tenantSlug: 'alloy',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('issues a signed JWT for the bcrypt seed password', async () => {
    const result = await auth.login({
      email: 'ops@alloy.works',
      password: VERIFORGE_DEV_SEED_PASSWORD,
      tenantSlug: 'alloy',
    });
    expect(result.accessToken.startsWith('forge-access-')).toBe(false);
    expect(result.accessToken.split('.').length).toBe(3);
    expect(result.user.tenantId).toBe('tenant-alloy');
    const claims = auth.verifyAccessToken(result.accessToken);
    expect(claims.tenantId).toBe('tenant-alloy');
    expect(claims.role).toBe('Admin');
  });

  it('issues a hashed reset token and rotates the password', async () => {
    const forgot = await auth.requestPasswordReset({
      email: 'ops@alloy.works',
      tenantSlug: 'alloy',
    });
    expect(forgot.resetTokenIssued).toBe(true);
    expect('resetToken' in forgot && forgot.resetToken).toBeTruthy();
    await auth.resetPassword({
      token: (forgot as { resetToken: string }).resetToken,
      password: 'N3w!Passw0rd!!',
    });
    await expect(
      auth.login({
        email: 'ops@alloy.works',
        password: VERIFORGE_DEV_SEED_PASSWORD,
        tenantSlug: 'alloy',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    const after = await auth.login({
      email: 'ops@alloy.works',
      password: 'N3w!Passw0rd!!',
      tenantSlug: 'alloy',
    });
    expect(after.user.email).toBe('ops@alloy.works');
  });

  it('signs in the hosted Auditor reviewer without ledger-write rights', async () => {
    const { VERIFORGE_REVIEWER_DEFAULT_PASSWORD, VERIFORGE_REVIEWER_EMAIL } =
      await import('./tenant-password');
    const { VERIFORGE_PERMISSIONS, VERIFORGE_ROLE_PERMISSIONS } = await import(
      '../rbac/permissions'
    );
    const result = await auth.login({
      email: VERIFORGE_REVIEWER_EMAIL,
      password: VERIFORGE_REVIEWER_DEFAULT_PASSWORD,
      tenantSlug: 'alloy',
    });
    expect(result.user.role).toBe('Auditor');
    expect(result.user.email).toBe(VERIFORGE_REVIEWER_EMAIL);
    expect(VERIFORGE_ROLE_PERMISSIONS.Auditor).toContain(
      VERIFORGE_PERMISSIONS.AUDIT_VIEW,
    );
    expect(VERIFORGE_ROLE_PERMISSIONS.Auditor).not.toContain(
      VERIFORGE_PERMISSIONS.AUDIT_WRITE,
    );
    expect(VERIFORGE_ROLE_PERMISSIONS.Auditor).not.toContain(
      VERIFORGE_PERMISSIONS.USER_WRITE,
    );
  });

  it('does not enumerate unknown emails', async () => {
    const forgot = await auth.requestPasswordReset({
      email: 'nobody@alloy.works',
      tenantSlug: 'alloy',
    });
    expect(forgot.resetTokenIssued).toBe(true);
    expect(forgot.resetToken).toBeUndefined();
  });
});
