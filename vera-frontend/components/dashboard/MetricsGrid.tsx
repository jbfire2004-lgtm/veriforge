import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  GraduationCap,
  ShieldAlert,
  Users,
} from "lucide-react";
import {
  Card,
  CardContent,
  EmptyState,
  Skeleton,
  StatusPill,
  type StatusPillTone,
} from "@/components/ui";
import { ErrorState } from "@/components/ui/error-state";
import { cn } from "@/src/lib/utils";
import {
  loadDashboardOverview,
  loadTrainingExpirySummary,
  type DashboardOverview,
  type TrainingExpirySummary,
} from "./dashboard-api";

type MetricAccent = "teal" | "indigo" | "emerald" | "violet" | "amber" | "red";

type MetricTile = {
  label: string;
  value: number;
  href: string;
  icon: LucideIcon;
  description: string;
  status: { tone: StatusPillTone; label: string; icon?: LucideIcon };
  accent: MetricAccent;
};

const accentStyles: Record<
  MetricAccent,
  { iconWrap: string; valueText: string; ring: string }
> = {
  teal: {
    iconWrap: "bg-vera-teal/15 text-vera-deep",
    valueText: "text-vera-deep",
    ring: "ring-vera-teal/30",
  },
  indigo: {
    iconWrap: "bg-indigo-50 text-indigo-700",
    valueText: "text-vera-deep",
    ring: "ring-indigo-100",
  },
  emerald: {
    iconWrap: "bg-emerald-50 text-emerald-700",
    valueText: "text-vera-deep",
    ring: "ring-emerald-100",
  },
  violet: {
    iconWrap: "bg-violet-50 text-violet-700",
    valueText: "text-vera-deep",
    ring: "ring-violet-100",
  },
  amber: {
    iconWrap: "bg-amber-50 text-amber-700",
    valueText: "text-amber-700",
    ring: "ring-amber-100",
  },
  red: {
    iconWrap: "bg-red-50 text-red-600",
    valueText: "text-red-600",
    ring: "ring-red-100",
  },
};

function buildTiles(
  overview: DashboardOverview,
  expiry: TrainingExpirySummary | null
): MetricTile[] {
  const expiringSoon = expiry?.expiringSoon ?? 0;
  const expired = expiry?.expired ?? 0;

  return [
    {
      label: "Workers",
      value: overview.workers,
      href: "/admin/workers",
      icon: Users,
      description: "Active worker profiles",
      status: { tone: "info", label: "Healthy", icon: CheckCircle2 },
      accent: "indigo",
    },
    {
      label: "Companies",
      value: overview.companies,
      href: "/companies",
      icon: Building2,
      description: "Organizations in the directory",
      status: { tone: "info", label: "Healthy", icon: CheckCircle2 },
      accent: "teal",
    },
    {
      label: "Trainings",
      value: overview.trainingRecords,
      href: "/admin/training",
      icon: GraduationCap,
      description: "Total training records",
      status: { tone: "success", label: "On record", icon: CheckCircle2 },
      accent: "emerald",
    },
    {
      label: "Credentials",
      value: overview.credentials,
      href: "/admin/certifications",
      icon: ClipboardCheck,
      description: "Issued credentials on file",
      status: { tone: "success", label: "Verified", icon: CheckCircle2 },
      accent: "violet",
    },
    {
      label: "Expiring soon",
      value: expiringSoon,
      href: "/admin/training",
      icon: AlertTriangle,
      description: "Training records expiring in 30 days",
      status:
        expiringSoon > 0
          ? { tone: "warning", label: "Watch", icon: AlertTriangle }
          : { tone: "success", label: "On track", icon: CheckCircle2 },
      accent: expiringSoon > 0 ? "amber" : "teal",
    },
    {
      label: "Expired training",
      value: expired,
      href: "/admin/training",
      icon: ShieldAlert,
      description: "Past-due training records",
      status:
        expired > 0
          ? { tone: "danger", label: "Action needed", icon: ShieldAlert }
          : { tone: "success", label: "All current", icon: CheckCircle2 },
      accent: expired > 0 ? "red" : "teal",
    },
  ];
}

