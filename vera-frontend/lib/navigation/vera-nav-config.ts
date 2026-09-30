import type { LucideIcon } from "lucide-react";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bot,
  Building2,
  ClipboardCheck,
  ClipboardList,
  CloudOff,
  FileCheck2,
  FileText,
  FolderOpen,
  GraduationCap,
  HardHat,
  Layers,
  LayoutDashboard,
  LayoutGrid,
  NotebookPen,
  Radio,
  RefreshCw,
  Settings,
  Shield,
  ShieldCheck,
  Users,
  Wrench,
} from "lucide-react";
import { Phase1Role } from "@/lib/phase1-roles";
import { resolveNavHref } from "./sidebar-config";

/** Official Vera global modules — fixed list, never changes dynamically. */
export type VeraGlobalModuleId =
  | "veraHub"
  | "veraCore"
  | "veraPm"
  | "fieldOs"
  | "veriAgent"
  | "veriForge"
  | "veriHubOrg"
  | "hiringClient"
  | "developer"
  | "companies"
  | "workers"
  | "equipment"
  | "training"
  | "compliance"
  | "unionHalls"
  | "trainingProviders"
  | "reports"
  | "settings";

/** Feature dropdown section labels (SMS / industrial chrome). */
export type VeraNavFeatureGroupId =
  | "overview"
  | "operations"
  | "controls"
  | "records"
  | "intelligence"
  | "admin";

export const VERA_NAV_FEATURE_GROUP_LABELS: Record<VeraNavFeatureGroupId, string> = {
  overview: "Overview",
  operations: "Operations",
  controls: "Controls",
  records: "Records",
  intelligence: "Intelligence",
  admin: "System",
};

export type VeraNavFeature = {
  id: string;
  label: string;
  description?: string;
  href: string;
  match?: (path: string) => boolean;
  /** Lucide icon — matches SMS Core industrial iconography */
  icon?: LucideIcon;
  /** Visual group in the module feature dropdown */
  group?: VeraNavFeatureGroupId;
  /** When false, used for route matching only (hidden from dropdown) */
  showInNav?: boolean;
};

export type VeraModuleQuickAction = {
  label: string;
  href: string | ((role: string | null) => string);
};

export type VeraGlobalModule = {
  id: VeraGlobalModuleId;
  label: string;
  icon: LucideIcon;
  homeHref: (role: string | null) => string;
  match: (path: string) => boolean;
  features: VeraNavFeature[];
  quickAction?: VeraModuleQuickAction;
};

function isAdminSettingsRoute(path: string): boolean {
  if (!path.startsWith("/admin")) return false;
  const otherModules = [
    "/admin/companies",
    "/admin/workers",
    "/admin/equipment",
    "/admin/reporting",
    "/admin/training",
  ];
  return !otherModules.some((prefix) => path.startsWith(prefix));
}

function isAdmin(role: string | null): boolean {
  return (
    role === Phase1Role.SUPER_ADMIN ||
    role === Phase1Role.ADMIN ||
    role === Phase1Role.COMPANY_ADMIN
  );
}

function isPlatformAdmin(role: string | null): boolean {
  return role === Phase1Role.SUPER_ADMIN || role === Phase1Role.ADMIN;
}

function workersBase(role: string | null): string {
  return resolveNavHref("workers", role, isAdmin(role) ? "admin" : "workspace");
}

function equipmentBase(role: string | null): string {
  return resolveNavHref("equipment", role, isAdmin(role) ? "admin" : "workspace");
}

