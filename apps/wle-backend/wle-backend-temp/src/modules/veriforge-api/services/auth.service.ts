import { BadRequestException, Injectable } from '@nestjs/common';
import { TenantAuthService } from '../tenancy/tenant-auth.service';

@Injectable()
export class AuthService {
  constructor(private readonly tenantAuth: TenantAuthService) {}

  login(
    email: string,
    password: string,
    tenantHint?: { tenantId?: string; tenantSlug?: string },
  ) {
    return this.tenantAuth.login({
      email,
      password,
      tenantId: tenantHint?.tenantId,
      tenantSlug: tenantHint?.tenantSlug ?? this.inferSlug(email),
    });
  }

  register(input: {
    name: string;
    email: string;
    password?: string;
    tenantId?: string;
  }) {
    if (!input.tenantId || !input.password) {
      throw new BadRequestException(
        'Tenant id and password are required to register',
      );
    }
    return this.tenantAuth.register({
      tenantId: input.tenantId,
      name: input.name,
      email: input.email,
      password: input.password,
    });
  }

  forgot(
    email: string,
    tenantHint?: { tenantId?: string; tenantSlug?: string },
  ) {
    return this.tenantAuth.requestPasswordReset({
      email,
      tenantId: tenantHint?.tenantId,
      tenantSlug: tenantHint?.tenantSlug ?? this.inferSlug(email),
    });
  }

  reset(input: { token: string; password: string }) {
    return this.tenantAuth.resetPassword(input);
  }

  private inferSlug(email: string): string {
    const domain = email.split('@')[1] ?? '';
    if (domain.includes('forgeco')) return 'forgeco';
    if (domain.includes('steelgate')) return 'steelgate';
    return 'alloy';
  }
}
