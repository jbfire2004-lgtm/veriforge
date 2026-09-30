"use client";

import * as React from "react";
import { cn } from "@/src/lib/utils";
import { veriforgeTypography, VeriForgeDivider, VeriForgeFrame } from "./theme";
import { VeriForgeButton } from "./button";
import { VeriForgeSelect } from "./inputs";
import { VeriForgeProgressBar } from "./progress";
import { useVeriForgeNotifications } from "./notifications";
import { AnvilIcon, ForgeBoltIcon, HeatEdgeIcon, ShieldGridIcon } from "./icons";

export type ArchitectureLayerId =
  | "presentation"
  | "application"
  | "api"
  | "data"
  | "storage"
  | "security"
  | "infrastructure"
  | "observability";

export type LayerHealth = "healthy" | "degraded" | "critical";
export type ServiceStatus = "online" | "degraded" | "offline";
export type ForgeFlowStatus = "idle" | "running" | "verified" | "failed";

export type ArchitectureLayerLocal = {
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

export type ModularServiceLocal = {
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

export type SchemaTableLocal = {
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

export type StorageBucketLocal = {
  id: string;
  tenantId: string;
  name: string;
  categories: string[];
  isolated: boolean;
  objectCount: number;
  timestamp: string;
  userId: number;
};

export type SecurityControlLocal = {
  id: string;
  name: string;
  status: "enforced" | "partial" | "gap";
  detail: string;
  timestamp: string;
  userId: number;
  tenantId: string;
};

export type InfraNodeLocal = {
  id: string;
  role: "api" | "worker" | "lb" | "db";
  region: string;
  loadScore: number;
  capacity: number;
  tenantPinned: string | null;
  timestamp: string;
  userId: number;
  tenantId: string;
};

export type ObservabilitySignalLocal = {
  id: string;
  kind: "log" | "metric" | "trace";
  name: string;
  value: number;
  unit: string;
  critical: boolean;
  timestamp: string;
  userId: number;
  tenantId: string;
};

export type ArchitectureAuditLogLocal = {
  id: string;
  action: string;
  layerId: ArchitectureLayerId | "system";
  detail: string;
  timestamp: string;
  userId: number;
  tenantId: string;
};

export type EnterpriseArchitectureAnalyticsSnapshot = {
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
  tenantId: string;
};

const STORAGE_KEY = "veriforge.enterprise-architecture.analytics";
const DEFAULT_TENANT = "tenant-alloy";

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function computeEnterpriseArchitectureAnalytics(input: {
  layers: ArchitectureLayerLocal[];
  services: ModularServiceLocal[];
  tables: SchemaTableLocal[];
  buckets: StorageBucketLocal[];
  security: SecurityControlLocal[];
  nodes: InfraNodeLocal[];
  signals: ObservabilitySignalLocal[];
  tenantId: string;
}): EnterpriseArchitectureAnalyticsSnapshot {
  const averageReadiness =
    input.layers.length === 0
      ? 0
      : clamp(input.layers.reduce((s, l) => s + l.readiness, 0) / input.layers.length);
  const tenantAwareCoverage =
    input.services.length === 0
      ? 0
      : clamp(
          (input.services.filter((s) => s.tenantAware).length / input.services.length) * 100,
        );
  const rlsCoverage =
    input.tables.length === 0
      ? 0
      : clamp(
          (input.tables.filter((t) => t.tenantScoped).length / input.tables.length) * 100,
        );
  const securityGaps = input.security.filter((s) => s.status !== "enforced").length;
  const infraLoadAverage =
    input.nodes.length === 0
      ? 0
      : clamp(input.nodes.reduce((s, n) => s + n.loadScore, 0) / input.nodes.length);
  const observabilityCritical = input.signals.filter((s) => s.critical).length;

  return {
    layerCount: input.layers.length,
    healthyLayers: input.layers.filter((l) => l.health === "healthy").length,
    degradedLayers: input.layers.filter((l) => l.health === "degraded").length,
    criticalLayers: input.layers.filter((l) => l.health === "critical").length,
    averageReadiness,
    modularServicesOnline: input.services.filter((s) => s.status === "online").length,
    tenantAwareCoverage,
    schemaTables: input.tables.length,
    rlsCoverage,
    storageBuckets: input.buckets.length,
    securityGaps,
    infraLoadAverage,
    observabilityCritical,
    architectureScore: clamp(
      averageReadiness * 0.35 +
        tenantAwareCoverage * 0.2 +
        rlsCoverage * 0.15 +
        (100 - securityGaps * 12) * 0.15 +
        (100 - Math.max(0, infraLoadAverage - 60)) * 0.1 +
        (100 - observabilityCritical * 15) * 0.05,
    ),
    timestamp: new Date().toISOString(),
    tenantId: input.tenantId,
  };
}

export function persistEnterpriseArchitectureAnalytics(
  snapshot: EnterpriseArchitectureAnalyticsSnapshot,
) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  window.dispatchEvent(
    new CustomEvent("veriforge:enterprise-architecture-analytics", { detail: snapshot }),
  );
}

export function readEnterpriseArchitectureAnalytics(): EnterpriseArchitectureAnalyticsSnapshot | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as EnterpriseArchitectureAnalyticsSnapshot;
  } catch {
    return null;
  }
}