/** Master switchboard — always the same modules in the same order. */
export const VERA_GLOBAL_MODULES: VeraGlobalModule[] = [
  {
    id: "veraHub",
    label: "Worker Hub",
    icon: LayoutGrid,
    homeHref: () => "/hub",
    match: (p) =>
      p.startsWith("/hub") || p.startsWith("/subscriptions") || p.startsWith("/jobs"),
    features: [
      { id: "home", label: "Home", href: "/hub", match: (p) => p === "/hub" },
      { id: "readiness", label: "Readiness", href: "/hub/readiness", match: (p) => p.startsWith("/hub/readiness") },
      { id: "activity", label: "Activity", href: "/hub/activity", match: (p) => p.startsWith("/hub/activity") },
      {
        id: "veriforge-dashboards",
        label: "VeriForge dashboards",
        description: "VERICore, VERIPM, contractor scores, analytics",
        href: "/hub/veriforge-dashboards",
        match: (p) => p.startsWith("/hub/veriforge-dashboards"),
      },
      {
        id: "verisuite-platform",
        label: "Intelligence Platform",
        description: "Unified VeriSuite AI architecture & design system",
        href: "/hub/verisuite-platform",
        match: (p) => p.startsWith("/hub/verisuite-platform"),
      },
      {
        id: "verisuite-intelligence",
        label: "VeriSuite Intelligence",
        description: "Regional drilldown, industry aggregation, AI insights",
        href: "/hub/verisuite-intelligence",
        match: (p) => p.startsWith("/hub/verisuite-intelligence"),
      },
      {
        id: "verisuite-aggregation",
        label: "AI Aggregation Engine",
        description: "Continuous web search, extract, daily industry benchmarks",
        href: "/hub/verisuite-aggregation",
        match: (p) => p.startsWith("/hub/verisuite-aggregation"),
      },
      {
        id: "regional-drilldown",
        label: "Regional Drilldown",
        description: "Global → Site filter, normalize, region & industry compare",
        href: "/hub/regional-drilldown",
        match: (p) => p.startsWith("/hub/regional-drilldown"),
      },
      {
        id: "dual-scale-dashboards",
        label: "Dual-scale dashboards",
        description: "Project & company planes — HECA, TRIF, leading, risk",
        href: "/hub/dual-scale-dashboards",
        match: (p) => p.startsWith("/hub/dual-scale-dashboards"),
      },
      {
        id: "anonymization-normalization",
        label: "Anonymization & Normalization",
        description: "Tokenize, strip, /200k normalize, blind aggregation",
        href: "/hub/anonymization-normalization",
        match: (p) => p.startsWith("/hub/anonymization-normalization"),
      },
      {
        id: "selector-system",
        label: "Selector System",
        description: "Industry, entity, subtype, scale, region — dynamic filters",
        href: "/hub/selector-system",
        match: (p) => p.startsWith("/hub/selector-system"),
      },
      {
        id: "smart-dashboard",
        label: "Smart Dashboard Engine",
        description: "AI anomaly, trend, narrative, forecast, correlations",
        href: "/hub/smart-dashboard",
        match: (p) => p.startsWith("/hub/smart-dashboard"),
      },
      {
        id: "industry-intelligence",
        label: "Industry Intelligence",
        description: "Mining, construction, manufacturing peer intelligence",
        href: "/hub/industry-intelligence",
        match: (p) => p.startsWith("/hub/industry-intelligence"),
      },
      {
        id: "industry-safety",
        label: "Industry safety",
        description: "Project & company industry benchmarks",
        href: "/hub/industry-safety",
        match: (p) => p.startsWith("/hub/industry-safety"),
      },
      {
        id: "fieldos",
        label: "FieldOS",
        description: "Live field binder",
        href: "/field",
        match: (p) =>
          p === "/field" ||
          p.startsWith("/field/equipment-readiness") ||
          p.startsWith("/field/crew-readiness") ||
          p.startsWith("/field/safety-pulse") ||
          p.startsWith("/field/task-sync") ||
          p.startsWith("/field/incident-capture") ||
          p.startsWith("/field/offline") ||
          p.startsWith("/field/analytics") ||
          p.startsWith("/field/permits") ||
          p.startsWith("/field/pending") ||
          p.startsWith("/field/conflicts") ||
          p.startsWith("/field/scan") ||
          p.startsWith("/field/safety") ||
          p.startsWith("/field/inspections"),
      },
      {
        id: "field-operations",
        label: "Field operations",
        description: "Inspections, hazards, near-miss, AI anomalies",
        href: "/field/operations",
        match: (p) => p.startsWith("/field/operations"),
      },
      {
        id: "jobs",
        label: "Job board",
        description: "Trades workforce marketplace",
        href: "/jobs",
        match: (p) => p.startsWith("/jobs"),
      },
      { id: "network", label: "Network", href: "/hub/network", match: (p) => p.startsWith("/hub/network") || p.startsWith("/hub/people") || p.startsWith("/hub/profile") || p.startsWith("/hub/company") || p.startsWith("/hub/provider") },
      {
        id: "pricing-plans",
        label: "Pricing & plans",
        href: "/subscriptions",
        match: (p) => p.startsWith("/subscriptions"),
      },
      { id: "settings", label: "Hub settings", href: "/hub/settings", match: (p) => p.startsWith("/hub/settings") },
    ],
  },
  {
    id: "veraCore",
    label: "VeriCore",
    icon: Layers,
    homeHref: () => "/core/dashboard",
    match: (p) => p.startsWith("/core") || p.startsWith("/documents"),
    features: [
      {
        id: "dashboard",
        label: "VERICore Dashboard",
        href: "/core/dashboard",
        match: (p) => p === "/core/dashboard" || p.startsWith("/core/dashboard/"),
      },
      {
        id: "training-competency",
        label: "Training & Competency",
        description: "Completion, gaps, expiry, regional skills, workforce risk",
        href: "/core/training-competency",
        match: (p) => p.startsWith("/core/training-competency"),
      },
      {
        id: "contractor-scores",
        label: "Contractor scores",
        href: "/core/contractor-scores",
        match: (p) => p.startsWith("/core/contractor-scores"),
      },
      { id: "workers", label: "Worker profiles", href: "/core/workers", match: (p) => p.startsWith("/core/workers") },
      { id: "equipment", label: "Equipment profiles", href: "/core/equipment", match: (p) => p.startsWith("/core/equipment") },
      { id: "readiness", label: "Readiness engine", href: "/core/readiness", match: (p) => p.startsWith("/core/readiness") },
      { id: "training-ingest", label: "Training ingestion", href: "/core/training-ingest", match: (p) => p.startsWith("/core/training-ingest") },
      {
        id: "safety-program-ingest",
        label: "Safety program ingestion",
        description: "Schema-validated policy/procedure/SDS extract → human confirm",
        href: "/core/safety-program-ingest",
        match: (p) => p.startsWith("/core/safety-program-ingest"),
      },
      { id: "verification", label: "Verification hub", href: "/core/verification", match: (p) => p.startsWith("/core/verification") },
      { id: "provider-hub", label: "Provider integration hub", href: "/core/provider-hub", match: (p) => p.startsWith("/core/provider-hub") },
      { id: "safety-knowledge", label: "Safety Knowledge", href: "/core/safety-knowledge", match: (p) => p.startsWith("/core/safety-knowledge") },
      {
        id: "document-archive",
        label: "Document Archive",
        href: "/pm/documents",
        match: (p) =>
          p.startsWith("/pm/documents") ||
          p.startsWith("/documents/completed") ||
          p.startsWith("/core/documents"),
      },
      { id: "twins", label: "Digital twins", href: "/core/twins", match: (p) => p.startsWith("/core/twins") },
      { id: "daily-logs", label: "Daily logs", href: "/core/daily-logs", match: (p) => p.startsWith("/core/daily-logs") },
      { id: "meeting-records", label: "Meeting records", href: "/core/meeting-records", match: (p) => p.startsWith("/core/meeting-records") },
      { id: "compliance-notes", label: "Compliance notes", href: "/core/compliance-notes", match: (p) => p.startsWith("/core/compliance-notes") },
      { id: "action-items", label: "Action items", href: "/core/action-items", match: (p) => p.startsWith("/core/action-items") },
      { id: "safety-observations", label: "Safety observations", href: "/core/safety-observations", match: (p) => p.startsWith("/core/safety-observations") },
      { id: "site-risks", label: "Site risks", href: "/core/site-risks", match: (p) => p.startsWith("/core/site-risks") },
      {
        id: "fieldos",
        label: "FieldOS",
        href: "/field",
        match: (p) =>
          p === "/field" ||
          (p.startsWith("/field/") && !p.startsWith("/field/operations")),
      },
      { id: "upload", label: "File upload", href: "/core/upload", match: (p) => p.startsWith("/core/upload") },
      { id: "sites", label: "Sites directory", href: "/core/sites/data-table", match: (p) => p.startsWith("/core/sites") },
    ],
  },
  {
    id: "veraPm",
    label: "VeriPM",
    icon: ClipboardList,
    homeHref: () => "/pm",
    match: (p) =>
      p.startsWith("/pm") ||
      p.startsWith("/contractor") ||
      p.startsWith("/documents") ||
      p.startsWith("/core/daily-logs") ||
      p.startsWith("/core/meeting-records"),
    quickAction: { label: "New project", href: "/pm/projects" },
    features: [
      // ── Primary VeriPM hierarchy (exact order — DO NOT REORDER) ──────────
      // 1. VeriPM Dashboard  2. SMS Core  3. Safety Hub  …
      // SMS Core must remain the second visible feature in ModuleNav.
      {
        id: "dashboard",
        label: "VeriPM Dashboard",
        description: "Project / company / subcontractor safety overview",
        href: "/pm",
        icon: LayoutDashboard,
        group: "overview",
        match: (p) =>
          p === "/pm" || p === "/pm/dashboard" || p.startsWith("/pm/dashboard/"),
      },
      {
        id: "sms",
        label: "SMS Core",
        description: "SCL / HECA / energy wheel & leading indicators",
        href: "/pm/sms",
        icon: Shield,
        group: "overview",
        match: (p) =>
          p === "/pm/sms" ||
          (p.startsWith("/pm/sms/") && !p.startsWith("/pm/sms-")) ||
          p.startsWith("/pm/sms-dashboards") ||
          p.startsWith("/pm/sms-ops") ||
          p.startsWith("/pm/sms-mockups"),
      },
      {
        id: "safety-hub",
        label: "Safety Hub",
        description: "Unified safety program home",
        href: "/pm/safety-hub",
        icon: LayoutGrid,
        group: "overview",
        match: (p) => p === "/pm/safety-hub" || p.startsWith("/pm/safety-hub/"),
      },
      {
        id: "inspections",
        label: "Inspections",
        description:
          "Smart Site AI, focus audits, equipment, PPE, safety devices, and BBO",
        href: "/pm/inspections",
        icon: ClipboardCheck,
        group: "operations",
        match: (p) => p.startsWith("/pm/inspections"),
      },
      {
        id: "projects",
        label: "Projects",
        href: "/pm/projects",
        icon: ClipboardList,
        group: "operations",
        match: (p) =>
          p.startsWith("/pm/projects") || p.startsWith("/pm/project-management"),
      },
      {
        id: "fieldos",
        label: "FieldOS",
        description: "Live field binder hub",
        href: "/field",
        icon: HardHat,
        group: "operations",
        match: (p) => p === "/field",
      },
      {
        id: "field-equipment-readiness",
        label: "Equipment Readiness",
        description: "Inspections, OOS flags, equipment alerts",
        href: "/field/equipment-readiness",
        icon: Wrench,
        group: "operations",
        showInNav: false,
        match: (p) =>
          p.startsWith("/field/equipment-readiness") ||
          p.startsWith("/field/inspections"),
      },
      {
        id: "field-crew-readiness",
        label: "Crew Readiness",
        description: "Tickets, training gaps, worker scan",
        href: "/field/crew-readiness",
        icon: Users,
        group: "operations",
        showInNav: false,
        match: (p) =>
          p.startsWith("/field/crew-readiness") || p.startsWith("/field/scan"),
      },
      {
        id: "field-safety-pulse",
        label: "Safety Pulse",
        description: "Permits, briefs, FLHA, emergency access",
        href: "/field/safety-pulse",
        icon: Activity,
        group: "operations",
        showInNav: false,
        match: (p) =>
          p.startsWith("/field/safety-pulse") ||
          p.startsWith("/field/permits") ||
          p.startsWith("/field/safety"),
      },
      {
        id: "field-task-sync",
        label: "Task Sync",
        description: "Binder queue, conflicts, pending sync",
        href: "/field/task-sync",
        icon: RefreshCw,
        group: "operations",
        showInNav: false,
        match: (p) =>
          p.startsWith("/field/task-sync") ||
          p.startsWith("/field/pending") ||
          p.startsWith("/field/conflicts"),
      },
      {
        id: "field-incident-capture",
        label: "Incident Capture",
        description: "Field incident log and OHS handoff",
        href: "/field/incident-capture",
        icon: AlertTriangle,
        group: "operations",
        showInNav: false,
        match: (p) => p.startsWith("/field/incident-capture"),
      },
      {
        id: "field-offline-mode",
        label: "Offline Mode",
        description: "Connectivity, cache preload, offline controls",
        href: "/field/offline",
        icon: CloudOff,
        group: "operations",
        showInNav: false,
        match: (p) => p.startsWith("/field/offline"),
      },
      {
        id: "field-analytics-snapshot",
        label: "Analytics Snapshot",
        description: "Field KPIs and ops drill-down",
        href: "/field/analytics",
        icon: BarChart3,
        group: "operations",
        showInNav: false,
        match: (p) => p.startsWith("/field/analytics"),
      },
      {
        id: "field-operations",
        label: "Field operations",
        description: "Inspections, hazards, near-miss, AI anomalies",
        href: "/field/operations",
        icon: Radio,
        group: "intelligence",
        showInNav: false,
        match: (p) => p.startsWith("/field/operations"),
      },
      {
        id: "project-safety",
        label: "Project Safety",
        description: "Leading/lagging, risk vs industry",
        href: "/pm/project-safety",
        icon: ShieldCheck,
        group: "operations",
        match: (p) =>
          p === "/pm/project-safety" || p.startsWith("/pm/project-safety/"),
      },
      {
        id: "action-management",
        label: "Action Management",
        description: "Corrective & preventive actions, aging, effectiveness",
        href: "/pm/action-management",
        icon: Wrench,
        group: "controls",
        match: (p) =>
          p.startsWith("/pm/action-management") ||
          p.startsWith("/pm/corrective-actions") ||
          p.startsWith("/pm/unified-corrective-action"),
      },
      {
        id: "emergency-response",
        label: "Emergency Response",
        href: "/pm/emergency-response",
        icon: Radio,
        group: "controls",
        match: (p) =>
          p.startsWith("/pm/emergency-response") ||
          p.startsWith("/pm/safety/emergency"),
      },
      {
        id: "work-at-heights",
        label: "Work at Heights",
        description:
          "Clearance worksheet, manufacturer specs, industry playbooks & rescue links",
        href: "/pm/work-at-heights",
        icon: HardHat,
        group: "controls",
        match: (p) => p.startsWith("/pm/work-at-heights"),
      },
      {
        id: "sif-heca",
        label: "SIF/HECA",
        description:
          "SIF exposures, HECA, energy wheel, critical controls & AI assess",
        href: "/pm/sif-heca",
        icon: AlertTriangle,
        group: "controls",
        match: (p) => p.startsWith("/pm/sif-heca"),
      },
      {
        id: "document-archive",
        label: "Document Archive",
        description: "Finalized forms, reports, assessments & storage files",
        href: "/pm/documents",
        icon: FolderOpen,
        group: "records",
        match: (p) =>
          p.startsWith("/pm/documents") ||
          p.startsWith("/documents/completed") ||
          p.startsWith("/core/documents"),
      },
      {
        id: "sds-document-control",
        label: "SDS & Document Control",
        description: "SDS library, chemicals, policies, acknowledgments",
        href: "/pm/sds-document-control",
        icon: FileCheck2,
        group: "records",
        match: (p) => p.startsWith("/pm/sds-document-control"),
      },
      {
        id: "safety-program-ingest",
        label: "Safety program ingestion",
        description: "Extract safety docs to schema → confirm write-back",
        href: "/pm/safety-program-ingest",
        icon: FileText,
        group: "records",
        match: (p) => p.startsWith("/pm/safety-program-ingest"),
      },
      {
        id: "daily-logs",
        label: "Daily Logs",
        href: "/core/daily-logs",
        icon: NotebookPen,
        group: "records",
        match: (p) => p.startsWith("/core/daily-logs"),
      },
      {
        id: "meeting-records",
        label: "Meeting Records",
        href: "/core/meeting-records",
        icon: Users,
        group: "records",
        match: (p) =>
          p.startsWith("/core/meeting-records") ||
          p.startsWith("/pm/safety-meetings"),
      },
      {
        id: "training",
        label: "Training & Competency",
        href: "/pm/training",
        icon: GraduationCap,
        group: "intelligence",
        match: (p) => p.startsWith("/pm/training"),
      },
      {
        id: "safety-intelligence",
        label: "Safety Intelligence",
        href: "/pm/safety-intelligence",
        icon: BarChart3,
        group: "intelligence",
        match: (p) =>
          p.startsWith("/pm/safety-intelligence") ||
          p.startsWith("/pm/unified-safety-intelligence") ||
          p.startsWith("/pm/predictive-safety-analytics"),
      },
      {
        id: "contractor",
        label: "Contractor Portal",
        description:
          "Onboarding, training verification, documents, safety scores",
        href: "/contractor",
        icon: Building2,
        group: "intelligence",
        match: (p) => p.startsWith("/contractor"),
      },
      {
        id: "admin-settings",
        label: "Admin / Settings",
        description: "Safety suite libraries, orientation, site access",
        href: "/pm/safety-suite",
        icon: Settings,
        group: "admin",
        match: (p) =>
          p.startsWith("/pm/safety-suite") ||
          p.startsWith("/pm/offline-mode") ||
          p.startsWith("/pm/unified-hazard-control") ||
          p.startsWith("/pm/site-access-control") ||
          p.startsWith("/pm/safety-stations") ||
          p.startsWith("/pm/project-safety-context") ||
          p.startsWith("/pm/attachments-media") ||
          p.startsWith("/pm/orientation") ||
          (p.includes("/pm/projects/") && p.includes("/orientations")) ||
          p.startsWith("/pm/safety/"),
      },
      // ── Hidden aliases (route match only — not shown in dropdown) ───────
      {
        id: "jha-flha",
        label: "JHA / FLHA",
        href: "/pm/jha-flha",
        showInNav: false,
        match: (p) => p.startsWith("/pm/jha-flha"),
      },
      {
        id: "permits",
        label: "Permits",
        href: "/pm/permits",
        showInNav: false,
        match: (p) => p.startsWith("/pm/permits"),
      },
      {
        id: "equipment-safety",
        label: "Equipment safety",
        href: "/pm/equipment-safety",
        showInNav: false,
        match: (p) => p.startsWith("/pm/equipment-safety"),
      },
      {
        id: "worker-safety",
        label: "Worker safety",
        href: "/pm/worker-safety-profile",
        showInNav: false,
        match: (p) => p.startsWith("/pm/worker-safety-profile"),
      },
      {
        id: "incidents",
        label: "Incidents",
        href: "/pm/incidents",
        showInNav: false,
        match: (p) => p.startsWith("/pm/incidents"),
      },
      {
        id: "substance-testing",
        label: "Substance testing",
        href: "/pm/substance-testing",
        showInNav: false,
        match: (p) => p.startsWith("/pm/substance-testing"),
      },
    ],
  },
  {
    id: "fieldOs",
    label: "FieldOS",
    icon: Radio,
    homeHref: () => "/field",
    match: (p) => p === "/field" || p.startsWith("/field/"),
    features: [
      {
        id: "binder",
        label: "Live binder",
        description: "Equipment, crew, safety pulse, and sync",
        href: "/field",
        icon: HardHat,
        group: "overview",
        match: (p) => p === "/field",
      },
      {
        id: "equipment-readiness",
        label: "Equipment Readiness",
        href: "/field/equipment-readiness",
        icon: Wrench,
        group: "operations",
        match: (p) =>
          p.startsWith("/field/equipment-readiness") ||
          p.startsWith("/field/inspections"),
      },
      {
        id: "crew-readiness",
        label: "Crew Readiness",
        href: "/field/crew-readiness",
        icon: Users,
        group: "operations",
        match: (p) =>
          p.startsWith("/field/crew-readiness") || p.startsWith("/field/scan"),
      },
      {
        id: "safety-pulse",
        label: "Safety Pulse",
        href: "/field/safety-pulse",
        icon: Activity,
        group: "operations",
        match: (p) =>
          p.startsWith("/field/safety-pulse") ||
          p.startsWith("/field/permits") ||
          p.startsWith("/field/safety"),
      },
      {
        id: "task-sync",
        label: "Task Sync",
        href: "/field/task-sync",
        icon: RefreshCw,
        group: "operations",
        match: (p) =>
          p.startsWith("/field/task-sync") ||
          p.startsWith("/field/pending") ||
          p.startsWith("/field/conflicts"),
      },
      {
        id: "incident-capture",
        label: "Incident Capture",
        href: "/field/incident-capture",
        icon: AlertTriangle,
        group: "operations",
        match: (p) => p.startsWith("/field/incident-capture"),
      },
      {
        id: "offline",
        label: "Offline Mode",
        href: "/field/offline",
        icon: CloudOff,
        group: "operations",
        match: (p) => p.startsWith("/field/offline"),
      },
      {
        id: "analytics",
        label: "Analytics Snapshot",
        href: "/field/analytics",
        icon: BarChart3,
        group: "intelligence",
        match: (p) => p.startsWith("/field/analytics"),
      },
      {
        id: "operations",
        label: "Field operations",
        href: "/field/operations",
        icon: Radio,
        group: "intelligence",
        match: (p) => p.startsWith("/field/operations"),
      },
    ],
  },
  {
    id: "veriAgent",
    label: "VeriAgent",
    icon: Bot,
    homeHref: () => "/veri-agent",
    match: (p) => p.startsWith("/veri-agent") || p.startsWith("/veriforge/assistant"),
    features: [
      {
        id: "overview",
        label: "Overview",
        description: "AI orchestration and privacy firewall",
        href: "/veri-agent",
        icon: Bot,
        group: "overview",
        match: (p) => p === "/veri-agent" || p.startsWith("/veri-agent/"),
      },
      {
        id: "assistant",
        label: "Safety assistant",
        description: "Industrial safety & verification advisor",
        href: "/veriforge/assistant",
        icon: Shield,
        group: "operations",
        match: (p) => p.startsWith("/veriforge/assistant"),
      },
    ],
  },
  {
    id: "veriForge",
    label: "VeriForge",
    icon: Shield,
    homeHref: () => "/veriforge/dashboard",
    match: (p) =>
      p.startsWith("/veriforge") &&
      !p.startsWith("/veriforge/auth") &&
      !p.startsWith("/veriforge/assistant"),
    features: [
      {
        id: "dashboard",
        label: "Control surface",
        href: "/veriforge/dashboard",
        match: (p) => p === "/veriforge/dashboard" || p.startsWith("/veriforge/dashboard/"),
      },
      {
        id: "training",
        label: "Training",
        href: "/veriforge/training",
        match: (p) => p.startsWith("/veriforge/training"),
      },
      {
        id: "verification",
        label: "Verification",
        href: "/veriforge/verification",
        match: (p) => p.startsWith("/veriforge/verification"),
      },
      {
        id: "compliance",
        label: "Compliance",
        href: "/veriforge/compliance",
        match: (p) => p.startsWith("/veriforge/compliance"),
      },
      {
        id: "audit",
        label: "Audit ledger",
        href: "/veriforge/audit",
        match: (p) => p.startsWith("/veriforge/audit"),
      },
      {
        id: "settings",
        label: "Settings",
        href: "/veriforge/settings",
        match: (p) => p.startsWith("/veriforge/settings"),
      },
    ],
  },
  {
    id: "veriHubOrg",
    label: "VeriHub Console",
    icon: LayoutGrid,
    homeHref: () => "/verihub",
    match: (p) => p.startsWith("/verihub") || p === "/notifications" || p.startsWith("/notifications/"),
    features: [
      {
        id: "overview",
        label: "Overview",
        href: "/verihub",
        group: "overview",
        match: (p) => p === "/verihub" || p.startsWith("/verihub/dashboard"),
      },
      {
        id: "notifications",
        label: "Notifications",
        href: "/notifications",
        group: "overview",
        match: (p) => p === "/notifications" || p.startsWith("/notifications/"),
      },
      {
        id: "modules",
        label: "Modules",
        href: "/verihub/modules",
        group: "admin",
        match: (p) => p.startsWith("/verihub/modules"),
      },
      {
        id: "users",
        label: "Users",
        href: "/verihub/users",
        group: "admin",
        match: (p) => p.startsWith("/verihub/users"),
      },
      {
        id: "roles",
        label: "Roles",
        href: "/verihub/roles",
        group: "admin",
        match: (p) => p.startsWith("/verihub/roles"),
      },
      {
        id: "billing",
        label: "Billing",
        href: "/verihub/billing",
        group: "admin",
        match: (p) => p.startsWith("/verihub/billing"),
      },
      {
        id: "compliance",
        label: "Compliance",
        href: "/compliance",
        group: "controls",
        match: (p) => p === "/compliance" || p.startsWith("/compliance/") || p.startsWith("/verihub/compliance"),
      },
      {
        id: "scorecards",
        label: "Scorecards",
        href: "/verihub/scorecards",
        group: "intelligence",
        match: (p) => p.startsWith("/verihub/scorecards"),
      },
      {
        id: "directory",
        label: "Directory",
        href: "/verihub/directory",
        group: "operations",
        match: (p) => p.startsWith("/verihub/directory"),
      },
      {
        id: "documents",
        label: "Documents",
        href: "/verihub/documents",
        group: "operations",
        match: (p) => p.startsWith("/verihub/documents"),
      },
      {
        id: "audits",
        label: "Audits",
        href: "/verihub/audits",
        group: "operations",
        match: (p) => p.startsWith("/verihub/audits"),
      },
      {
        id: "pvs",
        label: "PVS",
        href: "/verihub/pvs",
        group: "operations",
        match: (p) => p.startsWith("/verihub/pvs"),
      },
      {
        id: "analytics",
        label: "Analytics",
        href: "/verihub/analytics",
        group: "intelligence",
        match: (p) =>
          p.startsWith("/verihub/analytics") &&
          !p.startsWith("/verihub/analytics/admin"),
      },
      {
        id: "analytics-admin",
        label: "Admin analytics",
        href: "/verihub/analytics/admin",
        group: "intelligence",
        match: (p) => p.startsWith("/verihub/analytics/admin"),
      },
      {
        id: "quickcheck",
        label: "QuickCheck",
        href: "/verihub/quickcheck",
        group: "intelligence",
        match: (p) => p.startsWith("/verihub/quickcheck"),
      },
      {
        id: "projects",
        label: "Projects",
        href: "/verihub/projects",
        group: "operations",
        match: (p) => p.startsWith("/verihub/projects"),
      },
      {
        id: "signup",
        label: "Sign up",
        href: "/verihub/signup",
        group: "admin",
        showInNav: false,
        match: (p) => p.startsWith("/verihub/signup"),
      },
    ],
  },
  {
    id: "hiringClient",
    label: "Hiring Client",
    icon: ClipboardCheck,
    homeHref: () => "/client/review",
    match: (p) => p.startsWith("/client"),
    features: [
      {
        id: "review",
        label: "Contractor review",
        href: "/client/review",
        group: "operations",
        match: (p) => p === "/client" || p.startsWith("/client/review"),
      },
      {
        id: "contractors",
        label: "Contractors",
        href: "/client/contractors",
        group: "operations",
        match: (p) => p.startsWith("/client/contractors"),
      },
      {
        id: "directory",
        label: "Directory",
        href: "/client/directory",
        group: "operations",
        match: (p) => p.startsWith("/client/directory"),
      },
      {
        id: "analytics",
        label: "Analytics",
        href: "/client/analytics",
        group: "intelligence",
        match: (p) => p.startsWith("/client/analytics"),
      },
      {
        id: "login",
        label: "Sign in",
        href: "/client/login",
        group: "admin",
        showInNav: false,
        match: (p) => p.startsWith("/client/login"),
      },
      {
        id: "signup",
        label: "Sign up",
        href: "/client/signup",
        group: "admin",
        showInNav: false,
        match: (p) => p.startsWith("/client/signup"),
      },
    ],
  },
  {
    id: "developer",
    label: "Developer",
    icon: Wrench,
    homeHref: () => "/developer",
    match: (p) => p.startsWith("/developer"),
    features: [
      {
        id: "dashboard",
        label: "Dashboard",
        href: "/developer",
        group: "overview",
        match: (p) => p === "/developer" || p.startsWith("/developer/dashboard"),
      },
      {
        id: "impersonate",
        label: "Impersonate",
        href: "/developer/impersonate",
        group: "operations",
        match: (p) => p.startsWith("/developer/impersonate"),
      },
      {
        id: "modules",
        label: "Modules",
        href: "/developer/modules",
        group: "controls",
        match: (p) => p.startsWith("/developer/modules"),
      },
      {
        id: "feature-flags",
        label: "Feature flags",
        href: "/developer/feature-flags",
        group: "controls",
        match: (p) =>
          p.startsWith("/developer/feature-flags") ||
          p.startsWith("/developer/flags"),
      },
      {
        id: "logs",
        label: "Logs",
        href: "/developer/logs",
        group: "intelligence",
        match: (p) => p.startsWith("/developer/logs"),
      },
      {
        id: "api-keys",
        label: "API keys",
        href: "/developer/api-keys",
        group: "admin",
        match: (p) => p.startsWith("/developer/api-keys"),
      },
      {
        id: "login",
        label: "Sign in",
        href: "/developer/login",
        group: "admin",
        showInNav: false,
        match: (p) => p.startsWith("/developer/login"),
      },
      {
        id: "bootstrap",
        label: "Bootstrap",
        href: "/developer/bootstrap",
        group: "admin",
        showInNav: false,
        match: (p) => p.startsWith("/developer/bootstrap"),
      },
    ],
  },
  {
    id: "companies",
    label: "Companies",
    icon: Building2,
    homeHref: (role) => resolveNavHref("companies", role),
    match: (p) => p.startsWith("/companies") || p.startsWith("/admin/companies"),
    features: [
      { id: "list", label: "All companies", href: "/companies", match: (p) => p === "/companies" || (p.startsWith("/companies/") && !p.includes("/compliance") && !p.includes("/orientation")) },
      { id: "compliance", label: "Compliance", href: "/companies", match: (p) => p.includes("/companies/") && p.includes("/compliance") },
      { id: "orientations", label: "Orientations", href: "/companies", match: (p) => p.includes("/companies/") && (p.includes("/orientations") || p.includes("/orientation-requirements") || p.includes("/orientation/")) },
      { id: "admin", label: "Company admin", href: "/admin/companies", match: (p) => p.startsWith("/admin/companies") },
      { id: "safety-context", label: "Company safety context", href: "/pm/company-safety-context", match: (p) => p.startsWith("/pm/company-safety-context") },
    ],
  },
  {
    id: "workers",
    label: "Workers",
    icon: Users,
    homeHref: workersBase,
    match: (p) =>
      p.startsWith("/workers") ||
      p.startsWith("/admin/workers") ||
      p.startsWith("/core/workers") ||
      p.startsWith("/supervisor/worker") ||
      p.startsWith("/supervisor/worker-lookup") ||
      p.startsWith("/wallet") ||
      p.startsWith("/qr") ||
      p.startsWith("/field/scan") ||
      /^\/verify\/\d+/.test(p) ||
      p.startsWith("/verify/worker"),
    quickAction: { label: "+ Add Worker", href: "/admin/workers/new" },
    features: [
      { id: "active", label: "Active Workers", href: "/admin/workers", match: (p) => p.startsWith("/admin/workers") && !p.includes("inactive") && !p.endsWith("/new") && !p.includes("/create") },
      { id: "inactive", label: "Inactive Workers", href: "/admin/workers?status=inactive" },
      { id: "add", label: "Add Worker", href: "/admin/workers/new", match: (p) => p.startsWith("/admin/workers/new") || p.startsWith("/admin/workers/create") },
      { id: "core-profiles", label: "Core profiles", href: "/core/workers", match: (p) => p.startsWith("/core/workers") },
      { id: "compliance", label: "Worker Compliance", href: "/core/readiness", match: (p) => p.startsWith("/core/readiness") },
      { id: "safety-knowledge", label: "Safety Knowledge", href: "/core/safety-knowledge", match: (p) => p.startsWith("/core/safety-knowledge") },
      { id: "orientations", label: "Orientations", href: "/workers", match: (p) => p.includes("/workers/") && p.includes("/orientations") },
      { id: "assignments", label: "Assignments", href: "/equipment-assignments", match: (p) => p.startsWith("/equipment-assignments") },
      { id: "supervisor-lookup", label: "Supervisor lookup", href: "/supervisor/worker-lookup", match: (p) => p.startsWith("/supervisor/worker-lookup") || p.startsWith("/supervisor/worker/") },
      { id: "qr-scanner", label: "QR scanner", href: "/qr", match: (p) => p === "/qr" || p.startsWith("/field/scan") },
      { id: "public-verify", label: "Public verify", href: "/verify/worker", match: (p) => /^\/verify\/\d+/.test(p) || p.startsWith("/verify/worker") },
      { id: "staff-wallet", label: "VeriWallet", href: "/wallet", match: (p) => p.startsWith("/wallet") },
    ],
  },
  {
    id: "equipment",
    label: "Equipment",
    icon: Wrench,
    homeHref: equipmentBase,
    match: (p) =>
      p.startsWith("/equipment-assignments") ||
      p.startsWith("/admin/equipment") ||
      p.startsWith("/core/equipment") ||
      p.startsWith("/pm/equipment-safety") ||
      (p.startsWith("/equipment/") && !p.startsWith("/equipment-assignments")) ||
      p.startsWith("/verify/equipment") ||
      p.startsWith("/supervisor/equipment"),
    quickAction: { label: "+ Add Equipment", href: "/admin/equipment/new" },
    features: [
      { id: "active", label: "Active Equipment", href: "/admin/equipment", match: (p) => p.startsWith("/admin/equipment") && !p.includes("retired") && !p.endsWith("/new") },
      { id: "retired", label: "Retired Equipment", href: "/admin/equipment?status=retired" },
      { id: "add", label: "Add Equipment", href: "/admin/equipment/new", match: (p) => p.startsWith("/admin/equipment/new") },
      { id: "compliance", label: "Equipment Compliance", href: "/core/equipment", match: (p) => p.startsWith("/core/equipment") },
      { id: "pm-safety", label: "PM equipment safety", href: "/pm/equipment-safety", match: (p) => p.startsWith("/pm/equipment-safety") },
      { id: "inspections", label: "Inspections", href: "/pm/inspections", match: (p) => p.startsWith("/pm/inspections") },
      { id: "cert-catalog", label: "Cert catalog", href: "/admin/certifications", match: (p) => p.startsWith("/admin/certifications") },
      { id: "assignments", label: "Assignments", href: "/equipment-assignments", match: (p) => p.startsWith("/equipment-assignments") },
      { id: "verify-equipment", label: "Verify equipment", href: "/verify/equipment", match: (p) => p.startsWith("/verify/equipment") || p.startsWith("/equipment/") },
    ],
  },
  {
    id: "training",
    label: "Training",
    icon: GraduationCap,
    homeHref: (role) => resolveNavHref("training", role),
    match: (p) =>
      p.startsWith("/admin/training") ||
      p.startsWith("/core/training-ingest") ||
      p.startsWith("/core/training-competency") ||
      p.startsWith("/core/verification") ||
      p.startsWith("/core/provider-hub") ||
      p.startsWith("/supervisor/training"),
    quickAction: { label: "Upload Training", href: "/core/training-ingest" },
    features: [
      {
        id: "training-competency",
        label: "Training & Competency",
        description: "Workforce intelligence dashboard",
        href: "/core/training-competency",
        match: (p) => p.startsWith("/core/training-competency"),
      },
      { id: "records", label: "Worker Training Records", href: "/admin/training", match: (p) => p.startsWith("/admin/training") },
      { id: "dashboard", label: "Training dashboard", href: "/admin/training/dashboard", match: (p) => p.startsWith("/admin/training/dashboard") },
      { id: "standards", label: "Training standards", href: "/admin/training-standards/results", match: (p) => p.startsWith("/admin/training-standards") },
      { id: "expiry", label: "Training Expiry", href: "/core/readiness", match: (p) => p.startsWith("/core/readiness") },
      { id: "upload", label: "Upload Training", href: "/core/training-ingest", match: (p) => p.startsWith("/core/training-ingest") },
      { id: "providers", label: "Training Providers", href: "/provider-portal", match: (p) => p.startsWith("/provider-portal") },
      { id: "verification", label: "Training Verification", href: "/core/verification", match: (p) => p.startsWith("/core/verification") },
      { id: "needs-review", label: "Needs review", href: "/supervisor/training/review", match: (p) => p.startsWith("/supervisor/training/review") },
      { id: "provider-hub", label: "Provider integration hub", href: "/core/provider-hub", match: (p) => p.startsWith("/core/provider-hub") },
      { id: "verify-training", label: "Verify record", href: "/verify/core/training/1", match: (p) => p.startsWith("/verify/core/training") || p.startsWith("/verify/training") || p.startsWith("/verify/credential") },
    ],
  },
  {
    id: "compliance",
    label: "Compliance",
    icon: ShieldCheck,
    homeHref: (role) => resolveNavHref("compliance", role),
    match: (p) => p.startsWith("/training-provider") || p.startsWith("/provider-portal/compliance"),
    features: [
      { id: "dashboard", label: "Compliance dashboard", href: "/training-provider", match: (p) => p.startsWith("/training-provider") },
      { id: "portal", label: "Provider compliance", href: "/provider-portal/compliance", match: (p) => p.startsWith("/provider-portal/compliance") },
      { id: "notes", label: "Compliance notes", href: "/core/compliance-notes", match: (p) => p.startsWith("/core/compliance-notes") },
    ],
  },
  {
    id: "unionHalls",
    label: "Union Halls",
    icon: Building2,
    homeHref: () => "/union-hall",
    match: (p) => p.startsWith("/union-hall"),
    features: [
      { id: "directory", label: "Union hall directory", href: "/union-hall", match: (p) => p === "/union-hall" || /^\/union-hall\/\d+/.test(p) },
      { id: "reports", label: "Union hall reports", href: "/admin/reporting/union-halls", match: (p) => p.includes("union-halls") },
    ],
  },
  {
    id: "trainingProviders",
    label: "Training Providers",
    icon: GraduationCap,
    homeHref: () => "/provider-portal",
    match: (p) => p.startsWith("/provider-portal"),
    features: [
      { id: "dashboard", label: "Provider dashboard", href: "/provider-portal", match: (p) => p === "/provider-portal" },
      { id: "courses", label: "Courses", href: "/provider-portal/courses", match: (p) => p.startsWith("/provider-portal/courses") },
      { id: "instructors", label: "Instructors", href: "/provider-portal/instructors", match: (p) => p.startsWith("/provider-portal/instructors") },
      { id: "upload", label: "Upload records", href: "/provider-portal/upload", match: (p) => p.startsWith("/provider-portal/upload") },
      { id: "certificates", label: "Certificates", href: "/provider-portal/certificates", match: (p) => p.startsWith("/provider-portal/certificates") },
      { id: "compliance", label: "Compliance", href: "/provider-portal/compliance", match: (p) => p.startsWith("/provider-portal/compliance") },
    ],
  },
  {
    id: "reports",
    label: "Reports",
    icon: BarChart3,
    homeHref: () => "/admin/reporting",
    match: (p) => p.startsWith("/admin/reporting"),
    features: [
      { id: "overview", label: "Reporting hub", href: "/admin/reporting", match: (p) => p === "/admin/reporting" },
      { id: "workers", label: "Worker reports", href: "/admin/reporting/workers", match: (p) => p.startsWith("/admin/reporting/workers") },
      { id: "equipment", label: "Equipment reports", href: "/admin/reporting/equipment", match: (p) => p.startsWith("/admin/reporting/equipment") },
      { id: "projects", label: "Project reports", href: "/admin/reporting/projects", match: (p) => p.startsWith("/admin/reporting/projects") },
      { id: "companies", label: "Company reports", href: "/admin/reporting/companies", match: (p) => p.startsWith("/admin/reporting/companies") },
      { id: "competency", label: "Competency reports", href: "/admin/reporting/competency", match: (p) => p.startsWith("/admin/reporting/competency") },
      { id: "inspections", label: "Inspection reports", href: "/admin/reporting/inspections", match: (p) => p.startsWith("/admin/reporting/inspections") },
      { id: "union-halls", label: "Union hall reports", href: "/admin/reporting/union-halls", match: (p) => p.startsWith("/admin/reporting/union-halls") },
    ],
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    homeHref: (role) =>
      isPlatformAdmin(role) ? "/admin/subscriptions" : resolveNavHref("settings", role),
    match: (p) =>
      p.startsWith("/admin/settings") ||
      p.startsWith("/supervisor/settings") ||
      isAdminSettingsRoute(p),
    features: [
      {
        id: "subscription-map",
        label: "User tracking map",
        href: "/admin/subscriptions",
        match: (p) => p.startsWith("/admin/subscriptions"),
      },
      { id: "users", label: "User Management", href: "/admin/users", match: (p) => p.startsWith("/admin/users") },
      { id: "logs", label: "System Logs", href: "/admin/logs", match: (p) => p.startsWith("/admin/logs") },
      { id: "features", label: "Feature Flags", href: "/admin/features", match: (p) => p.startsWith("/admin/features") },
      {
        id: "adoption-map",
        label: "Adoption Map",
        href: "/admin/adoption",
        match: (p) => p.startsWith("/admin/adoption"),
      },
      {
        id: "feedback",
        label: "Feedback Manager",
        href: "/admin/feedback",
        match: (p) => p.startsWith("/admin/feedback"),
      },
      { id: "overview", label: "Admin overview", href: "/admin", match: (p) => p === "/admin" },
      { id: "acp", label: "Admin control panel", href: "/admin/acp", match: (p) => p.startsWith("/admin/acp") },
      { id: "tenants", label: "Tenants", href: "/admin/tenants", match: (p) => p.startsWith("/admin/tenants") },
      { id: "roles", label: "Roles", href: "/admin/roles", match: (p) => p.startsWith("/admin/roles") },
      { id: "permissions", label: "Permissions", href: "/admin/permissions", match: (p) => p.startsWith("/admin/permissions") },
      { id: "general", label: "General settings", href: "/admin/settings", match: (p) => p === "/admin/settings" },
      { id: "supervisor", label: "Supervisor settings", href: "/supervisor/settings", match: (p) => p.startsWith("/supervisor/settings") },
      { id: "moderation", label: "Moderation", href: "/admin/moderation", match: (p) => p.startsWith("/admin/moderation") },
      { id: "competency-eval", label: "Competency evaluate", href: "/admin/competency/evaluate", match: (p) => p.startsWith("/admin/competency") },
    ],
  },
];

