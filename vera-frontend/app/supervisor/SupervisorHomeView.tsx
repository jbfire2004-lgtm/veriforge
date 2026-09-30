"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Activity, ShieldCheck } from "lucide-react";
import { apiFetchJson } from "@/lib/api-fetch";
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
import { WorkspaceHero, ModuleLinkGrid } from "@/components/theme/workspace";

type VerificationLog = {
  id: string;
  result?: string;
  reasons?: string[];
  createdAt: string;
};

type Incident = {
  id: string;
  type?: string;
  description?: string;
  createdAt: string;
};

export function SupervisorHomeView() {
  const [recentLogs, setRecentLogs] = useState<VerificationLog[]>([]);
  const [recentIncidents, setRecentIncidents] = useState<Incident[]>([]);

  useEffect(() => {
    apiFetchJson<VerificationLog[]>("/verification/logs/recent")
      .then((data) => setRecentLogs(Array.isArray(data) ? data.slice(0, 5) : []))
      .catch(() => {});

    apiFetchJson<Incident[]>("/incident")
      .then((data) => setRecentIncidents(Array.isArray(data) ? data.slice(0, 5) : []))
      .catch(() => {});
  }, []);

  const quickLinks: { href: string; title: string; description: string; variant?: "default" | "teal" | "outline" | "destructive" | "secondary" }[] = [
    { href: "/supervisor/scan", title: "Scan worker", description: "Open scanner with worker mode.", variant: "default" },
    { href: "/supervisor/scan?mode=equipment", title: "Scan equipment", description: "Inspect an asset on site.", variant: "teal" },
    { href: "/supervisor/combined", title: "Combined scan", description: "Worker + equipment flow.", variant: "outline" },
    { href: "/supervisor/incidents/new", title: "New incident", description: "Start an incident report.", variant: "destructive" },
    { href: "/supervisor/signoff/preuse", title: "Pre-use signoff", description: "Structured equipment checks.", variant: "default" },
    { href: "/supervisor/training/review", title: "Training review", description: "Approve flagged credentials.", variant: "teal" },
    { href: "/supervisor/worker-lookup", title: "Worker lookup", description: "Search worker records.", variant: "secondary" },
    { href: "/supervisor/equipment-lookup", title: "Equipment lookup", description: "Search equipment records.", variant: "secondary" },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-vera-8 px-vera-6 py-vera-10 pb-28">
      <Breadcrumbs
        className="text-vera-muted"
        items={[{ label: "Supervisor", href: "/supervisor" }, { label: "Home" }]}
      />

      <WorkspaceHero
        eyebrow="Alternate entry"
        title="Supervisor home"
        description="Quick cards for legacy shortcuts and a compact feed of verifications and incidents."
        badges={[{ label: "Field tools", tone: "teal" }]}
      />

      <Tabs defaultValue="quick" className="space-y-vera-6">
        <TabsList className="w-full max-w-lg flex-wrap justify-start shadow-md">
          <TabsTrigger value="quick">Quick actions</TabsTrigger>
          <TabsTrigger value="feed">Activity feed</TabsTrigger>
        </TabsList>

        <TabsContent value="quick" className="mt-0 border-0 bg-transparent p-0 shadow-none">
          <ModuleLinkGrid
            modules={quickLinks.map((item) => ({
              href: item.href,
              title: item.title,
              description: item.description,
            }))}
            sectionId="supervisor-quick"
            sectionTitle="Quick actions"
            sectionDescription="Jump straight into scans, sign-offs, and lookups."
            columns="three"
          />
        </TabsContent>

        <TabsContent value="feed" className="mt-0 space-y-vera-10 border-0 bg-transparent p-0 shadow-none">
          <section className="space-y-vera-4">
            <div className="flex flex-wrap items-baseline justify-between gap-vera-4">
              <h2 className="text-xl font-semibold tracking-tight text-vera-charcoal">
                Recent verifications
              </h2>
              <Link href="/supervisor" className="text-sm font-semibold text-vera-deep hover:text-vera-teal hover:underline">
                Full dashboard
              </Link>
            </div>
            {recentLogs.length === 0 ? (
              <EmptyState
                icon={Activity}
                title="No verification logs yet"
                description="Complete a scan to populate this list."
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Result</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead className="text-right">When</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-semibold text-vera-charcoal">{log.result ?? "—"}</TableCell>
                      <TableCell className="text-vera-muted">
                        {log.reasons?.filter(Boolean).join(", ") || "—"}
                      </TableCell>
                      <TableCell className="text-right text-vera-muted whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </section>

          <section className="space-y-vera-4">
            <h2 className="text-xl font-semibold tracking-tight text-vera-charcoal">Recent incidents</h2>
            {recentIncidents.length === 0 ? (
              <EmptyState
                icon={ShieldCheck}
                title="No incidents logged"
                description="Reports filed from the field will appear here."
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">When</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentIncidents.map((inc) => (
                    <TableRow key={inc.id}>
                      <TableCell className="font-semibold text-vera-charcoal">{inc.type ?? "—"}</TableCell>
                      <TableCell className="max-w-md truncate text-vera-muted">{inc.description ?? "—"}</TableCell>
                      <TableCell className="text-right text-vera-muted whitespace-nowrap">
                        {new Date(inc.createdAt).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
}
