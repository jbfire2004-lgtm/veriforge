import Link from "next/link";
import { apiGetSafe } from "@/lib/api";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { AssignAssetForm } from "@/components/tools-ppe/AssignAssetForm";
import { PpeInspectForm } from "@/components/tools-ppe/PpeInspectForm";
import { Badge, Card, CardContent, CardHeader, CardTitle, ErrorState } from "@/components/ui";
import { buttonStyles } from "@/components/ui/button";

export default async function PpeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ppeId = Number(id);
  const res = await apiGetSafe<{
    id: number;
    name: string;
    ppeType: string;
    status: string;
    expiresAt: string;
    inspections: { id: number; passed: boolean; completedAt: string }[];
  }>(`/api/v1/tools-ppe/ppe/${ppeId}`);

  if (!res.ok) {
    return (
      <AdminPageShell title="PPE">
        <ErrorState title="PPE not found" description={res.error} />
      </AdminPageShell>
    );
  }

  const ppe = res.data;
  const expired = ppe.status === "EXPIRED";
  const expiringSoon =
    !expired &&
    new Date(ppe.expiresAt).getTime() - Date.now() < 30 * 86400000;

  return (
    <AdminPageShell
      title={ppe.name}
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Tools & PPE", href: "/admin/tools-ppe" },
        { label: "PPE", href: "/admin/tools-ppe/ppe" },
        { label: ppe.name },
      ]}
    >
      <section className="mb-6 flex flex-wrap items-center gap-2">
        <Badge variant={expired ? "danger" : expiringSoon ? "warning" : "success"}>
          {ppe.status}
        </Badge>
        <span className="text-sm text-muted-foreground">
          {ppe.ppeType} · Expires {new Date(ppe.expiresAt).toLocaleDateString()}
        </span>
      </section>

      {(expired || expiringSoon) && (
        <Card className="mb-6 border-amber-300 bg-amber-50">
          <CardContent className="pt-6 text-sm text-amber-900">
            {expired
              ? "This PPE is expired and cannot be assigned until re-inspected and renewed."
              : "This PPE expires within 30 days — schedule inspection or replacement."}
          </CardContent>
        </Card>
      )}

      <section className="grid gap-6 lg:grid-cols-2">
        <PpeInspectForm ppeId={ppeId} ppeType={ppe.ppeType} />
        <AssignAssetForm kind="ppe" assetId={ppeId} />
      </section>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Inspection history</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {ppe.inspections.length === 0 ? (
            <p className="text-sm text-muted-foreground">No inspections yet.</p>
          ) : (
            ppe.inspections.map((i) => (
              <section key={i.id} className="flex justify-between text-sm border-b py-2">
                <span>{new Date(i.completedAt).toLocaleString()}</span>
                <Badge variant={i.passed ? "success" : "danger"}>{i.passed ? "Pass" : "Fail"}</Badge>
              </section>
            ))
          )}
        </CardContent>
      </Card>

      <Link href="/admin/tools-ppe/ppe" className={buttonStyles({ variant: "outline", size: "sm", className: "mt-4 inline-block" })}>
        Back to PPE
      </Link>
    </AdminPageShell>
  );
}
