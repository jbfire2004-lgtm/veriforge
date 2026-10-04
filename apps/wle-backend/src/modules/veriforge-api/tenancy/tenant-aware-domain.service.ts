import { Injectable, OnModuleInit } from '@nestjs/common';
import { TenantRegistryService } from './tenant-registry.service';
import { TenantIsolationService } from './tenant-isolation.service';

export type TenantScopedRecord = {
  id: string;
  tenantId: string;
  title: string;
  status: string;
  updatedAt: string;
  meta: Record<string, unknown>;
};

/**
 * Tenant-aware domain facades for training, verification, and compliance.
 * Enforces shared-DB tenantId column isolation (Option A) with FK checks.
 */
@Injectable()
export class TenantAwareDomainService implements OnModuleInit {
  private training = new Map<string, TenantScopedRecord[]>();
  private verification = new Map<string, TenantScopedRecord[]>();
  private compliance = new Map<string, TenantScopedRecord[]>();

  constructor(
    private readonly registry: TenantRegistryService,
    private readonly isolation: TenantIsolationService,
  ) {}

  onModuleInit() {
    this.seed('tenant-alloy');
    this.seed('tenant-forgeco');
  }

  private seed(tenantId: string) {
    const now = new Date().toISOString();
    this.training.set(tenantId, [
      this.isolation.withTenantFk(tenantId, {
        id: `${tenantId}-trn-1`,
        title: 'Lockout-Tagout',
        status: 'assigned',
        updatedAt: now,
        meta: { progress: 40 },
      }),
    ]);
    this.verification.set(tenantId, [
      this.isolation.withTenantFk(tenantId, {
        id: `${tenantId}-ver-1`,
        title: 'forgeCheck · Site Entry',
        status: 'pending',
        updatedAt: now,
        meta: { forgeStatus: 'pending' },
      }),
    ]);
    this.compliance.set(tenantId, [
      this.isolation.withTenantFk(tenantId, {
        id: `${tenantId}-cmp-1`,
        title: 'OSHA 30 Card',
        status: 'valid',
        updatedAt: now,
        meta: { score: 88 },
      }),
    ]);
  }

  dashboard(tenantId: string) {
    const tenant = this.registry.assertActive(tenantId);
    const training = this.listTraining(tenantId);
    const verification = this.listVerification(tenantId);
    const compliance = this.listCompliance(tenantId);
    return {
      tenantId,
      name: tenant.name,
      branding: tenant.branding,
      config: tenant.config,
      db: this.isolation.dedicatedConnection(tenantId),
      metrics: {
        trainingModules: training.length,
        verificationChecks: verification.length,
        complianceItems: compliance.length,
        loadScore: tenant.loadScore,
      },
      training,
      verification,
      compliance,
    };
  }

  listTraining(tenantId: string) {
    return this.isolation.filterRows(
      tenantId,
      this.training.get(tenantId) ?? [],
    );
  }

  listVerification(tenantId: string) {
    return this.isolation.filterRows(
      tenantId,
      this.verification.get(tenantId) ?? [],
    );
  }

  listCompliance(tenantId: string) {
    return this.isolation.filterRows(
      tenantId,
      this.compliance.get(tenantId) ?? [],
    );
  }

  createTraining(
    tenantId: string,
    input: { title: string; userId?: number | null },
  ) {
    const row = this.isolation.withTenantFk(tenantId, {
      id: `${tenantId}-trn-${Date.now()}`,
      title: input.title,
      status: 'assigned',
      updatedAt: new Date().toISOString(),
      meta: { progress: 0 },
    });
    const list = this.training.get(tenantId) ?? [];
    list.unshift(row);
    this.training.set(tenantId, list);
    this.registry.appendAudit({
      tenantId,
      userId: input.userId ?? null,
      action: 'training.create',
      resource: row.id,
      details: { title: row.title },
    });
    return row;
  }

  runForgeCheck(tenantId: string, userId?: number | null) {
    const list = this.verification.get(tenantId) ?? [];
    const row = this.isolation.withTenantFk(tenantId, {
      id: `${tenantId}-ver-${Date.now()}`,
      title: 'forgeCheck · Runtime',
      status: 'Pass',
      updatedAt: new Date().toISOString(),
      meta: { forgeStatus: 'verified' },
    });
    list.unshift(row);
    this.verification.set(tenantId, list);
    this.registry.appendAudit({
      tenantId,
      userId: userId ?? null,
      action: 'verification.forgeCheck',
      resource: row.id,
      details: { status: row.status },
    });
    this.registry.bumpLoad(tenantId, 2);
    return row;
  }

  upsertCompliance(
    tenantId: string,
    input: { title: string; status?: string; userId?: number | null },
  ) {
    const row = this.isolation.withTenantFk(tenantId, {
      id: `${tenantId}-cmp-${Date.now()}`,
      title: input.title,
      status: input.status ?? 'pending',
      updatedAt: new Date().toISOString(),
      meta: { score: input.status === 'valid' ? 100 : 50 },
    });
    const list = this.compliance.get(tenantId) ?? [];
    list.unshift(row);
    this.compliance.set(tenantId, list);
    this.registry.appendAudit({
      tenantId,
      userId: input.userId ?? null,
      action: 'compliance.upsert',
      resource: row.id,
      details: { title: row.title, status: row.status },
    });
    return row;
  }
}
