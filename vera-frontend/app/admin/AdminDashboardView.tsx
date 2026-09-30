"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Activity, Eye, Upload } from "lucide-react";
import {
  Breadcrumbs,
  buttonStyles,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
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
import { AdminConsoleDashboard } from "@/components/vera-core-ui";
import {
  WorkspaceMetricCard,
  ModuleLinkGrid,
} from "@/components/theme/workspace";

export type AdminDashboardRecentUpload = {
  kind: "document" | "training-ingest";
  id: number;
  label: string;
  sublabel: string | null;
  createdAt: string;
  path: string | null;
};

export type AdminDashboardStats = {
  workerCount: number;
  companyCount: number;
  trainingRecordCount: number;
  trainingAttentionCount: number;
  credentialAttentionCount: number;
  equipmentCount: number;
  unsafeEquipmentCount: number;
  recentUploads: AdminDashboardRecentUpload[];
};

export type AdminActivityRow = {
  id: string;
  when: string;
  summary: string;
  area: string;
  tone?: "default" | "warning" | "danger";
};

type Shortcut = {
  href: string;
  title: string;
  description: string;
  variant?: "default" | "teal" | "outline";
};

const adminShortcuts: { phase: string; blurb: string; items: Shortcut[] }[] = [
  {
    phase: "Admin Control Panel (ACP)",
    blurb: "Tenants, RBAC, subscriptions, and feature flags.",
    items: [
      {
        href: "/admin/acp",
        title: "ACP overview",
        description: "Admin Control Panel home — tenants, RBAC, flags.",
        variant: "teal",
      },
      {
        href: "/admin/tenants",
        title: "Tenants",
        description: "Organizations and tenant lifecycle.",
        variant: "teal",
      },
      {
        href: "/admin/users",
        title: "Users & roles",
        description: "Assign users to tenants and ACP roles.",
      },
      {
        href: "/admin/permissions",
        title: "Permission matrix",
        description: "Role × permission grid.",
      },
      {
        href: "/admin/subscriptions",
        title: "Subscriptions",
        description: "Tier assignment per tenant.",
      },
      {
        href: "/admin/features",
        title: "Feature flags",
        description: "Per-tenant feature toggles.",
      },
      {
        href: "/admin/logs",
        title: "Audit logs",
        description: "ACP configuration history.",
      },
    ],
  },
  {
    phase: "Adoption & intelligence",
    blurb: "Usage analytics, geographic adoption, and product feedback.",
    items: [
      {
        href: "/admin/adoption",
        title: "Adoption & usage",
        description: "Map, module usage, growth, and feedback workflow.",
        variant: "teal",
      },
    ],
  },
  {
    phase: "Directory",
    blurb: "People, organizations, and assets under management.",
    items: [
      { href: "/admin/workers", title: "Workers", description: "Profiles, roles, and site assignments." },
      { href: "/admin/companies", title: "Companies", description: "Contractors and client organizations." },
      { href: "/admin/equipment", title: "Equipment", description: "Fleet, inspections, and safety posture." },
      { href: "/admin/inspections", title: "Inspections", description: "Pre-use, scheduled, PME, and lockout control." },
    ],
  },
  {
    phase: "VERA Core — Phase 1",
    blurb: "Ingest, verify, and move compliance evidence.",
    items: [
      { href: "/core/training-ingest", title: "Training ingest", description: "Bulk load and normalize training records.", variant: "teal" },
      { href: "/core/verification", title: "Verification hub", description: "Review and sign off on attestations.", variant: "outline" },
      { href: "/core/upload", title: "Core file upload", description: "Secure uploads into Core storage.", variant: "outline" },
    ],
  },
  {
    phase: "VERA Core — Phase 1.25",
    blurb: "Field documentation and compliance narrative.",
    items: [
      { href: "/core/meeting-records", title: "Meeting records", description: "Toolbox talks and safety meetings." },
      { href: "/core/daily-logs", title: "Daily logs", description: "Shift notes and conditions on site." },
      { href: "/core/compliance-notes", title: "Compliance notes", description: "Observations and follow-up context." },
    ],
  },
  {
    phase: "VERA Core — Phase 1.5",
    blurb: "PM workflows and corrective actions.",
    items: [
      {
        href: "/pm",
        title: "Project management",
        description: "VeraPM hub — workflow, safety forms, and CAIL closure.",
      },
      { href: "/pm/safety-forms", title: "Safety forms", description: "Permits, FLHAs, and unified form submissions." },
      {
        href: "/pm/safety-intelligence",
        title: "Safety Intelligence (CAIL)",
        description: "Corrective Action Log, inspections, BBO, and Copilot AI.",
      },
      { href: "/pm/safety", title: "PM safety workflows", description: "Lifecycle of PM safety packets." },
      { href: "/pm/safety/assess", title: "PM assessment", description: "Structured assessments and scoring." },
      { href: "/core/action-items", title: "Action items", description: "Track commitments through closure." },
    ],
  },
];

export function AdminDashboardView({
  stats,
  statsError,
  activityRows,
}: {
  stats: AdminDashboardStats | null;
  statsError: string | null;
  activityRows: AdminActivityRow[];
}) {
  return (
    <div className="mx-auto max-w-7xl space-y-vera-8">
      <Breadcrumbs
        className="text-vera-muted"
        items={[{ label: "Admin", href: "/admin" }, { label: "Dashboard" }]}
      />

      <AdminConsoleDashboard
        stats={stats}
        activity={activityRows}
        metricsError={statsError}
      />

      <Tabs defaultValue="overview" className="space-y-vera-6">
        <TabsList className="w-full max-w-xl flex-wrap justify-start shadow-md">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Recent activity</TabsTrigger>
          <TabsTrigger value="shortcuts">Workspaces</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-0 space-y-vera-8 border-0 p-0 shadow-none">
          <section className="space-y-vera-4">
            <div className="flex items-baseline justify-between gap-vera-4">
              <h2 className="text-xl font-semibold tracking-tight text-vera-charcoal">
                Program scale
              </h2>
              <span className="text-sm text-vera-muted">Counts from your API</span>
            </div>
            <div className="grid gap-vera-6 sm:grid-cols-2 xl:grid-cols-4">
              <WorkspaceMetricCard
                label="Workers"
                value={stats?.workerCount ?? "—"}
                hint="Active profiles available to assign to sites and crews."
              />
              <WorkspaceMetricCard
                label="Companies"
                value={stats?.companyCount ?? "—"}
                hint="Organizations linked to contracts and insurance."
              />
              <WorkspaceMetricCard
                label="Training records"
                value={stats?.trainingRecordCount ?? "—"}
                hint="Issued courses linked to workers and certifications."
              />
              <WorkspaceMetricCard
                label="Equipment"
                value={stats?.equipmentCount ?? "—"}
                hint="Tracked assets with safety and certification context."
              />
            </div>
          </section>

          <section className="space-y-vera-4">
            <h2 className="text-xl font-semibold tracking-tight text-vera-charcoal">
              Risk signals
            </h2>
            <div className="grid gap-vera-6 md:grid-cols-3">
              <WorkspaceMetricCard
                tone="amber"
                label="Training (expired / expiring)"
                value={stats?.trainingAttentionCount ?? "—"}
                hint="Records with an expiry date in the past or within the next 30 days."
              />
              <WorkspaceMetricCard
                tone="amber"
                label="Credentials (expired / expiring)"
                value={stats?.credentialAttentionCount ?? "—"}
                hint="Worker credentials with expiry in the past or within the next 30 days."
              />
              <WorkspaceMetricCard
                tone="red"
                label="Equipment safety"
                value={stats?.unsafeEquipmentCount ?? "—"}
                hint="Assets marked unsafe until inspections or repairs are recorded."
              />
            </div>
          </section>

          <section className="space-y-vera-4">
            <div className="flex items-baseline justify-between gap-vera-4">
              <h2 className="text-xl font-semibold tracking-tight text-vera-charcoal">
                Recent uploads
              </h2>
              <span className="text-sm text-vera-muted">Documents and training ingest runs</span>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>When</TableHead>
                  <TableHead>Kind</TableHead>
                  <TableHead>Label</TableHead>
                  <TableHead>Open</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(stats?.recentUploads ?? []).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="p-0">
                      <div className="p-vera-6">
                        <EmptyState
                          icon={Upload}
                          title="No recent uploads"
                          description="Documents and training ingest runs will appear here once recorded in the system."
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  stats!.recentUploads.map((u) => (
                    <TableRow key={`${u.kind}-${u.id}`}>
                      <TableCell className="whitespace-nowrap text-sm text-vera-muted">
                        {new Date(u.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-sm capitalize text-vera-charcoal">
                        {u.kind === "training-ingest" ? "Training ingest" : "Document"}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-vera-charcoal">{u.label}</div>
                        {u.sublabel != null && u.sublabel !== "" && (
                          <div className="text-xs text-vera-muted">{u.sublabel}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        {u.path != null ? (
                          <Link
                            href={u.path}
                            className={buttonStyles({ variant: "outline", size: "sm", className: "text-xs" })}
                          >
                            <Eye className="h-3.5 w-3.5" aria-hidden />
                            View
                          </Link>
                        ) : (
                          <span className="text-xs text-vera-muted">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </section>
        </TabsContent>

        <TabsContent value="activity" className="mt-0 space-y-vera-4 border-0 p-0 shadow-none">
          <div className="flex items-baseline justify-between gap-vera-4">
            <h2 className="text-xl font-semibold tracking-tight text-vera-charcoal">
              Recent activity
            </h2>
            <span className="text-sm text-vera-muted">Latest events (sample + live metrics)</span>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>When</TableHead>
                <TableHead>Summary</TableHead>
                <TableHead>Area</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activityRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="p-0">
                    <div className="p-vera-6">
                      <EmptyState
                        icon={Activity}
                        title="No recent activity"
                        description="Nothing to show in the activity feed yet."
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                activityRows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="whitespace-nowrap text-vera-muted">{row.when}</TableCell>
                    <TableCell
                      className={
                        row.tone === "warning"
                          ? "font-medium text-amber-900"
                          : row.tone === "danger"
                            ? "font-medium text-red-900"
                            : "text-vera-charcoal"
                      }
                    >
                      {row.summary}
                    </TableCell>
                    <TableCell className="text-vera-muted">{row.area}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="shortcuts" className="mt-0 space-y-vera-10 border-0 p-0 shadow-none">
          {adminShortcuts.map((group) => (
            <ModuleLinkGrid
              key={group.phase}
              sectionId={`admin-${group.phase}`}
              sectionTitle={group.phase}
              sectionDescription={group.blurb}
              modules={group.items}
              columns="three"
            />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
