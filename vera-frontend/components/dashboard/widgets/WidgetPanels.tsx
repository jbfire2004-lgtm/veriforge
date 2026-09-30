import Link from "next/link";
import {
  Activity,
  Building2,
  CalendarClock,
  ClipboardCheck,
  GraduationCap,
  HardHat,
  ShieldCheck,
  Users,
} from "lucide-react";
import { resolveNavHref } from "@/lib/navigation/sidebar-config";
import type {
  AssignmentsWidgetData,
  DashboardWidgetsBundle,
  EquipmentComplianceWidgetData,
  ProjectReadinessWidgetData,
  ProviderApprovalWidgetData,
  SystemHealthWidgetData,
  TrainingExpiryWidgetData,
  UnionDispatchWidgetData,
  WorkerComplianceWidgetData,
} from "@/lib/dashboard/types";
import { ComplianceWidget } from "@/components/vera-core/dashboard";
import { ProgressBar } from "@/components/vera-core/status";
import { WidgetContainer } from "../engine/WidgetContainer";
import { cn } from "@/src/lib/utils";

type PanelProps = { role: string | null };

export function WorkerCompliancePanel({
  data,
  role,
}: PanelProps & { data: WorkerComplianceWidgetData }) {
  const href = resolveNavHref("workers", role);
  const tone =
    data.complianceRate >= 90
      ? "success"
      : data.complianceRate >= 70
        ? "warning"
        : "danger";

  return (
    <WidgetContainer
      title="Worker compliance"
      subtitle={`${data.evaluated} of ${data.totalWorkers} evaluated`}
      icon={Users}
      tone={tone}
      action={{ label: "View workers", href }}
    >
      <ComplianceWidget
        title=""
        progress={data.complianceRate}
        progressLabel="Compliance rate"
        status={tone === "success" ? "compliant" : tone === "warning" ? "expiring" : "nonCompliant"}
        breakdown={[
          { label: "Compliant", value: data.compliant, tone: "success" },
          { label: "Non-compliant", value: data.nonCompliant, tone: "danger" },
          { label: "Expiring soon", value: data.expiringSoon, tone: "warning" },
        ]}
        className="border-0 bg-transparent p-0 shadow-none"
      />
      {data.topIssues.length > 0 ? (
        <ul className="mt-3 space-y-1 text-sm" aria-label="Top issues">
          {data.topIssues.map((issue) => (
            <li key={issue.label} className="flex justify-between text-[var(--muted-foreground)]">
              <span>{issue.label}</span>
              <span className="font-medium text-[var(--foreground)]">{issue.count}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </WidgetContainer>
  );
}

export function EquipmentCompliancePanel({
  data,
  role,
}: PanelProps & { data: EquipmentComplianceWidgetData }) {
  const href = resolveNavHref("equipment", role);
  const tone =
    data.complianceRate >= 90
      ? "success"
      : data.complianceRate >= 70
        ? "warning"
        : "danger";

  return (
    <WidgetContainer
      title="Equipment compliance"
      subtitle={`${data.total} assets tracked`}
      icon={HardHat}
      tone={tone}
      action={{ label: "View equipment", href }}
    >
      <ProgressBar value={data.complianceRate} label="Compliance rate" showLabel tone="teal" />
      <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
        <Stat label="Locked out" value={data.lockedOut} />
        <Stat label="Overdue inspection" value={data.overdueInspection} />
        <Stat label="Non-compliant" value={data.nonCompliant} />
        <Stat label="Compliant" value={data.compliant} />
      </dl>
    </WidgetContainer>
  );
}

export function TrainingExpiryPanel({
  data,
  role,
}: PanelProps & { data: TrainingExpiryWidgetData }) {
  const href = resolveNavHref("training", role);
  const tone = data.expired > 0 ? "danger" : data.highRisk > 0 ? "warning" : "default";

  return (
    <WidgetContainer
      title="Training expiry"
      subtitle="30 / 60 / 90 day windows"
      icon={GraduationCap}
      tone={tone}
      action={{ label: "View training", href }}
    >
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Bucket label="Expired" value={data.expired} urgent />
        <Bucket label="≤30 days" value={data.expiring30} />
        <Bucket label="31–60 days" value={data.expiring60} />
        <Bucket label="61–90 days" value={data.expiring90} />
      </div>
      {data.gaps > 0 ? (
        <p className="mt-3 text-sm text-[var(--muted-foreground)]">
          <span className="font-medium text-[var(--foreground)]">{data.gaps}</span> workers with no
          training on file
        </p>
      ) : null}
    </WidgetContainer>
  );
}

export function ProjectReadinessPanel({
  data,
  role,
}: PanelProps & { data: ProjectReadinessWidgetData }) {
  const href = resolveNavHref("projects", role);
  return (
    <WidgetContainer
      title="Project readiness"
      subtitle={`${data.totalProjects} active projects`}
      icon={Building2}
      tone={
        data.averageReadiness >= 90
          ? "success"
          : data.averageReadiness >= 70
            ? "warning"
            : "danger"
      }
      action={{ label: "View projects", href }}
    >
      <p className="text-3xl font-bold tracking-tight text-[var(--foreground)]">
        {data.averageReadiness}%
      </p>
      <p className="text-sm text-[var(--muted-foreground)]">
        {data.ready} of {data.totalProjects} projects ready
      </p>
      <dl className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
        <Stat label="At risk" value={data.atRisk} />
        <Stat label="Not ready" value={data.notReady} />
        <Stat label="Gaps" value={data.missingWorkers + data.missingEquipment} />
      </dl>
    </WidgetContainer>
  );
}

export function ProviderApprovalsPanel({ data }: { data: ProviderApprovalWidgetData }) {
  return (
    <WidgetContainer
      title="Provider approvals"
      subtitle="Training providers & instructors"
      icon={ShieldCheck}
      action={{ label: "Review approvals", href: "/provider-portal/approval" }}
    >
      <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <Stat label="Approved" value={data.approved} />
        <Stat label="Pending" value={data.pending} highlight={data.pending > 0} />
        <Stat label="Rejected" value={data.rejected} />
        <Stat label="Expiring quals" value={data.expiringApprovals} />
      </dl>
    </WidgetContainer>
  );
}

export function UnionDispatchPanel({
  data,
  role,
}: PanelProps & { data: UnionDispatchWidgetData }) {
  const href = resolveNavHref("unionHalls", role);
  return (
    <WidgetContainer
      title="Union dispatch"
      subtitle={`${data.activeMembers} active members`}
      icon={ClipboardCheck}
      action={{ label: "Open dispatch", href }}
    >
      <dl className="grid grid-cols-2 gap-3 text-sm">
        <Stat label="Ready" value={data.readyForDispatch} />
        <Stat label="Dispatched" value={data.currentlyDispatched} />
        <Stat label="Missing training" value={data.missingTraining} highlight={data.missingTraining > 0} />
        <Stat label="Total dispatches" value={data.totalDispatches} />
      </dl>
    </WidgetContainer>
  );
}

export function SystemHealthPanel({ data }: { data: SystemHealthWidgetData }) {
  const tone =
    data.status === "healthy" ? "success" : data.status === "degraded" ? "warning" : "danger";
  return (
    <WidgetContainer title="System health" subtitle="Platform overview" icon={Activity} tone={tone}>
      <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
        <Stat label="Workers" value={data.workers} />
        <Stat label="Equipment" value={data.equipment} />
        <Stat label="Companies" value={data.companies} />
        <Stat label="Training records" value={data.trainingRecords} />
        <Stat label="Open incidents" value={data.openIncidents} highlight={data.openIncidents > 0} />
      </dl>
    </WidgetContainer>
  );
}

export function AssignmentsPanel({ data }: { data: AssignmentsWidgetData }) {
  return (
    <WidgetContainer
      title="Today's assignments"
      subtitle="Active field assignments"
      icon={CalendarClock}
      action={{ label: "View roster", href: "/supervisor" }}
    >
      <dl className="grid grid-cols-3 gap-3 text-sm">
        <Stat label="Active" value={data.activeAssignments} />
        <Stat label="At risk" value={data.atRisk} highlight={data.atRisk > 0} />
        <Stat label="Workers" value={data.totalWorkers} />
      </dl>
    </WidgetContainer>
  );
}

export function renderDataWidget(
  widgetId: string,
  bundle: DashboardWidgetsBundle,
  role: string | null
) {
  switch (widgetId) {
    case "workerCompliance":
      return bundle.workerCompliance ? (
        <WorkerCompliancePanel data={bundle.workerCompliance} role={role} />
      ) : null;
    case "equipmentCompliance":
      return bundle.equipmentCompliance ? (
        <EquipmentCompliancePanel data={bundle.equipmentCompliance} role={role} />
      ) : null;
    case "trainingExpiry":
      return bundle.trainingExpiry ? (
        <TrainingExpiryPanel data={bundle.trainingExpiry} role={role} />
      ) : null;
    case "projectReadiness":
      return bundle.projectReadiness ? (
        <ProjectReadinessPanel data={bundle.projectReadiness} role={role} />
      ) : null;
    case "providerApprovals":
      return bundle.providerApprovals ? (
        <ProviderApprovalsPanel data={bundle.providerApprovals} />
      ) : null;
    case "unionDispatch":
      return bundle.unionDispatch ? (
        <UnionDispatchPanel data={bundle.unionDispatch} role={role} />
      ) : null;
    case "systemHealth":
      return bundle.systemHealth ? <SystemHealthPanel data={bundle.systemHealth} /> : null;
    case "assignments":
      return bundle.assignments ? <AssignmentsPanel data={bundle.assignments} /> : null;
    default:
      return null;
  }
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-md)] bg-[var(--muted)] px-3 py-2",
        highlight && "ring-1 ring-[var(--badge-warning-fg)]"
      )}
    >
      <dt className="text-xs text-[var(--muted-foreground)]">{label}</dt>
      <dd className="text-lg font-semibold tabular-nums text-[var(--foreground)]">{value}</dd>
    </div>
  );
}

function Bucket({ label, value, urgent }: { label: string; value: number; urgent?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-md)] px-3 py-2 text-center",
        urgent
          ? "bg-[var(--badge-danger-bg)] text-[var(--badge-danger-fg)]"
          : "bg-[var(--muted)] text-[var(--foreground)]"
      )}
    >
      <p className="text-xl font-bold tabular-nums">{value}</p>
      <p className="text-xs font-medium uppercase tracking-wide opacity-80">{label}</p>
    </div>
  );
}
