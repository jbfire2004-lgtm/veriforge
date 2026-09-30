"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { getEquipmentProfile } from "@/lib/pm-equipment-safety";
import { SfCard } from "@/src/components/safety-forms/ui";

export default function EquipmentProfilePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = parseInt(String(params.id), 10);
  const projectId = searchParams?.get("projectId") ?? "1";
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    void getEquipmentProfile(id).then(setProfile).catch(() => undefined);
  }, [id]);

  if (!profile) {
    return <p className="p-8 text-sm text-[var(--sf-text-muted)]">Loading…</p>;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <Link
        href={`/pm/equipment-safety?projectId=${projectId}`}
        className="text-sm text-[var(--sf-primary)] hover:underline"
      >
        ← Equipment safety
      </Link>
      <h1 className="text-2xl font-semibold">{String(profile.name)}</h1>
      <SfCard className="space-y-2 p-5 text-sm">
        <p>
          <span className="text-[var(--sf-text-muted)]">Status:</span>{" "}
          {String(profile.operationalStatus)} / {String(profile.complianceStatus)}
        </p>
        <p>
          <span className="text-[var(--sf-text-muted)]">Serial:</span>{" "}
          {String(profile.serialNumber ?? "—")}
        </p>
        <p>
          <span className="text-[var(--sf-text-muted)]">Manufacturer:</span>{" "}
          {String(profile.manufacturer ?? "—")} {String(profile.model ?? "")}
        </p>
      </SfCard>
    </div>
  );
}
