"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createPmProject, fetchPmProjects, type PmProjectRow } from "@/lib/pm-project-management";
import {
  CompanySelectField,
  type CompanyOption,
} from "@/src/components/core/CompanySelectField";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Props = {
  companies: CompanyOption[];
  defaultCompanyId?: number;
  lockCompany?: boolean;
};

function resolveInitialCompanyId(
  companies: CompanyOption[],
  defaultCompanyId?: number,
): string {
  if (defaultCompanyId != null && defaultCompanyId > 0) {
    return String(defaultCompanyId);
  }
  if (companies.length === 1) {
    return String(companies[0]!.id);
  }
  return "";
}

export function PmProjectsList({
  companies,
  defaultCompanyId,
  lockCompany = false,
}: Props) {
  const [projects, setProjects] = useState<PmProjectRow[]>([]);
  const [companyId, setCompanyId] = useState(() =>
    resolveInitialCompanyId(companies, defaultCompanyId),
  );
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function load() {
    setLoading(true);
    setError(null);
    const cid = companyId.trim() ? Number(companyId) : undefined;
    void fetchPmProjects(cid)
      .then(setProjects)
      .catch((e: unknown) => {
        setProjects([]);
        setError(e instanceof Error ? e.message : "Could not load projects.");
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (companyId !== "") return;
    const next = resolveInitialCompanyId(companies, defaultCompanyId);
    if (next !== "") setCompanyId(next);
  }, [companies, defaultCompanyId, companyId]);

  useEffect(() => {
    if (companyId.trim()) {
      load();
    } else {
      setProjects([]);
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId]);

  async function handleCreate() {
    const cid = Number(companyId);
    if (!Number.isFinite(cid) || cid < 1) {
      setError("Select a company before creating a project.");
      return;
    }
    if (!name.trim()) return;
    setCreating(true);
    setError(null);
    try {
      await createPmProject({
        companyId: cid,
        name: name.trim(),
        code: `PRJ-${Date.now().toString(36).slice(-4).toUpperCase()}`,
      });
      setName("");
      load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Could not create project.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-[260px] flex-1">
          <CompanySelectField
            id="pm-projects-company"
            companies={companies}
            value={companyId}
            onChange={setCompanyId}
            locked={lockCompany}
            disabled={loading || creating}
            addCompanyHref="/admin/companies/new"
          />
        </div>
        <Button type="button" variant="outline" onClick={load} disabled={!companyId.trim()}>
          Refresh
        </Button>
        {!lockCompany ? (
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/companies/new">Add company</Link>
          </Button>
        ) : null}
      </div>

      {companyId.trim() ? (
        <div className="flex flex-wrap gap-2">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="New project name"
            className="max-w-sm"
            disabled={creating}
          />
          <Button type="button" onClick={() => void handleCreate()} disabled={creating}>
            {creating ? "Creating…" : "Create project"}
          </Button>
        </div>
      ) : (
        <p className="text-sm text-slate-500">Select a company to view or create projects.</p>
      )}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {loading ? (
        <p className="text-sm text-slate-500">Loading projects…</p>
      ) : !companyId.trim() ? null : projects.length === 0 ? (
        <p className="text-sm text-slate-500">No projects found for this company.</p>
      ) : (
        <ul className="divide-y rounded-xl border border-slate-200 bg-white">
          {projects.map((p) => (
            <li key={p.id}>
              <Link
                href={`/pm/projects/${p.id}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-slate-50"
              >
                <div>
                  <p className="font-medium text-slate-900">{p.name}</p>
                  <p className="text-xs text-slate-500">
                    {p.code ?? `Project #${p.id}`} · {p.company?.name ?? `Company ${p.companyId}`}
                    {p._count
                      ? ` · ${p._count.pmPmTasks} tasks · ${p._count.pmPmWorkerAssignments} assignments`
                      : ""}
                  </p>
                </div>
                <span className="text-sm capitalize text-teal-700">{p.status.toLowerCase()}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
