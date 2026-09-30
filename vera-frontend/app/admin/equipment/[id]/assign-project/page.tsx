"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { assignEquipmentToProject } from "@/lib/api/equipment-core";
import { getCompanyProjects } from "@/lib/api/vera-core";
import { Button, Card, CardContent, Label, Select } from "@/components/ui";
import { buttonStyles } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { AdminPageShell } from "@/components/admin/AdminPageShell";

export default function AssignEquipmentProjectPage() {
  const params = useParams();
  const id = Number(params?.id);
  const router = useRouter();
  const { toast } = useToast();
  const [projects, setProjects] = useState<{ id: number; name: string }[]>([]);
  const [projectId, setProjectId] = useState("");
  const [companyId, setCompanyId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void (async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/v1/equipment/${id}`,
        { credentials: "include" },
      );
      if (!res.ok) return;
      const data = await res.json();
      const cid = data.activeCompanyLink?.companyId ?? data.companyId;
      setCompanyId(cid ?? null);
      if (cid) {
        const list = await getCompanyProjects(cid);
        setProjects(list);
      }
    })();
  }, [id]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!projectId) return;
    setBusy(true);
    try {
      await assignEquipmentToProject(id, Number(projectId));
      toast({ title: "Assigned to project", variant: "success" });
      router.push(`/admin/equipment/${id}`);
      router.refresh();
    } catch (err) {
      toast({
        title: "Assignment failed",
        description: err instanceof Error ? err.message : undefined,
        variant: "error",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <AdminPageShell
      title="Assign to project"
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Equipment", href: "/admin/equipment" },
        { label: `#${id}`, href: `/admin/equipment/${id}` },
        { label: "Assign" },
      ]}
    >
      <Card>
        <CardContent className="p-6">
          {!companyId ? (
            <p className="text-sm text-vera-muted">
              Link this equipment to a company before assigning to a project.
            </p>
          ) : (
            <form onSubmit={onSubmit} className="flex max-w-md flex-col gap-4">
              <div>
                <Label htmlFor="project">Project</Label>
                <Select
                  id="project"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                >
                  <option value="">Select project</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="flex gap-2">
                <Button type="submit" variant="teal" disabled={busy}>
                  Assign
                </Button>
                <Link
                  href={`/admin/equipment/${id}`}
                  className={buttonStyles({ variant: "outline" })}
                >
                  Cancel
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </AdminPageShell>
  );
}
