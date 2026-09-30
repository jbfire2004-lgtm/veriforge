"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui";
import {
  createPvsProgram,
  ensureRequiredPvs,
  fetchPvsDashboard,
  listPvsPrograms,
  type ProgramVerification,
  type PvsDashboard,
  type PvsProgramCategory,
} from "@/lib/pvs-api";
import { PvsStatusBadge } from "./PvsStatusBadge";
import { ProgramViewer } from "./ProgramViewer";

export function PvsDashboard({
  contractorId,
  canManage = true,
  basePath = "/verihub/pvs",
}: {
  contractorId: string;
  canManage?: boolean;
  basePath?: string;
}) {
  const [dash, setDash] = useState<PvsDashboard | null>(null);
  const [items, setItems] = useState<ProgramVerification[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [newCategory, setNewCategory] =
    useState<PvsProgramCategory>("hazard_assessment");

  const reload = useCallback(async () => {
    setError(null);
    try {
      const [d, list] = await Promise.all([
        fetchPvsDashboard(contractorId),
        listPvsPrograms(contractorId),
      ]);
      setDash(d);
      setItems(list.items);
      if (!selectedId && list.items[0]) setSelectedId(list.items[0].id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load PVS");
    }
  }, [contractorId, selectedId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Program Verification</h2>
          {dash ? (
            <p className="text-sm text-zinc-600">
              PVS score <strong>{dash.pvsScore}</strong> ·{" "}
              {dash.totals.verified} verified · {dash.totals.exempt} exempt
            </p>
          ) : null}
        </div>
        {canManage ? (
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={() => {
                setBusy(true);
                void ensureRequiredPvs(contractorId)
                  .then(reload)
                  .catch((e) =>
                    setError(e instanceof Error ? e.message : "Failed"),
                  )
                  .finally(() => setBusy(false));
              }}
            >
              Seed required programs
            </Button>
            <select
              className="border border-zinc-300 px-2 py-1 text-sm"
              value={newCategory}
              onChange={(e) =>
                setNewCategory(e.target.value as PvsProgramCategory)
              }
            >
              {(
                [
                  "hazard_assessment",
                  "emergency_response",
                  "incident_investigation",
                  "ppe",
                  "working_at_heights",
                  "confined_space",
                  "lockout_tagout",
                  "substance_abuse",
                  "orientation_training",
                  "environmental",
                  "other",
                ] as PvsProgramCategory[]
              ).map((c) => (
                <option key={c} value={c}>
                  {c.replace(/_/g, " ")}
                </option>
              ))}
            </select>
            <Button
              type="button"
              disabled={busy}
              onClick={() => {
                setBusy(true);
                void createPvsProgram(contractorId, {
                  programCategory: newCategory,
                })
                  .then((p) => {
                    setSelectedId(p.id);
                    return reload();
                  })
                  .catch((e) =>
                    setError(e instanceof Error ? e.message : "Create failed"),
                  )
                  .finally(() => setBusy(false));
              }}
            >
              Add program
            </Button>
          </div>
        ) : null}
      </div>

      {dash?.indicators ? (
        <div className="flex flex-wrap gap-2 text-sm">
          {dash.indicators.ready ? (
            <span className="border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-800">
              Required programs covered
            </span>
          ) : (
            <span className="border border-amber-200 bg-amber-50 px-3 py-1 text-amber-900">
              Missing:{" "}
              {dash.missingRequired.map((c) => c.replace(/_/g, " ")).join(", ") ||
                "—"}
            </span>
          )}
          {dash.indicators.hasPendingExemption ? (
            <span className="border border-sky-200 bg-sky-50 px-3 py-1 text-sky-800">
              Pending exemptions
            </span>
          ) : null}
        </div>
      ) : null}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <ul className="divide-y divide-zinc-200 border border-zinc-200 text-sm">
          {items.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                className={`w-full px-3 py-3 text-left hover:bg-zinc-50 ${selectedId === p.id ? "bg-zinc-50" : ""}`}
                onClick={() => setSelectedId(p.id)}
              >
                <div className="font-medium">{p.title}</div>
                <div className="mt-1 flex items-center gap-2">
                  <PvsStatusBadge status={p.verificationStatus} />
                </div>
              </button>
            </li>
          ))}
          {!items.length ? (
            <li className="px-3 py-6 text-zinc-500">No programs yet.</li>
          ) : null}
        </ul>
        <div className="border border-zinc-200 p-4">
          {selectedId ? (
            <ProgramViewer
              contractorId={contractorId}
              pvsId={selectedId}
              canManage={canManage}
              onChanged={() => void reload()}
            />
          ) : (
            <p className="text-sm text-zinc-500">Select a program.</p>
          )}
        </div>
      </div>

      <p className="text-xs text-zinc-500">
        Also see{" "}
        <Link href="/verihub/analytics" className="underline">
          Analytics
        </Link>{" "}
        and{" "}
        <Link href="/verihub/quickcheck" className="underline">
          QuickCheck
        </Link>
        .
      </p>
    </div>
  );
}
