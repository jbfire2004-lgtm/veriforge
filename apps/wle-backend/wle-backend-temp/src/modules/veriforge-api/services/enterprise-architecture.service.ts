import { Injectable, NotFoundException } from '@nestjs/common';
import { NotificationService } from './notification.service';

export type ArchitectureLayerId =
  | 'presentation'
  | 'application'
  | 'api'
  | 'data'
  | 'storage'
  | 'security'
  | 'infrastructure'
  | 'observability';

export type LayerHealth = 'healthy' | 'degraded' | 'critical';
export type ServiceStatus = 'online' | 'degraded' | 'offline';
export type ForgeFlowStatus = 'idle' | 'running' | 'verified' | 'failed';

export type ArchitectureLayer = {
  id: ArchitectureLayerId;
  name: string;
  description: string;
  health: LayerHealth;
  readiness: number;
  components: string[];
  rules: string[];
  timestamp: string;
  userId: number;
  tenantId: string;
};

export type ModularService = {
  id: string;
  name: string;
  status: ServiceStatus;
  tenantAware: boolean;
  stateless: boolean;
  forgeFlow: ForgeFlowStatus;
  endpoints: string[];
  timestamp: string;
  userId: number;
  tenantId: string;
};

export type SchemaTable = {
  id: string;
  name: string;
  primaryKey: string;
  foreignKeys: string[];
  rlsPredicate: string;
  tenantScoped: boolean;
  timestamp: string;
  userId: number;
  tenantId: string;
};

export type StorageBucket = {
  id: string;
  tenantId: string;
  name: string;
  categories: string[];
  isolated: boolean;
  objectCount: number;
  timestamp: string;
  userId: number;
};

export type SecurityControl = {
  id: string;
  name: string;
  status: 'enforced' | 'partial' | 'gap';
  detail: string;
  timestamp: string;
  userId: number;
  tenantId: string;
};

export type InfraNode = {
  id: string;
  role: 'api' | 'worker' | 'lb' | 'db';
  region: string;
  loadScore: number;
  capacity: number;
  tenantPinned: string | null;
  timestamp: string;
  userId: number;
  tenantId: string;
};

export type ObservabilitySignal = {
  id: string;
  kind: 'log' | 'metric' | 'trace';
  name: string;
  value: number;
  unit: string;
  critical: boolean;
  timestamp: string;
  userId: number;
  tenantId: string;
};

export type ArchitectureAuditLog = {
  id: string;
  action: string;
  layerId: ArchitectureLayerId | 'system';
  detail: string;
  timestamp: string;
  userId: number;
  tenantId: string;
};

export type EnterpriseArchitectureAnalytics = {
  layerCount: number;
  healthyLayers: number;
  degradedLayers: number;
  criticalLayers: number;
  averageReadiness: number;
  modularServicesOnline: number;
  tenantAwareCoverage: number;
  schemaTables: number;
  rlsCoverage: number;
  storageBuckets: number;
  securityGaps: number;
  infraLoadAverage: number;
  observabilityCritical: number;
  architectureScore: number;
  timestamp: string;
  userId: number | null;
  tenantId: string;
};

@Injectable()
export class EnterpriseArchitectureService {
  private readonly defaultTenant = 'tenant-alloy';
  private logSeq = 8;
  private flowSeq = 1;

  private layers: ArchitectureLayer[] = [];
  private services: ModularService[] = [];
  private tables: SchemaTable[] = [];
  private buckets: StorageBucket[] = [];
  private security: SecurityControl[] = [];
  private nodes: InfraNode[] = [];
  private signals: ObservabilitySignal[] = [];
  private logs: ArchitectureAuditLog[] = [];

  constructor(private readonly notifications: NotificationService) {
    this.seed();
  }