/** Always-visible product switcher — Hub, Core, PM, FieldOS, VeriAgent. */
export const VERA_PRIMARY_PRODUCT_IDS: VeraGlobalModuleId[] = [
  "veraHub",
  "veraCore",
  "veraPm",
  "fieldOs",
  "veriAgent",
];

export function resolvePrimaryProducts(): VeraGlobalModule[] {
  return VERA_PRIMARY_PRODUCT_IDS.map((id) => resolveGlobalModuleById(id));
}

export function resolveActiveGlobalModule(pathname: string): VeraGlobalModule | null {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  return VERA_GLOBAL_MODULES.find((m) => m.match(normalized)) ?? null;
}

export function resolveGlobalModuleById(id: VeraGlobalModuleId): VeraGlobalModule {
  const mod = VERA_GLOBAL_MODULES.find((m) => m.id === id);
  if (!mod) throw new Error(`Unknown global module: ${id}`);
  return mod;
}

export function resolveActiveFeature(
  module: VeraGlobalModule,
  pathname: string,
): VeraNavFeature {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  return (
    module.features.find((f) => f.match?.(normalized)) ??
    module.features.find((f) => normalized === f.href || normalized.startsWith(f.href + "/")) ??
    module.features[0]
  );
}

/**
 * Visible ModuleNav features for a module (respects `showInNav`).
 * Vera PM: index 0 = VeriPM Dashboard, index 1 = SMS Core (locked).
 */
