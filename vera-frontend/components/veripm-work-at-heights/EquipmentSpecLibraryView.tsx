"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  approveFallEquipment,
  createFallEquipment,
  ingestFallEquipmentManual,
  listFallEquipment,
  rejectFallEquipment,
} from "@/lib/veripm-work-at-heights/api";
import {
  emptyParams,
  q,
  type ClearanceParams,
  type FallEquipmentProfile,
} from "@/lib/veripm-work-at-heights/types";

export function EquipmentSpecLibraryView({
  projectId = 1,
  companyId = 1,
}: {
  projectId?: number;
  companyId?: number;
}) {
  const qs = q(companyId, projectId);
  const [rows, setRows] = useState<FallEquipmentProfile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [ingestId, setIngestId] = useState("");
  const [ingestText, setIngestText] = useState("");
  const [form, setForm] = useState({
    type: "system",
    manufacturer: "",
    model: "",
    params: emptyParams(),
  });

  const reload = useCallback(async () => {
    try {
      setRows(await listFallEquipment(true));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  async function onCreate() {
    setBusy(true);
    setError(null);
    try {
      await createFallEquipment({
        type: form.type,
        manufacturer: form.manufacturer,
        model: form.model,
        clearanceParams: form.params,
        standardRefs: ["Verify manufacturer IFU"],
      });
      setForm({ type: "system", manufacturer: "", model: "", params: emptyParams() });
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Create failed");
    } finally {
      setBusy(false);
    }
  }

  async function onIngest() {
    if (!ingestId || !ingestText.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const result = await ingestFallEquipmentManual(ingestId, ingestText);
      setError(
        result.warnings.length
          ? `Ingested (confidence ${result.confidence}). Warnings: ${result.warnings.join("; ")}`
          : `Ingested (confidence ${result.confidence}). Verify datasheet before approving.`,
      );
      setIngestText("");
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ingest failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5 p-4 sm:p-6">
      <Link
        href={`/pm/work-at-heights?${qs}`}
        className="text-sm text-slate-600 hover:text-slate-900"
      >
        ← Work at Heights
      </Link>
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">
          Manufacturer spec library
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Load and review equipment clearance parameters for use as{" "}
          <strong>reference</strong> values in worksheets. Approving a profile
          does not mean Vera validated the datasheet.
        </p>
      </header>

      {error ? (
        <p className="rounded border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
          {error}
        </p>
      ) : null}

      <section className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-3 py-2">Manufacturer / model</th>
              <th className="px-3 py-2">Type</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-slate-100">
                <td className="px-3 py-2">
                  <div className="font-medium">{r.manufacturer}</div>
                  <div className="text-xs text-slate-500">{r.model}</div>
                </td>
                <td className="px-3 py-2">{r.type}</td>
                <td className="px-3 py-2">{r.status}</td>
                <td className="px-3 py-2 space-x-2">
                  <button
                    type="button"
                    className="text-xs text-slate-700 underline"
                    onClick={() => setIngestId(r.id)}
                  >
                    Ingest
                  </button>
                  {r.status !== "APPROVED" ? (
                    <button
                      type="button"
                      className="text-xs text-emerald-700 underline"
                      disabled={busy}
                      onClick={() =>
                        approveFallEquipment(r.id).then(reload).catch((e) =>
                          setError(e instanceof Error ? e.message : "Approve failed"),
                        )
                      }
                    >
                      Approve
                    </button>
                  ) : null}
                  {r.status !== "REJECTED" ? (
                    <button
                      type="button"
                      className="text-xs text-red-700 underline"
                      disabled={busy}
                      onClick={() =>
                        rejectFallEquipment(r.id).then(reload).catch((e) =>
                          setError(e instanceof Error ? e.message : "Reject failed"),
                        )
                      }
                    >
                      Reject
                    </button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:grid-cols-2">
        <h2 className="sm:col-span-2 text-sm font-semibold">Add draft profile</h2>
        <label className="text-sm">
          Type
          <select
            className="mt-1 w-full rounded border px-2 py-1.5"
            value={form.type}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
          >
            {["system", "lanyard", "srl", "harness", "anchor"].map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Manufacturer
          <input
            className="mt-1 w-full rounded border px-2 py-1.5"
            value={form.manufacturer}
            onChange={(e) =>
              setForm((f) => ({ ...f, manufacturer: e.target.value }))
            }
          />
        </label>
        <label className="sm:col-span-2 text-sm">
          Model
          <input
            className="mt-1 w-full rounded border px-2 py-1.5"
            value={form.model}
            onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))}
          />
        </label>
        <ParamFields
          params={form.params}
          onChange={(params) => setForm((f) => ({ ...f, params }))}
        />
        <div className="sm:col-span-2">
          <button
            type="button"
            disabled={busy || !form.manufacturer || !form.model}
            onClick={onCreate}
            className="rounded bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-50"
          >
            Create draft
          </button>
        </div>
      </section>

      <section className="space-y-2 rounded-lg border border-slate-200 bg-white p-4">
        <p className="text-xs text-slate-500">
          Prefer{" "}
          <Link
            href={`/pm/safety-program-ingest?${qs}`}
            className="underline"
          >
            Safety program ingestion
          </Link>{" "}
          for full-document IFU/policy extract (schema + confirm). Heuristic
          ingest below remains for quick param drafts.
        </p>
        <h2 className="text-sm font-semibold">Ingest manual / datasheet text</h2>
        <p className="text-xs text-slate-500">
          Heuristic extraction only — verify every number against the manufacturer
          datasheet before approving for reference use.
        </p>
        <select
          className="w-full rounded border px-2 py-1.5 text-sm"
          value={ingestId}
          onChange={(e) => setIngestId(e.target.value)}
        >
          <option value="">Select profile…</option>
          {rows.map((r) => (
            <option key={r.id} value={r.id}>
              {r.manufacturer} — {r.model}
            </option>
          ))}
        </select>
        <textarea
          className="w-full rounded border px-2 py-1.5 text-sm"
          rows={5}
          value={ingestText}
          onChange={(e) => setIngestText(e.target.value)}
          placeholder="Paste IFU / datasheet excerpts…"
        />
        <button
          type="button"
          disabled={busy || !ingestId || !ingestText.trim()}
          onClick={onIngest}
          className="rounded border border-slate-300 px-4 py-2 text-sm disabled:opacity-50"
        >
          Run ingest → pending review
        </button>
      </section>
    </div>
  );
}

function ParamFields({
  params,
  onChange,
}: {
  params: ClearanceParams;
  onChange: (p: ClearanceParams) => void;
}) {
  const fields: (keyof ClearanceParams)[] = [
    "maxFreeFallM",
    "decelerationDistanceM",
    "harnessStretchM",
    "lifelinePayoutM",
    "anchorDeflectionM",
    "safetyMarginM",
  ];
  return (
    <>
      {fields.map((key) => (
        <label key={key} className="text-sm">
          {key}
          <input
            type="number"
            min={0}
            step={0.01}
            className="mt-1 w-full rounded border px-2 py-1.5"
            value={params[key]}
            onChange={(e) =>
              onChange({ ...params, [key]: Number(e.target.value) || 0 })
            }
          />
        </label>
      ))}
    </>
  );
}