  private seed() {
    const now = new Date().toISOString();
    const tenantId = this.defaultTenant;
    const userId = 1;

    this.layers = [
      {
        id: 'presentation',
        name: 'Presentation Layer',
        description: 'Web + Mobile forged-metal UI',
        health: 'healthy',
        readiness: 96,
        components: [
          'Angular geometry cards',
          'Black / steel / red tokens',
          'Metallic gradients',
          'Bold geometric typography',
          'Mobile Field Command',
        ],
        rules: ['All UI follows forged-metal identity', 'No soft dashboard chrome'],
        timestamp: now,
        userId,
        tenantId,
      },
      {
        id: 'application',
        name: 'Application Layer',
        description: 'Modular tenant-aware domain services',
        health: 'healthy',
        readiness: 94,
        components: [
          'AuthService',
          'TrainingService',
          'VerificationService',
          'ComplianceService',
          'IncidentService',
          'RiskService',
          'WorkflowService',
        ],
        rules: [
          'Services are stateless',
          'Workflows use forgeCheck / forgeStatus / forgeFlow',
          'Tenant-aware orchestration',
        ],
        timestamp: now,
        userId,
        tenantId,
      },
      {
        id: 'api',
        name: 'API Layer',
        description: 'RESTful JSON contracts with meta envelope',
        health: 'healthy',
        readiness: 97,
        components: [
          'buildSuccess / buildError',
          '{ status, data, meta }',
          'tenantId in meta',
          'RBAC + tenant guards',
        ],
        rules: ['tenantId embedded in all requests/responses', 'Stateless handlers'],
        timestamp: now,
        userId,
        tenantId,
      },
      {
        id: 'data',
        name: 'Data Layer',
        description: 'Relational schema with FK + RLS',
        health: 'degraded',
        readiness: 82,
        components: [
          'users',
          'companies',
          'trainingModules',
          'verificationChecks',
          'complianceRequirements',
          'incidents',
          'audits',
          'workflows',
          'equipment',
          'contractors',
        ],
        rules: ['Strict FK constraints', 'Row-level security by tenant_id'],
        timestamp: now,
        userId,
        tenantId,
      },
      {
        id: 'storage',
        name: 'Storage Layer',
        description: 'Tenant-specific document buckets',
        health: 'healthy',
        readiness: 91,
        components: [
          'veriforge-tenant-{slug}',
          'compliance isolation',
          'training isolation',
          'incident isolation',
        ],
        rules: ['No cross-tenant object access', 'Category-scoped prefixes'],
        timestamp: now,
        userId,
        tenantId,
      },
      {
        id: 'security',
        name: 'Security Layer',
        description: 'JWT tenancy, encryption, audit logging',
        health: 'healthy',
        readiness: 93,
        components: [
          'JWT + tenantId claim',
          'Encryption at rest',
          'TLS in transit',
          'Angular audit metadata',
        ],
        rules: ['JWT tenantId must match route/header', 'All logs include tenantId'],
        timestamp: now,
        userId,
        tenantId,
      },
      {
        id: 'infrastructure',
        name: 'Infrastructure Layer',
        description: 'Horizontal scale + tenant-aware LB',
        health: 'degraded',
        readiness: 78,
        components: [
          'API node pool',
          'Tenant-aware load balancer',
          'Auto-scaling on loadScore',
          'Pinned affinity routing',
        ],
        rules: ['Stateless compute', 'Scale on workload'],
        timestamp: now,
        userId,
        tenantId,
      },
      {
        id: 'observability',
        name: 'Observability Layer',
        description: 'Logs, metrics, traces with metallic dashboards',
        health: 'healthy',
        readiness: 88,
        components: ['Structured logs', 'Layer metrics', 'Distributed traces', 'Angular dashboards'],
        rules: ['Logs include tenantId, userId, timestamp'],
        timestamp: now,
        userId,
        tenantId,
      },
    ];

    this.services = [
      {
        id: 'svc-auth',
        name: 'AuthService',
        status: 'online',
        tenantAware: true,
        stateless: true,
        forgeFlow: 'verified',
        endpoints: ['/veriforge/auth', '/veriforge/tenants/auth'],
        timestamp: now,
        userId,
        tenantId,
      },
      {
        id: 'svc-training',
        name: 'TrainingService',
        status: 'online',
        tenantAware: true,
        stateless: true,
        forgeFlow: 'running',
        endpoints: ['/veriforge/training'],
        timestamp: now,
        userId,
        tenantId,
      },
      {
        id: 'svc-verification',
        name: 'VerificationService',
        status: 'online',
        tenantAware: true,
        stateless: true,
        forgeFlow: 'verified',
        endpoints: ['/veriforge/verification'],
        timestamp: now,
        userId,
        tenantId,
      },
      {
        id: 'svc-compliance',
        name: 'ComplianceService',
        status: 'online',
        tenantAware: true,
        stateless: true,
        forgeFlow: 'idle',
        endpoints: ['/veriforge/compliance'],
        timestamp: now,
        userId,
        tenantId,
      },
      {
        id: 'svc-incident',
        name: 'IncidentService',
        status: 'degraded',
        tenantAware: true,
        stateless: true,
        forgeFlow: 'failed',
        endpoints: ['/veriforge/incidents'],
        timestamp: now,
        userId,
        tenantId,
      },
      {
        id: 'svc-risk',
        name: 'RiskService',
        status: 'online',
        tenantAware: true,
        stateless: true,
        forgeFlow: 'running',
        endpoints: ['/veriforge/risk'],
        timestamp: now,
        userId,
        tenantId,
      },
      {
        id: 'svc-workflow',
        name: 'WorkflowService',
        status: 'online',
        tenantAware: true,
        stateless: true,
        forgeFlow: 'verified',
        endpoints: ['/veriforge/workflows'],
        timestamp: now,
        userId,
        tenantId,
      },
    ];

    this.tables = [
      {
        id: 'tbl-users',
        name: 'users',
        primaryKey: 'id',
        foreignKeys: ['companies.id'],
        rlsPredicate: "tenant_id = current_setting('app.tenant_id')",
        tenantScoped: true,
        timestamp: now,
        userId,
        tenantId,
      },
      {
        id: 'tbl-companies',
        name: 'companies',
        primaryKey: 'id',
        foreignKeys: [],
        rlsPredicate: "tenant_id = current_setting('app.tenant_id')",
        tenantScoped: true,
        timestamp: now,
        userId,
        tenantId,
      },
      {
        id: 'tbl-training',
        name: 'trainingModules',
        primaryKey: 'id',
        foreignKeys: ['users.id'],
        rlsPredicate: "tenant_id = current_setting('app.tenant_id')",
        tenantScoped: true,
        timestamp: now,
        userId,
        tenantId,
      },
      {
        id: 'tbl-verification',
        name: 'verificationChecks',
        primaryKey: 'id',
        foreignKeys: ['users.id', 'workflows.id'],
        rlsPredicate: "tenant_id = current_setting('app.tenant_id')",
        tenantScoped: true,
        timestamp: now,
        userId,
        tenantId,
      },
      {
        id: 'tbl-compliance',
        name: 'complianceRequirements',
        primaryKey: 'id',
        foreignKeys: ['companies.id'],
        rlsPredicate: "tenant_id = current_setting('app.tenant_id')",
        tenantScoped: true,
        timestamp: now,
        userId,
        tenantId,
      },
      {
        id: 'tbl-incidents',
        name: 'incidents',
        primaryKey: 'id',
        foreignKeys: ['users.id', 'companies.id'],
        rlsPredicate: "tenant_id = current_setting('app.tenant_id')",
        tenantScoped: true,
        timestamp: now,
        userId,
        tenantId,
      },
      {
        id: 'tbl-audits',
        name: 'audits',
        primaryKey: 'id',
        foreignKeys: ['users.id'],
        rlsPredicate: "tenant_id = current_setting('app.tenant_id')",
        tenantScoped: true,
        timestamp: now,
        userId,
        tenantId,
      },
      {
        id: 'tbl-workflows',
        name: 'workflows',
        primaryKey: 'id',
        foreignKeys: ['users.id'],
        rlsPredicate: "tenant_id = current_setting('app.tenant_id')",
        tenantScoped: true,
        timestamp: now,
        userId,
        tenantId,
      },
      {
        id: 'tbl-equipment',
        name: 'equipment',
        primaryKey: 'id',
        foreignKeys: ['companies.id'],
        rlsPredicate: "tenant_id = current_setting('app.tenant_id')",
        tenantScoped: true,
        timestamp: now,
        userId,
        tenantId,
      },
      {
        id: 'tbl-contractors',
        name: 'contractors',
        primaryKey: 'id',
        foreignKeys: ['companies.id', 'users.id'],
        rlsPredicate: "tenant_id = current_setting('app.tenant_id')",
        tenantScoped: true,
        timestamp: now,
        userId,
        tenantId,
      },
    ];

    this.buckets = [
      {
        id: 'bkt-1',
        tenantId: 'tenant-alloy',
        name: 'veriforge-tenant-alloy',
        categories: ['compliance', 'training', 'incidents'],
        isolated: true,
        objectCount: 1284,
        timestamp: now,
        userId,
      },
      {
        id: 'bkt-2',
        tenantId: 'tenant-forgeco',
        name: 'veriforge-tenant-forgeco',
        categories: ['compliance', 'training', 'verification', 'incidents'],
        isolated: true,
        objectCount: 642,
        timestamp: now,
        userId,
      },
      {
        id: 'bkt-3',
        tenantId: 'tenant-steelgate',
        name: 'veriforge-tenant-steelgate',
        categories: ['compliance', 'training'],
        isolated: true,
        objectCount: 91,
        timestamp: now,
        userId,
      },
    ];

    this.security = [
      {
        id: 'sec-1',
        name: 'JWT with tenantId',
        status: 'enforced',
        detail: 'Claims: sub, email, role, tenantId · iss=veriforge-saas',
        timestamp: now,
        userId,
        tenantId,
      },
      {
        id: 'sec-2',
        name: 'Encryption at rest',
        status: 'enforced',
        detail: 'Per-tenant KEK ids (kek-*-v1)',
        timestamp: now,
        userId,
        tenantId,
      },
      {
        id: 'sec-3',
        name: 'Encryption in transit',
        status: 'enforced',
        detail: 'TLS 1.2+ on all edge and service links',
        timestamp: now,
        userId,
        tenantId,
      },
      {
        id: 'sec-4',
        name: 'Audit logging',
        status: 'enforced',
        detail: 'Angular metadata: tenantId, userId, timestamp, layerId',
        timestamp: now,
        userId,
        tenantId,
      },
      {
        id: 'sec-5',
        name: 'Row-level security',
        status: 'partial',
        detail: 'RLS policies present; migration coverage at 82%',
        timestamp: now,
        userId,
        tenantId,
      },
    ];

    this.nodes = [
      {
        id: 'node-lb-1',
        role: 'lb',
        region: 'us-west',
        loadScore: 41,
        capacity: 100,
        tenantPinned: null,
        timestamp: now,
        userId,
        tenantId,
      },
      {
        id: 'node-api-1',
        role: 'api',
        region: 'us-west',
        loadScore: 62,
        capacity: 100,
        tenantPinned: 'tenant-alloy',
        timestamp: now,
        userId,
        tenantId,
      },
      {
        id: 'node-api-2',
        role: 'api',
        region: 'us-west',
        loadScore: 74,
        capacity: 100,
        tenantPinned: null,
        timestamp: now,
        userId,
        tenantId,
      },
      {
        id: 'node-worker-1',
        role: 'worker',
        region: 'us-west',
        loadScore: 55,
        capacity: 100,
        tenantPinned: null,
        timestamp: now,
        userId,
        tenantId,
      },
      {
        id: 'node-db-1',
        role: 'db',
        region: 'us-west',
        loadScore: 68,
        capacity: 100,
        tenantPinned: null,
        timestamp: now,
        userId,
        tenantId,
      },
    ];

    this.signals = [
      {
        id: 'sig-1',
        kind: 'metric',
        name: 'api.p95_ms',
        value: 186,
        unit: 'ms',
        critical: false,
        timestamp: now,
        userId,
        tenantId,
      },
      {
        id: 'sig-2',
        kind: 'metric',
        name: 'forgeFlow.fail_rate',
        value: 4.2,
        unit: '%',
        critical: false,
        timestamp: now,
        userId,
        tenantId,
      },
      {
        id: 'sig-3',
        kind: 'log',
        name: 'security.rls_denials',
        value: 12,
        unit: 'count',
        critical: false,
        timestamp: now,
        userId,
        tenantId,
      },
      {
        id: 'sig-4',
        kind: 'trace',
        name: 'workflow.forgeCheck.span',
        value: 420,
        unit: 'ms',
        critical: false,
        timestamp: now,
        userId,
        tenantId,
      },
      {
        id: 'sig-5',
        kind: 'metric',
        name: 'infra.load_average',
        value: 74,
        unit: '%',
        critical: true,
        timestamp: now,
        userId,
        tenantId,
      },
    ];

    this.logs = [
      {
        id: 'al-1',
        action: 'architecture.seed',
        layerId: 'system',
        detail: 'Enterprise architecture registry initialized',
        timestamp: now,
        userId,
        tenantId,
      },
      {
        id: 'al-2',
        action: 'security.jwt.validate',
        layerId: 'security',
        detail: 'JWT tenantId matched route tenant',
        timestamp: now,
        userId,
        tenantId,
      },
      {
        id: 'al-3',
        action: 'data.rls.check',
        layerId: 'data',
        detail: 'RLS predicate evaluated for incidents',
        timestamp: now,
        userId,
        tenantId,
      },
      {
        id: 'al-4',
        action: 'infra.scale.evaluate',
        layerId: 'infrastructure',
        detail: 'loadScore 74 · scale recommendation: +1 api',
        timestamp: now,
        userId,
        tenantId,
      },
      {
        id: 'al-5',
        action: 'workflow.forgeCheck',
        layerId: 'application',
        detail: 'VerificationService forgeFlow=verified',
        timestamp: now,
        userId,
        tenantId,
      },
      {
        id: 'al-6',
        action: 'storage.isolate',
        layerId: 'storage',
        detail: 'Bucket veriforge-tenant-alloy isolation confirmed',
        timestamp: now,
        userId,
        tenantId,
      },
      {
        id: 'al-7',
        action: 'observability.metric',
        layerId: 'observability',
        detail: 'infra.load_average critical threshold crossed',
        timestamp: now,
        userId,
        tenantId,
      },
    ];

    if (this.signals.some((s) => s.critical)) {
      this.notifications.enqueue({
        title: 'ARCHITECTURE SIGNAL CRITICAL',
        message: 'Infrastructure load average exceeded forged threshold.',
        category: 'compliance',
        forgeStatus: 'failed',
      });
    }
  }

