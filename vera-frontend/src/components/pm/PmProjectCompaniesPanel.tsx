"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CompanySelectField,
  type CompanyOption,
} from "@/src/components/core/CompanySelectField";
import {
  createPortalMembership,
  listPrimeProjectMemberships,
  type PortalMembership,
} from "@/lib/pm-contractor-portal";
import { Button } from "@/components/ui/button";
import { ContractorComplianceEnginePanel } from "@/src/components/pm/ContractorComplianceEnginePanel";
import { ContractorVerificationPanel } from "@/src/components/pm/ContractorVerificationPanel";
import { ClientPrequalificationPanel } from "@/src/components/pm/ClientPrequalificationPanel";

type Props = {
  projectId: number;
  primeCompanyId: number;
  companies: CompanyOption[];
};

export function PmProjectCompaniesPanel({
  projectId,
  primeCompanyId,
  companies,
}: Props) {
  const [memberships, setMemberships] = useState<PortalMembership[]>([]);
  const [contractorCompanyId, setContractorCompanyId] = useState("");
  const [loading, setLoading] = useState(true);
  const [linking, setLinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const linkedIds = useMemo(
    () => new Set(memberships.map((m) => m.contractorCompanyId)),
    [memberships],
  );

  const linkableCompanies = useMemo(
    () =>
      companies.filter(
        (c) => c.id !== primeCompanyId && !linkedIds.has(c.id),
      ),
    [companies, primeCompanyId, linkedIds],
  );

  const reload = useCallback(() => {
    setLoading(true);
    setError(null);
    void listPrimeProjectMemberships(primeCompanyId, projectId)
      .then(setMemberships)
      .catch((e: unknown) => {
        setMemberships([]);
        setError(e instanceof Error ? e.message : "Could not load linked companies.");
      })
      .finally(() => setLoading(false));
  }, [primeCompanyId, projectId]);

  useEffect(() => {
    reload();
  }, [reload]);

  async function handleLink() {
    const cid = Number(contractorCompanyId);
    if (!Number.isFinite(cid) || cid < 1) {
      setError("Select a company to link.");
      return;
    }
    setLinking(true);
    setError(null);
    setMessage(null);
    try {
      await createPortalMembership({
        primeCompanyId,
        contractorCompanyId: cid,
        projectId,
      });
      setContractorCompanyId("");
      setMessage("Company linked to this project.");
      reload();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Could not link company.");
    } finally {
      setLinking(false);
    }
  }

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-slate-900">Linked companies</h3>
          <p className="mt-1 text-sm text-slate-600">
            Contractor and partner organizations with portal access on this project.
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" asChild>
          <Link href="/admin/companies/new">Add company</Link>
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Loading linked companies…</p>
      ) : memberships.length === 0 ? (
        <p className="text-sm text-slate-500">
          No companies linked yet. Search below to attach a contractor to this project.
        </p>
      ) : (
        <ul className="divide-y rounded-lg border border-slate-100">
          {memberships.map((m) => (
            <li key={m.id} className="px-3 py-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-900">
                  {m.contractorCompany?.name ?? `Company #${m.contractorCompanyId}`}
                </span>
                <span className="text-xs text-slate-500">
                  {m.projectId === projectId ? "Project scope" : "All projects"}
                </span>
              </div>
              <ContractorComplianceEnginePanel
                membershipId={m.id}
                contractorName={m.contractorCompany?.name ?? `Company #${m.contractorCompanyId}`}
              />
              <ContractorVerificationPanel
                membershipId={m.id}
                contractorName={m.contractorCompany?.name ?? `Company #${m.contractorCompanyId}`}
              />
              <ClientPrequalificationPanel
                membershipId={m.id}
                contractorName={m.contractorCompany?.name ?? `Company #${m.contractorCompanyId}`}
              />
            </li>
          ))}
        </ul>
      )}

      <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/50 p-4">
        <p className="mb-3 text-sm font-medium text-slate-800">Link a company</p>
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[240px] flex-1">
            <CompanySelectField
              id="link-contractor-company"
              companies={linkableCompanies}
              value={contractorCompanyId}
              onChange={setContractorCompanyId}
              disabled={linking || linkableCompanies.length === 0}
              addCompanyHref="/admin/companies/new"
            />
          </div>
          <Button
            type="button"
            onClick={() => void handleLink()}
            disabled={linking || !contractorCompanyId}
          >
            {linking ? "Linking…" : "Link to project"}
          </Button>
        </div>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {message ? <p className="text-sm text-teal-700">{message}</p> : null}
    </div>
  );
}
