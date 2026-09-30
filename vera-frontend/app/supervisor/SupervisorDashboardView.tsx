"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Activity } from "lucide-react";
import {
  Breadcrumbs,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
  EmptyState,
  buttonStyles,
} from "@/components/ui";
import { WorkspaceHero, WorkspaceMetricCard } from "@/components/theme/workspace";

export type SupervisorDashboardStats = {
  totalWorkers: number;
  totalEquipment: number;
  safeChecks: number;
  unsafeChecks: number;
};

export type SupervisorRecentLog = {
  id: string;
  result: string;
  createdAt: string;
  worker?: { firstName?: string; lastName?: string } | null;
  equipment?: { name?: string } | null;
};

export function SupervisorDashboardView({
  stats,
  recent,
  loadError,
}: {
  stats: SupervisorDashboardStats | null;
  recent: SupervisorRecentLog[];
  loadError?: string | null;
}) {
  return (
    <div className="mx-auto max-w-6xl space-y-vera-8 px-vera-6 py-vera-10 pb-28">
      <Breadcrumbs
        className="text-vera-muted"
        items={[{ label: "Supervisor", href: "/supervisor" }, { label: "Dashboard" }]}
      />

      <WorkspaceHero
        eyebrow="Field operations"
        title="Supervisor dashboard"
        description="Scan workers and equipment, review site posture, and jump to verification or incidents — on a single calm surface."
        badges={[{ label: "Site execution", tone: "teal" }]}
      />

      {loadError != null && (
        <Card className="border-amber-200 bg-amber-50/90 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg text-amber-950">Could not load dashboard data</CardTitle>
            <CardDescription className="text-amber-900/90">{loadError}</CardDescription>
          </CardHeader>
        </Card>
      )}

      <Tabs defaultValue="overview" className="space-y-vera-6">
        <TabsList className="w-full max-w-xl flex-wrap justify-start shadow-md">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Recent activity</TabsTrigger>
          <TabsTrigger value="actions">Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-0 space-y-vera-10 border-0 p-0 shadow-none">
          <section className="space-y-vera-4">
            <h2 className="text-xl font-semibold tracking-tight text-vera-charcoal">Site status</h2>
            <div className="grid gap-vera-6 sm:grid-cols-2 xl:grid-cols-4">
              <WorkspaceMetricCard
                label="Workers"
                value={stats?.totalWorkers ?? "—"}
                hint="On record for your supervised scope."
              />
              <WorkspaceMetricCard
                label="Equipment"
                value={stats?.totalEquipment ?? "—"}
                hint="Assets tracked for inspections and sign-offs."
              />
              <WorkspaceMetricCard
                tone="teal"
                label="Safe checks"
                value={stats?.safeChecks ?? "—"}
                hint="Recent verifications marked safe."
              />
              <WorkspaceMetricCard
                tone="red"
                label="Unsafe checks"
                value={stats?.unsafeChecks ?? "—"}
                hint="Items needing follow-up."
              />
            </div>
          </section>

          <section className="space-y-vera-4">
            <h2 className="text-xl font-semibold tracking-tight text-vera-charcoal">Scan</h2>
            <div className="grid gap-vera-6 md:grid-cols-2">
              <Card className="flex flex-col border-vera-charcoal/10 shadow-md">
                <CardHeader className="flex-1">
                  <CardTitle className="text-lg">Scan worker</CardTitle>
                  <CardDescription>Verify credentials at the gate or toolbox.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link
                    href="/supervisor/scan?mode=worker"
                    className={buttonStyles({ variant: "default", className: "w-full justify-center" })}
                  >
                    Open
                  </Link>
                </CardContent>
              </Card>
              <Card className="flex flex-col border-vera-charcoal/10 shadow-md">
                <CardHeader className="flex-1">
                  <CardTitle className="text-lg">Scan equipment</CardTitle>
                  <CardDescription>Quick attach inspection context to an asset.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link
                    href="/supervisor/scan?mode=equipment"
                    className={buttonStyles({ variant: "teal", className: "w-full justify-center" })}
                  >
                    Open
                  </Link>
                </CardContent>
              </Card>
              <Card className="flex flex-col border-vera-charcoal/10 shadow-md md:col-span-2">
                <CardHeader className="flex-1">
                  <CardTitle className="text-lg">Combined scan</CardTitle>
                  <CardDescription>Worker + equipment in one pass.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link
                    href="/supervisor/scan?mode=combined"
                    className={buttonStyles({ variant: "outline", className: "w-full justify-center sm:w-auto" })}
                  >
                    Open
                  </Link>
                </CardContent>
              </Card>
            </div>
          </section>

          <section className="space-y-vera-4">
            <h2 className="text-xl font-semibold tracking-tight text-vera-charcoal">Lookup</h2>
            <div className="grid gap-vera-6 md:grid-cols-2">
              <Card className="flex flex-col border-vera-charcoal/10 shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg">Worker lookup</CardTitle>
                  <CardDescription>Search profiles and documents.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link
                    href="/supervisor/worker-lookup"
                    className={buttonStyles({ variant: "secondary", className: "w-full justify-center" })}
                  >
                    Open
                  </Link>
                </CardContent>
              </Card>
              <Card className="flex flex-col border-vera-charcoal/10 shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg">Equipment lookup</CardTitle>
                  <CardDescription>Inspect history and requirements.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link
                    href="/supervisor/equipment-lookup"
                    className={buttonStyles({ variant: "secondary", className: "w-full justify-center" })}
                  >
                    Open
                  </Link>
                </CardContent>
              </Card>
            </div>
          </section>
        </TabsContent>

        <TabsContent value="activity" className="mt-0 space-y-vera-4 border-0 p-0 shadow-none">
          <div className="flex flex-wrap items-baseline justify-between gap-vera-4">
            <h2 className="text-xl font-semibold tracking-tight text-vera-charcoal">Recent activity</h2>
            <span className="text-sm text-vera-muted">Verification log stream</span>
          </div>

          {recent.length === 0 ? (
            <EmptyState
              icon={Activity}
              title="No recent activity"
              description="Completed scans and checks will appear here as they sync from the field."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Result</TableHead>
                  <TableHead>Who / what</TableHead>
                  <TableHead className="text-right">When</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recent.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell
                      className={
                        log.result === "SAFE"
                          ? "font-semibold text-emerald-700"
                          : "font-semibold text-red-700"
                      }
                    >
                      {log.result}
                    </TableCell>
                    <TableCell className="text-vera-charcoal">
                      {[log.worker?.firstName, log.worker?.lastName].filter(Boolean).join(" ") || "—"}
                      {" · "}
                      {log.equipment?.name ?? "—"}
                    </TableCell>
                    <TableCell className="text-right text-vera-muted whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TabsContent>

        <TabsContent value="actions" className="mt-0 space-y-vera-6 border-0 p-0 shadow-none">
          <section className="grid gap-vera-6 md:grid-cols-2">
            <Card className="border-vera-charcoal/10 shadow-md">
              <CardHeader>
                <CardTitle className="text-lg">Pre-use signoff</CardTitle>
                <CardDescription>Complete structured checks before operating equipment.</CardDescription>
              </CardHeader>
              <CardContent>
                <Link
                  href="/supervisor/signoff/preuse"
                  className={buttonStyles({ variant: "default", className: "w-full justify-center md:w-auto" })}
                >
                  Start signoff
                </Link>
              </CardContent>
            </Card>
            <Card className="border-vera-charcoal/10 shadow-md">
              <CardHeader>
                <CardTitle className="text-lg">Training review</CardTitle>
                <CardDescription>
                  Approve low-confidence ingestions and inspect verification chains.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link
                  href="/supervisor/training/review"
                  className={buttonStyles({ variant: "teal", className: "w-full justify-center md:w-auto" })}
                >
                  Needs review queue
                </Link>
              </CardContent>
            </Card>
            <Card className="border-vera-charcoal/10 shadow-md">
              <CardHeader>
                <CardTitle className="text-lg">Report incident</CardTitle>
                <CardDescription>Capture events while details are fresh.</CardDescription>
              </CardHeader>
              <CardContent>
                <Link
                  href="/supervisor/incidents/new"
                  className={buttonStyles({ variant: "destructive", className: "w-full justify-center md:w-auto" })}
                >
                  New incident
                </Link>
              </CardContent>
            </Card>
          </section>

          <Card className="border-vera-charcoal/10 bg-vera-surface/40 shadow-md">
            <CardHeader>
              <CardTitle className="text-base">Alternate entry</CardTitle>
              <CardDescription>
                The legacy supervisor home route lists additional shortcuts if you need them.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/supervisor/home" className={buttonStyles({ variant: "outline", size: "sm" })}>
                Open classic home
              </Link>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
