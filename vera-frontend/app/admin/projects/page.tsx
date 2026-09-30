"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import {
  createProject,
  getCompanyProjects,
  type Project,
} from "@/lib/api/vera-core";
import { getProjectReadinessReport } from "@/lib/api/reporting";
import {
  Badge,
  Button,
  Card,
  CardContent,
  ErrorState,
  Input,
  Label,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui";
import { buttonStyles } from "@/components/ui/button";

export default function AdminProjectsPage() {
  const [companyId, setCompanyId] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [readiness, setReadiness] = useState<
    Record<number, { readinessScore: number; readinessStatus: string }>
  >({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");

  const load = useCallback(async () => {
    const cid = Number(companyId);
    if (!Number.isFinite(cid) || cid < 1) {
      setProjects([]);
      setReadiness({});
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [plist, report] = await Promise.all([
        getCompanyProjects(cid),
        getProjectReadinessReport(cid),
      ]);
      setProjects(plist);
      const map: Record<number, { readinessScore: number; readinessStatus: string }> = {};
      for (const row of report.rows) {
        map[row.projectId] = {
          readinessScore: row.readinessScore,
          readinessStatus: row.readinessStatus,
        };
      }
      setReadiness(map);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load projects");
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    const cid = Number(companyId);
    if (!Number.isFinite(cid)) return;
    await createProject({ companyId: cid, name, code: code || undefined });
    setName("");
    setCode("");
    await load();
  }

  return (
    <AdminPageShell
      title="Projects"
      description="Company projects, worker/equipment assignments, and readiness scores."
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Projects" },
      ]}
      actions={
        <Link
          href="/admin/reporting/projects"
          className={buttonStyles({ variant: "outline", size: "sm" })}
        >
          Readiness report
        </Link>
      }
    >
      <section className="space-y-6">
        <Card>
          <CardContent className="flex flex-wrap items-end gap-4 pt-6">
            <div>
              <Label>Company ID</Label>
              <Input
                type="number"
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                className="w-36"
              />
            </div>
            <Button variant="outline" onClick={() => void load()}>
              Load
            </Button>
          </CardContent>
        </Card>

        {Number(companyId) > 0 && (
          <Card>
            <CardContent className="pt-6">
              <form onSubmit={onCreate} className="flex flex-wrap gap-3 items-end">
                <div>
                  <Label>Name</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div>
                  <Label>Code</Label>
                  <Input value={code} onChange={(e) => setCode(e.target.value)} />
                </div>
                <Button type="submit" variant="teal">
                  Create project
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {loading && <Skeleton className="h-40 w-full rounded-xl" />}
        {error && <ErrorState title="Unable to load" description={error} />}

        {!loading && !error && projects.length > 0 && (
          <Card>
            <CardContent className="px-0 pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Readiness</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projects.map((p) => {
                    const r = readiness[p.id];
                    return (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{p.name}</TableCell>
                        <TableCell>{p.code ?? "—"}</TableCell>
                        <TableCell>{p.status}</TableCell>
                        <TableCell>
                          {r ? (
                            <Badge
                              variant={
                                r.readinessStatus === "READY"
                                  ? "success"
                                  : r.readinessStatus === "AT_RISK"
                                    ? "outline"
                                    : "danger"
                              }
                            >
                              {r.readinessScore}%
                            </Badge>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell>
                          <Link
                            href={`/admin/companies/${p.companyId}`}
                            className="text-sm text-teal-600 hover:underline"
                          >
                            Company
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </section>
    </AdminPageShell>
  );
}