export function getVisibleModuleFeatures(
  module: VeraGlobalModule,
): VeraNavFeature[] {
  return module.features.filter((f) => f.showInNav !== false);
}

/** Locked Vera PM primary order — SMS Core must remain second. */
export function getVeraPmPrimaryNavIds(): string[] {
  return getVisibleModuleFeatures(resolveGlobalModuleById("veraPm")).map(
    (f) => f.id,
  );
}

export function resolveFeatureHrefs(module: VeraGlobalModule, role: string | null): VeraNavFeature[] {
  const home = module.homeHref(role);
  return module.features.map((f) => ({
    ...f,
    href: f.href.startsWith("http") ? f.href : f.href,
  }));
}

/** Resolve module home with role-aware base paths for worker/equipment features. */
export function globalModuleHomeHref(module: VeraGlobalModule, role: string | null): string {
  return module.homeHref(role);
}

export function globalModulesForRole(_role: string | null): VeraGlobalModule[] {
  return VERA_GLOBAL_MODULES;
}

export function resolveModuleQuickAction(
  module: VeraGlobalModule,
  role: string | null,
): { label: string; href: string } | null {
  if (!module.quickAction) return null;
  const href =
    typeof module.quickAction.href === "function"
      ? module.quickAction.href(role)
      : module.quickAction.href;
  return { label: module.quickAction.label, href };
}
