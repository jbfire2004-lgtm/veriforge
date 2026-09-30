import Link from "next/link";
import { apiGetSafe } from "@/lib/api";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ErrorState,
  Badge,
} from "@/components/ui";
import { buttonStyles } from "@/components/ui/button";
import type { EquipmentDashboard } from "@/lib/api/equipment-core";

export default async function EquipmentDashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { companyId } = await searchParams;
  const qs = companyId ? `?companyId=${companyId}` : "";
  const res = await apiGetSafe<EquipmentDashboard>(`/api/v1/equipment/dashboard${qs}`);

  return (
    <AdminPageShell
      title="Equipment dashboard"
      description="Fleet compliance, lockouts, and recent assets."
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Equipment", href: "/admin/equipment" },
        { label: "Dashboard" },
      ]}
      actions={
        <section className="flex gap-2">
          <Link
            href="/admin/equipment/compliance"
            className={buttonStyles({ variant: "outline", size: "sm" })}
          >
            Compliance engine
          </Link>
          <Link href="/admin/equipment/new" className={buttonStyles({ variant: "teal", size: "sm" })}>
            Add equipment
          </Link>
        </section>
      }
    >
      {!res.ok ? (
        <ErrorState title="Dashboard unavailable" description={res.error} />
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total assets" value={res.data.total} />
            <StatCard label="Locked out" value={res.data.lockedOut} variant="danger" />
            <StatCard label="Non-compliant links" value={res.data.nonCompliant} variant="warning" />
            <StatCard label="Needs inspection" value={res.data.needsInspection} variant="warning" />
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Recent equipment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {res.data.recent.map((e) => (
                <Link
                  key={e.id}
                  href={`/admin/equipment/${e.id}`}
                  className="flex items-center justify-between rounded-lg border border-vera-charcoal/10 px-4 py-3 hover:bg-vera-charcoal/5"
                >
                  <span className="font-medium">{e.name}</span>
                  <Badge variant={e.safetyStatus === "OK" ? "success" : "danger"}>
                    {e.safetyStatus}
                  </Badge>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </AdminPageShell>
  );
}

function StatCard({
  label,
  value,
  variant,
}: {
  label: string;
  value: number;
  variant?: "danger" | "warning";
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <p className="text-sm text-vera-muted">{label}</p>
        <p className="mt-1 text-3xl font-semibold text-vera-charcoal">{value}</p>
        {variant === "danger" && value > 0 ? (
          <p className="mt-1 text-xs text-red-600">Action required</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