  overview(tenantId = this.defaultTenant) {
    return {
      layers: this.layers,
      services: this.services,
      tables: this.tables,
      buckets: this.buckets.filter((b) => b.tenantId === tenantId || true),
      security: this.security,
      nodes: this.nodes,
      signals: this.signals,
      logs: this.logs,
      analytics: this.analytics(null, tenantId),
      contract: {
        responseShape: '{ status, data, meta }',
        metaFields: ['timestamp', 'userId', 'tenantId', 'forgeStatus'],
        workflowPrimitives: ['forgeCheck', 'forgeStatus', 'forgeFlow'],
        enterpriseRules: [
          'All services must be stateless',
          'All workflows must be tenant-aware',
          'All logs must include tenantId, userId, timestamp',
          'All UI must follow forged-metal identity',
        ],
      },
    };
  }

  analytics(
    userId: number | null = null,
    tenantId = this.defaultTenant,
  ): EnterpriseArchitectureAnalytics {
    const healthyLayers = this.layers.filter((l) => l.health === 'healthy').length;
    const degradedLayers = this.layers.filter((l) => l.health === 'degraded').length;
    const criticalLayers = this.layers.filter((l) => l.health === 'critical').length;
    const averageReadiness =
      this.layers.length === 0
        ? 0
        : Math.round(
            this.layers.reduce((s, l) => s + l.readiness, 0) / this.layers.length,
          );
    const modularServicesOnline = this.services.filter((s) => s.status === 'online').length;
    const tenantAwareCoverage =
      this.services.length === 0
        ? 0
        : Math.round(
            (this.services.filter((s) => s.tenantAware).length / this.services.length) *
              100,
          );
    const rlsCoverage =
      this.tables.length === 0
        ? 0
        : Math.round(
            (this.tables.filter((t) => t.tenantScoped).length / this.tables.length) * 100,
          );
    const securityGaps = this.security.filter((s) => s.status !== 'enforced').length;
    const infraLoadAverage =
      this.nodes.length === 0
        ? 0
        : Math.round(this.nodes.reduce((s, n) => s + n.loadScore, 0) / this.nodes.length);
    const observabilityCritical = this.signals.filter((s) => s.critical).length;
    const architectureScore = Math.max(
      0,
      Math.min(
        100,
        Math.round(
          averageReadiness * 0.35 +
            tenantAwareCoverage * 0.2 +
            rlsCoverage * 0.15 +
            (100 - securityGaps * 12) * 0.15 +
            (100 - Math.max(0, infraLoadAverage - 60)) * 0.1 +
            (100 - observabilityCritical * 15) * 0.05,
        ),
      ),
    );

    return {
      layerCount: this.layers.length,
      healthyLayers,
      degradedLayers,
      criticalLayers,
      averageReadiness,
      modularServicesOnline,
      tenantAwareCoverage,
      schemaTables: this.tables.length,
      rlsCoverage,
      storageBuckets: this.buckets.length,
      securityGaps,
      infraLoadAverage,
      observabilityCritical,
      architectureScore,
      timestamp: new Date().toISOString(),
      userId,
      tenantId,
    };
  }

