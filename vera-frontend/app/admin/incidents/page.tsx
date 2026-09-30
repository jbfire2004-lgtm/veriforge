"use client";

import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { apiGet } from "@/lib/api";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import {
  Badge,
  EmptyState,
  ErrorState,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui";

type IncidentRow = {
  id: number;
  type?: string | null;
  category?: string | null;
  title?: string | null;
  severity?: string | null;
  description?: string | null;
  notes?: string | null;
  createdAt: string;
  worker?: { firstName?: string | null; lastName?: string | null } | null;
  equipment?: { name?: string | null } | null;
  site?: { name?: string | null } | null;
  supervisor?: { email?: string | null } | null;
};

const breadcrumbs = [
  { label: "Admin", href: "/admin" },
  { label: "Incidents" },
];

export default function AdminIncidentsPage() {
  const [incidents, setIncidents] = useState<IncidentRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const rows = await apiGet<IncidentRow[]>("/incident");
        if (!cancelled) {
          setIncidents(rows);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setIncidents([]);
          setError(e instanceof Error ? e.message : "Could not load incidents.");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const loading = incidents === null;

  return (
    <AdminPageShell
      title="Incident reports"
      description="Logged field incidents and follow-ups."
      breadcrumbs={breadcrumbs}
    >
      {error != null ? (
        <ErrorState title="Could not load incidents" description={error} />
      ) : loading ? (
        <Skeleton className="h-40 w-full rounded-xl" />
      ) : incidents!.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="No incidents recorded"
          description="Reports submitted from the field will appear here."
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>When</TableHead>
              <TableHead>Summary</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {incidents!.map((inc) => (
              <TableRow key={inc.id}>
                <TableCell className="font-semibold text-vera-deep">
                  {inc.type ?? inc.category ?? inc.title ?? "—"}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{inc.severity ?? "N/A"}</Badge>
                </TableCell>
                <TableCell className="whitespace-nowrap text-vera-muted text-xs">
                  {new Date(inc.createdAt).toLocaleString()}
                </TableCell>
                <TableCell>
                  <p className="text-sm text-vera-charcoal">{inc.description}</p>
                  {inc.notes ? (
                    <p className="mt-vera-2 text-xs text-vera-muted">Notes: {inc.notes}</p>
                  ) : null}
                  <div className="mt-vera-2 flex flex-wrap gap-x-vera-4 gap-y-vera-1 text-xs text-vera-muted">
                    {inc.worker ? (
                      <span>
                        Worker: {inc.worker.firstName} {inc.worker.lastName}
                      </span>
                    ) : null}
                    {inc.equipment ? <span>Equipment: {inc.equipment.name}</span> : null}
                    {inc.site ? <span>Site: {inc.site.name}</span> : null}
                    {inc.supervisor ? <span>Supervisor: {inc.supervisor.email}</span> : null}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </AdminPageShell>
  );
}
