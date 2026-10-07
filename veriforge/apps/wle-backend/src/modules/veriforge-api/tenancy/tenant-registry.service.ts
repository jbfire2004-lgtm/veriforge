import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { existsSync, mkdirSync, renameSync, writeFileSync, readFileSync } from 'fs';
import { dirname, join } from 'path';
import { tmpdir } from 'os';
import {
  DEFAULT_FORGE_BRANDING,
  type TenantAuditEntry,
  type TenantPasswordReset,
  type TenantRecord,
  type TenantRegistrySnapshot,
  type TenantStorageObject,
  type TenantUserPoolUser,
} from './tenant.types';
import {
  hashTenantPassword,
  VERIFORGE_DEV_SEED_PASSWORD,
  VERIFORGE_REVIEWER_DEFAULT_PASSWORD,
  VERIFORGE_REVIEWER_EMAIL,
} from './tenant-password';

function isProd() {
  return process.env.NODE_ENV === 'production';
}

function isTest() {
  return process.env.NODE_ENV === 'test';
}

function resolveRegistryPath(): string {
  const fromEnv = process.env.VERIFORGE_TENANT_REGISTRY_PATH;
  if (isProd()) {
    if (!fromEnv) {
      throw new Error(
        'VERIFORGE_TENANT_REGISTRY_PATH is required in production (durable tenant store)',
      );
    }
    return fromEnv;
  }
  if (fromEnv) return fromEnv;
  if (isTest()) {
    return join(tmpdir(), `veriforge-tenants-test-${process.pid}.json`);
  }
  return join(process.cwd(), 'data', 'veriforge-tenants.json');
}

@Injectable()
export class TenantRegistryService implements OnModuleInit {
  private tenants = new Map<string, TenantRecord>();
  private usersByTenant = new Map<string, TenantUserPoolUser[]>();
  private auditLog: TenantAuditEntry[] = [];
  private storageObjects: TenantStorageObject[] = [];
  private resetTokens: TenantPasswordReset[] = [];
  private auditSeq = 1;
  private storageSeq = 1;
  private readonly persistPath = resolveRegistryPath();

  async onModuleInit() {
    if (this.loadPersisted()) {
      await this.ensureReviewerUser();
      return;
    }
    if (isProd() && process.env.VERIFORGE_SEED_TENANTS !== 'true') {
      throw new Error(
        'Tenant registry file is empty or missing. Provision tenants or set VERIFORGE_SEED_TENANTS=true for a one-time seed.',
      );
    }
    await this.seed();
    await this.ensureReviewerUser();
    this.persist();
  }

  private loadPersisted(): boolean {
    try {
      if (!existsSync(this.persistPath)) return false;
      const raw = JSON.parse(
        readFileSync(this.persistPath, 'utf8'),
      ) as TenantRegistrySnapshot;
      if (!Array.isArray(raw.tenants) || raw.tenants.length === 0) return false;
      this.tenants = new Map(raw.tenants.map((t) => [t.tenantId, t]));
      this.usersByTenant = new Map();
      for (const user of raw.users ?? []) {
        const pool = this.usersByTenant.get(user.tenantId) ?? [];
        pool.push(user);
        this.usersByTenant.set(user.tenantId, pool);
      }
      this.auditLog = raw.auditLog ?? [];
      this.storageObjects = raw.storageObjects ?? [];
      this.resetTokens = raw.resetTokens ?? [];
      this.auditSeq = raw.auditSeq ?? this.auditLog.length + 1;
      this.storageSeq = raw.storageSeq ?? this.storageObjects.length + 1;
      return true;
    } catch (err) {
      if (isProd()) {
        throw new Error(
          `Failed to load tenant registry from ${this.persistPath}: ${
            err instanceof Error ? err.message : String(err)
          }`,
        );
      }
      return false;
    }
  }

  private persist(): void {
    const snapshot: TenantRegistrySnapshot = {
      version: 1,
      auditSeq: this.auditSeq,
      storageSeq: this.storageSeq,
      tenants: this.listTenants(),
      users: Array.from(this.usersByTenant.values()).flat(),
      auditLog: this.auditLog,
      storageObjects: this.storageObjects,
      resetTokens: this.resetTokens,
    };
    try {
      mkdirSync(dirname(this.persistPath), { recursive: true });
      const tmp = `${this.persistPath}.${process.pid}.tmp`;
      writeFileSync(tmp, JSON.stringify(snapshot, null, 2), 'utf8');
      renameSync(tmp, this.persistPath);
    } catch (err) {
      const message = `Failed to persist tenant registry to ${this.persistPath}: ${
        err instanceof Error ? err.message : String(err)
      }`;
      if (isProd()) throw new Error(message);
      throw new Error(message);
    }
  }

