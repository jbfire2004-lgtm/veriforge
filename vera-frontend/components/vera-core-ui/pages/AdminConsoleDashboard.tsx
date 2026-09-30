"use client";

import Link from "next/link";
import {
  Activity,
  Building2,
  GraduationCap,
  HardHat,
  ShieldAlert,
  Users,
} from "lucide-react";
import { buttonStyles } from "@/components/ui";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui";
import type { AdminActivityRow, AdminDashboardStats } from "@/app/admin/AdminDashboardView";
import { complianceFromScore } from "@/lib/vera-core-ui/compliance";
import { CoreHero } from "../CoreHero";
import { CoreDashboardGrid } from "../CoreDashboardGrid";
import { CoreMetricTile } from "../CoreMetricTile";
import { CoreSection } from "../CoreSection";
import { SyncPulse } from "../SyncPulse";
import { useVeraCoreUI } from "@/lib/vera-core-ui/store";

type Props = {
  stats: AdminDashboardStats | null;
  activity: AdminActivityRow[];
  metricsError?: string | null;
};

export function AdminConsoleDashboard({ stats, activity, metricsError }: Props) {
  const { markSynced } = useVeraCoreUI();
  const attention =
    (stats?.trainingAttentionCount ?? 0) + (stats?.credentialAttentionCount ?? 0);
  const readiness = stats
    ? Math.max(
        0,
        100 -
          Math.round(
            ((attention + (stats.unsafeEquipmentCount ?? 0)) /
              Math.max(stats.workerCount, 1)) *
              100,
          ),
      )
    : 0;
  const compliance = complianceFromScore(readiness, stats?.unsafeEquipmentCount ?? 0);

  return (
    <div className="space-y-8 vera-motion-stagger">
      <CoreHero
        eyebrow="Admin console"
        title="Organization command center"
        description="Workers, companies, training attention, and equipment safety — one minimalist surface."
        score={readiness}
        compliance={compliance}
        badges={[
          {
            label: attention > 0 ? `${attention} need attention` : "All clear",
            state: attention > 0 ? "at_risk" : "ok",
          },
        ]}
        actions={
          <>
            <SyncPulse onSync={() => markSynced()} />
            <Link href="/admin/acp" className={buttonStyles({ variant: "teal", size: "sm" })}>
              Admin control panel
            </Link>
          </>
        }
      />

      {metricsError ? (
        <p className="rounded-xl border border-[var(--compliance-risk)]/30 bg-[var(--compliance-risk-bg)] px-4 py-3 text-sm text-[var(--compliance-risk-fg)]">
          {metricsError}
        </p>
      ) : null}

      {stats ? (
        <CoreSection title="Live metrics">
          <CoreDashboardGrid columns={4}>
            <CoreMetricTile label="Workers" value={stats.workerCount} icon={Users} compliance="ok" />
            <CoreMetricTile label="Companies" value={stats.companyCount} icon={Building2} compliance="ok" />
            <CoreMetricTile
              label="Training attention"
              value={stats.trainingAttentionCount}
              icon={GraduationCap}
              compliance={stats.trainingAttentionCount > 0 ? "at_risk" : "ok"}
            />
            <CoreMetricTile
              label="Unsafe equipment"
              value={stats.unsafeEquipmentCount}
              icon={HardHat}
              compliance={stats.unsafeEquipmentCount > 0 ? "non_compliant" : "ok"}
            />
          </CoreDashboardGrid>
        </CoreSection>
      ) : null}

      <Tabs defaultValue="activity">
        <TabsList>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="uploads">Recent uploads</TabsTrigger>
        </TabsList>
        <TabsContent value="activity" className="mt-4">
          <CoreSection title="Recent activity" description="Platform events across admin areas.">
            <div className="overflow-hidden rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>When</TableHead>
                    <TableHead>Area</TableHead>
                    <TableHead>Summary</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activity.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="text-[var(--muted-foreground)]">{row.when}</TableCell>
                      <TableCell>{row.area}</TableCell>
                      <TableCell className="flex items-center gap-2">
                        {row.tone === "warning" ? (
                          <ShieldAlert className="h-4 w-4 text-[var(--compliance-risk)]" aria-hidden />
                        ) : (
                          <Activity className="h-4 w-4 text-[var(--muted-foreground)]" aria-hidden />
                        )}
                        {row.summary}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CoreSection>
        </TabsContent>
        <TabsContent value="uploads" className="mt-4">
          <CoreSection title="Recent uploads">
            {stats?.recentUploads?.length ? (
              <ul className="divide-y rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)]">
                {stats.recentUploads.map((u) => (
                  <li key={`${u.kind}-${u.id}`} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                    <span className="font-medium text-[var(--foreground)]">{u.label}</span>
                    <span className="text-[var(--muted-foreground)]">
                      {new Date(u.createdAt).toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-[var(--muted-foreground)]">No recent uploads.</p>
            )}
          </CoreSection>
        </TabsContent>
      </Tabs>
    </div>
  );
}
