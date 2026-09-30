import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { canViewEquipmentDetail } from "@/lib/phase1-roles";
import { requireRouteAccess } from "@/lib/route-access";
import { apiGetSafe } from "@/lib/api";
import {
  Breadcrumbs,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
  ErrorState,
  buttonStyles,
} from "@/components/ui";
import EquipmentTrainingRequirementsPanel from "@/app/components/equipment/EquipmentTrainingRequirementsPanel";

type EquipmentIncident = {
  id: number;
  title?: string | null;
  description?: string | null;
};

type EquipmentDetail = {
  id: number;
  name: string;
  incidents: EquipmentIncident[];
};

function isInvalidId(raw: string): boolean {
  const trimmed = raw.trim();
  return !/^\d+$/.test(trimmed) || Number(trimmed) < 1;
}

export default async function EquipmentPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const { id } = await Promise.resolve(params);
  const callbackUrl = `/equipment/${id}`;

  await requireRouteAccess({ callbackUrl, guard: canViewEquipmentDetail });

  if (isInvalidId(id)) {
    return (
      <div className="space-y-vera-6 p-vera-6">
        <Breadcrumbs items={[{ label: "Equipment" }, { label: "Invalid" }]} />
        <ErrorState
          title="Invalid equipment id"
          description="The id in the URL must be a positive integer."
        >
          <Link href="/admin/equipment" className={buttonStyles({ variant: "outline", size: "md" })}>
            Back to equipment
          </Link>
        </ErrorState>
      </div>
    );
  }

  const equipmentId = Number(id);
  const res = await apiGetSafe<EquipmentDetail>(`/equipment/${equipmentId}`);

  if (!res.ok) {
    return (
      <div className="space-y-vera-6 p-vera-6">
        <ErrorState title="Equipment unavailable" description={res.error}>
          <Link href="/admin/equipment" className={buttonStyles({ variant: "outline", size: "md" })}>
            Back to equipment
          </Link>
        </ErrorState>
      </div>
    );
  }

  const equipment = res.data;
  const hasIncidents = equipment.incidents.length > 0;

  return (
    <div className="space-y-vera-8 p-vera-6">
      <Breadcrumbs
        items={[
          { label: "Equipment", href: "/admin/equipment" },
          { label: equipment.name },
        ]}
      />

      <header className="flex items-center justify-between gap-vera-3">
        <h1 className="text-2xl font-bold tracking-tight text-vera-deep sm:text-3xl">
          {equipment.name}
        </h1>
        <span
          className={`rounded-full px-vera-3 py-vera-1 text-xs font-semibold uppercase tracking-wide ${
            hasIncidents
              ? "bg-red-100 text-red-700"
              : "bg-emerald-100 text-emerald-700"
          }`}
        >
          {hasIncidents ? "Non-compliant" : "Compliant"}
        </span>
      </header>

      <EquipmentTrainingRequirementsPanel equipmentId={equipmentId} />

      <Card className="border-vera-charcoal/10 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl tracking-tight">Incidents</CardTitle>
        </CardHeader>
        <CardContent>
          {equipment.incidents.length === 0 ? (
            <EmptyState
              icon={ShieldCheck}
              title="No incidents recorded"
              description="Reported safety issues will appear here."
            />
          ) : (
            <ul className="space-y-vera-2 text-sm">
              {equipment.incidents.map((i) => (
                <li key={i.id} className="rounded-lg border border-vera-charcoal/10 p-vera-3">
                  <p className="font-semibold text-vera-deep">{i.title ?? "Incident"}</p>
                  {i.description ? (
                    <p className="mt-vera-1 text-vera-muted">{i.description}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