  private async seed() {
    const now = new Date().toISOString();
    const seeds: TenantRecord[] = [
      {
        tenantId: 'tenant-alloy',
        slug: 'alloy',
        name: 'Alloy Works',
        status: 'active',
        dbMode: 'shared',
        dbConnectionKey: 'shared-primary',
        storageBucket: 'veriforge-tenant-alloy',
        encryptionKeyId: 'kek-alloy-v1',
        branding: {
          ...DEFAULT_FORGE_BRANDING,
          logoUrl: null,
          primaryColor: '#C62828',
          accentColor: '#424242',
          useDefaultForgeIdentity: true,
        },
        config: {
          trainingRequired: true,
          verificationStrict: true,
          complianceRetentionDays: 365,
          maxUsers: 250,
          features: ['training', 'verification', 'compliance', 'incidents'],
        },
        loadScore: 42,
        createdAt: now,
        updatedAt: now,
      },
      {
        tenantId: 'tenant-forgeco',
        slug: 'forgeco',
        name: 'ForgeCo Industries',
        status: 'active',
        dbMode: 'dedicated',
        dbConnectionKey: 'dedicated-forgeco',
        storageBucket: 'veriforge-tenant-forgeco',
        encryptionKeyId: 'kek-forgeco-v1',
        branding: {
          logoUrl: '/branding/forgeco-mark.svg',
          primaryColor: '#B71C1C',
          accentColor: '#37474F',
          useDefaultForgeIdentity: false,
        },
        config: {
          trainingRequired: true,
          verificationStrict: false,
          complianceRetentionDays: 730,
          maxUsers: 1000,
          features: [
            'training',
            'verification',
            'compliance',
            'incidents',
            'contractors',
          ],
        },
        loadScore: 78,
        createdAt: now,
        updatedAt: now,
      },
      {
        tenantId: 'tenant-steelgate',
        slug: 'steelgate',
        name: 'Steelgate Safety',
        status: 'provisioning',
        dbMode: 'shared',
        dbConnectionKey: 'shared-primary',
        storageBucket: 'veriforge-tenant-steelgate',
        encryptionKeyId: 'kek-steelgate-v1',
        branding: { ...DEFAULT_FORGE_BRANDING },
        config: {
          trainingRequired: true,
          verificationStrict: true,
          complianceRetentionDays: 180,
          maxUsers: 50,
          features: ['training', 'compliance'],
        },
        loadScore: 12,
        createdAt: now,
        updatedAt: now,
      },
    ];

    for (const tenant of seeds) {
      this.tenants.set(tenant.tenantId, tenant);
      this.usersByTenant.set(tenant.tenantId, []);
    }

    const seedPasswordHash = await hashTenantPassword(VERIFORGE_DEV_SEED_PASSWORD);
    this.addUser(
      {
        id: 101,
        tenantId: 'tenant-alloy',
        email: 'ops@alloy.works',
        name: 'Alloy Ops',
        role: 'Admin',
        passwordHash: seedPasswordHash,
        active: true,
        createdAt: now,
      },
      false,
    );
    this.addUser(
      {
        id: 102,
        tenantId: 'tenant-alloy',
        email: 'worker@alloy.works',
        name: 'Alloy Worker',
        role: 'Worker',
        passwordHash: seedPasswordHash,
        active: true,
        createdAt: now,
      },
      false,
    );
    this.addUser(
      {
        id: 201,
        tenantId: 'tenant-forgeco',
        email: 'admin@forgeco.io',
        name: 'ForgeCo Admin',
        role: 'SuperAdmin',
        passwordHash: seedPasswordHash,
        active: true,
        createdAt: now,
      },
      false,
    );
  }

  /**
   * Hosted black-box reviewer: Auditor role, no USER_WRITE / SETTINGS / ledger commit.
   * Created when missing. Password is never rotated on boot if the user already exists.
   */
  private async ensureReviewerUser() {
    const password = process.env.VERIFORGE_REVIEWER_PASSWORD;
    if (isProd() && !password) return;
    const secret = password || VERIFORGE_REVIEWER_DEFAULT_PASSWORD;
    if (this.findUserByEmail('tenant-alloy', VERIFORGE_REVIEWER_EMAIL)) return;
    if (!this.tenants.has('tenant-alloy')) return;
    const passwordHash = await hashTenantPassword(secret);
    this.addUser({
      id: 103,
      tenantId: 'tenant-alloy',
      email: VERIFORGE_REVIEWER_EMAIL,
      name: 'External Reviewer',
      role: 'Auditor',
      passwordHash,
      active: true,
      createdAt: new Date().toISOString(),
    });
  }

  listTenants(): TenantRecord[] {
    return Array.from(this.tenants.values());
  }

  getTenant(tenantId: string): TenantRecord {
    const tenant = this.tenants.get(tenantId);
    if (!tenant) throw new NotFoundException(`Tenant ${tenantId} not found`);
    return tenant;
  }

  getBySlug(slug: string): TenantRecord {
    const tenant = this.listTenants().find((item) => item.slug === slug);
    if (!tenant) throw new NotFoundException(`Tenant slug ${slug} not found`);
    return tenant;
  }