export function useEnterpriseArchitectureAnalyticsSync(
  fallback: EnterpriseArchitectureAnalyticsSnapshot = {
    layerCount: 8,
    healthyLayers: 6,
    degradedLayers: 2,
    criticalLayers: 0,
    averageReadiness: 90,
    modularServicesOnline: 6,
    tenantAwareCoverage: 100,
    schemaTables: 10,
    rlsCoverage: 100,
    storageBuckets: 3,
    securityGaps: 1,
    infraLoadAverage: 60,
    observabilityCritical: 1,
    architectureScore: 86,
    timestamp: new Date().toISOString(),
    tenantId: DEFAULT_TENANT,
  },
) {
  const [analytics, setAnalytics] = React.useState<EnterpriseArchitectureAnalyticsSnapshot>(
    () => readEnterpriseArchitectureAnalytics() ?? fallback,
  );

  React.useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY || !event.newValue) return;
      try {
        setAnalytics(JSON.parse(event.newValue) as EnterpriseArchitectureAnalyticsSnapshot);
      } catch {
        /* ignore */
      }
    };
    const onCustom = (event: Event) => {
      const detail = (event as CustomEvent<EnterpriseArchitectureAnalyticsSnapshot>).detail;
      if (detail) setAnalytics(detail);
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener(
      "veriforge:enterprise-architecture-analytics",
      onCustom as EventListener,
    );
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(
        "veriforge:enterprise-architecture-analytics",
        onCustom as EventListener,
      );
    };
  }, []);

  return { analytics, setAnalytics };
}