  private addLog(
    action: string,
    layerId: ArchitectureLayerId | 'system',
    detail: string,
    userId: number,
    tenantId: string,
  ) {
    this.logs.unshift({
      id: `al-${this.logSeq++}`,
      action,
      layerId,
      detail,
      timestamp: new Date().toISOString(),
      userId,
      tenantId,
    });
  }

  getLayer(id: ArchitectureLayerId) {
    const layer = this.layers.find((l) => l.id === id);
    if (!layer) throw new NotFoundException(`Layer ${id} not found`);
    return layer;
  }

  setLayerHealth(
    id: ArchitectureLayerId,
    health: LayerHealth,
    readiness: number,
    userId: number,
    tenantId = this.defaultTenant,
  ) {
    const layer = this.getLayer(id);
    layer.health = health;
    layer.readiness = Math.max(0, Math.min(100, Math.round(readiness)));
    layer.userId = userId;
    layer.tenantId = tenantId;
    layer.timestamp = new Date().toISOString();
    this.addLog(
      'architecture.layer.health',
      id,
      `${layer.name} → ${health} (${layer.readiness}%)`,
      userId,
      tenantId,
    );
    if (health === 'critical') {
      this.notifications.enqueue({
        title: 'ARCHITECTURE LAYER CRITICAL',
        message: `${layer.name} marked critical for tenant ${tenantId}.`,
        category: 'compliance',
        forgeStatus: 'failed',
      });
    }
    return layer;
  }

