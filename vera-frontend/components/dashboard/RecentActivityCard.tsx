import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  GraduationCap,
  Inbox,
  ShieldAlert,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
  ErrorState,
  StatusPill,
  type StatusPillTone,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableSkeleton,
} from "@/components/ui";
import { buttonStyles } from "@/components/ui/button";
import { cn } from "@/src/lib/utils";
import {
  formatShortDate,
  getExpiryTone,
  parseDate,
} from "@/components/wallet/worker-wallet-utils";
import {
  loadRecentUploads,
  type RecentCredential,
  type RecentDocument,
  type RecentTrainingRecord,
  type RecentWorkerRef,
} from "./dashboard-api";

type ActivityKind = "training" | "credential" | "document";

type ActivityStatus = {
  tone: StatusPillTone;
  label: string;
  icon?: LucideIcon;
};

type ActivityRow = {
  id: string;
  kind: ActivityKind;
  title: string;
  subtitle: string | null;
  worker: RecentWorkerRef | null;
  workerFallback: string | null;
  date: Date | null;
  href: string;
  external: boolean;
  actionLabel: string;
  status: ActivityStatus;
};

const kindMeta: Record<
  ActivityKind,
  { label: string; icon: LucideIcon; iconWrap: string; ring: string }
> = {
  training: {
    label: "Training",
    icon: GraduationCap,
    iconWrap: "bg-emerald-50 text-emerald-700",
    ring: "ring-emerald-100",
  },
  credential: {
    label: "Credential",
    icon: ClipboardCheck,
    iconWrap: "bg-violet-50 text-violet-700",
    ring: "ring-violet-100",
  },
  document: {
    label: "Document",
    icon: FileText,
    iconWrap: "bg-indigo-50 text-indigo-700",
    ring: "ring-indigo-100",
  },
};

function workerName(w: RecentWorkerRef | null): string {
  if (!w) return "Unassigned";
  const full = [w.firstName, w.lastName].filter(Boolean).join(" ");
  return full || `Worker #${w.id}`;
}

function expiryStatus(expiresAt: Date | null): ActivityStatus {
  const tone = getExpiryTone(expiresAt);
  switch (tone) {
    case "good":
      return { tone: "success", label: "Active", icon: CheckCircle2 };
    case "soon":
      return { tone: "warning", label: "Expiring soon", icon: AlertTriangle };
    case "bad":
      return { tone: "danger", label: "Expired", icon: ShieldAlert };
    default:
      return { tone: "info", label: "On record", icon: CheckCircle2 };
  }
}

function trainingToActivity(row: RecentTrainingRecord): ActivityRow {
  return {
    id: `training-${row.id}`,
    kind: "training",
    title: row.certification?.name ?? "Training record",
    subtitle: row.certificateNumber ? `Certificate #${row.certificateNumber}` : null,
    worker: row.worker,
    workerFallback: null,
    date: parseDate(row.issuedAt),
    href: `/verify/training?id=${encodeURIComponent(String(row.id))}`,
    external: false,
    actionLabel: "Open",
    status: expiryStatus(parseDate(row.expiresAt)),
  };
}

function credentialToActivity(row: RecentCredential): ActivityRow {
  return {
    id: `credential-${row.id}`,
    kind: "credential",
    title: row.name ?? row.certification?.name ?? "Credential",
    subtitle: null,
    worker: row.worker,
    workerFallback: null,
    date: parseDate(row.issuedAt),
    href: `/verify/credential?id=${encodeURIComponent(String(row.id))}`,
    external: false,
    actionLabel: "Verify",
    status: expiryStatus(parseDate(row.expiresAt)),
  };
}

function documentToActivity(row: RecentDocument): ActivityRow {
  const internalHref =
    row.workerId != null ? `/verify/${row.workerId}` : null;
  const external = internalHref == null && (row.url ?? "") !== "";
  return {
    id: `document-${row.id}`,
    kind: "document",
    title: row.name ?? "Document",
    subtitle: row.type ?? "DOCUMENT",
    worker: null,
    workerFallback:
      row.workerId != null
        ? `Worker #${row.workerId}`
        : row.companyId != null
          ? `Company #${row.companyId}`
          : row.equipmentId != null
            ? `Equipment #${row.equipmentId}`
            : null,
    date: parseDate(row.createdAt),
    href: internalHref ?? row.url ?? "#",
    external,
    actionLabel: internalHref != null ? "Open worker" : external ? "View file" : "Open",
    status: { tone: "info", label: "Uploaded", icon: CheckCircle2 },
  };
}

