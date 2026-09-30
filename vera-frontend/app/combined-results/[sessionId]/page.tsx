"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import QRCode from "qrcode";
import { API_URL } from "@/lib/api-fetch";

type CombinedView = {
  status: string;
  reasons: string[];
  workerSummary: {
    id: number;
    firstName: string;
    lastName: string;
    fullName: string;
    companyName: string | null;
  };
  equipmentSummary: {
    id: number;
    name: string;
    serialNumber: string | null;
  };
  raw?: { equipment?: { safetyStatus?: string } };
};

function parseWorkerEquipment(sessionId: string): { workerId: number; equipmentId: number } | null {
  const m = /^(\d+)-(\d+)$/.exec(sessionId.trim());
  if (!m) return null;
  return { workerId: Number(m[1]), equipmentId: Number(m[2]) };
}

export default function CombinedResultPage() {
  const params = useParams();
  const sessionId = String(params?.sessionId ?? "");

  const [session, setSession] = useState<CombinedView | null>(null);
  const [qr, setQr] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const resultUrl =
    typeof window !== "undefined" ? `${window.location.origin}/combined-results/${sessionId}` : "";

  useEffect(() => {
    async function load() {
      const ids = parseWorkerEquipment(sessionId);
      if (!ids) {
        setError("Invalid result link. Expected format: {workerId}-{equipmentId}.");
        setLoading(false);
        return;
      }

      try {
        const qs = new URLSearchParams({
          worker: String(ids.workerId),
          equipment: String(ids.equipmentId),
        });
        const res = await fetch(`${API_URL}/combined/result?${qs.toString()}`, { credentials: "include" });
        if (!res.ok) {
          setError(await res.text());
          setSession(null);
          return;
        }
        const data = (await res.json()) as CombinedView;
        setSession(data);

        const qrData = await QRCode.toDataURL(resultUrl || `${window.location.origin}/combined-results/${sessionId}`, {
          width: 200,
          margin: 1,
        });
        setQr(qrData);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load");
        setSession(null);
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">
        Loading verification result…
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="p-6 text-center text-red-600">
        {error || "Verification session not found."}
      </div>
    );
  }

  const pass = session.status === "SAFE";
  const reasons = Array.isArray(session.reasons) ? session.reasons : [];
  const eqSafe = session.raw?.equipment?.safetyStatus === "OK";

  return (
    <div className="mx-auto max-w-lg space-y-6 p-6">
      <div
        className={`rounded py-4 text-center text-4xl font-bold ${
          pass ? "bg-green-700 text-white" : "bg-red-700 text-white"
        }`}
      >
        {pass ? "PASS" : "FAIL"}
      </div>

      <div className="rounded border bg-white p-4 text-center shadow">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={qr} alt="Result QR" className="mx-auto h-40 w-40" />
        <p className="mt-2 break-all text-xs text-gray-600">{resultUrl}</p>
      </div>

      <div className="rounded border bg-gray-900 p-4 text-white shadow">
        <h2 className="mb-2 text-xl font-semibold">Worker</h2>
        <p className="text-lg">{session.workerSummary.fullName}</p>
        {session.workerSummary.companyName ? (
          <p className="text-sm text-gray-300">{session.workerSummary.companyName}</p>
        ) : null}
        <p className="mt-1 text-xs text-gray-400">Worker ID: {session.workerSummary.id}</p>
      </div>

      <div className="rounded border bg-gray-900 p-4 text-white shadow">
        <h2 className="mb-2 text-xl font-semibold">Equipment</h2>
        <p className="text-lg">{session.equipmentSummary.name}</p>
        {session.equipmentSummary.serialNumber ? (
          <p className="text-sm text-gray-300">Serial: {session.equipmentSummary.serialNumber}</p>
        ) : null}
        <p className="mt-1 text-xs">
          Status:{" "}
          <span className={eqSafe ? "text-green-400" : "text-red-400"}>{eqSafe ? "SAFE" : "REVIEW"}</span>
        </p>
      </div>

      {!pass && reasons.length > 0 && (
        <div className="rounded border bg-red-900 p-4 text-white shadow">
          <h2 className="mb-2 text-xl font-semibold">Reasons</h2>
          <ul className="ml-5 list-disc space-y-1 text-sm">
            {reasons.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="text-center text-sm text-gray-400">Combined check · worker–equipment pair</div>

      <div className="text-center">
        <a href="/supervisor/combined" className="text-blue-500 underline">
          New combined check
        </a>
      </div>
    </div>
  );
}