  runForgeFlow(
    serviceId: string,
    userId: number,
    tenantId = this.defaultTenant,
  ) {
    const service = this.services.find((s) => s.id === serviceId);
    if (!service) throw new NotFoundException(`Service ${serviceId} not found`);
    if (!service.tenantAware || !service.stateless) {
      service.forgeFlow = 'failed';
      service.status = 'degraded';
    } else {
      service.forgeFlow = 'running';
      service.status = 'online';
      service.forgeFlow = 'verified';
    }
    service.userId = userId;
    service.tenantId = tenantId;
    service.timestamp = new Date().toISOString();
    this.addLog(
      'workflow.forgeFlow',
      'application',
      `${service.name} forgeFlow=${service.forgeFlow} (#${this.flowSeq++})`,
      userId,
      tenantId,
    );
    return service;
  }

  evaluateScaling(userId: number, tenantId = this.defaultTenant) {
    const avg =
      this.nodes.length === 0
        ? 0
        : Math.round(this.nodes.reduce((s, n) => s + n.loadScore, 0) / this.nodes.length);
    const recommendation =
      avg >= 70 ? 'scale_out_api' : avg <= 35 ? 'scale_in_api' : 'hold';
    if (recommendation === 'scale_out_api') {
      const id = `node-api-${this.nodes.filter((n) => n.role === 'api').length + 1}`;
      this.nodes.push({
        id,
        role: 'api',
        region: 'us-west',
        loadScore: 20,
        capacity: 100,
        tenantPinned: null,
        timestamp: new Date().toISOString(),
        userId,
        tenantId,
      });
      this.layers = this.layers.map((l) =>
        l.id === 'infrastructure'
          ? {
              ...l,
              readiness: Math.min(100, l.readiness + 6),
              health: l.readiness + 6 >= 85 ? 'healthy' : l.health,
              timestamp: new Date().toISOString(),
              userId,
              tenantId,
            }
          : l,
      );
    }
    this.addLog(
      'infra.scale.evaluate',
      'infrastructure',
      `loadScore ${avg} · recommendation ${recommendation}`,
      userId,
      tenantId,
    );
    return {
      loadAverage: avg,
      recommendation,
      nodes: this.nodes,
      analytics: this.analytics(userId, tenantId),
    };
  }