function mergeActivity(lists: ActivityRow[][], limit: number): ActivityRow[] {
  return lists
    .flat()
    .sort((a, b) => {
      const at = a.date?.getTime() ?? 0;
      const bt = b.date?.getTime() ?? 0;
      return bt - at;
    })
    .slice(0, limit);
}

function ActivityKindCell({ kind }: { kind: ActivityKind }) {
  const meta = kindMeta[kind];
  const Icon = meta.icon;
  return (
    <div className="flex items-center gap-vera-3">
      <span
        className={cn(
          "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg shadow-md ring-1 ring-inset",
          meta.iconWrap,
          meta.ring
        )}
      >
        <Icon className="h-4 w-4" aria-hidden />
      </span>
      <span className="text-xs font-medium uppercase tracking-wide text-vera-muted">
        {meta.label}
      </span>
    </div>
  );
}

function ActivityWorkerCell({ row }: { row: ActivityRow }) {
  if (row.worker != null) {
    return (
      <Link
        href={`/verify/${row.worker.id}`}
        className="text-sm font-medium text-vera-charcoal hover:text-vera-teal hover:underline"
      >
        {workerName(row.worker)}
      </Link>
    );
  }
  if (row.workerFallback) {
    return <span className="text-sm text-vera-muted">{row.workerFallback}</span>;
  }
  return <span className="text-sm text-vera-muted">—</span>;
}

function ActivityActionCell({ row }: { row: ActivityRow }) {
  return (
    <Link
      href={row.href}
      target={row.external ? "_blank" : undefined}
      rel={row.external ? "noopener noreferrer" : undefined}
      className={buttonStyles({ variant: "outline", size: "sm" })}
    >
      {row.actionLabel}
    </Link>
  );
}

function RecentActivityShell({
  children,
  viewAllHref = "/admin/training",
}: {
  children: React.ReactNode;
  viewAllHref?: string;
}) {
  return (
    <Card className="border-vera-charcoal/10 shadow-sm">
      <CardHeader className="flex flex-col gap-vera-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-vera-1">
          <CardTitle className="text-xl tracking-tight">Recent activity</CardTitle>
          <CardDescription>
            Latest training records, credentials, and documents added across VERA.
          </CardDescription>
        </div>
        <Link
          href={viewAllHref}
          className="text-sm font-medium text-vera-teal hover:underline"
        >
          View all training records
        </Link>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export function RecentActivitySkeleton() {
  return (
    <RecentActivityShell>
      <TableSkeleton rows={6} columns={6} />
    </RecentActivityShell>
  );
}

export async function RecentActivityCard() {
  const res = await loadRecentUploads(5);

  if (!res.ok) {
    return (
      <RecentActivityShell>
        <ErrorState
          title="Recent activity unavailable"
          description={res.error}
        />
      </RecentActivityShell>
    );
  }

  const rows = mergeActivity(
    [
      res.data.trainingRecords.map(trainingToActivity),
      res.data.credentials.map(credentialToActivity),
      res.data.documents.map(documentToActivity),
    ],
    12
  );

  if (rows.length === 0) {
    return (
      <RecentActivityShell>
        <EmptyState
          icon={Inbox}
          title="No recent activity"
          description="When workers, credentials, or documents are added, they'll appear here."
        />
      </RecentActivityShell>
    );
  }

  return (
    <RecentActivityShell>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[170px]">Type</TableHead>
            <TableHead>Item</TableHead>
            <TableHead>Worker</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Date</TableHead>
            <TableHead className="w-[120px] text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell>
                <ActivityKindCell kind={row.kind} />
              </TableCell>
              <TableCell>
                <p className="font-medium text-vera-charcoal">{row.title}</p>
                {row.subtitle != null && (
                  <p className="text-xs text-vera-muted">{row.subtitle}</p>
                )}
              </TableCell>
              <TableCell>
                <ActivityWorkerCell row={row} />
              </TableCell>
              <TableCell>
                <StatusPill
                  tone={row.status.tone}
                  icon={row.status.icon}
                  subtle
                >
                  {row.status.label}
                </StatusPill>
              </TableCell>
              <TableCell className="text-right text-sm tabular-nums text-vera-muted">
                {formatShortDate(row.date)}
              </TableCell>
              <TableCell className="text-right">
                <ActivityActionCell row={row} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </RecentActivityShell>
  );
}
