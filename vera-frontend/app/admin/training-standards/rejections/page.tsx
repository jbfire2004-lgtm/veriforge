import { apiGetSafe } from "@/lib/api";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { Card, CardContent, ErrorState } from "@/components/ui";

export default async function RejectionReasonsPage() {
  const res = await apiGetSafe<
    {
      code: string;
      title: string;
      description: string | null;
      severity: string;
      category: string;
    }[]
  >("/api/v1/training-standards/rejection-reasons");

  return (
    <AdminPageShell
      title="Rejection reasons"
      description="Catalog of validation failure codes used by the compliance engine."
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Training standards", href: "/admin/training-standards" },
        { label: "Rejections" },
      ]}
    >
      {!res.ok ? (
        <ErrorState title="Could not load rejection reasons" description={res.error} />
      ) : (
        <Card>
          <CardContent className="pt-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2">Code</th>
                  <th className="pb-2">Title</th>
                  <th className="pb-2">Category</th>
                  <th className="pb-2">Severity</th>
                </tr>
              </thead>
              <tbody>
                {res.data.map((r) => (
                  <tr key={r.code} className="border-b last:border-0">
                    <td className="py-2 font-mono text-xs">{r.code}</td>
                    <td className="py-2">{r.title}</td>
                    <td className="py-2">{r.category}</td>
                    <td className="py-2">{r.severity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </AdminPageShell>
  );
}
