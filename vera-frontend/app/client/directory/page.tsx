"use client";

import { useCallback, useEffect, useState } from "react";
import { HiringClientShell } from "@/src/components/client/HiringClientShell";
import { ContractorDirectoryCard } from "@/src/components/contractor-directory";
import { Button, Input } from "@/components/ui";
import {
  listContractorsDirectory,
  requestContractorConnection,
  type ContractorListItem,
  type InsuranceStatus,
} from "@/lib/contractor-directory-api";

export default function ClientDirectoryPage() {
  const [items, setItems] = useState<ContractorListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [q, setQ] = useState("");
  const [insuranceStatus, setInsuranceStatus] = useState<InsuranceStatus | "">(
    "",
  );
  const [minCompliance, setMinCompliance] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const take = 12;

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listContractorsDirectory({
        q: q || undefined,
        insuranceStatus: insuranceStatus || undefined,
        minCompliance: minCompliance ? Number(minCompliance) : undefined,
        skip: (page - 1) * take,
        take,
      });
      setItems(data.items ?? []);
      setTotal(data.total ?? 0);
      setPageCount(data.pageCount ?? 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [q, insuranceStatus, minCompliance, page]);

  useEffect(() => {
    void reload();
  }, [reload]);

  async function onConnect(id: string) {
    setBusyId(id);
    try {
      await requestContractorConnection(id);
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connection failed");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <HiringClientShell
      title="Contractor directory"
      description="Search, filter, and connect with contractor organizations."
    >
      <form
        className="mb-6 grid gap-3 sm:grid-cols-4"
        onSubmit={(e) => {
          e.preventDefault();
          setPage(1);
          void reload();
        }}
      >
        <Input
          placeholder="Search name, industry…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          className="rounded border border-zinc-300 px-3 py-2 text-sm"
          value={insuranceStatus}
          onChange={(e) =>
            setInsuranceStatus(e.target.value as InsuranceStatus | "")
          }
        >
          <option value="">All insurance</option>
          <option value="valid">Valid</option>
          <option value="expiring">Expiring</option>
          <option value="expired">Expired</option>
          <option value="missing">Missing</option>
        </select>
        <Input
          type="number"
          min={0}
          max={100}
          placeholder="Min compliance"
          value={minCompliance}
          onChange={(e) => setMinCompliance(e.target.value)}
        />
        <Button type="submit">Search</Button>
      </form>

      {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}
      {loading ? (
        <p className="text-sm text-zinc-500">Loading…</p>
      ) : (
        <>
          <p className="mb-3 text-xs text-zinc-500">
            {total} contractor{total === 1 ? "" : "s"}
          </p>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((c) => (
              <li key={c.contractorId}>
                <ContractorDirectoryCard
                  contractor={c}
                  hrefBase="/client/directory"
                  onConnect={onConnect}
                  connectBusy={busyId === c.contractorId}
                />
              </li>
            ))}
          </ul>
          {!items.length ? (
            <p className="text-sm text-zinc-500">No contractors match.</p>
          ) : null}
          <div className="mt-6 flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <span className="text-sm text-zinc-600">
              Page {page} / {pageCount}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page >= pageCount}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </>
      )}
    </HiringClientShell>
  );
}
