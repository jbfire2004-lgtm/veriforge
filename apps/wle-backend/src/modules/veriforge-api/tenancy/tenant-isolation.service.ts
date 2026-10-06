import { ForbiddenException, Injectable } from '@nestjs/common';
import { TenantRegistryService } from './tenant-registry.service';

/**
 * Isolation helpers for Option A (shared DB + tenantId column)
 * and Option B (dedicated DB connection key per tenant).
 */
@Injectable()
export class TenantIsolationService {
  constructor(private readonly registry: TenantRegistryService) {}

  assertSameTenant(actorTenantId: string, resourceTenantId: string) {
    if (actorTenantId !== resourceTenantId) {
      throw new ForbiddenException({
        code: 'TENANT_ISOLATION_VIOLATION',
        message: 'Cross-tenant access denied',
        actorTenantId,
        resourceTenantId,
      });
    }
  }

  /** Option A: shared DB row filter */
  sharedWhere(tenantId: string) {
    this.registry.assertActive(tenantId);
    return { tenantId };
  }

  /** Option B: dedicated connection routing key */
  dedicatedConnection(tenantId: string) {
    const tenant = this.registry.assertActive(tenantId);
    return {
      mode: tenant.dbMode,
      connectionKey: tenant.dbConnectionKey,
      encryptionKeyId: tenant.encryptionKeyId,
    };
  }

  withTenantFk<T extends Record<string, unknown>>(
    tenantId: string,
    row: T,
  ): T & { tenantId: string } {
    this.registry.assertActive(tenantId);
    if ('tenantId' in row && row.tenantId && row.tenantId !== tenantId) {
      throw new ForbiddenException('FK tenantId mismatch');
    }
    return { ...row, tenantId };
  }

  filterRows<T extends { tenantId: string }>(
    tenantId: string,
    rows: T[],
  ): T[] {
    this.assertSameTenant(tenantId, tenantId);
    return rows.filter((row) => row.tenantId === tenantId);
  }
}
