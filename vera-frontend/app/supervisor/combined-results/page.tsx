"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { apiGet } from "@/lib/api";
import { unknownToErrorMessage } from "@/lib/core";
import {
  parseWorkerEquipmentParams,
} from "@/lib/core/field-scan";
import {
  CombinedResultViewSchema,
  type CombinedResultView,
} from "@/lib/supervisor/combined-result-schema";

function CombinedResultsContent() {
  const params = useSearchParams();

  const pair = useMemo(
    () =>
      parseWorkerEquipmentParams(
        params?.get("worker") ?? null,
        params?.get("equipment") ?? null
      ),
    [params]
  );

  const workerId = pair.ok ? pair.workerId : null;
  const equipmentId = pair.ok ? pair.equipmentId : null;

  const [data, setData] = useState<CombinedResultView | null>(null);
  const [loadError, setLoadError] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoadError("");
    setData(null);

    if (!pair.ok) {
      setLoading(false);
      setLoadError(pair.reason);
      return;
    }

    let cancelled = false;
    async function load() {
      try {
        const raw = await apiGet<unknown>(
          `/combined/result?worker=${workerId}&equipment=${equipmentId}`
        );
        const parsed = CombinedResultViewSchema.safeParse(raw);
        if (!parsed.success) {
          throw new Error(
            "Server returned an unexpected combined verification shape"
          );
        }
        if (!cancelled) setData(parsed.data);
      } catch (e) {
        if (!cancelled) {
          setLoadError(unknownToErrorMessage(e, "Could not load verification"));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    setLoading(true);
    load();
    return () => {
      cancelled = true;
    };
  }, [pair.ok, workerId, equipmentId]);

  if (loading) {
    return (
      <div className="p-6 bg-black text-white min-h-screen">
        <p className="text-gray-400">Loading combined results…</p>
      </div>
    );
  }

  if (!pair.ok || loadError || !data) {
    return (
      <div className="p-6 bg-black text-white min-h-screen space-y-2">
        <p className="text-red-400">
          {!pair.ok ? pair.reason : loadError || "Invalid or incomplete data."}
        </p>
        <a
          href="/supervisor/scan?mode=combined"
          className="inline-block text-blue-400 underline"
        >
          Scan again
        </a>
      </div>
    );
  }

  const { workerSummary, equipmentSummary, status, reasons } = data;
  const isSafe = status === "SAFE";

  return (
    <div className="p-6 bg-black text-white min-h-screen space-y-8 pb-24">
      <h1 className="text-3xl font-bold text-center">Combined Safety Check</h1>

      <div
        className={`p-6 rounded text-center text-3xl font-bold ${
          isSafe ? "bg-green-700" : "bg-red-700"
        }`}
      >
        {status}
      </div>

      {!isSafe && reasons.length > 0 && (
        <section className="p-4 bg-red-900 rounded border border-red-700">
          <h2 className="text-xl font-semibold mb-2">Issues</h2>
          <ul className="list-disc ml-6 space-y-1">
            {reasons.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </section>
      )}

      <section className="p-4 bg-gray-900 rounded border border-gray-700">
        <h2 className="text-xl font-semibold mb-2">Worker</h2>
        <p className="text-lg font-semibold">
          {workerSummary.firstName} {workerSummary.lastName}
        </p>
        <p className="text-gray-400 text-sm">ID: {workerSummary.id}</p>
        <p className="text-gray-400 text-sm">
          Company: {workerSummary.companyName || "N/A"}
        </p>
      </section>

      <section className="p-4 bg-gray-900 rounded border border-gray-700">
        <h2 className="text-xl font-semibold mb-2">Equipment</h2>
        <p className="text-lg font-semibold">{equipmentSummary.name}</p>
        <p className="text-gray-400 text-sm">ID: {equipmentSummary.id}</p>
        <p className="text-gray-400 text-sm">
          Serial: {equipmentSummary.serialNumber || "N/A"}
        </p>
      </section>

      <section className="grid grid-cols-2 gap-4">
        <a
          href={`/supervisor/signoff/preuse?worker=${workerSummary.id}&equipment=${equipmentSummary.id}`}
          className="rounded-[3px] border border-[#3D8F58] bg-[#4FAF6F] p-4 text-center font-semibold text-[#0F1A12] shadow-none transition-[background-color,transform] duration-150 hover:-translate-y-px hover:bg-[#45A064]"
        >
          Pre‑Use Signoff
        </a>

        <a
          href="/supervisor/incidents/new"
          className="rounded-[3px] border border-[#174F86] bg-[#1E6FB8] p-4 text-center font-semibold text-[#F4F6F8] shadow-none transition-[background-color,transform] duration-150 hover:-translate-y-px hover:bg-[#1A63A6]"
        >
          Report Incident
        </a>

        <a
          href="/supervisor/scan?mode=combined"
          className="col-span-2 rounded-[3px] border border-[#2A2E33] bg-[#3B3F45] p-4 text-center font-semibold text-[#F4F6F8] shadow-none transition-[background-color,transform] duration-150 hover:-translate-y-px hover:bg-[#454A51]"
        >
          Scan Again
        </a>
      </section>
    </div>
  );
}

export default function CombinedResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6 bg-black text-white min-h-screen">
          <p className="text-gray-400">Loading combined results…</p>
        </div>
      }
    >
      <CombinedResultsContent />
    </Suspense>
  );
}