  assertActive(tenantId: string): TenantRecord {
    const tenant = this.getTenant(tenantId);
    if (tenant.status === 'suspended') {
      throw new ForbiddenException(`Tenant ${tenantId} is suspended`);
    }
    return tenant;
  }

  addUser(user: TenantUserPoolUser, persist = true) {
    const pool = this.usersByTenant.get(user.tenantId) ?? [];
    pool.push(user);
    this.usersByTenant.set(user.tenantId, pool);
    if (persist) this.persist();
    return user;
  }

  findUserByEmail(tenantId: string, email: string): TenantUserPoolUser | null {
    const pool = this.usersByTenant.get(tenantId) ?? [];
    return (
      pool.find(
        (item) => item.email.toLowerCase() === email.toLowerCase() && item.active,
      ) ?? null
    );
  }

  findUserById(tenantId: string, userId: number): TenantUserPoolUser | null {
    const pool = this.usersByTenant.get(tenantId) ?? [];
    return pool.find((item) => item.id === userId) ?? null;
  }

  listUsers(tenantId: string): TenantUserPoolUser[] {
    this.getTenant(tenantId);
    return [...(this.usersByTenant.get(tenantId) ?? [])].map((user) => ({
      ...user,
      passwordHash: '[redacted]',
    }));
  }

  setPasswordHash(tenantId: string, userId: number, passwordHash: string) {
    const pool = this.usersByTenant.get(tenantId) ?? [];
    const user = pool.find((item) => item.id === userId);
    if (!user) throw new NotFoundException(`User ${userId} not found`);
    user.passwordHash = passwordHash;
    this.persist();
    return user;
  }

  replaceResetTokens(tokens: TenantPasswordReset[]) {
    this.resetTokens = tokens;
    this.persist();
  }

  listResetTokens(): TenantPasswordReset[] {
    return this.resetTokens;
  }

  updateBranding(
    tenantId: string,
    branding: Partial<TenantRecord['branding']>,
  ): TenantRecord {
    const tenant = this.getTenant(tenantId);
    tenant.branding = {
      ...tenant.branding,
      ...branding,
      useDefaultForgeIdentity:
        branding.useDefaultForgeIdentity ??
        !(branding.primaryColor || branding.logoUrl),
    };
    tenant.updatedAt = new Date().toISOString();
    this.persist();
    return tenant;
  }

  updateConfig(
    tenantId: string,
    config: Partial<TenantRecord['config']>,
  ): TenantRecord {
    const tenant = this.getTenant(tenantId);
    tenant.config = { ...tenant.config, ...config };
    tenant.updatedAt = new Date().toISOString();
    this.persist();
    return tenant;
  }

  bumpLoad(tenantId: string, delta = 1) {
    const tenant = this.getTenant(tenantId);
    tenant.loadScore = Math.max(0, Math.min(100, tenant.loadScore + delta));
    tenant.updatedAt = new Date().toISOString();
    this.persist();
    return tenant.loadScore;
  }

  appendAudit(entry: Omit<TenantAuditEntry, 'id' | 'timestamp'>): TenantAuditEntry {
    const record: TenantAuditEntry = {
      ...entry,
      id: `taudit-${this.auditSeq++}`,
      timestamp: new Date().toISOString(),
    };
    this.auditLog.unshift(record);
    if (this.auditLog.length > 500) this.auditLog.length = 500;
    this.persist();
    return record;
  }

  listAudit(tenantId: string): TenantAuditEntry[] {
    this.getTenant(tenantId);
    return this.auditLog.filter((item) => item.tenantId === tenantId);
  }

  putObject(
    input: Omit<TenantStorageObject, 'id' | 'timestamp' | 'key' | 'bucket'> & {
      fileName: string;
    },
  ): TenantStorageObject {
    const tenant = this.getTenant(input.tenantId);
    const key = `${tenant.tenantId}/${input.category}/${Date.now()}-${input.fileName}`;
    const object: TenantStorageObject = {
      key,
      tenantId: tenant.tenantId,
      bucket: tenant.storageBucket,
      category: input.category,
      fileName: input.fileName,
      sizeBytes: input.sizeBytes,
      uploadedBy: input.uploadedBy,
      timestamp: new Date().toISOString(),
    };
    this.storageObjects.unshift(object);
    this.storageSeq += 1;
    this.persist();
    return object;
  }

  listObjects(tenantId: string, category?: TenantStorageObject['category']) {
    this.getTenant(tenantId);
    return this.storageObjects.filter(
      (item) =>
        item.tenantId === tenantId &&
        (!category || item.category === category),
    );
  }

  getObject(tenantId: string, key: string): TenantStorageObject {
    const object = this.storageObjects.find(
      (item) => item.tenantId === tenantId && item.key === key,
    );
    if (!object) throw new NotFoundException(`Object ${key} not found`);
    return object;
  }
}
