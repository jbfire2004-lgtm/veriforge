import { AlertTriangle, ShieldCheck } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
} from "@/components/ui";
import type { CompanyIncident } from "./types";

export default function IncidentsPanel({
  workerIncidents,
  equipmentIncidents,
}: {
  workerIncidents: CompanyIncident[];
  equipmentIncidents: CompanyIncident[];
}) {
  const total = workerIncidents.length + equipmentIncidents.length;
  return (
    <Card className="border-vera-charcoal/10 shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-vera-3">
          <AlertTriangle className="h-6 w-6 text-vera-teal" aria-hidden />
          <div>
            <CardTitle className="text-xl tracking-tight">Incidents</CardTitle>
            <CardDescription>
              Open and recent incident reports tied to this company.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-vera-5">
        {total === 0 ? (
          <EmptyState
            icon={ShieldCheck}
            title="No incidents reported"
            description="When a worker or piece of equipment is flagged, it will appear here."
          />
        ) : (
          <div className="grid gap-vera-5 md:grid-cols-2">
            <IncidentList title="Worker incidents" rows={workerIncidents} />
            <IncidentList title="Equipment incidents" rows={equipmentIncidents} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function IncidentList({ title, rows }: { title: string; rows: CompanyIncident[] }) {
  return (
    <div className="space-y-vera-3">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-vera-muted">
        {title}
      </h3>
      {rows.length === 0 ? (
        <p className="text-sm text-vera-muted">None.</p>
      ) : (
        <ul className="space-y-vera-2 text-sm">
          {rows.map((i) => (
            <li
              key={i.id}
              className="rounded-xl border border-vera-charcoal/10 bg-vera-surface/40 p-vera-3"
            >
              <p className="font-medium text-vera-charcoal">{i.title ?? `Incident #${i.id}`}</p>
              {i.description != null && i.description !== "" && (
                <p className="mt-vera-1 text-xs text-vera-muted">{i.description}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
