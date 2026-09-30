import Link from "next/link";
import { apiGetSafe } from "@/lib/api";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { AssignAssetForm } from "@/components/tools-ppe/AssignAssetForm";
import { ToolInspectForm } from "@/components/tools-ppe/ToolInspectForm";
import { Badge, Card, CardContent, CardHeader, CardTitle, ErrorState } from "@/components/ui";
import { buttonStyles } from "@/components/ui/button";

export default async function ToolDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const toolId = Number(id);
  const res = await apiGetSafe<{
    id: number;
    name: string;
    status: string;
    nextInspectionAt: string | null;
    defaultChecklist: { id: string; label: string; required?: boolean }[];
    inspections: { id: number; passed: boolean; completedAt: string }[];
  }>(`/api/v1/tools-ppe/tools/${toolId}`);

  if (!res.ok) {
    return (
      <AdminPageShell title="Tool">
        <ErrorState title="Tool not found" description={res.error} />
      </AdminPageShell>
    );
  }

  const tool = res.data;

  return (
    <AdminPageShell
      title={tool.name}
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Tools & PPE", href: "/admin/tools-ppe" },
        { label: "Tools", href: "/admin/tools-ppe/tools" },
        { label: tool.name },
      ]}
    >
      <section className="mb-6 flex flex-wrap gap-2">
        <Badge variant={tool.status === "ACTIVE" ? "success" : "warning"}>{tool.status}</Badge>
        {tool.nextInspectionAt && (
          <span className="text-sm text-muted-foreground">
            Next inspection {new Date(tool.nextInspectionAt).toLocaleDateString()}
          </span>
        )}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <ToolInspectForm toolId={toolId} items={tool.defaultChecklist} />
        <AssignAssetForm kind="tool" assetId={toolId} />
      </section>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Inspection history</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {tool.inspections.length === 0 ? (
            <p className="text-sm text-muted-foreground">No inspections yet.</p>
          ) : (
            tool.inspections.map((i) => (
              <section key={i.id} className="flex justify-between text-sm border-b py-2">
                <span>{new Date(i.completedAt).toLocaleString()}</span>
                <Badge variant={i.passed ? "success" : "danger"}>{i.passed ? "Pass" : "Fail"}</Badge>
              </section>
            ))
          )}
        </CardContent>
      </Card>

      <Link href="/admin/tools-ppe/tools" className={buttonStyles({ variant: "outline", size: "sm", className: "mt-4 inline-block" })}>
        Back to tools
      </Link>
    </AdminPageShell>
  );
}