function MetricCard({ tile }: { tile: MetricTile }) {
  const Icon = tile.icon;
  const accent = accentStyles[tile.accent];
  return (
    <Link
      href={tile.href}
      className="group block rounded-xl outline-none transition focus-visible:ring-2 focus-visible:ring-vera-teal focus-visible:ring-offset-2"
    >
      <Card className="h-full overflow-hidden transition-shadow group-hover:shadow-vera">
        <CardContent className="flex h-full flex-col gap-vera-5 p-vera-6">
          <div className="flex items-start justify-between gap-vera-3">
            <span
              className={cn(
                "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-md ring-1 ring-inset",
                accent.iconWrap,
                accent.ring
              )}
            >
              <Icon className="h-5 w-5" aria-hidden />
            </span>
            <StatusPill tone={tile.status.tone} icon={tile.status.icon} subtle>
              {tile.status.label}
            </StatusPill>
          </div>
          <div className="space-y-vera-1">
            <p
              className={cn(
                "text-2xl font-medium tabular-nums leading-tight tracking-tight sm:text-3xl",
                accent.valueText
              )}
            >
              {tile.value.toLocaleString()}
            </p>
            <p className="text-sm font-medium text-vera-charcoal">{tile.label}</p>
            <p className="text-xs font-normal leading-relaxed text-vera-muted">
              {tile.description}
            </p>
          </div>
          <span className="mt-auto inline-flex items-center gap-vera-2 text-xs font-medium text-vera-teal opacity-0 transition group-hover:opacity-100">
            View
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
          </span>
        </CardContent>
      </Card>
    </Link>
  );
}

function SectionHeading({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <header className="flex flex-col gap-vera-1">
      <h2 className="text-base font-medium leading-tight tracking-tight text-vera-deep">
        {title}
      </h2>
      <p className="text-sm font-normal leading-relaxed text-vera-muted">
        {description}
      </p>
    </header>
  );
}

export function MetricsGridSkeleton() {
  return (
    <section aria-label="System metrics" className="space-y-vera-5">
      <div className="flex flex-col gap-vera-1">
        <Skeleton className="h-5 w-40 rounded-md" />
        <Skeleton className="h-4 w-72 rounded-md" />
      </div>
      <div className="grid gap-vera-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="h-full">
            <CardContent className="flex h-full flex-col gap-vera-5 p-vera-6">
              <div className="flex items-start justify-between gap-vera-3">
                <Skeleton className="h-11 w-11 rounded-xl" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
              <div className="space-y-vera-2">
                <Skeleton className="h-8 w-24 rounded-md" />
                <Skeleton className="h-4 w-28 rounded-md" />
                <Skeleton className="h-3 w-40 rounded-md" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

export async function MetricsGrid() {
  const [overviewRes, expiryRes] = await Promise.all([
    loadDashboardOverview(),
    loadTrainingExpirySummary(),
  ]);

  if (!overviewRes.ok) {
    return (
      <section aria-label="System metrics" className="space-y-vera-5">
        <SectionHeading
          title="System overview"
          description="At-a-glance counts across workers, companies, training, and credentials."
        />
        <ErrorState
          title="Metrics unavailable"
          description={overviewRes.error || "Could not load the system totals."}
        />
      </section>
    );
  }

  const tiles = buildTiles(overviewRes.data, expiryRes.ok ? expiryRes.data : null);
  const allZero = tiles.every((t) => t.value === 0);

  return (
    <section aria-label="System metrics" className="space-y-vera-5">
      <SectionHeading
        title="System overview"
        description="At-a-glance counts across workers, companies, training, and credentials."
      />
      {allZero ? (
        <EmptyState
          icon={BarChart3}
          title="No data yet"
          description="Once workers, companies, and training records are added, totals will appear here."
        />
      ) : (
        <div className="grid gap-vera-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          {tiles.map((tile) => (
            <MetricCard key={tile.label} tile={tile} />
          ))}
        </div>
      )}
    </section>
  );
}
