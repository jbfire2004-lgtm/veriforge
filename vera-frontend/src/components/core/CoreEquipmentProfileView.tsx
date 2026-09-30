"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ClipboardCheck, HardHat } from "lucide-react";
import { getEquipmentProfile } from "@/lib/api/vera-core";
import { fetchEquipmentReadiness } from "@/lib/core/vera-core-platform";
import { AssetDocumentsPanel } from "@/components/documents/AssetDocumentsPanel";

type Props = { equipmentId: number };

export function CoreEquipmentProfileView({ equipmentId }: Props) {
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [readiness, setReadiness] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void Promise.all([
      getEquipmentProfile(equipmentId).catch(() => null),
      fetchEquipmentReadiness(equipmentId).catch(() => null),
    ])
      .then(([p, r]) => {
        setProfile(p as Record<string, unknown> | null);
        setReadiness(r as Record<string, unknown> | null);
      })
      .catch(() => setError("Could not load equipment profile"))
      .finally(() => setLoading(false));
  }, [equipmentId]);

  if (loading) return <p className="text-sm text-slate-500">Loading profile…</p>;
  if (error || !profile) {
    return <p className="text-sm text-amber-700">{error ?? "Equipment not found"}</p>;
  }

  const inspections = (profile.inspections as Array<Record<string, unknown>>) ?? [];
  const links = (profile.equipmentLinks as Array<Record<string, unknown>>) ?? [];

  return (
    <div className="space-y-8">
      <Link href="/core/equipment" className="inline-flex items-center gap-1 text-sm text-teal-700 hover:underline">
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back to equipment
      </Link>

      <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <HardHat className="h-8 w-8 text-teal-600" aria-hidden />
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{String(profile.name)}</h1>
            <p className="mt-1 text-sm text-slate-500">
              {[profile.serialNumber, profile.assetTag].filter(Boolean).map(String).join(" · ")}
            </p>
          </div>
        </div>
        {readiness ? (
          <div className="mt-4 flex flex-wrap gap-4">
            <div className="rounded-xl bg-teal-50 px-4 py-2">
              <p className="text-xs font-semibold uppercase text-teal-800">Readiness score</p>
              <p className="text-2xl font-bold text-teal-900">{String(readiness.score)}%</p>
            </div>
            <div className="rounded-xl bg-slate-50 px-4 py-2">
              <p className="text-xs font-semibold uppercase text-slate-600">Status</p>
              <p className="text-lg font-semibold">{String(readiness.complianceStatus)}</p>
            </div>
          </div>
        ) : null}
      </header>

      <section>
        <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
          <ClipboardCheck className="h-5 w-5 text-teal-600" aria-hidden />
          Recent inspections
        </h2>
        <ul className="divide-y rounded-xl border border-slate-200 bg-white">
          {inspections.length === 0 ? (
            <li className="px-4 py-3 text-sm text-slate-500">No inspections</li>
          ) : (
            inspections.slice(0, 10).map((i) => (
              <li key={String(i.id)} className="flex justify-between px-4 py-3 text-sm">
                <span>{String(i.status)}</span>
                <span className="text-slate-500">
                  {i.completedAt
                    ? new Date(String(i.completedAt)).toLocaleDateString()
                    : "Pending"}
                </span>
              </li>
            ))
          )}
        </ul>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Company links</h2>
        <ul className="divide-y rounded-xl border border-slate-200 bg-white">
          {links.length === 0 ? (
            <li className="px-4 py-3 text-sm text-slate-500">No active links</li>
          ) : (
            links.map((l) => (
              <li key={String(l.id)} className="px-4 py-3 text-sm">
                {(l.company as { name?: string })?.name ?? `Company #${String(l.companyId)}`}
                {" · "}
                {String(l.complianceStatus ?? "UNKNOWN")}
              </li>
            ))
          )}
        </ul>
      </section>

      <AssetDocumentsPanel assetId={equipmentId} />
    </div>
  );
}