function seed(tenantId: string) {
  const now = new Date().toISOString();
  const userId = 1;
  return {
    layers: [
      {
        id: "presentation" as const,
        name: "Presentation Layer",
        description: "Web + Mobile forged-metal UI",
        health: "healthy" as const,
        readiness: 96,
        components: [
          "Angular geometry cards",
          "Black / steel / red tokens",
          "Metallic gradients",
          "Bold geometric typography",
          "Mobile Field Command",
        ],
        rules: ["All UI follows forged-metal identity"],
        timestamp: now,
        userId,
        tenantId,
      },
      {
        id: "application" as const,
        name: "Application Layer",
        description: "Modular tenant-aware domain services",
        health: "healthy" as const,
        readiness: 94,
        components: [
          "AuthService",
          "TrainingService",
          "VerificationService",
          "ComplianceService",
          "IncidentService",
          "RiskService",
          "WorkflowService",
        ],
        rules: ["Stateless services", "forgeCheck / forgeStatus / forgeFlow"],
        timestamp: now,
        userId,
        tenantId,
      },
      {
        id: "api" as const,
        name: "API Layer",
        description: "REST + { status, data, meta }",
        health: "healthy" as const,
        readiness: 97,
        components: ["buildSuccess", "tenantId in meta", "RBAC + tenant guards"],
        rules: ["tenantId in all requests"],
        timestamp: now,
        userId,
        tenantId,
      },
      {
        id: "data" as const,
        name: "Data Layer",
        description: "Relational schema with FK + RLS",
        health: "degraded" as const,
        readiness: 82,
        components: [
          "users",
          "companies",
          "trainingModules",
          "verificationChecks",
          "complianceRequirements",
          "incidents",
          "audits",
          "workflows",
          "equipment",
          "contractors",
        ],
        rules: ["Strict FKs", "RLS by tenant_id"],
        timestamp: now,
        userId,
        tenantId,
      },
      {
        id: "storage" as const,
        name: "Storage Layer",
        description: "Tenant-specific document buckets",
        health: "healthy" as const,
        readiness: 91,
        components: ["veriforge-tenant-{slug}", "compliance", "training", "incidents"],
        rules: ["No cross-tenant object access"],
        timestamp: now,
        userId,
        tenantId,
      },
      {
        id: "security" as const,
        name: "Security Layer",
        description: "JWT tenancy, encryption, audit logging",
        health: "healthy" as const,
        readiness: 93,
        components: ["JWT + tenantId", "Encryption at rest", "TLS", "Audit metadata"],
        rules: ["JWT tenantId must match route/header"],
        timestamp: now,
        userId,
        tenantId,
      },
      {
        id: "infrastructure" as const,
        name: "Infrastructure Layer",
        description: "Horizontal scale + tenant-aware LB",
        health: "degraded" as const,
        readiness: 78,
        components: ["API pool", "Tenant-aware LB", "Auto-scaling", "Pinned affinity"],
        rules: ["Stateless compute", "Scale on workload"],
        timestamp: now,
        userId,
        tenantId,
      },
      {
        id: "observability" as const,
        name: "Observability Layer",
        description: "Logs, metrics, traces",
        health: "healthy" as const,
        readiness: 88,
        components: ["Structured logs", "Layer metrics", "Traces", "Angular dashboards"],
        rules: ["Logs include tenantId, userId, timestamp"],
        timestamp: now,
        userId,
        tenantId,
      },
    ] as ArchitectureLayerLocal[],
    services: [
      {
        id: "svc-auth",
        name: "AuthService",
        status: "online" as const,
        tenantAware: true,
        stateless: true,
        forgeFlow: "verified" as const,
        endpoints: ["/veriforge/auth"],
        timestamp: now,
        userId,
        tenantId,
      },
      {
        id: "svc-training",
        name: "TrainingService",
        status: "online" as const,
        tenantAware: true,
        stateless: true,
        forgeFlow: "running" as const,
        endpoints: ["/veriforge/training"],
        timestamp: now,
        userId,
        tenantId,
      },
      {
        id: "svc-verification",
        name: "VerificationService",
        status: "online" as const,
        tenantAware: true,
        stateless: true,
        forgeFlow: "verified" as const,
        endpoints: ["/veriforge/verification"],
        timestamp: now,
        userId,
        tenantId,
      },
      {
        id: "svc-compliance",
        name: "ComplianceService",
        status: "online" as const,
        tenantAware: true,
        stateless: true,
        forgeFlow: "idle" as const,
        endpoints: ["/veriforge/compliance"],
        timestamp: now,
        userId,
        tenantId,
      },
      {
        id: "svc-incident",
        name: "IncidentService",
        status: "degraded" as const,
        tenantAware: true,
        stateless: true,
        forgeFlow: "failed" as const,
        endpoints: ["/veriforge/incidents"],
        timestamp: now,
        userId,
        tenantId,
      },
      {
        id: "svc-risk",
        name: "RiskService",
        status: "online" as const,
        tenantAware: true,
        stateless: true,
        forgeFlow: "running" as const,
        endpoints: ["/veriforge/risk"],
        timestamp: now,
        userId,
        tenantId,
      },
      {
        id: "svc-workflow",
        name: "WorkflowService",
        status: "online" as const,
        tenantAware: true,
        stateless: true,
        forgeFlow: "verified" as const,
        endpoints: ["/veriforge/workflows"],
        timestamp: now,
        userId,
        tenantId,
      },
    ] as ModularServiceLocal[],
    tables: [
      "users",
      "companies",
      "trainingModules",
      "verificationChecks",
      "complianceRequirements",
      "incidents",
      "audits",
      "workflows",
      "equipment",
      "contractors",
    ].map((name, i) => ({
      id: `tbl-${i + 1}`,
      name,
      primaryKey: "id",
      foreignKeys:
        name === "users"
          ? ["companies.id"]
          : name === "verificationChecks"
            ? ["users.id", "workflows.id"]
            : name === "contractors"
              ? ["companies.id", "users.id"]
              : name === "companies"
                ? []
                : ["users.id"],
      rlsPredicate: "tenant_id = current_setting('app.tenant_id')",
      tenantScoped: true,
      timestamp: now,
      userId,
      tenantId,
    })) as SchemaTableLocal[],
    buckets: [
      {
        id: "bkt-1",
        tenantId: "tenant-alloy",
        name: "veriforge-tenant-alloy",
        categories: ["compliance", "training", "incidents"],
        isolated: true,
        objectCount: 1284,
        timestamp: now,
        userId,
      },
      {
        id: "bkt-2",
        tenantId: "tenant-forgeco",
        name: "veriforge-tenant-forgeco",
        categories: ["compliance", "training", "verification", "incidents"],
        isolated: true,
        objectCount: 642,
        timestamp: now,
        userId,
      },
      {
        id: "bkt-3",
        tenantId: "tenant-steelgate",
        name: "veriforge-tenant-steelgate",
        categories: ["compliance", "training"],
        isolated: true,
        objectCount: 91,
        timestamp: now,
        userId,
      },
    ] as StorageBucketLocal[],
    security: [
      {
        id: "sec-1",
        name: "JWT with tenantId",
        status: "enforced" as const,
        detail: "Claims include tenantId · iss=veriforge-saas",
        timestamp: now,
        userId,
        tenantId,
      },
      {
        id: "sec-2",
        name: "Encryption at rest",
        status: "enforced" as const,
        detail: "Per-tenant KEK ids",
        timestamp: now,
        userId,
        tenantId,
      },
      {
        id: "sec-3",
        name: "Encryption in transit",
        status: "enforced" as const,
        detail: "TLS 1.2+ edge and service links",
        timestamp: now,
        userId,
        tenantId,
      },
      {
        id: "sec-4",
        name: "Audit logging",
        status: "enforced" as const,
        detail: "Angular metadata: tenantId, userId, timestamp",
        timestamp: now,
        userId,
        tenantId,
      },
      {
        id: "sec-5",
        name: "Row-level security",
        status: "partial" as const,
        detail: "RLS policies present; coverage improving",
        timestamp: now,
        userId,
        tenantId,
      },
    ] as SecurityControlLocal[],
    nodes: [
      {
        id: "node-lb-1",
        role: "lb" as const,
        region: "us-west",
        loadScore: 41,
        capacity: 100,
        tenantPinned: null,
        timestamp: now,
        userId,
        tenantId,
      },
      {
        id: "node-api-1",
        role: "api" as const,
        region: "us-west",
        loadScore: 62,
        capacity: 100,
        tenantPinned: "tenant-alloy",
        timestamp: now,
        userId,
        tenantId,
      },
      {
        id: "node-api-2",
        role: "api" as const,
        region: "us-west",
        loadScore: 74,
        capacity: 100,
        tenantPinned: null,
        timestamp: now,
        userId,
        tenantId,
      },
      {
        id: "node-worker-1",
        role: "worker" as const,
        region: "us-west",
        loadScore: 55,
        capacity: 100,
        tenantPinned: null,
        timestamp: now,
        userId,
        tenantId,
      },
      {
        id: "node-db-1",
        role: "db" as const,
        region: "us-west",
        loadScore: 68,
        capacity: 100,
        tenantPinned: null,
        timestamp: now,
        userId,
        tenantId,
      },
    ] as InfraNodeLocal[],
    signals: [
      {
        id: "sig-1",
        kind: "metric" as const,
        name: "api.p95_ms",
        value: 186,
        unit: "ms",
        critical: false,
        timestamp: now,
        userId,
        tenantId,
      },
      {
        id: "sig-2",
        kind: "metric" as const,
        name: "forgeFlow.fail_rate",
        value: 4.2,
        unit: "%",
        critical: false,
        timestamp: now,
        userId,
        tenantId,
      },
      {
        id: "sig-3",
        kind: "log" as const,
        name: "security.rls_denials",
        value: 12,
        unit: "count",
        critical: false,
        timestamp: now,
        userId,
        tenantId,
      },
      {
        id: "sig-4",
        kind: "trace" as const,
        name: "workflow.forgeCheck.span",
        value: 420,
        unit: "ms",
        critical: false,
        timestamp: now,
        userId,
        tenantId,
      },
      {
        id: "sig-5",
        kind: "metric" as const,
        name: "infra.load_average",
        value: 74,
        unit: "%",
        critical: true,
        timestamp: now,
        userId,
        tenantId,
      },
    ] as ObservabilitySignalLocal[],
    logs: [
      {
        id: "al-1",
        action: "architecture.seed",
        layerId: "system" as const,
        detail: "Enterprise architecture registry initialized",
        timestamp: now,
        userId,
        tenantId,
      },
      {
        id: "al-2",
        action: "security.jwt.validate",
        layerId: "security" as const,
        detail: "JWT tenantId matched route tenant",
        timestamp: now,
        userId,
        tenantId,
      },
      {
        id: "al-3",
        action: "infra.scale.evaluate",
        layerId: "infrastructure" as const,
        detail: "loadScore 74 · scale recommendation pending",
        timestamp: now,
        userId,
        tenantId,
      },
    ] as ArchitectureAuditLogLocal[],
  };
}

