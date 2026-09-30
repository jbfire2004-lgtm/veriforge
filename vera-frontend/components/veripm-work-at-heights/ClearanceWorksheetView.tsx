"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  listFallEquipment,
  saveClearanceWorksheet,
} from "@/lib/veripm-work-at-heights/api";
import {
  PARAM_ROWS,
  WAH_DISCLAIMER,
  WAH_INDUSTRY_PLAYBOOKS,
  emptyParams,
  q,
  sumParams,
  type ClearanceParams,
  type FallEquipmentProfile,
  type WahIndustryId,
  type WorksheetGeometry,
} from "@/lib/veripm-work-at-heights/types";

export function ClearanceWorksheetView({
  projectId = 1,
  companyId = 1,
  industry: initialIndustry = "construction",
}: {
  projectId?: number;
  companyId?: number;
  industry?: string;
}) {
  const { data: session } = useSession();
  const [equipment, setEquipment] = useState<FallEquipmentProfile[]>([]);
  const [equipmentId, setEquipmentId] = useState("");
  const [industry, setIndustry] = useState<WahIndustryId>(
    (initialIndustry as WahIndustryId) || "construction",
  );
  const [reference, setReference] = useState<ClearanceParams>(emptyParams());
  const [userParams, setUserParams] = useState<ClearanceParams>(emptyParams());
  const [geometry, setGeometry] = useState<WorksheetGeometry>({
    anchorHeightM: 6,
    workSurfaceHeightM: 3,
    horizontalOffsetM: 1.5,
    workerMassKg: 90,
    environment: "outdoor",
  });
  const [userRequiredM, setUserRequiredM] = useState<string>("");
  const [userAvailableM, setUserAvailableM] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [ack, setAck] = useState(false);
  const [ackName, setAckName] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const qs = q(companyId, projectId);
  const playbook = WAH_INDUSTRY_PLAYBOOKS.find((p) => p.id === industry);
  const selected = equipment.find((e) => e.id === equipmentId);
  const userSubtotal = useMemo(() => sumParams(userParams), [userParams]);

  useEffect(() => {
    listFallEquipment(false)
      .then((rows) => {
        setEquipment(rows);
        if (rows[0]) {
          setEquipmentId(rows[0].id);
          setReference({ ...rows[0].clearanceParams });
          setUserParams({ ...rows[0].clearanceParams });
        }
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load specs"));
  }, []);

  useEffect(() => {
    const name =
      (session?.user as { name?: string } | undefined)?.name ??
      session?.user?.email ??
      "";
    if (name && !ackName) setAckName(name);
  }, [session, ackName]);

  function loadEquipment(id: string) {
    setEquipmentId(id);
    const eq = equipment.find((e) => e.id === id);
    if (!eq) return;
    setReference({ ...eq.clearanceParams });
    setUserParams({ ...eq.clearanceParams });
    setMessage(
      "Reference values loaded from manufacturer profile. Verify against the datasheet, then enter your working figures.",
    );
  }

  function copyReferenceToWorking() {
    setUserParams({ ...reference });
  }

  function clearWorking() {
    setUserParams(emptyParams());
  }

  async function onSave() {
    setError(null);
    setMessage(null);
    if (!ack) {
      setError("You must acknowledge the liability statement before saving.");
      return;
    }
    if (!ackName.trim()) {
      setError("Enter your name as the competent person acknowledging this worksheet.");
      return;
    }
    setSaving(true);
    try {
      const saved = await saveClearanceWorksheet({
        companyId,
        projectId,
        industry,
        equipmentId: equipmentId || undefined,
        referenceParams: reference,
        userParams,
        geometry,
        userRequiredM: userRequiredM === "" ? undefined : Number(userRequiredM),
        userAvailableM:
          userAvailableM === "" ? undefined : Number(userAvailableM),
        userNotes: notes || undefined,
        acknowledged: true,
        acknowledgedBy: ackName.trim(),
      });
      setMessage(
        `Worksheet saved (${saved.id.slice(0, 8)}…). This is your working record — not a Vera certification.`,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  function printSummary() {
    window.print();
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5 p-4 sm:p-6 print:max-w-none">
      <div className="flex flex-wrap items-center justify-between gap-2 print:hidden">
        <Link
          href={`/pm/work-at-heights?${qs}`}
          className="text-sm text-slate-600 hover:text-slate-900"
        >
          ← Work at Heights
        </Link>
        <div className="flex flex-wrap gap-3">
          <Link
            href={`/pm/work-at-heights/equipment?${qs}`}
            className="text-sm text-slate-600 hover:underline"
          >
            Spec library
          </Link>
          <Link
            href={`/pm/safety-program-ingest?${qs}`}
            className="text-sm text-slate-600 hover:underline"
          >
            Safety program ingestion
          </Link>
        </div>
      </div>

      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-slate-900">
          Clearance worksheet
        </h1>
        <p className="text-sm text-slate-600">
          Manufacturer values are reference only. Enter your own line items and
          totals. Vera does not calculate adequacy or authorize work.
        </p>
      </header>

      <div
        className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950"
        role="note"
      >
        {WAH_DISCLAIMER}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 print:hidden">
        <label className="text-sm">
          Industry context
          <select
            className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5"
            value={industry}
            onChange={(e) => setIndustry(e.target.value as WahIndustryId)}
          >
            {WAH_INDUSTRY_PLAYBOOKS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Load manufacturer / system profile
          <select
            className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5"
            value={equipmentId}
            onChange={(e) => loadEquipment(e.target.value)}
          >
            <option value="">Select approved profile…</option>
            {equipment.map((eq) => (
              <option key={eq.id} value={eq.id}>
                {eq.manufacturer} — {eq.model} ({eq.type})
              </option>
            ))}
          </select>
        </label>
      </div>

      {selected ? (
        <p className="text-xs text-slate-500">
          Standards refs: {selected.standardRefs.join(", ") || "—"} · Status:{" "}
          {selected.status} · Example profiles must be verified against the
          current datasheet.
        </p>
      ) : null}

      {playbook ? (
        <p className="rounded border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
          <strong>{playbook.label}:</strong> {playbook.summary}
        </p>
      ) : null}

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-3 py-2">Line item</th>
              <th className="px-3 py-2">Reference (m)</th>
              <th className="px-3 py-2">Your working value (m)</th>
            </tr>
          </thead>
          <tbody>
            {PARAM_ROWS.map((row) => (
              <tr key={row.key} className="border-t border-slate-100">
                <td className="px-3 py-2">
                  <div className="font-medium text-slate-800">{row.label}</div>
                  <div className="text-xs text-slate-500">{row.hint}</div>
                </td>
                <td className="px-3 py-2 text-slate-600">
                  {reference[row.key].toFixed(3)}
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    className="w-28 rounded border border-slate-300 px-2 py-1"
                    value={userParams[row.key]}
                    onChange={(e) =>
                      setUserParams((prev) => ({
                        ...prev,
                        [row.key]: Number(e.target.value) || 0,
                      }))
                    }
                  />
                </td>
              </tr>
            ))}
            <tr className="border-t border-slate-200 bg-slate-50">
              <td className="px-3 py-2 font-semibold">Your line-item subtotal</td>
              <td className="px-3 py-2 text-slate-500">
                {sumParams(reference).toFixed(3)}
              </td>
              <td className="px-3 py-2 font-semibold">
                {userSubtotal.toFixed(3)} m
                <span className="ml-2 text-xs font-normal text-slate-500">
                  (arithmetic only — not a safety verdict)
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap gap-2 print:hidden">
        <button
          type="button"
          className="rounded border border-slate-300 px-3 py-1.5 text-sm"
          onClick={copyReferenceToWorking}
        >
          Copy reference → working
        </button>
        <button
          type="button"
          className="rounded border border-slate-300 px-3 py-1.5 text-sm"
          onClick={clearWorking}
        >
          Clear working values
        </button>
      </div>

      <section className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:grid-cols-2">
        <h2 className="sm:col-span-2 text-sm font-semibold text-slate-900">
          Site geometry (documentation only)
        </h2>
        {(
          [
            ["anchorHeightM", "Anchor height (m)"],
            ["workSurfaceHeightM", "Work surface height (m)"],
            ["horizontalOffsetM", "Horizontal offset (m)"],
            ["workerMassKg", "Worker mass (kg)"],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="text-sm">
            {label}
            <input
              type="number"
              min={0}
              step={0.01}
              className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5"
              value={geometry[key] ?? ""}
              onChange={(e) =>
                setGeometry((g) => ({
                  ...g,
                  [key]: e.target.value === "" ? undefined : Number(e.target.value),
                }))
              }
            />
          </label>
        ))}
        <label className="text-sm">
          Environment
          <select
            className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5"
            value={geometry.environment ?? "outdoor"}
            onChange={(e) =>
              setGeometry((g) => ({ ...g, environment: e.target.value }))
            }
          >
            <option value="outdoor">Outdoor</option>
            <option value="indoor">Indoor</option>
            <option value="leading_edge">Leading edge</option>
            <option value="confined">Confined</option>
            <option value="general">General</option>
          </select>
        </label>
      </section>

      <section className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:grid-cols-2">
        <h2 className="sm:col-span-2 text-sm font-semibold text-slate-900">
          Your clearance figures
        </h2>
        <label className="text-sm">
          Required clearance (your figure, m)
          <input
            type="number"
            min={0}
            step={0.01}
            className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5"
            value={userRequiredM}
            onChange={(e) => setUserRequiredM(e.target.value)}
            placeholder="Enter your required clearance"
          />
        </label>
        <label className="text-sm">
          Available clearance to next lower level (your figure, m)
          <input
            type="number"
            min={0}
            step={0.01}
            className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5"
            value={userAvailableM}
            onChange={(e) => setUserAvailableM(e.target.value)}
            placeholder="Enter available clearance"
          />
        </label>
        <label className="sm:col-span-2 text-sm">
          Notes / assumptions
          <textarea
            className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Document datasheet revision, swing-fall considerations, competent person judgment…"
          />
        </label>
      </section>

      <section className="space-y-3 rounded-lg border border-slate-300 bg-white p-4 print:border-black">
        <label className="flex items-start gap-2 text-sm text-slate-800">
          <input
            type="checkbox"
            className="mt-1"
            checked={ack}
            onChange={(e) => setAck(e.target.checked)}
          />
          <span>
            I acknowledge this is a user-owned working worksheet. Manufacturer
            values are reference only. I (or my organization) am responsible for
            verifying datasheets, performing the clearance determination, and
            authorizing work. Vera does not certify adequacy or issue a
            pass/fail result.
          </span>
        </label>
        <label className="block text-sm">
          Acknowledged by (competent person)
          <input
            className="mt-1 w-full max-w-md rounded border border-slate-300 px-2 py-1.5"
            value={ackName}
            onChange={(e) => setAckName(e.target.value)}
          />
        </label>
        <div className="flex flex-wrap gap-2 print:hidden">
          <button
            type="button"
            disabled={saving}
            onClick={onSave}
            className="rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save working record"}
          </button>
          <button
            type="button"
            onClick={printSummary}
            className="rounded border border-slate-300 px-4 py-2 text-sm"
          >
            Print / export summary
          </button>
        </div>
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        {message ? <p className="text-sm text-emerald-800">{message}</p> : null}
        <p className="text-xs text-slate-500">
          Printed summary label: User worksheet — not Vera-certified.
        </p>
      </section>
    </div>
  );
}