  verifyRls(userId: number, tenantId = this.defaultTenant) {
    const coverage =
      this.tables.length === 0
        ? 0
        : Math.round(
            (this.tables.filter((t) => t.tenantScoped).length / this.tables.length) * 100,
          );
    this.layers = this.layers.map((l) =>
      l.id === 'data'
        ? {
            ...l,
            readiness: coverage,
            health: coverage >= 95 ? 'healthy' : coverage >= 80 ? 'degraded' : 'critical',
            timestamp: new Date().toISOString(),
            userId,
            tenantId,
          }
        : l,
    );
    this.addLog(
      'data.rls.verify',
      'data',
      `RLS coverage ${coverage}% across ${this.tables.length} tables`,
      userId,
      tenantId,
    );
    return { coverage, tables: this.tables, analytics: this.analytics(userId, tenantId) };
  }

  appendObservability(
    input: {
      kind: 'log' | 'metric' | 'trace';
      name: string;
      value: number;
      unit: string;
      critical?: boolean;
    },
    userId: number,
    tenantId = this.defaultTenant,
  ) {
    const signal: ObservabilitySignal = {
      id: `sig-${Date.now()}`,
      kind: input.kind,
      name: input.name,
      value: input.value,
      unit: input.unit,
      critical: Boolean(input.critical),
      timestamp: new Date().toISOString(),
      userId,
      tenantId,
    };
    this.signals.unshift(signal);
    this.addLog(
      'observability.signal',
      'observability',
      `${signal.kind}:${signal.name}=${signal.value}${signal.unit}`,
      userId,
      tenantId,
    );
    if (signal.critical) {
      this.notifications.enqueue({
        title: 'ARCHITECTURE SIGNAL CRITICAL',
        message: `${signal.name} critical for tenant ${tenantId}.`,
        category: 'compliance',
        forgeStatus: 'failed',
      });
    }
    return signal;
  }
}