function Metric({
  label,
  value,
  critical,
}: {
  label: string;
  value: string;
  critical?: boolean;
}) {
  return (
    <div
      className={cn(
        "border px-3 py-2",
        critical
          ? "border-[#1E6FB8] bg-[rgba(30, 111, 184,.14)] shadow-[0_0_10px_rgba(30, 111, 184,.25)]"
          : "border-[#424242] bg-[#1f1f1f]",
      )}
    >
      <p className="text-[10px] uppercase tracking-[0.12em] text-[#9f9f9f]">{label}</p>
      <p className="mt-1 font-[var(--vf-font-primary)] text-lg text-[#FAFAFA]">{value}</p>
    </div>
  );
}

function HealthChip({ health }: { health: LayerHealth }) {
  return (
    <span
      className={cn(
        "inline-block border px-2 py-0.5 text-[10px] uppercase tracking-[0.12em]",
        health === "healthy"
          ? "border-[#424242] bg-[#1f1f1f] text-[#b8e0b8]"
          : health === "critical"
            ? "border-[#1E6FB8] bg-[rgba(30, 111, 184,.2)] text-[#ffc9c9] shadow-[0_0_8px_rgba(30, 111, 184,.35)]"
            : "border-[#1E6FB8] bg-[#2a1a1a] text-[#ffd0d0]",
      )}
    >
      {health}
    </span>
  );
}

