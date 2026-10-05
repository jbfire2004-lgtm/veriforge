import { UnauthorizedException } from '@nestjs/common';
import {
  requireTenantId,
  resolveTenantId,
  type VeriForgeRequest,
} from './veriforge-request.util';

describe('resolveTenantId (JWT-only)', () => {
  it('uses JWT tenant and ignores headers and body', () => {
    const req = {
      veriforgeTenantId: 'tenant-jwt',
      user: { tenantId: 'tenant-jwt' },
      headers: { 'x-veriforge-tenant': 'tenant-spoof' },
    } as unknown as VeriForgeRequest;

    expect(resolveTenantId(req, { tenantId: 'tenant-body' })).toBe(
      'tenant-jwt',
    );
    expect(resolveTenantId(req, undefined, 'tenant-other')).toBe('tenant-jwt');
  });

  it('does not invent tenant from companyId or headers', () => {
    const req = {
      headers: { 'x-veriforge-tenant': 'tenant-header' },
      user: { companyId: 42 },
    } as unknown as VeriForgeRequest;
    expect(resolveTenantId(req, { tenantId: 'tenant-body' })).toBeNull();
    expect(() => requireTenantId(req)).toThrow(UnauthorizedException);
  });
});