export function VeriForgeEnterpriseArchitectureConsole() {
  const { push } = useVeriForgeNotifications();
  const [tenantId, setTenantId] = React.useState(DEFAULT_TENANT);
  const initial = React.useMemo(() => seed(tenantId), [tenantId]);
  const [layers, setLayers] = React.useState(initial.layers);
  const [services, setServices] = React.useState(initial.services);
  const [tables, setTables] = React.useState(initial.tables);
  const [buckets] = React.useState(initial.buckets);
  const [security] = React.useState(initial.security);
  const [nodes, setNodes] = React.useState(initial.nodes);
  const [signals, setSignals] = React.useState(initial.signals);
  const [logs, setLogs] = React.useState(initial.logs);
  const [selectedLayer, setSelectedLayer] = React.useState<ArchitectureLayerId>("presentation");
  const notified = React.useRef<Set<string>>(new Set(["sig-5"]));
  const seq = React.useRef(20);

  React.useEffect(() => {
    const next = seed(tenantId);
    setLayers(next.layers);
    setServices(next.services);
    setTables(next.tables);
    setNodes(next.nodes);
    setSignals(next.signals);
    setLogs(next.logs);
  }, [tenantId]);

  const activeLayer = layers.find((l) => l.id === selectedLayer) ?? layers[0];

  const pushLog = (
    action: string,
    layerId: ArchitectureLayerId | "system",
    detail: string,
  ) => {
    setLogs((prev) => [
      {
        id: `al-${seq.current++}`,
        action,
        layerId,
        detail,
        timestamp: new Date().toISOString(),
        userId: 1,
        tenantId,
      },
      ...prev,
    ]);
  };

  const analytics = React.useMemo(
    () =>
      computeEnterpriseArchitectureAnalytics({
        layers,
        services,
        tables,
        buckets,
        security,
        nodes,
        signals,
        tenantId,
      }),
    [layers, services, tables, buckets, security, nodes, signals, tenantId],
  );

  React.useEffect(() => {
    persistEnterpriseArchitectureAnalytics(analytics);
  }, [analytics]);

  React.useEffect(() => {
    for (const signal of signals) {
      if (!signal.critical) continue;
      if (notified.current.has(signal.id)) continue;
      notified.current.add(signal.id);
      push({
        category: "compliance",
        tone: "critical",
        title: "ARCHITECTURE SIGNAL CRITICAL",
        message: `${signal.name} critical for tenant ${signal.tenantId}.`,
        forgeStatus: "failed",
        userId: signal.userId,
        actionLabel: "Open Architecture",
      });
    }
    for (const layer of layers) {
      if (layer.health !== "critical") continue;
      if (notified.current.has(layer.id)) continue;
      notified.current.add(layer.id);
      push({
        category: "compliance",
        tone: "critical",
        title: "ARCHITECTURE LAYER CRITICAL",
        message: `${layer.name} marked critical for tenant ${layer.tenantId}.`,
        forgeStatus: "failed",
        userId: layer.userId,
      });
    }
  }, [signals, layers, push]);

  const setHealth = (id: ArchitectureLayerId, health: LayerHealth) => {
    setLayers((prev) =>
      prev.map((l) =>
        l.id === id
          ? {
              ...l,
              health,
              readiness:
                health === "healthy" ? Math.max(l.readiness, 90) : health === "critical" ? 45 : 75,
              timestamp: new Date().toISOString(),
              userId: 1,
              tenantId,
            }
          : l,
      ),
    );
    pushLog("architecture.layer.health", id, `${id} → ${health}`);
    if (health === "critical") notified.current.delete(id);
  };

  const runForgeFlow = (serviceId: string) => {
    setServices((prev) =>
      prev.map((s) => {
        if (s.id !== serviceId) return s;
        const forgeFlow: ForgeFlowStatus =
          s.tenantAware && s.stateless ? "verified" : "failed";
        return {
          ...s,
          forgeFlow,
          status: forgeFlow === "verified" ? "online" : "degraded",
          timestamp: new Date().toISOString(),
          userId: 1,
          tenantId,
        };
      }),
    );
    const svc = services.find((s) => s.id === serviceId);
    pushLog(
      "workflow.forgeFlow",
      "application",
      `${svc?.name ?? serviceId} forgeFlow executed for ${tenantId}`,
    );
  };

  const evaluateScaling = () => {
    const avg = clamp(nodes.reduce((s, n) => s + n.loadScore, 0) / Math.max(1, nodes.length));
    if (avg >= 70) {
      setNodes((prev) => [
        ...prev,
        {
          id: `node-api-${seq.current++}`,
          role: "api",
          region: "us-west",
          loadScore: 20,
          capacity: 100,
          tenantPinned: null,
          timestamp: new Date().toISOString(),
          userId: 1,
          tenantId,
        },
      ]);
      setLayers((prev) =>
        prev.map((l) =>
          l.id === "infrastructure"
            ? {
                ...l,
                readiness: clamp(l.readiness + 6),
                health: l.readiness + 6 >= 85 ? "healthy" : l.health,
                timestamp: new Date().toISOString(),
                tenantId,
                userId: 1,
              }
            : l,
        ),
      );
      pushLog("infra.scale.evaluate", "infrastructure", `loadScore ${avg} · scale_out_api`);
    } else {
      pushLog("infra.scale.evaluate", "infrastructure", `loadScore ${avg} · hold`);
    }
  };

  const verifyRls = () => {
    const coverage = clamp(
      (tables.filter((t) => t.tenantScoped).length / Math.max(1, tables.length)) * 100,
    );
    setLayers((prev) =>
      prev.map((l) =>
        l.id === "data"
          ? {
              ...l,
              readiness: coverage,
              health: coverage >= 95 ? "healthy" : coverage >= 80 ? "degraded" : "critical",
              timestamp: new Date().toISOString(),
              userId: 1,
              tenantId,
            }
          : l,
      ),
    );
    pushLog("data.rls.verify", "data", `RLS coverage ${coverage}%`);
  };

  return (
    <div className="space-y-4">
      <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className={cn(veriforgeTypography.heading, "text-lg text-[#FAFAFA]")}>
              Enterprise Architecture Console
            </h2>
            <p className="mt-1 text-sm text-[#c7c7c7]">
              Eight forged layers · stateless services · tenant-aware workflows · metallic observability.
            </p>
          </div>
          <div className="w-48">
            <VeriForgeSelect
              label="Tenant"
              value={tenantId}
              onChange={(e) => setTenantId(e.target.value)}
              options={[
                { label: "tenant-alloy", value: "tenant-alloy" },
                { label: "tenant-forgeco", value: "tenant-forgeco" },
                { label: "tenant-steelgate", value: "tenant-steelgate" },
              ]}
            />
          </div>
        </div>
        <VeriForgeDivider className="my-3" />
        <div className="grid gap-3 md:grid-cols-4">
          <Metric label="Layers" value={String(analytics.layerCount)} />
          <Metric
            label="Critical Layers"
            value={String(analytics.criticalLayers)}
            critical={analytics.criticalLayers > 0}
          />
          <Metric
            label="Security Gaps"
            value={String(analytics.securityGaps)}
            critical={analytics.securityGaps > 0}
          />
          <Metric
            label="Obs Critical"
            value={String(analytics.observabilityCritical)}
            critical={analytics.observabilityCritical > 0}
          />
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <VeriForgeProgressBar label="Architecture Score" value={analytics.architectureScore} />
          <VeriForgeProgressBar label="Average Readiness" value={analytics.averageReadiness} />
        </div>
        <p className="mt-2 text-[10px] uppercase tracking-[0.1em] text-[#8f8f8f]">
          Contract · {"{ status, data, meta }"} · tenantId: {tenantId} · forgeCheck / forgeStatus /
          forgeFlow
        </p>
      </VeriForgeFrame>

      {/* 1. Presentation + layer stack */}
      <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
        <h3 className={cn(veriforgeTypography.heading, "text-sm text-[#FAFAFA]")}>
          1–8. Architecture Layers
        </h3>
        <VeriForgeDivider className="my-3" />
        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
          {layers.map((layer, idx) => (
            <button
              key={layer.id}
              type="button"
              onClick={() => setSelectedLayer(layer.id)}
              className={cn(
                "border px-3 py-3 text-left",
                selectedLayer === layer.id
                  ? "border-[#1E6FB8] bg-[rgba(30, 111, 184,.16)] shadow-[inset_3px_0_0_#1E6FB8]"
                  : layer.health === "critical"
                    ? "border-[#1E6FB8] bg-[#1f1f1f] shadow-[0_0_12px_rgba(30, 111, 184,.3)]"
                    : "border-[#424242] bg-[linear-gradient(145deg,#222_0%,#171717_100%)]",
              )}
            >
              <div className="mb-1 flex items-center justify-between gap-2">
                <p className="text-[10px] uppercase tracking-[0.12em] text-[#9f9f9f]">
                  {idx + 1}. {layer.id}
                </p>
                <HealthChip health={layer.health} />
              </div>
              <p className="text-sm text-[#FAFAFA]">{layer.name}</p>
              <p className="mt-1 text-xs text-[#aaaaaa]">{layer.description}</p>
              <div className="mt-2">
                <VeriForgeProgressBar label="Readiness" value={layer.readiness} />
              </div>
            </button>
          ))}
        </div>
        {activeLayer ? (
          <div className="mt-4 border border-[#424242] bg-[#151515] p-3">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <p className="text-sm text-[#FAFAFA]">{activeLayer.name}</p>
              <HealthChip health={activeLayer.health} />
              <VeriForgeButton size="sm" onClick={() => setHealth(activeLayer.id, "healthy")}>
                Mark Healthy
              </VeriForgeButton>
              <VeriForgeButton
                size="sm"
                variant="secondary"
                onClick={() => setHealth(activeLayer.id, "degraded")}
              >
                Degrade
              </VeriForgeButton>
              <VeriForgeButton
                size="sm"
                variant="secondary"
                onClick={() => setHealth(activeLayer.id, "critical")}
              >
                Critical
              </VeriForgeButton>
            </div>
            <p className="text-xs text-[#aaaaaa]">
              Components: {activeLayer.components.join(" · ")}
            </p>
            <p className="mt-1 text-xs text-[#ffc9c9]">Rules: {activeLayer.rules.join(" · ")}</p>
            <p className="mt-2 text-[10px] uppercase tracking-[0.1em] text-[#8f8f8f]">
              timestamp: {activeLayer.timestamp.slice(0, 19)} · userId: {activeLayer.userId} ·
              tenantId: {activeLayer.tenantId}
            </p>
          </div>
        ) : null}
      </VeriForgeFrame>

      <div className="grid gap-4 xl:grid-cols-2">
        {/* Application services */}
        <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
          <h3 className={cn(veriforgeTypography.heading, "text-sm text-[#FAFAFA]")}>
            2. Application Layer — Modular Services
          </h3>
          <VeriForgeDivider className="my-3" />
          <div className="space-y-2">
            {services.map((svc) => (
              <div
                key={svc.id}
                className={cn(
                  "flex items-center justify-between gap-2 border px-3 py-2",
                  svc.forgeFlow === "failed" || svc.status === "degraded"
                    ? "border-[#1E6FB8] bg-[rgba(30, 111, 184,.12)]"
                    : "border-[#424242] bg-[#1f1f1f]",
                )}
              >
                <div>
                  <p className="text-sm text-[#f0f0f0]">{svc.name}</p>
                  <p className="text-xs text-[#aaaaaa]">
                    {svc.status} · forgeFlow={svc.forgeFlow} · tenantAware=
                    {svc.tenantAware ? "yes" : "no"} · stateless={svc.stateless ? "yes" : "no"}
                  </p>
                </div>
                <VeriForgeButton size="sm" onClick={() => runForgeFlow(svc.id)}>
                  forgeFlow
                </VeriForgeButton>
              </div>
            ))}
          </div>
        </VeriForgeFrame>

        {/* API + Data */}
        <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
          <h3 className={cn(veriforgeTypography.heading, "text-sm text-[#FAFAFA]")}>
            3–4. API + Data Layers
          </h3>
          <VeriForgeDivider className="my-3" />
          <div className="mb-3 border border-[#424242] bg-[linear-gradient(145deg,#222_0%,#171717_100%)] p-3 font-mono text-[11px] text-[#cfcfcf]">
            <p className="text-[#ffc9c9]">{"{"}</p>
            <p className="pl-3">&quot;status&quot;: &quot;ok&quot;,</p>
            <p className="pl-3">&quot;data&quot;: {"{ }"},</p>
            <p className="pl-3">&quot;meta&quot;: {"{"}</p>
            <p className="pl-6">&quot;timestamp&quot;, &quot;userId&quot;, &quot;tenantId&quot;, &quot;forgeStatus&quot;</p>
            <p className="pl-3">{"}"}</p>
            <p className="text-[#ffc9c9]">{"}"}</p>
          </div>
          <div className="mb-3 flex gap-2">
            <VeriForgeButton size="sm" onClick={verifyRls}>
              Verify RLS
            </VeriForgeButton>
            <span className="self-center text-xs text-[#aaaaaa]">
              coverage {analytics.rlsCoverage}%
            </span>
          </div>
          <div className="max-h-56 space-y-1 overflow-y-auto">
            {tables.map((tbl) => (
              <div key={tbl.id} className="border border-[#424242] bg-[#1f1f1f] px-2 py-1.5">
                <p className="text-xs text-[#f0f0f0]">{tbl.name}</p>
                <p className="text-[10px] text-[#8f8f8f]">
                  PK {tbl.primaryKey}
                  {tbl.foreignKeys.length ? ` · FK ${tbl.foreignKeys.join(", ")}` : ""} · RLS
                </p>
              </div>
            ))}
          </div>
        </VeriForgeFrame>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {/* Storage + Security */}
        <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
          <h3 className={cn(veriforgeTypography.heading, "text-sm text-[#FAFAFA]")}>
            5–6. Storage + Security
          </h3>
          <VeriForgeDivider className="my-3" />
          <div className="mb-3 space-y-2">
            {buckets.map((b) => (
              <div
                key={b.id}
                className={cn(
                  "border px-3 py-2",
                  b.tenantId === tenantId
                    ? "border-[#1E6FB8] bg-[rgba(30, 111, 184,.1)]"
                    : "border-[#424242] bg-[#1f1f1f]",
                )}
              >
                <p className="text-sm text-[#f0f0f0]">{b.name}</p>
                <p className="text-xs text-[#aaaaaa]">
                  {b.categories.join(" · ")} · {b.objectCount} objects · isolated=
                  {b.isolated ? "yes" : "no"}
                </p>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            {security.map((sec) => (
              <div
                key={sec.id}
                className={cn(
                  "border px-3 py-2",
                  sec.status !== "enforced"
                    ? "border-[#1E6FB8] bg-[rgba(30, 111, 184,.12)]"
                    : "border-[#424242] bg-[#1f1f1f]",
                )}
              >
                <p className="text-sm text-[#f0f0f0]">
                  {sec.name} · {sec.status}
                </p>
                <p className="text-xs text-[#aaaaaa]">{sec.detail}</p>
              </div>
            ))}
          </div>
        </VeriForgeFrame>

        {/* Infrastructure + Observability */}
        <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
          <h3 className={cn(veriforgeTypography.heading, "text-sm text-[#FAFAFA]")}>
            7–8. Infrastructure + Observability
          </h3>
          <VeriForgeDivider className="my-3" />
          <div className="mb-3 flex gap-2">
            <VeriForgeButton onClick={evaluateScaling}>Evaluate Auto-Scale</VeriForgeButton>
            <span className="self-center text-xs text-[#aaaaaa]">
              load avg {analytics.infraLoadAverage}%
            </span>
          </div>
          <div className="mb-3 space-y-2">
            {nodes.map((node) => (
              <div key={node.id} className="border border-[#424242] bg-[#1f1f1f] px-3 py-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm text-[#f0f0f0]">
                    {node.role} · {node.id}
                  </p>
                  <span className="text-[10px] text-[#8f8f8f]">
                    {node.tenantPinned ?? "least-conn"}
                  </span>
                </div>
                <VeriForgeProgressBar label={`Load ${node.loadScore}%`} value={node.loadScore} />
              </div>
            ))}
          </div>
          <div className="space-y-2">
            {signals.map((sig) => (
              <div
                key={sig.id}
                className={cn(
                  "border px-3 py-2",
                  sig.critical
                    ? "border-[#1E6FB8] bg-[rgba(30, 111, 184,.14)] shadow-[0_0_10px_rgba(30, 111, 184,.28)]"
                    : "border-[#424242] bg-[#1f1f1f]",
                )}
              >
                <p className="text-sm text-[#f0f0f0]">
                  {sig.kind}: {sig.name}
                </p>
                <p className="text-xs text-[#aaaaaa]">
                  {sig.value}
                  {sig.unit} · tenantId: {sig.tenantId} · userId: {sig.userId}
                </p>
              </div>
            ))}
          </div>
        </VeriForgeFrame>
      </div>

      {/* Audit logs */}
      <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className={cn(veriforgeTypography.heading, "text-sm text-[#FAFAFA]")}>
            Architecture Audit Log
          </h3>
          <HeatEdgeIcon className="text-[#1E6FB8]" />
        </div>
        <VeriForgeDivider className="my-3" />
        <div className="max-h-56 space-y-2 overflow-y-auto">
          {logs.map((log) => (
            <div
              key={log.id}
              className="border border-[#424242] border-l-[#1E6FB8] bg-[#1f1f1f] px-3 py-2"
              style={{ borderLeftWidth: 3 }}
            >
              <p className="text-sm text-[#f0f0f0]">
                {log.action} · {log.detail}
              </p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.1em] text-[#8f8f8f]">
                {log.timestamp.slice(0, 19)} · userId: {log.userId} · tenantId: {log.tenantId} ·
                layer: {log.layerId}
              </p>
            </div>
          ))}
        </div>
      </VeriForgeFrame>

      <div className="border border-[#424242] bg-[#151515] p-3 text-xs text-[#cfcfcf]">
        <p className="font-[var(--vf-font-primary)] text-[11px] uppercase tracking-[0.12em] text-[#ffc9c9]">
          Enterprise Rules
        </p>
        <ul className="mt-2 list-inside list-disc space-y-1">
          <li>All services must be stateless</li>
          <li>All workflows must be tenant-aware</li>
          <li>All logs must include tenantId, userId, timestamp</li>
          <li>All UI must follow forged-metal identity</li>
        </ul>
      </div>

      <div className="flex gap-3 text-[#1E6FB8]">
        <AnvilIcon />
        <ForgeBoltIcon />
        <ShieldGridIcon />
      </div>
    </div>
  );
}
